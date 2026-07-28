/**
 * Diagnostic: for every ramp channel, compare the value the DARK/LIGHT state
 * ships TODAY (pre-WB snapshot artifact) against the value the new mode block
 * would emit. Tells us whether re-derivation moves pixels.
 */
import { readFileSync } from 'node:fs';
import { effectiveMap } from './effective-map.mjs';
import { loadSource, CORE_ROOT } from './source-loader.mjs';

const SNAP = '/private/tmp/rottay-design-platform-independent-audit-round-3/r1p/closure/wb-snapshot';

const m = await loadSource({
  compiler: '/src/infrastructure/compilers/kernel/runtime/brand-theme/index.ts',
  bithire: '/src/foundation/tokens/ts/presentation/brand-themes/bithire/index.ts',
  evnto: '/src/foundation/tokens/ts/presentation/brand-themes/evnto/index.ts',
  platform: '/src/foundation/tokens/ts/presentation/brand-themes/platform/index.ts',
});
const { compileBrandTheme } = m.compiler;
const firstExport = (mod) => Object.values(mod).find((v) => v && typeof v === 'object' && 'id' in v);
const THEMES = { bithire: firstExport(m.bithire), evnto: firstExport(m.evnto), rottay: firstExport(m.platform) };

const norm = (v) => (v == null ? null : v.replace(/\s+/g, ' ').trim().toLowerCase());

for (const [slug, state] of [['bithire', 'dark'], ['evnto', 'dark'], ['rottay', 'light']]) {
  const before = readFileSync(`${SNAP}/${slug}.index.css`, 'utf-8');
  const shipped = Object.fromEntries(
    [...effectiveMap(before, state, slug)].map(([k, v]) => [k, v.value]),
  );
  const compiled = compileBrandTheme({ brandTheme: THEMES[slug], tenantSlug: slug });
  const block = (compiled.modeBlocks ?? []).find((b) => b.mode === state);
  if (!block) { console.log(`${slug}: no ${state} mode block`); continue; }

  const ramp = /^--ds-color-(primary|secondary|accent|success|warning|error|info|neutral)-(\d+)$/;
  let same = 0;
  const moved = [];
  for (const [k, v] of Object.entries(block.cssVariables)) {
    if (!ramp.test(k)) continue;
    if (norm(shipped[k]) === norm(v)) same += 1;
    else moved.push({ k, shipped: shipped[k], now: v });
  }
  console.log(`\n=== ${slug} ${state}: ramp channels in mode block — unchanged ${same}, MOVED ${moved.length}`);
  for (const r of moved.slice(0, 24)) console.log(`   ${r.k}: ships ${r.shipped} -> would emit ${r.now}`);
  if (moved.length > 24) console.log(`   … ${moved.length - 24} more`);
}
