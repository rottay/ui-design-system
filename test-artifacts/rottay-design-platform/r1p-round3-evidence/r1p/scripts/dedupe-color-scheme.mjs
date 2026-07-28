/**
 * `color-scheme` is now compiler-emitted on the base block (AD-3), so a
 * base-state root re-declaration of the SAME value is a duplicate authority.
 * Mode blocks keep theirs — that is the mode they exist to author.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { loadSource, CORE_SPECIFIERS, CORE_ROOT } from './source-loader.mjs';

const AUDIT = '/private/tmp/rottay-design-platform-independent-audit-round-3';
const postcss = createRequire(`${CORE_ROOT}/package.json`)('postcss');
const sel = createRequire(`${AUDIT}/scripts/classify/selector-lib.js`)('./selector-lib.js');

const m = await loadSource(CORE_SPECIFIERS);
const THEMES = { bithire: m.bithire.bithireBrandTheme, evnto: m.evnto.evntoBrandTheme, rottay: m.platform.rottayBrandTheme };

for (const [slug, theme] of Object.entries(THEMES)) {
  const emitted = m.compiler.compileBrandTheme({ brandTheme: theme, tenantSlug: slug }).colorScheme;
  const file = `${CORE_ROOT}/src/foundation/tokens/css/facade/artifacts/${slug}/_source/extension.css`;
  const root = postcss.parse(readFileSync(file, 'utf-8'), { from: file });
  let removed = 0;
  root.walkRules((rule) => {
    if (rule.parent?.type === 'atrule') return;
    const arms = sel.splitArms(rule.selector);
    if (!arms.some((a) => sel.armMatchesState(a, 'default') && !sel.armIsDescendant(a))) return;
    for (const decl of [...(rule.nodes ?? [])]) {
      if (decl.type === 'decl' && decl.prop === 'color-scheme' && decl.value.trim() === emitted) {
        decl.remove();
        removed += 1;
      }
    }
  });
  if (removed) writeFileSync(file, root.toString());
  console.log(`${slug}: compiler emits color-scheme:${emitted}; removed ${removed} duplicate declaration(s)`);
}
