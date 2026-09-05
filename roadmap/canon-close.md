---
title: "Design System Canon close: C4 landing, honest verification, CSS layers, parallel customization paths, overlay kernel, engine policy"
date: 2026-09-05
status: canonical (adopted 2026-09-05 from audit/70-plan/roadmap-draft; state lives in roadmap/registry.json)
audience: ai-agent
sources:
  - audit/README.md (verdict, guide for the executor)
  - audit/30-findings/** (closure criteria of every F-nn cited below)
  - audit/70-plan/index.md (blocks, waves, indicators)
  - audit/50-matrices/customization-inventory/index.md §5 (identity kit, approved as-is by the owner on 2026-09-05, D-27)
---

# Canon close: C4 landing, honest verification, CSS layers, parallel customization paths, overlay kernel, engine policy

This lane lands C4 and removes everything that competes with the compiler without touching the compiler. Every WO after WO-CAN-01 has a disjoint write set and runs in parallel. Modern is the only productive engine (owner decision 2026-09-05): this lane makes that fail-closed and spends zero effort on Classic/Rustic content.

Lane-wide rules (binding on every WO):

- Repo: `/Users/daniel/Developer/Rottay/ui-design-system` (macOS, pnpm). Paths are relative to the repo root unless prefixed; "logical path" means the target-tree grammar of `audit/40-architecture/target` §5. D-21 is decided (owner, 2026-09-05): grammar (b), first level — `packages/core/src/{contracts,kernel,tokens,graphics,compilers,runtime,components,entrypoints}`. A logical path written `.../src/infrastructure/compilers/theme/**` therefore materializes as `.../src/compilers/theme/**`, `.../src/foundation/contracts/theme/**` as `.../src/contracts/theme/**`, and `.../src/infrastructure/runtime/<x>/**` as `.../src/runtime/<x>/**`. New code is born with this grammar from WO-CAT-02; what is not rewritten is normalized in WO-RET-04. `packages/core/scripts/check/architecture/audits/structure/index.mjs` and `CLAUDE.md` still pin the four-tier grammar, so WO-CAT-02 — the first WO that materializes a new first-level root — also amends that gate, its test and the written law.
- Engines: Modern is the only admitted engine; Classic and Rustic stay in the package frozen and fail-closed; no WO in any lane adds content, tokens, tests or a11y work to them (owner decision 2026-09-05).
- Every WO names the audit findings it closes (`Closes`) and is done only when the closure criterion of each cited `F-nn` (`audit/30-findings`) passes on the working tree, in addition to its own acceptance gate and a green DS build/test.
- Uniqueness: a WO that leaves two files or two processes with the same responsibility is not done.
- Executors are edit-only; the coordinator certifies and commits one lot at a time; never push.
- Write sets are declared before claiming; two in-flight WOs never share a file; the coordinator integrates shared files (`package.json`, CI, gate manifests).


### WO-CAN-01 C4 landing: green tree, gates matrix and single commit
- **Outcome** — The post-C4 residuals are closed on the committed tree: `gates:ci` runs with zero code-class failures, the compiler suites are green except `dist/`-bound ones, `customization.contract.test.tsx` is 7/7, `typecheck:tests` is 0, `packages/core/src` has no empty directory, and no governance JSON still points at a path C4 deleted. No design change enters this WO.
- **Why** — `audit/30-findings/p0/index.md` F-01: C4 changed signatures and locations without propagating to the test files, the `migrate-v1` imports, the governance `sourceBindings`, the posture drill, the artifact renderer and three authoring surfaces. C4 is now committed (`bc1d206df`), so the landing itself is done and the residuals are measurable: 4 empty directories survive under `packages/core/src` (`foundation/tokens/css/runtime/bridges/collapse-paint`, `infrastructure/runtime/foundation/icons/active-profile/{provider,read,resolution}`) and 820 pointers in 53 `packages/core/governance/**` JSON files still cite `composition/tenant-theme/migrate-v1` or `kernel/runtime/appearance` (measured 2026-09-05; the same strings also appear in sealed `artifacts/quality/**` receipts, which are historical evidence and are NOT rewritten). The gates matrix has not been re-run since the commit.
- **Closes** — F-01, F-96 (closure criteria in `audit/30-findings`).
- **Wave** — 0; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — none.
- **Steps** —
  1. Run `node scripts/check/automation/runner/index.mjs --continue`; classify every red as CODIGO / ARTEFACTO-STALE / ENV (dist, corpus, git, docs). Fix only CODIGO and ARTEFACTO-STALE.
  2. Regenerate the derived views the manifest of gates expects (`manifest/generation`, `fanout`, `cascade/producers --write`, `customization/{surface,catalog,controls,preservation}`, `contract:generate`) and the governance JSON that cites `migrate-v1`.
  3. Remove the empty directories left by C4 (`runtime/bridges/collapse-paint`, `icons/active-profile/{provider,read,resolution}`) and any probe file outside `tests/`.
  4. Run `pnpm -C packages/core build` then the `dist/`-bound gates; run the full `unit` and `integration` vitest projects; `structure:check` must be 0 with the baseline untouched.
  5. One local commit, conventional subject, repo-local author, no AI attribution, never push. Sealed evidence under `packages/core/artifacts/quality/**` is out of scope: a receipt that records a path as it was at capture time is not stale.
- **Files** — `packages/core/src/**/tests/**`; `packages/core/tests/**`; `packages/core/governance/manifest/**`; `packages/core/artifacts/generated/**`; `packages/core/scripts/libraries/theme-lowering/index.mjs`.
- **Acceptance gate** — `node scripts/check/automation/runner/index.mjs --continue` reports no CODIGO/ARTEFACTO-STALE failure; `pnpm exec vitest run src/infrastructure/compilers` green except `dist/`; `find packages/core/src -type d -empty` prints nothing; `grep -rl -e "composition/tenant-theme/migrate-v1" -e "kernel/runtime/appearance" --include="*.json" packages/core/governance` prints nothing; `pnpm --filter @rottay/design-system structure:check` is 0 with the identity baseline untouched.
- **Do NOT** — Do not open any design change (C5) inside this WO. Do not widen a baseline. Do not touch `roadmap/**` or `audit/**`.
- **Size** — S.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-CAN-01 (C4 landing: green tree, gates matrix and single commit) exactly as specified in `roadmap/canon-close.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-01, F-96 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-CAN-02 Honest verification: pre/post-build gate manifest, mandatory drills, fail-open counters, tautological tests removed
- **Outcome** — A green gate means a law holds: no gate reads `dist/` before the build, every gate has a drill or a written reason, no `package.json` alias counts as a channel, the DaisyUI drain counter cannot be satisfied by a comment, tautological suites are gone, `retry` is 0, `structure:check` is in the manifest and `packages/core` lints itself with its own ESLint plugin.
- **Why** — F-23: 13 blocking gates require `dist/` pre-build; `wiring-coverage` legalizes aliases (≥20 checks nobody runs); `themeCss.unreferencedSelectors` is fail-open (`buildConsumedClassSet` reads backtick tokens inside `//` comments); `tests/system/theming` (1,214 lines) tests fictional tenants; ~9,000 findings frozen in baselines with `--widen` used. F-57: the DS publishes ESLint rules it does not apply to itself.
- **Closes** — F-23, F-49, F-57, F-97, F-103, F-104, F-107 (closure criteria in `audit/30-findings`).
- **Wave** — 1; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-CAN-01.
- **Steps** —
  1. Split `scripts/check/automation/gates/manifest/index.mjs` into `pre-build` and `post-build` phases; `validateManifest()` rejects a pre-build gate whose transitive imports reach `dist/` and rejects any gate without `drillId` or `noDrillReason`; move the 15 existing drills and `csspaint`/`containerquery`/`structure:check`/`test:diagnostics` (showroom, glob) into the manifest.
  2. `wiring-coverage`: remove the alias channel; adjudicate the ~20 orphan aliases (wire or delete). Move `prepack` checks to a post-build CI step.
  3. `engine/tokens/audit`: strip `//` comments in `buildConsumedClassSet`, take class tokens only from `className` expressions, recompute the baseline; add an injection drill per counter family (`themeCss.*`, `daisy.*`, `cascade-wiring`).
  4. Delete `tests/system/theming/index.test.ts`, `tests/fixtures/tenants/*.css`, `TENANT_CSS_EXPECTATIONS`; replace the 19 `if (!…) return;` guards by assertions; set `retry: 0`.
  5. Runner: `PREREQ-MISSING` distinct from `FAIL`, prerequisites in `--list`, `debtRatio` printed for every ratchet.
  6. Add `eslint.config.*` to `packages/core` with the published plugin; make `lint` run it; fix or explicitly exempt what it finds (`no-motion-literals` scope extended to `graphics/motion/**`).
- **Files** — `packages/core/scripts/check/automation/**`; `packages/core/scripts/check/engine/tokens/audit/index.mjs`; `packages/core/tests/system/theming/**`; `packages/core/tests/fixtures/tenants/**`; `packages/core/tests/support/engine/tenant/**`; `packages/core/vitest.config.ts`; `packages/core/eslint.config.* (new: no ESLint config exists in `packages/core` or at the repo root today; `lint` is a chain of checks)`; `packages/core/package.json`; `packages/showroom/package.json`; `.github/workflows/ci.yml`.
- **Acceptance gate** — `validateManifest()` rejects a planted gate without drill and a planted pre-build gate importing `dist/`; `themeCss.unreferencedSelectors > 0` until the Daisy rules are deleted (WO-RET-02); `node --test` of the deleted suites no longer exists; `pnpm --filter @rottay/design-system lint` runs ESLint and passes; runner `--list` shows prerequisites and debt per gate.
- **Do NOT** — Do not green a gate by widening its baseline. Do not delete a gate to make the matrix green; convert it or move it to post-build.
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-CAN-02 (Honest verification: pre/post-build gate manifest, mandatory drills, fail-open counters, tautological tests removed) exactly as specified in `roadmap/canon-close.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-23, F-49, F-57, F-97, F-103, F-104, F-107 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-CAN-03 CSS layers in tier order and a single entrypoint
- **Outcome** — `facade/entrypoints/` contains `base/` and `tests/` only; the layer order is `tokens → engines → components → structures → surfaces → responsive` so the higher tier wins without inline styles; the 172 false `DELIBERATELY UNLAYERED` headers are corrected; `styles.css` is derived from the same graph; entrypoint parity is a gate.
- **Why** — F-16: skins of structures/surfaces load in `rottay-components` before `rottay-engines`, so the higher tier only wins by escaping to inline (728 `style={{` across patterns/structures/surfaces, 2,282 px in structures skins); `styles/index.css` is a dead, divergent duplicate (Collapse, Arabic floor, touch floor); 172 headers document a cascade the build inverts.
- **Closes** — F-16, F-95, F-62, F-64 (closure criteria in `audit/30-findings`).
- **Wave** — 1; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-CAN-01.
- **Steps** —
  1. Reorder `@layer` in `foundation/tokens/css/facade/entrypoints/base/index.css:25`; add `rottay-structures` and `rottay-surfaces` layers after `rottay-engines`; move the structures/surfaces skin imports into them.
  2. Delete `facade/entrypoints/{styles,rottay,bithire,evnto}/index.css`; make the build produce `styles.css` from `base` + artifacts (it already does via `stylesBundle`); `csspaint:check` asserts `entrypoints.length === 1` and full import-graph parity (all `.css`, not only `skin/`).
  3. Import the collapse token sheet from `base` (or delete the bridge together with the Classic collapse path once WO-CAN-06 lands).
  4. Codemod the 172 headers; add a gate that compares a header's layer claim with the real `layer()` of its import; fix the `responsive`, `font-packs` manifest and `classic-anatomy-support` headers.
  5. Baseline `style={{` in structures/surfaces (decrease-only); the drain itself belongs to WO-FAM-10/11.
- **Files** — `packages/core/src/foundation/tokens/css/facade/entrypoints/**`; `packages/core/src/foundation/tokens/css/runtime/engines/**/index.css (headers only)`; `packages/core/scripts/check/engine/css/paint/layers/index.mjs`; `packages/core/scripts/build/verticals/css-build/index.mjs`.
- **Acceptance gate** — `ls src/foundation/tokens/css/facade/entrypoints` = `base tests`; `grep -rl "DELIBERATELY UNLAYERED" … | wc -l` = 0; `entrypoint-parity` gate green; a computed-style probe shows a structure token beating an engine token without inline.
- **Do NOT** — Do not touch skin rule bodies (only headers); do not drain inline styles here.
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-CAN-03 (CSS layers in tier order and a single entrypoint) exactly as specified in `roadmap/canon-close.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-16, F-95, F-62, F-64 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-CAN-04 Remove the parallel customization paths
- **Outcome** — No path beats the theme: `SurfaceVisualOverrides` is validated against the catalog and subordinate to the tenant; `Math.random()` never picks anatomy; `oauth-transition` (a parallel DS with product identity and `--rh-*`) leaves the DS; the provider bridge stops painting personality variables; `collection-workspace` carries no global state or product semantics.
- **Why** — F-18: instance overrides (13 fields × 33 configs) have the highest precedence and are written by the app; `Math.random()` in `data-terminal-card`/`insights` causes hydration mismatch; `oauth-transition` ships 2,278 skin lines, 6 hex palettes and 0 `var(--ds-` in production on 4 routes. F-17: the `css-variables-bridge` writes ~60 `--ds-personality-*` unconditionally. F-56: `window.location`, `localStorage`, `CustomEvent` shortcuts and `HIGH_VALUE_SCOPE_KEYS` inside the DS.
- **Closes** — F-18, F-56, F-17 (closure criteria in `audit/30-findings`).
- **Wave** — 1; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-CAN-01.
- **Steps** —
  1. `useSurfaceProfileDefaultsWithOverrides`: instance selections validated against the catalog; tenant wins; gate that fails if an override can contradict a decision.
  2. Gate forbidding `Math.random` in `src/components`; replace with deterministic variant selection in `data-terminal-card` and `insights`.
  3. Move `oauth-transition` (surface + skin) to the consuming apps as a literal copy first, then delete from the DS; the 4 routes migrate on the app side (consumer note X in `audit/70-plan/risks`).
  4. Delete `css-variables-bridge` personality writes; runtime facts come from the artifact only (WO-EMI-02 completes).
  5. `collection-workspace`: remove `window.location`, `localStorage`, `CustomEvent` shortcuts and domain keys; keyboard ownership moves to WO-FAM-11.
- **Files** — `packages/core/src/components/structures/foundation/chrome/**`; `packages/core/src/components/surfaces/foundation/contracts/**`; `packages/core/src/components/structures/dashboard/{data-terminal-card,insights}/**`; `packages/core/src/components/surfaces/presentation/pages/experience/oauth-transition/**`; `packages/core/src/foundation/tokens/css/presentation/components/skin/oauth-transition/**`; `packages/core/src/infrastructure/runtime/theming/presentation/adapters/react/css-variables-bridge/**`; `packages/core/src/components/surfaces/presentation/pages/workspace/collection-workspace/**`.
- **Acceptance gate** — `grep -rn "Math.random" src/components` = 0; `grep -rc -- "--rh-" src` = 0; test: an instance override cannot contradict a tenant decision; `grep -rn "window.location\|localStorage\|CustomEvent" src/components/surfaces src/components/structures` = 0 outside a declared runtime.
- **Do NOT** — Do not re-implement the overrides as a second catalog; do not keep `oauth-transition` "temporarily" in the DS.
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-CAN-04 (Remove the parallel customization paths) exactly as specified in `roadmap/canon-close.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-18, F-56, F-17 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-CAN-05 Overlay kernel adoption and one z-index scale
- **Outcome** — Every family with a panel (9 inputs + modal, drawer, sheet, dialogs, popover, dropdown, tooltip, tour, toast) uses one `useFieldOverlay(kind)` contract (`Portal` + `PortalScope` + `useOverlayPosition` + `useOverlayLayer` + ref-counted scroll-lock); one z-index scale in one file; no numeric `zIndex`, `createPortal` or `body.style.overflow` outside the kernel.
- **Why** — F-21: scroll-lock reimplemented 6× (a drawer stays scrollable after closing an alert-dialog, probe executed); 11 own `keydown`, 9 dismiss handlers; 5 z-index vocabularies with 4 undefined aliases; 5 Modern dropdowns without portal (clipped by `overflow:hidden`); 18 literal z-index in Modern skins and 8 in input TSX.
- **Closes** — F-21 (closure criteria in `audit/30-findings`).
- **Wave** — 1; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-CAN-01.
- **Steps** —
  1. Extract `useFieldOverlay(kind)` in `primitives/runtime/overlay`; adopt in the 9 input families and the overlay/feedback families; one scroll-lock with refcount.
  2. Unify the scale in `foundation/base/z-index/index.css` (the real scale today lives in `themes/default:938-948`); remove the 4 undefined aliases; the compiler emits the scale in WO-DER-04.
  3. Gate: `createPortal`, numeric `zIndex`, `body.style.overflow` forbidden outside the kernel.
- **Files** — `packages/core/src/components/primitives/runtime/overlay/**`; `packages/core/src/components/primitives/{inputs,feedback,overlay,display/tooltip}/**/engines/modern/index.tsx`; `packages/core/src/foundation/tokens/css/foundation/base/z-index/index.css`; `packages/core/src/foundation/tokens/css/foundation/themes/default/index.css (z-index block)`.
- **Acceptance gate** — Test drawer + alert-dialog keeps scroll locked; `grep -rn "createPortal\|zIndex: [0-9]\|body.style.overflow" src/components` = 0 outside the kernel; a single file declares `--ds-z-index-*`.
- **Do NOT** — Do not touch Classic/Rustic engine files (owner: zero effort); Rustic overlays get `rustic: null` where they only re-export Classic (WO-CAN-06).
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-CAN-05 (Overlay kernel adoption and one z-index scale) exactly as specified in `roadmap/canon-close.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-21 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-CAN-06 Engine policy: Modern is the only admitted engine, structure stays N-engine, Classic/Rustic frozen and fail-closed
- **Outcome** — `ENGINE_NAMES` is the single roster source (every guard, set, local union and registry derives from it, a gate forbids literals elsewhere); admission rejects by name any tenant or intent that selects an engine other than `modern` (or a registered `custom` pack); `custom` never degrades to Classic (`notification`/`message`/`form` refuse; Typography compounds resolve through the factory with pack support); `rustic` forwarding aliases become `rustic: null`; the posture drill measures the engine CSS surface separately from component TSX; the Classic anatomy manifest and adapter tell one truth; `[data-engine]` on the root is the declared authority in CSS. Classic and Rustic remain in the package for compatibility, frozen, with zero content work.
- **Why** — Owner decision 2026-09-05: the DS controls its engines; keep the structure able to host others, keep compatibility, but spend no effort on Classic/Rustic. F-14: the roster types `engine: "modern"` as a literal, admission is a no-op in production, two Classic `native` postures rest on inline TSX, `custom` silently renders antd without projection. F-28: ~48 roster authorities. F-15: Classic/Rustic degrade silently (36 % invalid paint; Rustic without cascade).
- **Closes** — F-14, F-28, F-29, F-65, F-100, F-15, F-79 (closure criteria in `audit/30-findings`).
- **Wave** — 1; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-CAN-01.
- **Steps** —
  1. Derive `isValidEngineName`, `effects.ENGINES`, the 16 local unions, showroom/tests/scripts rosters from `ENGINE_NAMES`; add the literal gate (0 findings target; today 44 + 12).
  2. `admission/engine`: any `engine !== 'modern'` without a registered pack is refused by name in every origin; `resolveEngine` loses its `PRIMARY_ENGINE` fallback; `scripts/libraries/theme-lowering` imports `verticalEngine`.
  3. Replace `return classicEngine` in `notification`, `message`, `form` by the factory refusal; `createSyncEngineComponent` for `Text/Heading/Paragraph/Link` with pack resolution; `rustic: null` in `list-toolbar` and `column-settings`; extend the `forwarding-engine` rule to `export { default } from '../<engine>'` and deep relative specifiers.
  4. Posture drill: `engineCssSurface` vs `engineComponentSurface`; reclassify Classic `palette.seeds`/`status-seeds` to `mapped`; anatomy gate derives from the adapter posture.
  5. Engine CSS gating by `[data-engine]` instead of `[data-tenant]` in `modern/theme`; document `[data-engine]` as the authority (D-18).
  6. Freeze policy rewritten per the decision: Classic/Rustic frozen, only their declared contract is tested; no family cut may touch them; `styles.css` for external consumers may keep them until WO-RET-02 decides the bundle split.
- **Files** — `packages/core/src/foundation/contracts/kernel/engine-identity/**`; `packages/core/src/infrastructure/runtime/engines/**`; `packages/core/src/infrastructure/compilers/runtime/theme/presentation/adapters/**`; `packages/core/src/components/primitives/feedback/{notification,message}/index.tsx`; `packages/core/src/components/primitives/inputs/form/index.ts`; `packages/core/src/components/primitives/display/typography/compound/**`; `packages/core/src/components/patterns/data/{list-toolbar,column-settings}/engines/rustic/index.tsx`; `packages/core/scripts/check/engine/{wiring,lifecycle/freeze,runtime/anatomy-variants}/**`; `packages/core/scripts/libraries/theme-lowering/index.mjs`; `packages/showroom/src/components/{showroom-context,runtime/query}/**`.
- **Acceptance gate** — Engine-literal gate = 0 findings; `node scripts/check/engine/wiring/index.mjs` reports the 3 custom→classic findings before and 0 after; test: registering `Text` in a pack and mounting `engine="custom"` renders the pack; test: a tenant document selecting `classic` is refused by name in preview and publish; posture drill green with the CSS-only surface.
- **Do NOT** — Do not delete Classic/Rustic code in this WO (compatibility stays); do not add Classic/Rustic skins, tokens, tests or a11y work anywhere in the program.
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-CAN-06 (Engine policy: Modern is the only admitted engine, structure stays N-engine, Classic/Rustic frozen and fail-closed) exactly as specified in `roadmap/canon-close.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-14, F-28, F-29, F-65, F-100, F-15, F-79 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.
