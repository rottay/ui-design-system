import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, sep } from 'node:path';
import { FIXTURE_SKIN_ANCHOR, hardcodeFixtures } from '../../context/fixtures/index.mjs';
import { foundationDir, root, tokensCssDir } from '../../context/paths/index.mjs';
import { baselineKeys } from '../../context/sparse/index.mjs';
import { cssFilesUnder, rootScopedDeclarations, stripBlockComments } from '../../parsing/index.mjs';

/** Build a name -> raw-value map from every foundation CSS file's base :root block.
 * `themes/default/index.css` is read first and wins ties: it is the file the CSS entrypoint
 * imports LAST among the foundation layer (entrypoints/base/index.css), so for any name
 * declared in more than one foundation file, its value is the one that actually wins
 * the cascade (e.g. base/spacing.css's semantic --ds-spacing-xs..xl ladder duplicates
 * different values than default.css's - default.css is the one real pages render). */
function buildTokenDefinitions() {
  const defs = new Map();
  const priorityFile = join(foundationDir, 'themes/default/index.css');
  const rest = cssFilesUnder(foundationDir).filter((f) => f !== priorityFile);
  for (const f of [priorityFile, ...rest]) {
    if (!existsSync(f)) continue;
    const text = readFileSync(f, 'utf8');
    for (const [name, raw] of rootScopedDeclarations(text)) {
      if (!defs.has(name)) defs.set(name, raw);
    }
  }
  return defs;
}

/** Follow a `var(--name, fallback)` chain (any `--` custom property, prefixed
 * or not - the DS-prefixed aliases in transitions.css point at unprefixed
 * legacy names) to its concrete literal value. Returns null if it bottoms out
 * on an undefined name with no fallback, or on a cycle. */
function resolveToken(name, defs, seen = new Set()) {
  if (seen.has(name)) return null;
  seen.add(name);
  const raw = defs.get(name);
  if (raw === undefined) return null;
  const m = /^var\(\s*(--[a-zA-Z0-9-]+)\s*(?:,\s*([\s\S]*))?\)$/.exec(raw);
  if (!m) return raw;
  const [, inner, fallback] = m;
  const resolved = resolveToken(inner, defs, seen);
  if (resolved !== null) return resolved;
  return fallback !== undefined ? fallback.trim() : null;
}

/** Normalize a simple scalar CSS value (px/rem/em/ms/s/bare number) to a
 * [unit, number] bucket for comparison; returns null for anything else
 * (colors, multi-value shorthands, keywords, cubic-bezier, ...) - those are
 * out of scope for this check (see module doc). */
function normalizeScalar(value) {
  const m = /^(-?\d*\.?\d+)(px|rem|em|ms|s)?$/.exec(value.trim());
  if (!m) return null;
  const num = Number(m[1]);
  const unit = m[2] || '';
  if (unit === 'rem') return ['px', num * 16];
  if (unit === 's') return ['ms', num * 1000];
  if (unit === '') return ['num', num];
  return [unit, num];
}

/**
 * Count `var(--ds-token, fallback)` usages across packages/core/src where the
 * fallback is a simple numeric scalar (px/rem/em/ms/s/bare) that disagrees
 * with the token's foundation-defined value. Scoped to scalar fallbacks only:
 * color/gradient fallbacks are tenant-branded (no single "correct" value) and
 * multi-value shorthands (e.g. modal header padding `16px 24px` vs a
 * single-value token) need per-component design judgment, not a mechanical
 * check - both are intentionally out of scope here, not silently "passing".
 * SVG presentation-attribute usages (D3 `.attr('rx', 'var(...)')`) are
 * excluded: those are DOM attributes, not CSS property values, so CSS
 * fallback-parity doesn't apply the same way. Target: 0 (decrease-only ratchet).
 */
function countFallbackParityViolations() {
  const defs = buildTokenDefinitions();
  const usageRe = /var\(\s*(--ds-[a-zA-Z0-9-]+)\s*,\s*([^,()]+)\)/g;
  const srcDir = join(root, 'src');
  let violations = 0;

  function walk(dir) {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const rel = full.slice(srcDir.length + 1).replace(/\\/g, '/');
      if (rel.startsWith('foundation/tokens/css/facade/artifacts/') || rel.startsWith('foundation/tokens/css/facade/legacy/')) continue;
      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      if (!/\.(tsx?|css)$/.test(full)) continue;
      if (/__tests__|\.(test|spec|stories)\./.test(rel)) continue;
      const text = readFileSync(full, 'utf8');
      for (const m of text.matchAll(usageRe)) {
        const token = m[1];
        const fallback = m[2].trim();
        if (fallback.includes('$') || fallback.includes('`') || fallback.includes('{')) continue; // dynamic, not a literal
        const precedingContext = text.slice(Math.max(0, m.index - 40), m.index);
        if (/\.attr\(\s*['"][a-zA-Z-]+['"]\s*,\s*['"]?$/.test(precedingContext)) continue; // SVG attribute, not CSS
        const fallbackNorm = normalizeScalar(fallback);
        if (fallbackNorm === null) continue; // not a simple scalar (color, shorthand, keyword)
        const resolved = resolveToken(token, defs);
        if (resolved === null) continue; // undefined token: a different defect (orphan name), not parity
        const resolvedNorm = normalizeScalar(resolved);
        if (resolvedNorm === null) continue; // token itself isn't a simple scalar (color, composite)
        if (resolvedNorm[0] !== fallbackNorm[0]) continue; // incomparable units, don't guess
        if (Math.abs(resolvedNorm[1] - fallbackNorm[1]) > 1e-6) {
          violations += 1;
          if (process.env.DEBUG_FALLBACK_PARITY) {
            const line = text.slice(0, m.index).split('\n').length;
            console.error(
              `[fallback-parity] ${rel}:${line} ${token} fallback=${fallback} resolved=${resolved}`,
            );
          }
        }
      }
    }
  }
  walk(srcDir);
  return violations;
}

/** Every `var(--ds-x, <fallback>)` in a text, with its balanced fallback. */
function dsVarFallbacks(text) {
  const out = [];
  const opener = /var\(\s*(--ds-[a-zA-Z0-9-]+)\s*,/g;
  for (const m of text.matchAll(opener)) {
    let depth = 1;
    let i = m.index + m[0].length;
    while (i < text.length && depth > 0) {
      if (text[i] === '(') depth += 1;
      else if (text[i] === ')') depth -= 1;
      i += 1;
    }
    out.push({ token: m[1], fallback: text.slice(m.index + m[0].length, i - 1).trim(), index: m.index });
  }
  return out;
}

const NAMED_PARITY_COLORS = { white: [255, 255, 255, 1], black: [0, 0, 0, 1], transparent: [0, 0, 0, 0] };

/** Normalize a plain colour literal (hex, rgb()/rgba(), white/black/transparent) to [r,g,b,a]. */
function normalizeColor(value) {
  const v = value.trim().toLowerCase();
  if (NAMED_PARITY_COLORS[v]) return NAMED_PARITY_COLORS[v];
  const hex = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(v);
  if (hex) {
    let digits = hex[1];
    if (digits.length <= 4) digits = [...digits].map((d) => d + d).join('');
    const n = (i) => Number.parseInt(digits.slice(i, i + 2), 16);
    return [n(0), n(2), n(4), digits.length === 8 ? Math.round((n(6) / 255) * 1000) / 1000 : 1];
  }
  const fn = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/.exec(v);
  if (fn) {
    const alpha = fn[4] === undefined ? 1 : fn[4].endsWith('%') ? Number.parseFloat(fn[4]) / 100 : Number(fn[4]);
    return [Number(fn[1]), Number(fn[2]), Number(fn[3]), Math.round(alpha * 1000) / 1000];
  }
  return null;
}

/**
 * Component channels that resolve through the root: a `--ds-*` name declared,
 * anywhere in the authored CSS, as exactly one `var(--root ...)` alias. A name
 * aliased to two different targets is ambiguous and stays unresolved.
 */
function buildChannelAliases(defs) {
  const aliases = new Map();
  const files = cssFilesUnder(tokensCssDir).filter(
    (f) => !f.includes(`${sep}facade${sep}artifacts${sep}`) && !f.includes(`${sep}facade${sep}legacy${sep}`),
  );
  const declRe = /(--ds-[a-zA-Z0-9-]+)\s*:\s*var\(\s*(--[a-zA-Z0-9-]+)\s*[,)]/g;
  for (const f of files) {
    const text = stripBlockComments(readFileSync(f, 'utf8'));
    for (const m of text.matchAll(declRe)) {
      if (defs.has(m[1])) continue;
      if (!aliases.has(m[1])) aliases.set(m[1], new Set());
      aliases.get(m[1]).add(m[2]);
    }
  }
  return new Map([...aliases].filter(([, targets]) => targets.size === 1).map(([name, targets]) => [name, [...targets][0]]));
}

/** Compare a fallback with a resolved root value: scalar or colour, or null when incomparable. */
function fallbackDisagrees(fallback, resolved) {
  const fs = normalizeScalar(fallback);
  const rs = normalizeScalar(resolved);
  if (fs && rs) return fs[0] === rs[0] ? Math.abs(fs[1] - rs[1]) > 1e-6 : null;
  const fc = normalizeColor(fallback);
  const rc = normalizeColor(resolved);
  if (fc && rc) return fc.some((channel, i) => Math.abs(channel - rc[i]) > (i === 3 ? 0.002 : 0.5));
  return null;
}

/**
 * The two DEF axes `countFallbackParityViolations` leaves out (HARD-2):
 *  - `color`: a colour-literal fallback of a ROOT-defined token that differs
 *    from the root's own colour value (hex/rgb/rgba/white/black/transparent).
 *  - `channel`: a scalar or colour fallback of a COMPONENT channel the root
 *    does not define but that resolves to a root token through exactly one
 *    authored `--ds-x: var(--root)` alias, differing from that root value.
 * Same corpus and the same exclusions as the scalar counter. A token resolving
 * to anything else (color-mix, a shorthand, an unresolved name) is skipped.
 */
function countFallbackParityExtensions() {
  const defs = buildTokenDefinitions();
  const aliases = buildChannelAliases(defs);
  const srcDir = join(root, 'src');
  const result = { color: 0, channel: 0, files: {} };

  function walk(dir) {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const rel = full.slice(srcDir.length + 1).replace(/\\/g, '/');
      if (rel.startsWith('foundation/tokens/css/facade/artifacts/') || rel.startsWith('foundation/tokens/css/facade/legacy/')) continue;
      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      if (!/\.(tsx?|css)$/.test(full)) continue;
      if (/__tests__|\.(test|spec|stories)\./.test(rel)) continue;
      scanFile(full, rel);
    }
  }

  function scanFile(full, rel) {
    const text = readFileSync(full, 'utf8');
    for (const { token, fallback, index } of dsVarFallbacks(text)) {
      if (/[$`{]/.test(fallback) || fallback.includes('var(')) continue;
      const precedingContext = text.slice(Math.max(0, index - 40), index);
      if (/\.attr\(\s*['"][a-zA-Z-]+['"]\s*,\s*['"]?$/.test(precedingContext)) continue;
      let axis;
      let resolved;
      if (defs.has(token)) {
        if (!normalizeColor(fallback)) continue; // scalar root fallbacks: countFallbackParityViolations
        axis = 'color';
        resolved = resolveToken(token, defs);
      } else if (aliases.has(token)) {
        axis = 'channel';
        resolved = resolveToken(aliases.get(token), defs);
      } else continue;
      if (resolved === null) continue;
      if (fallbackDisagrees(fallback, resolved) === true) {
        result[axis] += 1;
        const key = `fallbackParity.${axis}.${rel}`;
        result.files[key] = (result.files[key] ?? 0) + 1;
        if (process.env.DEBUG_FALLBACK_PARITY) {
          const line = text.slice(0, index).split('\n').length;
          console.error(`[fallback-parity:${axis}] ${rel}:${line} ${token} fallback=${fallback} resolved=${resolved}`);
        }
      }
    }
  }
  walk(srcDir);
  if (hardcodeFixtures.skin) scanFile(hardcodeFixtures.skin, `foundation/tokens/css/${FIXTURE_SKIN_ANCHOR}`);
  return result;
}

/** Per-file keys for the two DEF extensions (sparse, see `sparse`), so a drain cannot pay for a regression. */
function fallbackParityFileCounters(fallbackParityExtensions) {
  const out = {};
  for (const key of baselineKeys) if (key.startsWith('fallbackParity.')) out[key] = 0;
  for (const [key, count] of Object.entries(fallbackParityExtensions.files)) out[key] = count;
  return out;
}

export {
  countFallbackParityViolations,
  countFallbackParityExtensions,
  fallbackParityFileCounters,
};
