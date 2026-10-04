# WO-DER-07 — T6 receipt (rendered probe-ground, built showroom)

- Built commit: `4497460c8` (core `pnpm build` + showroom `next build --webpack`, then `next start`).
- Run: `npx playwright test e2e/probe-ground/identity-runtime-connection.spec.ts --config playwright.visual.config.ts` (twice: terminal reporter and JSON; both 7/7, 0 unexpected, 0 flaky).
- The six T6 routes (3 candidates x 2 modes, all six screens per route): `route-checks.json` — stage + runtime proof visible, six screen regions present, per-screen content markers matched, ground/ink luminance polarity correct per mode, one artifact style, seven identical badges, no DIVERGED, zero `[design-system]` console errors, zero page errors.
- `playwright-report.json` is the machine-readable report of the second run.
- D-30 (the owner pick) is NOT part of this receipt; it stays a deferred branding obligation.
