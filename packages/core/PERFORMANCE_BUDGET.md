# Performance Budget - Rottay Design System

Enforced in CI via `scripts/analyze-bundle.mjs`. Any violation fails the build.

## JavaScript Budget

| Metric | Limit |
|--------|-------|
| Main bundle (`dist/index.js`) | < 150 KB gzipped |
| Main CJS bundle (`dist/index.cjs`) | < 150 KB gzipped |
| Flagship component bundle | Component-specific gzip ceilings in `scripts/analyze-bundle.mjs`; each fixture deliberately inlines all three physical engines |
| Icons bundle (`dist/icons.js`) | < 40 KB gzipped |
| Marks bundle (`dist/marks.js`) | < 30 KB gzipped, excluding the explicitly installed renderer peer |
| Named semantic role consumer closure | < 40 KB gzipped in ESM and CJS; renderer supplier included, React external |
| BitHire selected `Icon` preset closure | < 40 KB gzipped in ESM and CJS; exact productive 46-role inventory, renderer supplier included, React external |
| Explicit full-corpus `Icon` compatibility closure | < 203/226 KB gzip ESM/CJS compatibility ratchet (184,033/204,761 B measured +10%, rounded upward); all 263 roles, never presented as a route-sized < 40 KB payload |
| `BrandMark` consumer closure | < 30 KB gzipped in ESM and CJS; renderer supplier included, React external |
| `CloudServiceMark` consumer closure | < 30 KB gzipped in ESM and CJS; renderer supplier included, React external |
| `FeaturePictogram` consumer closure | < 4 KB gzipped in ESM and CJS; React external |
| Charts experience entry (`dist/charts.js` / `.cjs`) | < 600/700 B raw (517/569 B measured; canonical preserveModules paths, runtime governed separately) |
| Chart specification entry (`dist/chart-spec.js` / `.cjs`) | < 700/800 B raw (607/643 B measured) |
| Chart specification all-export fixture | < 2.2 KB gzipped (1,787 B measured + >20%; ESM/CJS/types supplier/browser-neutral) |
| Chart data-access entry (`dist/chart-access.js` / `.cjs`) | < 800 B raw each (651/695 B measured) |
| Chart data-access all-export fixture | < 2.8 KB gzipped (2,380 B measured; access-only and React external) |
| Chart data-access pure CSV fixture | < 1 KB gzipped (791 B measured; import-free and client component absent) |
| Chart renderers entry (`dist/chart-renderers.js` / `.cjs`) | < 1.2/1.2 KB raw (1,038/1,066 B measured; five renderers plus datum-key facade, runtime governed separately) |
| Semantic motion entry (`dist/motion.js` / `.cjs`) | < 1.3 KB raw each (1,139/1,147 B measured; React and Motion external) |
| Pure motion policy fixture | < 2.1 KB gzipped (1,822 B measured + >10%; no React/Motion retained) |
| Motion provider fixture | < 2.3 KB gzipped (2,077 B measured + >10%; React/Motion external) |
| EffectRegistry entry (`dist/effects.js` / `.cjs`) | < 800 B raw each (652/676 B measured + >10%) |
| EffectRegistry all-export fixture | < 5.5 KB gzipped (4,829 B measured + >10%; ESM/CJS/types supplier-neutral) |
| Spatial host entry (`dist/spatial.js` / `.cjs`) | < 400/400 B raw (296/356 B measured + >10%) |
| Spatial specification entry (`dist/spatial-spec.js` / `.cjs`) | < 800/800 B raw (688/724 B measured + >10%) |
| Spatial host all-export fixture | < 7.8 KB gzipped (7,064 B measured + >10%; includes the supplier-neutral shared continuous-runtime governor, React is the only external) |
| Spatial specification all-export fixture | < 1.3 KB gzipped (1,097 B measured + >10%; no external/browser runtime) |
| Named Bar renderer | < 12.1 KB gzipped (10,934 B measured + >10%; accessible interaction/insight runtime, D3/React external) |
| Named Line renderer | < 12.8 KB gzipped (11,603 B measured + >10%; accessible interaction/insight runtime, D3/React external) |
| Named HeatMap renderer | < 10.7 KB gzipped (9,665 B measured + >10%; accessible interaction runtime, D3/React external) |
| Named Pie/Donut renderer | < 9.7 KB gzipped (8,748 B measured + >10%; accessible interaction runtime, D3/React external) |
| Deduplicated renderer family | < 18.3 KB gzipped (16,572 B measured + >10%; Bar + Line + HeatMap + Pie, shared runtime paid once) |
| Line datum-key utility | < 200 B gzipped (101 B provisional source-entry measurement; import-free) |
| Tokens bundle (`dist/tokens.js`) | < 20 KB gzipped |
| i18n bundle (`dist/i18n.js`) | < 20 KB gzipped |
| Aggregate JS package footprint | < 9.1 MB raw (8,194,345 B measured + >10%; 261-role semantic corpus, ESM + CJS; consumer routes remain independently gated) |

The aggregate baseline records the exact 261-role corpus that was present when
it was measured on 2026-07-16. The governed corpus now contains 263 roles; rerun
the analyzer before changing that ceiling rather than presenting the historical
measurement as a current role count.

## CSS Budget

| Metric | Limit |
|--------|-------|
| Generic styles (`dist/styles.css`) | < 460 KB gzip (418,154 B measured + >10%) |
| Platform styles (`dist/platform.css`) | < 425 KB gzip (383,113 B measured + >10%) |
| BitHire styles (`dist/bithire.css`) | < 430 KB gzip (389,050 B measured + >10%) |
| Evnto styles (`dist/evnto.css`) | < 410 KB gzip (368,166 B measured + >10%) |
| Modern engine (`dist/modern-engine.css`) | < 30 KB gzip (25,744 B measured + >10%) |
| Commercial styles (`dist/commercial.css`) | < 8 KB gzip (7,080 B measured + >10%) |
| Vite style compatibility entry (`dist/style.css`) | < 2.5 KB gzip (2,161 B measured + >10%) |

Vertical bundles are alternative consumer payloads, so they are governed
independently. The gate deliberately does not sum mutually exclusive variants
or mix built artifacts with source CSS.

## Uncompressed Limits (CI Gate)

These are the raw file-size limits checked by `analyze-bundle.mjs` before gzip,
chosen to approximate the gzipped budgets above (typical 3-4x ratio).

| File | Max uncompressed |
|------|-----------------|
| `dist/index.js` | 500 KB |
| `dist/index.cjs` | 500 KB |
| `dist/icons.js` | 150 KB |
| `dist/icons.cjs` | 150 KB |
| `dist/marks.js` | 100 KB |
| `dist/marks.cjs` | 100 KB |
| `dist/charts.js` | 600 B (517 B measured +10%, rounded up to 100 B) |
| `dist/charts.cjs` | 700 B (569 B measured +10%, rounded up to 100 B) |
| `dist/chart-spec.js` | 700 B (607 B measured + >10%) |
| `dist/chart-spec.cjs` | 800 B (643 B measured + >10%) |
| `dist/chart-access.js` | 800 B (651 B measured + >10%) |
| `dist/chart-access.cjs` | 800 B (695 B measured + >10%) |
| `dist/chart-renderers.js` | 1.2 KB (1,038 B measured +10%, rounded up to 100 B) |
| `dist/chart-renderers.cjs` | 1.2 KB (1,066 B measured +10%, rounded up to 100 B) |
| `dist/motion.js` | 1,300 B (1,139 B measured + >10%) |
| `dist/motion.cjs` | 1,300 B (1,147 B measured + >10%) |
| `dist/effects.js` | 800 B (652 B measured + >10%) |
| `dist/effects.cjs` | 800 B (676 B measured + >10%) |
| `dist/spatial.js` | 400 B (296 B measured + >10%) |
| `dist/spatial.cjs` | 400 B (356 B measured + >10%) |
| `dist/spatial-spec.js` | 800 B (688 B measured + >10%) |
| `dist/spatial-spec.cjs` | 800 B (724 B measured + >10%) |
| `dist/tokens.js` | 80 KB |
| `dist/tokens.cjs` | 80 KB |
| `dist/i18n.js` | 80 KB |
| `dist/i18n.cjs` | 80 KB |

## Web Vitals Targets

| Metric | Target | Condition |
|--------|--------|-----------|
| First Contentful Paint (FCP) | < 1.5 s | Simulated 3G |
| Time to Interactive (TTI) | < 3.0 s | Simulated 3G |
| Cumulative Layout Shift (CLS) | < 0.1 | All connections |
| Largest Contentful Paint (LCP) | < 2.5 s | All connections |

## How It Works

1. `pnpm run analyze` builds the library and checks every entry-point file against its budget.
2. The same command builds Bar, Line, HeatMap, Pie/Donut and the line datum-key utility once each through the
   public `charts/renderers` facade. Each in-memory ESM bundle must retain only its selected export,
   keep peers external, and remain below its named gzip budget; the utility must not retain D3. A
   second all-renderer fixture proves the shared accessibility, interaction and insight runtime is
   deduplicated and bounded instead of charging four isolated costs to a multi-chart route.
3. The semantic motion gate bundles the pure policy and `MotionProvider` separately through the
   public facade. Pure resolution must retain neither React nor Motion; the provider must keep both
   peers external. `node scripts/analyze-bundle.mjs --motion` runs only this focused gate.
4. The EffectRegistry gate bundles all nine runtime exports from `./effects`, rejects suppliers,
   dynamic imports, emitted assets and visual/client modules, then independently walks the CJS
   `require()` closure and `.d.ts` graph. `node scripts/analyze-bundle.mjs --effects` runs only
   this focused gate.
5. The VIZ-03A chart-spec gate bundles every runtime export from `./charts/spec`, rejects React,
   D3, other suppliers, browser/client runtime, dynamic imports and emitted assets, then walks the
   CJS `require()` closure and `.d.ts` graph. `node scripts/analyze-bundle.mjs --chart-spec` runs
   only this focused gate and also enforces both raw facade ceilings.
6. The VIZ-03C chart-access gate bundles the complete `./charts/access` runtime inventory and an
   independent pure-CSV slice. The complete fixture permits external React only; the CSV slice must
   retain no imports or client component. It also walks CJS and declaration closures and enforces
   both raw facade ceilings. `node scripts/analyze-bundle.mjs --chart-access` runs only this gate.
7. `node scripts/analyze-bundle.mjs --chart-renderers` runs only that focused renderer gate;
   it does not build the full package or write artifacts.
8. The SPATIAL-01 gate uses `export *` fixtures and compares both the built-facade and bundled
   runtime export inventories with the supplier contract, so a stale hand-written list cannot
   hide a new export. The server-safe `./spatial/spec` fixture rejects every external import,
   React, DOM/browser runtime, Three/R3F, asset and dynamic import. The `./spatial` host fixture
   permits external React only and rejects Three/R3F, Motion, D3, assets and dynamic imports.
   Import expressions are captured from Rollup's parsed module graph before inlining; asset
   inlining is disabled and both emitted assets and asset module IDs are denied. Both facades
   independently walk their CJS and declaration closures, including triple-slash path/type/lib
   references; the spec denies DOM, WebWorker and ScriptHost declaration libraries. The gate
   also enforces the four raw facade ceilings. `node scripts/analyze-bundle.mjs --spatial` runs
   only this focused gate.
9. The WO-CRA-17 semantic-asset retention gate selects a generated role subpath, the exact
   46-role BitHire preset, the explicit full-corpus compatibility facade, focused `BrandMark` and
   `CloudServiceMark` entries, and `FeaturePictogram`. For ESM it records the tree-shaken inline
   bundle; for CJS it walks the complete executable static `require()` closure. Both formats
   include resolvable renderer suppliers and keep only React external. Route boundaries retain
   the existing 40/30/4 KB ceilings; the complete 263-role facade has a separate measured +10%
   compatibility ratchet. Raw, gzip, retained-module IDs and group counts are written
   deterministically to `test-artifacts/craft/cra-17/bundle-retention.json`.
   `node scripts/analyze-bundle.mjs --asset-retention` runs only this focused gate.
10. CI runs the analyzer after the build step; any size, isolation or externalization failure exits non-zero.
11. The report is printed as a table in the console.

## Semantic Asset Retention Decision

The 40 KB icon and 30 KB mark ceilings are payload contracts, not top-level
preserveModules file-size checks. They are enforced on generated per-role
ESM/CJS subpaths, the exact 46-role BitHire preset, and separate brand/cloud
entries. The exhaustive synchronous 263-role registry remains available at
`./icons/full` and is always measured, but is explicitly not represented as a
route-sized payload. Its independent ESM/CJS compatibility ratchet is derived
from the exact 184,033/204,761 B gzip baseline with 10% headroom and protects
against silent full-corpus growth without widening the route budget. This
preserves every semantic role without hiding the compatibility cost. The
historical `./icons` facade remains a one-minor compatibility alias while
consumers migrate to role or preset boundaries.

The VIZ-03 raw ESM/CJS entries and named-renderer bundles were measured from
the same cohesive producer build on 2026-07-16. Re-measure through the focused
gate before changing them; never widen a ceiling only to silence CI.

The MOT-01 raw ESM/CJS facade and isolated policy/provider fixtures were measured from the same
canonical-tree 2.19.28 release-candidate build on 2026-07-17. The isolation gate is part of every
normal analysis.

The EFX-01A raw ESM/CJS facade and all-export fixture were measured from the same cohesive
2.19.17 producer build on 2026-07-16. Its gate proves ESM, CJS and declaration closure purity;
the public subpath contains governance metadata/resolution only and no visual effect runtime.

The VIZ-03A/C/D chart-spec, access, experience and renderer measurements come from the same
cohesive producer build on 2026-07-16. The gates must remain supplier-, browser-, client- and
asset-safe according to each public boundary; do not increase component budgets to absorb
unrelated code.

## Spatial Baseline

The canonical-tree 2.19.28 release-candidate build on 2026-07-17 measured the
host facades at 296/356 B raw, the specification facades at 688/724 B raw, the
host all-export fixture at 7,064 B gzip and the specification fixture at 1,097 B
gzip. The single `SPATIAL_BASELINE_BYTES` object records those exact values;
`deriveSpatialBudget()` creates every ceiling as measured +10%, rounded up to
the next 100 B. Re-measure all six together when the public boundary changes;
never replace exact baselines with rounded limits.

## Adjusting Budgets

If a budget increase is genuinely needed:

1. Update the limits in both this document and `scripts/analyze-bundle.mjs`.
2. Open a PR with a justification for the increase.
3. Tag `@rottay/design-system-reviewers` for approval.
