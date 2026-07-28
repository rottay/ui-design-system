/**
 * P1 task 2: value-twin analysis.
 *
 * For every extension declaration that is not already a BrandTheme field, ask:
 * does the artifact ALREADY carry this exact value on a GOVERNED channel in the
 * same state (a channel the compiler emits from a typed field)? If yes the
 * extension declaration is a duplicate of governed vocabulary — the value has a
 * typed home already and the hand-written channel is a second name for it.
 *
 * A duplicate is only safely removable when the consuming component can reach
 * the governed twin. That reachability is reported, not assumed.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { stateOf } from './state-of.mjs';
import { effectiveMap } from '../effective-map.mjs';
import { loadSource, CORE_ROOT } from '../source-loader.mjs';

const OUT = '/Users/daniel/Developer/Rottay/ui-design-system/test-artifacts/rottay-design-platform/r1p-round3-evidence/r1p/closure/remediation';
const ART = `${CORE_ROOT}/src/foundation/tokens/css/facade/artifacts`;

const ledger = JSON.parse(readFileSync(`${OUT}/p1-ledger.json`, 'utf-8'));

// Governed = every channel the compiler emits for this theme (base + modes).
const mods = await loadSource({
  brand: '/src/infrastructure/compilers/kernel/runtime/brand-theme/index.ts',
  bithire: '/src/foundation/tokens/ts/presentation/brand-themes/bithire/index.ts',
  evnto: '/src/foundation/tokens/ts/presentation/brand-themes/evnto/index.ts',
  platform: '/src/foundation/tokens/ts/presentation/brand-themes/platform/index.ts',
});
const firstExport = (mod) => Object.values(mod).find((v) => v && typeof v === 'object' && 'id' in v);
const THEMES = { bithire: firstExport(mods.bithire), evnto: firstExport(mods.evnto), rottay: firstExport(mods.platform) };

const governed = {};
for (const [slug, theme] of Object.entries(THEMES)) {
  const c = mods.brand.compileBrandTheme({ brandTheme: theme, tenantSlug: slug });
  governed[slug] = {
    base: new Set(Object.keys(c.cssVariables)),
    modes: Object.fromEntries((c.modeBlocks ?? []).map((b) => [b.mode, new Set(Object.keys(b.cssVariables))])),
  };
}

const STATES = ['default', 'light', 'dark'];
const maps = {};
for (const slug of ['bithire', 'evnto', 'rottay']) {
  const css = readFileSync(`${ART}/${slug}/index.css`, 'utf-8');
  maps[slug] = {};
  for (const st of STATES) maps[slug][st] = Object.fromEntries([...effectiveMap(css, st, slug)].map(([k, v]) => [k, v.value]));
}

const norm = (v) => String(v ?? '').trim().toLowerCase().replace(/\s+/g, ' ').replace(/\s*,\s*/g, ',');

const report = {};
for (const [slug, v] of Object.entries(ledger.verticals)) {
  const gov = governed[slug];
  const isGoverned = (name, st) => gov.base.has(name) || (gov.modes[st]?.has(name) ?? false);
  const out = { withGovernedTwin: [], noTwin: [], twinHistogram: {} };
  for (const row of v.rows) {
    if (row.cls === 'existing-BrandTheme-field' || row.cls === 'legitimate-media-reduced-motion' || row.cls === 'non-custom-property') continue;
    const st = stateOf(row.selector);
    const m = maps[slug][st];
    const target = norm(row.value);
    const twins = [];
    for (const [name, val] of Object.entries(m)) {
      if (name === row.prop) continue;
      if (!isGoverned(name, st)) continue;
      if (norm(val) === target) twins.push(name);
    }
    const rec = { prop: row.prop, value: row.value, state: st, cls: row.cls, readers: row.readers, twins: twins.slice(0, 12), twinCount: twins.length };
    if (twins.length) {
      out.withGovernedTwin.push(rec);
      const key = twins[0];
      out.twinHistogram[key] = (out.twinHistogram[key] ?? 0) + 1;
    } else out.noTwin.push(rec);
  }
  const totalConsidered = out.withGovernedTwin.length + out.noTwin.length;
  report[slug] = out;
  console.log(`${slug}: considered ${totalConsidered} -> ${out.withGovernedTwin.length} have a governed value-twin, ${out.noTwin.length} do not`);
}
writeFileSync(`${OUT}/p1-value-twins.json`, JSON.stringify(report, null, 1));
console.log(`wrote ${OUT}/p1-value-twins.json`);
