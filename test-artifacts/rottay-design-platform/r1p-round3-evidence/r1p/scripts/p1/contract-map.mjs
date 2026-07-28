/**
 * P1 step 1a: current BrandTheme leaf -> emitted-channel map.
 *
 * Same probe method as W-B (union of every leaf across all authored themes and
 * fixtures, sentinel-substituted per path), re-run against the CURRENT contract
 * so the classifier sees the dual-mode fields W-B already landed.
 */
import { writeFileSync } from 'node:fs';
import { loadSource } from '../source-loader.mjs';

const OUT = '/Users/daniel/Developer/Rottay/ui-design-system/test-artifacts/rottay-design-platform/r1p-round3-evidence/r1p/closure/remediation';
const SENTINEL = '#010203';

const SPECS = {
  compiler: '/src/infrastructure/compilers/kernel/runtime/brand-theme/index.ts',
  bithire: '/src/foundation/tokens/ts/presentation/brand-themes/bithire/index.ts',
  evnto: '/src/foundation/tokens/ts/presentation/brand-themes/evnto/index.ts',
  platform: '/src/foundation/tokens/ts/presentation/brand-themes/platform/index.ts',
  torture: '/src/foundation/tokens/ts/presentation/brand-themes/fixtures/torture/index.ts',
  tmm: '/src/foundation/tokens/ts/presentation/brand-themes/fixtures/themanagementmiami/index.ts',
  divEditorial: '/src/foundation/tokens/ts/presentation/brand-themes/fixtures/divergence-editorial/index.ts',
  divSober: '/src/foundation/tokens/ts/presentation/brand-themes/fixtures/divergence-sober/index.ts',
};

const m = await loadSource(SPECS);
const { compileBrandTheme } = m.compiler;
const firstExport = (mod) => Object.values(mod).find((v) => v && typeof v === 'object' && 'id' in v);

const THEMES = { bithire: firstExport(m.bithire), evnto: firstExport(m.evnto), rottay: firstExport(m.platform) };
const DONORS = [
  THEMES.bithire, THEMES.evnto, THEMES.rottay,
  firstExport(m.torture), firstExport(m.tmm), firstExport(m.divEditorial), firstExport(m.divSober),
].filter(Boolean);

function leafPaths(obj, prefix = '', acc = new Set()) {
  if (obj == null || typeof obj !== 'object') return acc;
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) leafPaths(v, p, acc);
    else acc.add(p);
  }
  return acc;
}

const union = new Set();
for (const d of DONORS) for (const p of leafPaths(d)) union.add(p);
for (const skip of ['id', 'name', 'extends']) union.delete(skip);
// modes.* leaves are the overlay of the same families; probing them separately
// would double-count. The overlay reuses the identical family compilers.
for (const p of [...union]) if (p.startsWith('modes.')) union.delete(p);

const clone = (o) => JSON.parse(JSON.stringify(o));
function setPath(obj, path, value) {
  const parts = path.split('.');
  let cur = obj;
  for (const part of parts.slice(0, -1)) {
    if (cur[part] == null || typeof cur[part] !== 'object') cur[part] = {};
    cur = cur[part];
  }
  cur[parts.at(-1)] = value;
}

const report = {};
for (const [slug, theme] of Object.entries(THEMES)) {
  const compiled = compileBrandTheme({ brandTheme: theme, tenantSlug: slug });
  const base = compiled.cssVariables;
  const byVar = {};
  const byPath = {};
  for (const path of union) {
    const probe = clone(theme);
    setPath(probe, path, SENTINEL);
    let vars;
    try { vars = compileBrandTheme({ brandTheme: probe, tenantSlug: slug }).cssVariables; }
    catch { continue; }
    const verbatim = [];
    const moved = [];
    for (const k of new Set([...Object.keys(vars), ...Object.keys(base)])) {
      if (vars[k] === base[k]) continue;
      if (vars[k] === SENTINEL) verbatim.push(k); else moved.push(k);
    }
    if (verbatim.length || moved.length) {
      byPath[path] = { verbatim, moved };
      for (const v of verbatim) (byVar[v] ??= []).push({ path, kind: 'verbatim', controls: verbatim.length + moved.length });
      for (const v of moved) (byVar[v] ??= []).push({ path, kind: 'derived', controls: verbatim.length + moved.length });
    }
  }
  report[slug] = { baseVarCount: Object.keys(base).length, probedPaths: union.size, byVar, byPath };
  const exact = Object.values(byVar).filter((c) => c.some((x) => x.kind === 'verbatim')).length;
  console.log(`${slug}: probed ${union.size} paths -> ${Object.keys(byVar).length} reachable channels (${exact} verbatim)`);
}

writeFileSync(`${OUT}/p1-contract-map.json`, JSON.stringify(report, null, 1));
console.log(`wrote ${OUT}/p1-contract-map.json`);
