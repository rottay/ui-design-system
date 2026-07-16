# Performance Budget - Rottay Design System

Enforced in CI via `scripts/analyze-bundle.mjs`. Any violation fails the build.

## JavaScript Budget

| Metric | Limit |
|--------|-------|
| Main bundle (`dist/index.js`) | < 150 KB gzipped |
| Main CJS bundle (`dist/index.cjs`) | < 150 KB gzipped |
| Per-engine chunk | < 80 KB gzipped |
| Icons bundle (`dist/icons.js`) | < 40 KB gzipped |
| Marks bundle (`dist/marks.js`) | < 30 KB gzipped, excluding the explicitly installed renderer peer |
| Charts projection entry (`dist/charts.js`) | < 400 B raw (measured 290 B; focused entry) |
| Chart renderers entry (`dist/chart-renderers.js`) | < 600 B raw (measured 460 B; D3 and React external) |
| Semantic motion entry (`dist/motion.js`) | < 1.1 KB raw (922 B measured; React and Motion external) |
| Pure motion policy fixture | < 2.1 KB gzipped (1,822 B measured + >10%; no React/Motion retained) |
| Motion provider fixture | < 2.3 KB gzipped (2,076 B measured + >10%; React/Motion external) |
| EffectRegistry entry (`dist/effects.js` / `.cjs`) | < 800 B raw each (652/676 B measured + >10%) |
| EffectRegistry all-export fixture | < 5.5 KB gzipped (4,829 B measured + >10%; ESM/CJS/types supplier-neutral) |
| Named Bar renderer | < 2.7 KB gzipped (2,375 B measured + >10%; D3/React external) |
| Named Line renderer | < 3.3 KB gzipped (2,969 B measured + >10%; D3/React external) |
| Named HeatMap renderer | < 3.3 KB gzipped (2,943 B measured + >10%; D3/React external) |
| Tokens bundle (`dist/tokens.js`) | < 20 KB gzipped |
| i18n bundle (`dist/i18n.js`) | < 20 KB gzipped |
| Aggregate JS package footprint | < 8.1 MB raw (7,302,508 B measured + >10%; ESM + CJS) |

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
| `dist/charts.js` | 400 B (290 B measured + >10%) |
| `dist/charts.cjs` | 400 B (350 B measured + >10%) |
| `dist/chart-renderers.js` | 600 B (460 B measured + >10%) |
| `dist/chart-renderers.cjs` | 600 B (512 B measured + >10%) |
| `dist/motion.js` | 1.1 KB (922 B measured + >10%) |
| `dist/motion.cjs` | 1.1 KB (930 B measured + >10%) |
| `dist/effects.js` | 800 B (652 B measured + >10%) |
| `dist/effects.cjs` | 800 B (676 B measured + >10%) |
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
2. The same command builds Bar, Line and HeatMap once each through the public
   `charts/renderers` facade. Each in-memory ESM bundle must retain only its selected renderer,
   keep D3 and React external, and remain below its named gzip budget.
3. The semantic motion gate bundles the pure policy and `MotionProvider` separately through the
   public facade. Pure resolution must retain neither React nor Motion; the provider must keep both
   peers external. `node scripts/analyze-bundle.mjs --motion` runs only this focused gate.
4. The EffectRegistry gate bundles all nine runtime exports from `./effects`, rejects suppliers,
   dynamic imports, emitted assets and visual/client modules, then independently walks the CJS
   `require()` closure and `.d.ts` graph. `node scripts/analyze-bundle.mjs --effects` runs only
   this focused gate.
5. `node scripts/analyze-bundle.mjs --chart-renderers` runs only that focused renderer gate;
   it does not build the full package or write artifacts.
6. CI runs the analyzer after the build step; any size, isolation or externalization failure exits non-zero.
7. The report is printed as a table in the console.

The VIZ-02 raw ESM/CJS entries and named-renderer bundles were measured from
the same cohesive producer build on 2026-07-16. Re-measure through the focused
gate before changing them; never widen a ceiling only to silence CI.

The MOT-01 raw ESM/CJS facade and isolated policy/provider fixtures were measured from the same
2.19.17 producer build on 2026-07-16. The isolation gate is part of every normal analysis.

The EFX-01A raw ESM/CJS facade and all-export fixture were measured from the same cohesive
2.19.17 producer build on 2026-07-16. Its gate proves ESM, CJS and declaration closure purity;
the public subpath contains governance metadata/resolution only and no visual effect runtime.

## Adjusting Budgets

If a budget increase is genuinely needed:

1. Update the limits in both this document and `scripts/analyze-bundle.mjs`.
2. Open a PR with a justification for the increase.
3. Tag `@rottay/design-system-reviewers` for approval.
