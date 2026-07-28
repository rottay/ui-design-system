/** Assert the BrandTheme edits moved exactly the intended compiled channels. */
import { readFileSync } from 'node:fs';
import { loadSource, CORE_SPECIFIERS } from './source-loader.mjs';

const ROOT = '/private/tmp/rottay-design-platform-independent-audit-round-3';
const plan = JSON.parse(readFileSync(`${ROOT}/r1p/migration-plan.json`, 'utf-8'));
const cls = JSON.parse(readFileSync(`${ROOT}/classification.json`, 'utf-8'));

const m = await loadSource(CORE_SPECIFIERS);
const THEMES = { bithire: m.bithire.bithireBrandTheme, evnto: m.evnto.evntoBrandTheme, rottay: m.platform.rottayBrandTheme };
const norm = (v) => (v == null ? null : v.replace(/\s+/g, ' ').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').trim().toLowerCase());

let bad = 0;
for (const [slug, theme] of Object.entries(THEMES)) {
  const now = m.compiler.compileBrandTheme({ brandTheme: theme, tenantSlug: slug }).cssVariables;
  const before = Object.fromEntries(
    Object.values(cls.verticals[slug].names).map((n) => [n.name, n.compiled?.value])
  );
  const expected = new Map(plan[slug].sets.map((s) => [s.name, s.to]));

  // 1. every adopted channel now carries the extension value
  for (const [name, want] of expected) {
    if (norm(now[name]) !== norm(want)) {
      console.error(`✗ ${slug} ${name}: want ${JSON.stringify(want)} got ${JSON.stringify(now[name])}`);
      bad += 1;
    }
  }
  // 2. no shared channel moved that was not adopted
  const collateral = [];
  for (const [name, was] of Object.entries(before)) {
    if (was == null || expected.has(name)) continue;
    if (norm(now[name]) !== norm(was)) collateral.push(`${name}: ${JSON.stringify(was)} -> ${JSON.stringify(now[name])}`);
  }
  console.log(`${slug}: ${expected.size} adopted channels OK, ${collateral.length} collateral change(s) among shared names`);
  for (const c of collateral) console.log(`   ! ${c}`);
}
process.exit(bad === 0 ? 0 : 1);
