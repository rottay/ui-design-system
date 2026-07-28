/**
 * P1 task 2: is the rottay extension a hand-written copy of the DS's OWN
 * default component-token layer?
 *
 * `foundation/tokens/css/foundation/themes/default.css` declares 392 of the 425
 * component channels rottay re-declares. It has a `:root` block (light) and a
 * short `html.dark` block. This resolves both DS blocks and compares them to
 * rottay's two hand-authored blocks, so the ledger can say per channel whether
 * the tenant declaration carries tenant intent or restates a DS default.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { stateOf } from './state-of.mjs';
import { createRequire } from 'node:module';
import { CORE_ROOT } from '../source-loader.mjs';

const OUT = '/Users/daniel/Developer/Rottay/ui-design-system/test-artifacts/rottay-design-platform/r1p-round3-evidence/r1p/closure/remediation';
const requireFromCore = createRequire(`${CORE_ROOT}/package.json`);
const postcss = requireFromCore('postcss');
const ledger = JSON.parse(readFileSync(`${OUT}/p1-ledger.json`, 'utf-8'));

const DEFAULTS = `${CORE_ROOT}/src/foundation/tokens/css/foundation/themes/default.css`;
const root = postcss.parse(readFileSync(DEFAULTS, 'utf-8'), { from: DEFAULTS });
const dsLight = {};
const dsDark = {};
root.walkRules((rule) => {
  if (rule.parent?.type === 'atrule') return;
  const target = /(^|,)\s*html\.dark\b/.test(rule.selector) ? dsDark
    : /(^|,)\s*:root\b/.test(rule.selector) ? dsLight : null;
  if (!target) return;
  for (const d of rule.nodes ?? []) if (d.type === 'decl' && d.prop.startsWith('--')) target[d.prop] = d.value;
});
console.log(`DS defaults: :root ${Object.keys(dsLight).length} decls | html.dark ${Object.keys(dsDark).length} decls`);

// Also pick up the per-component presentation token files (light defaults too).
import { execFileSync } from 'node:child_process';
const compFiles = execFileSync('find', [`${CORE_ROOT}/src/foundation/tokens/css/presentation/components`, '-maxdepth', '1', '-name', '*.css'], { encoding: 'utf-8' }).split('\n').filter(Boolean);
const dsComponent = {};
for (const f of compFiles) {
  const r = postcss.parse(readFileSync(f, 'utf-8'), { from: f });
  r.walkRules((rule) => {
    if (rule.parent?.type === 'atrule') return;
    if (!/(^|,)\s*:root\b/.test(rule.selector)) return;
    for (const d of rule.nodes ?? []) if (d.type === 'decl' && d.prop.startsWith('--')) dsComponent[d.prop] ??= d.value;
  });
}
console.log(`DS presentation/components :root defaults: ${Object.keys(dsComponent).length} decls`);

const norm = (v) => String(v ?? '').trim().toLowerCase().replace(/\s+/g, ' ').replace(/\s*,\s*/g, ',');

const out = {};
for (const [slug, v] of Object.entries(ledger.verticals)) {
  const buckets = { restatesDsLight: [], restatesDsDark: [], divergesFromDs: [], notDsDeclared: [] };
  for (const row of v.rows) {
    if (!row.prop.startsWith('--')) continue;
    if (row.cls === 'existing-BrandTheme-field' || row.cls === 'legitimate-media-reduced-motion') continue;
    const st = stateOf(row.selector);
    const dsL = dsLight[row.prop] ?? dsComponent[row.prop];
    const dsD = dsDark[row.prop];
    const rec = { prop: row.prop, state: st, value: row.value, dsLight: dsL ?? null, dsDark: dsD ?? null, cls: row.cls, readers: row.readers };
    if (dsL == null && dsD == null) { buckets.notDsDeclared.push(rec); continue; }
    if (dsD != null && norm(dsD) === norm(row.value)) buckets.restatesDsDark.push(rec);
    else if (dsL != null && norm(dsL) === norm(row.value)) buckets.restatesDsLight.push(rec);
    else buckets.divergesFromDs.push(rec);
  }
  out[slug] = buckets;
  console.log(`${slug}: restates-DS-light ${buckets.restatesDsLight.length} | restates-DS-dark ${buckets.restatesDsDark.length} | diverges ${buckets.divergesFromDs.length} | not-DS-declared ${buckets.notDsDeclared.length}`);
}

// rottay light block specifically: how much of it is a verbatim copy of the DS light default?
const rl = out.rottay.restatesDsLight.filter((r) => r.state === 'light').length;
const rlTotal = [...out.rottay.restatesDsLight, ...out.rottay.restatesDsDark, ...out.rottay.divergesFromDs, ...out.rottay.notDsDeclared].filter((r) => r.state === 'light').length;
console.log(`\nrottay LIGHT block: ${rl}/${rlTotal} declarations are byte-equal to the DS ':root' default`);
const rd = out.rottay.restatesDsLight.filter((r) => r.state === 'dark').length;
const rdTotal = [...out.rottay.restatesDsLight, ...out.rottay.restatesDsDark, ...out.rottay.divergesFromDs, ...out.rottay.notDsDeclared].filter((r) => r.state === 'dark').length;
console.log(`rottay DARK  block: ${rd}/${rdTotal} declarations are byte-equal to the DS ':root' (light) default`);

writeFileSync(`${OUT}/p1-ds-default-delta.json`, JSON.stringify(out, null, 1));
