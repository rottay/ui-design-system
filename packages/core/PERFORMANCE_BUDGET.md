# Performance Budget - Rottay Design System

Enforced in CI via `scripts/analyze-bundle.mjs`. Any violation fails the build.

## JavaScript Budget

| Metric | Limit |
|--------|-------|
| Main bundle (`dist/index.js`) | < 150 KB gzipped |
| Main CJS bundle (`dist/index.cjs`) | < 150 KB gzipped |
| Per-engine chunk | < 80 KB gzipped |
| Icons bundle (`dist/icons.js`) | < 40 KB gzipped |
| Tokens bundle (`dist/tokens.js`) | < 20 KB gzipped |
| i18n bundle (`dist/i18n.js`) | < 20 KB gzipped |

## CSS Budget

| Metric | Limit |
|--------|-------|
| Total CSS (tokens + themes) | < 50 KB gzipped |

## Uncompressed Limits (CI Gate)

These are the raw file-size limits checked by `analyze-bundle.mjs` before gzip,
chosen to approximate the gzipped budgets above (typical 3-4x ratio).

| File | Max uncompressed |
|------|-----------------|
| `dist/index.js` | 500 KB |
| `dist/index.cjs` | 500 KB |
| `dist/icons.js` | 150 KB |
| `dist/icons.cjs` | 150 KB |
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
2. CI runs the same script after the build step; any over-budget file exits non-zero.
3. The report is printed as a table in the console and appended to `$GITHUB_STEP_SUMMARY` when available.

## Adjusting Budgets

If a budget increase is genuinely needed:

1. Update the limits in both this document and `scripts/analyze-bundle.mjs`.
2. Open a PR with a justification for the increase.
3. Tag `@rottay/design-system-reviewers` for approval.
