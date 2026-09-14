# skeleton-r108 — WO-FAM-14 (reopened) geometry invalidation receipts

Lot N3, 2026-09-14. Base pin `7314b2dbb` (skeleton tree identical at working HEAD
`cb792de04`). All commands run from `packages/core`. Browser runs were serialized;
no Playwright process was left behind.

Runner: `src/components/primitives/feedback/skeleton/runtime/anatomy-renderer/tests/fixtures/geometry-invalidation-scene/runner/index.mjs`
(esbuild via the installed Vite, Chromium 149.0.7827.55 via the showroom's `@playwright/test`).

| # | Command | Exit | Result | Files |
|---|---------|------|--------|-------|
| 1 | `node <runner> --json test-artifacts/skeleton-r108/red-before.working-tree.json` (renderer unmodified, before the fix) | 1 | 14/18 assertions; G1, G2, G3, G4r FAIL; G1c, G2c controls PASS; 12 regression legs PASS; G4 observation `covered=false` | `red-before.working-tree.{json,log}` |
| 2 | `node <runner> --json test-artifacts/skeleton-r108/green-after.working-tree.json` (fixed renderer) | 0 | 18/18 assertions PASS; G4 observation `covered=false` (declared bound) | `green-after.working-tree.{json,log}` |
| 3 | `node <runner> --pin 7314b2dbb --json test-artifacts/skeleton-r108/red-before.pin-7314b2dbb.json` (same harness, committed renderer compiled from git) | 1 | 14/18; identical failure set to run 1 | `red-before.pin-7314b2dbb.{json,log}` |
| 4 | `./node_modules/.bin/vitest run src/components/primitives/feedback/skeleton --reporter=verbose --reporter=json --outputFile=test-artifacts/skeleton-r108/unit.skeleton.json` | 0 | 5 files, 82/82 (74 pre-existing + 8 new) | `unit.skeleton.{json,log}` |
| 5 | same vitest command scoped to `runtime/anatomy-renderer` with the renderer temporarily swapped to `git show 7314b2dbb`, then restored byte-identical (`cmp`) | 1 | 8 new tests FAIL, 23 existing PASS | `unit.red-before.pin-7314b2dbb.{json,log}` |
| 6 | `./node_modules/.bin/tsc --noEmit` | 0 | clean | — |
| 7 | `pnpm structure:check` | 0 | `findings=0`, passed | — |
| 8 | `../../node_modules/.bin/eslint <renderer> <test> <runner>` | 0 | clean | — |
| 9 | `pnpm typecheck:tests` | 1 | 10 errors, none in the skeleton tree: `alert/tests/Alert.callout-subtle-wash.test.tsx` (1), `compilers/.../tenant-divergence-matrix.test.ts` (1), `tests/integration/axis-difference-pilot/index.test.tsx` (8); those files are unmodified in the working tree | — |

Geometry scene invariants held in every run: source wrapper `1264x100`, trigger `40x40`.

| Case | Signal (outside the source) | Red (pin) | Green (fix) |
|------|-----------------------------|-----------|-------------|
| G1 | `#scope.style.setProperty('--test-radius','20px')` | part `20px`, bone `4px` | bone `20px` |
| G2 | `#scope.setAttribute('dir','rtl')` | part x `1224`, bone x `0` | bone x `1224` |
| G3 | `#scope.classList.add('shifted')` gating `translateX(17px)` | part x `17`, bone x `0` | bone x `17` |
| G4 | stylesheet-only `translateX(17px)`, no attribute, no box | bone x `0` (observation) | bone x `0` (declared bound) |
| G4r | then `#scope.setAttribute('data-theme','dark')` | bone x `0` | bone x `17` |
| G1c/G2c | `data-audit-refresh` on the part inside the source | PASS | PASS |
