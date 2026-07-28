/**
 * W-B step 0c: complete BrandTheme leaf -> emitted-channel map.
 *
 * The Round 3 probe only walked leaves the vertical under test already set, so
 * a field the contract has but the theme omits (evnto's textPrimaryColor, for
 * one) reads as "no path". This probes the UNION of every leaf present in any
 * authored theme or fixture, against every vertical, so the map answers "can
 * this contract carry this channel", not "does this theme happen to".
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { loadSource, CORE_ROOT } from './source-loader.mjs';

const R1P = '/private/tmp/rottay-design-platform-independent-audit-round-3/r1p';
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

const THEMES = {
  bithire: firstExport(m.bithire),
  evnto: firstExport(m.evnto),
  rottay: firstExport(m.platform),
};
const DONORS = [
  THEMES.bithire, THEMES.evnto, THEMES.rottay,
  firstExport(m.torture), firstExport(m.tmm),
  firstExport(m.divEditorial), firstExport(m.divSober),
].filter(Boolean);

/** Every scalar leaf path of an object, dotted. */
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
// Structural identity fields are not channels.
for (const skip of ['id', 'name', 'extends']) union.delete(skip);

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
  const base = compileBrandTheme({ brandTheme: theme, tenantSlug: slug }).cssVariables;
  const byVar = {};
  const byPath = {};
  for (const path of union) {
    const probe = clone(theme);
    setPath(probe, path, SENTINEL);
    let vars;
    try {
      vars = compileBrandTheme({ brandTheme: probe, tenantSlug: slug }).cssVariables;
    } catch {
      continue; // a sentinel this field cannot accept (numeric/enum); not a color channel
    }
    const verbatim = [];
    const moved = [];
    for (const k of new Set([...Object.keys(vars), ...Object.keys(base)])) {
      if (vars[k] === base[k]) continue;
      if (vars[k] === SENTINEL) verbatim.push(k);
      else moved.push(k);
    }
    if (verbatim.length || moved.length) {
      byPath[path] = { verbatim, moved };
      for (const v of verbatim) (byVar[v] ??= []).push({ path, kind: 'verbatim', controls: verbatim.length + moved.length });
      for (const v of moved) (byVar[v] ??= []).push({ path, kind: 'derived', controls: verbatim.length + moved.length });
    }
  }
  report[slug] = { baseVarCount: Object.keys(base).length, probedPaths: union.size, byVar, byPath };
  const exact = Object.values(byVar).filter((c) => c.some((x) => x.kind === 'verbatim')).length;
  console.log(`${slug}: probed ${union.size} paths -> ${Object.keys(byVar).length} reachable channels (${exact} reachable verbatim)`);
}

writeFileSync(`${R1P}/closure/wb-contract-map.json`, JSON.stringify(report, null, 1));

// Coverage of the mode blocks with the fuller map.
const analysis = JSON.parse(readFileSync(`${R1P}/closure/wb-mode-analysis.json`, 'utf-8'));
for (const slug of ['bithire', 'evnto', 'rottay']) {
  const byVar = report[slug].byVar;
  const decls = analysis[slug].classified.filter((c) => c.prop.startsWith('--'));
  const tally = { verbatim: 0, derivedOnly: 0, unreachable: 0 };
  const unreachable = [];
  const derivedOnly = [];
  for (const d of decls) {
    const cands = byVar[d.prop] ?? [];
    if (cands.some((c) => c.kind === 'verbatim')) tally.verbatim += 1;
    else if (cands.length) { tally.derivedOnly += 1; derivedOnly.push(d.prop); }
    else { tally.unreachable += 1; unreachable.push(d.prop); }
  }
  console.log(`\n== ${slug} mode block vs full contract map: ${JSON.stringify(tally)}`);
  console.log('   derived-only:', derivedOnly.slice(0, 40).join(' '));
  console.log('   unreachable count:', unreachable.length);
}
