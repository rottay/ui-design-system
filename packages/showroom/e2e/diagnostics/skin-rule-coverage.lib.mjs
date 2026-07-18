// Static skin-rule collection for the dead-selector audit (P-79).
//
// Extracted from skin-rule-coverage.spec.ts so it can be exercised two ways:
//   - the Playwright spec probes each collected selector against the real DOM
//   - a node unit test asserts the collection is non-empty (the spec is not
//     vacuous) WITHOUT a browser
//
// No Playwright import lives here on purpose: importing this module must have no
// test-runner side effects.

import postcss from 'postcss';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_CSS = join(HERE, '../../../core/src/foundation/tokens/css');

// The three real skin roots on disk. The engine skins live under
// runtime/engines/<engine>/skin; the engine-agnostic component skins under
// presentation/components/skin. An earlier revision of this audit pointed at
// engines/<engine>/skin and components/skin — paths that no longer exist — so
// collectRules() returned an empty set and the audit silently asserted nothing.
// collectRules() now throws if any of these roots is missing so that a future
// relocation fails loudly instead of going vacuous again.
export const SKIN_DIRS = [
  ['modern', join(CORE_CSS, 'runtime/engines/modern/skin')],
  ['rustic', join(CORE_CSS, 'runtime/engines/rustic/skin')],
  ['agnostic', join(CORE_CSS, 'presentation/components/skin')],
];

/** Strip what cannot match at rest: interaction pseudo-classes and pseudo-elements. */
export function toProbe(selector) {
  let s = selector
    .replace(/::[a-z-]+(\([^)]*\))?/g, '')
    .replace(/:(hover|focus|focus-visible|focus-within|active|target|checked|disabled|enabled|placeholder-shown|autofill|visited|link|empty)\b/g, '');
  s = s.trim();
  if (!s || s.startsWith('@') || s.includes('%')) return null;
  // A selector reduced to nothing but a combinator is not probeable.
  if (/^[>+~,\s]*$/.test(s)) return null;
  return s;
}

/**
 * The STRUCTURAL skeleton: classes and `data-part` only. Every other attribute
 * is dropped. Discriminates a thin fixture (state not rendered — rule is fine)
 * from a dead anchor (the part itself is absent — the rule reaches nobody).
 */
export function toSkeleton(probe) {
  const s = probe
    .replace(/\[(?!data-part)[^\]]*\]/g, '')
    .replace(/:not\([^)]*\)/g, '')
    .trim();
  if (!s || /^[>+~,\s]*$/.test(s)) return null;
  return s;
}

/**
 * Parse every skin file under the three real roots into probeable selectors.
 * Throws if a root is missing — a missing root is a relocation bug, never an
 * empty result to swallow.
 *
 * @returns {Array<{engine: string, file: string, selector: string, probe: string, skeleton: string}>}
 */
export function collectRules() {
  const out = [];
  for (const [engine, dir] of SKIN_DIRS) {
    if (!existsSync(dir)) {
      throw new Error(`skin-rule-coverage: skin root missing: ${dir} (engine ${engine}). Fix SKIN_DIRS after a relocation instead of scanning nothing.`);
    }
    for (const f of readdirSync(dir).filter((n) => n.endsWith('.css'))) {
      const css = readFileSync(join(dir, f), 'utf8');
      let root;
      try {
        root = postcss.parse(css);
      } catch {
        continue; // parseErrors already guards this
      }
      root.walkRules((rule) => {
        // Rules inside @keyframes are step selectors (`from`, `50%`), not DOM selectors.
        if (rule.parent?.type === 'atrule' && /keyframes/.test(rule.parent.name)) return;
        for (const sel of rule.selectors) {
          const probe = toProbe(sel);
          if (!probe) continue;
          const skeleton = toSkeleton(probe);
          if (skeleton) out.push({ engine, file: f, selector: sel, probe, skeleton });
        }
      });
    }
  }
  return out;
}
