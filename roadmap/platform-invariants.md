---
title: "Design System Platform invariants: direction, i18n, accessibility, responsive, motion as engine-independent laws"
date: 2026-09-05
status: canonical (adopted 2026-09-05 from audit/70-plan/roadmap-draft; state lives in roadmap/registry.json)
audience: ai-agent
sources:
  - audit/README.md (verdict, guide for the executor)
  - audit/30-findings/** (closure criteria of every F-nn cited below)
  - audit/70-plan/index.md (blocks, waves, indicators)
  - audit/50-matrices/customization-inventory/index.md §5 (identity kit, approved as-is by the owner on 2026-09-05, D-27)
---

# Platform invariants: direction, i18n, accessibility, responsive, motion as engine-independent laws

Cross-family laws that must not be re-decided per family cut: a single direction authority, one i18n catalog, a global accessibility floor, one responsive contract, one motion vocabulary.

Lane-wide rules (binding on every WO):

- Repo: `/Users/daniel/Developer/Rottay/ui-design-system` (macOS, pnpm). Paths are relative to the repo root unless prefixed; "logical path" means the target-tree grammar of `audit/40-architecture/target` §5. D-21 is decided (owner, 2026-09-05): grammar (b), first level — `packages/core/src/{contracts,kernel,tokens,graphics,compilers,runtime,components,entrypoints}`. A logical path written `.../src/infrastructure/compilers/theme/**` therefore materializes as `.../src/compilers/theme/**`, `.../src/foundation/contracts/theme/**` as `.../src/contracts/theme/**`, and `.../src/infrastructure/runtime/<x>/**` as `.../src/runtime/<x>/**`. New code is born with this grammar from WO-CAT-02; what is not rewritten is normalized in WO-RET-04. `packages/core/scripts/check/architecture/audits/structure/index.mjs` and `CLAUDE.md` still pin the four-tier grammar, so WO-CAT-02 — the first WO that materializes a new first-level root — also amends that gate, its test and the written law.
- Engines: Modern is the only admitted engine; Classic and Rustic stay in the package frozen and fail-closed; no WO in any lane adds content, tokens, tests or a11y work to them (owner decision 2026-09-05).
- Every WO names the audit findings it closes (`Closes`) and is done only when the closure criterion of each cited `F-nn` (`audit/30-findings`) passes on the working tree, in addition to its own acceptance gate and a green DS build/test.
- Uniqueness: a WO that leaves two files or two processes with the same responsibility is not done.
- Executors are edit-only; the coordinator certifies and commits one lot at a time; never push.
- Write sets are declared before claiming; two in-flight WOs never share a file; the coordinator integrates shared files (`package.json`, CI, gate manifests).


### WO-INV-01 One direction authority and logical geometry everywhere
- **Outcome** — `useOptionalDirection()` is the only direction source (the 76 DOM probes are deleted; a gate forbids `closest('[dir]')`/`getComputedStyle().direction`); Modern CSS is 100 % logical (66 physical declarations migrated); the public API of Box/Stack/Flex is logical; directional icons mirror through `data-icon-mirrored`.
- **Why** — F-38: three direction authorities, SSR assumes LTR in five input families, 6 `placement` spellings, physical props in the public API.
- **Closes** — F-38 (closure criteria in `audit/30-findings`).
- **Wave** — 4; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-DER-01.
- **Steps** —
  1. Migrate the 43 probes in `src`; gate; logical props; `placement` start/end only.
- **Files** — `packages/core/src/infrastructure/runtime/i18n/composition/direction/**`; `packages/core/src/components/**`; `packages/core/src/foundation/tokens/css/runtime/engines/modern/**`.
- **Acceptance gate** — `grep -rn "closest('\[dir\]')" src/components` = 0; physical-property gate = 0 outside a written allowlist; `dir="rtl"` Playwright case per family group.
- **Do NOT** — Do not touch Classic/Rustic.
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-INV-01 (One direction authority and logical geometry everywhere) exactly as specified in `roadmap/platform-invariants.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-38 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-INV-02 One i18n catalog with an English floor, locale-aware formatting and IME-safe submit
- **Outcome** — Every visible string goes through the catalog (`i18n-key-parity` with ≥ 90 % adoption in Modern); `toLocale*()` calls use the provider locale; the calendar kernel takes `locale` and `weekStartsOn`; `resolveSubmitIntent` guards IME composition in all 10 `onPressEnter` sites; the Arabic font pack ships.
- **Why** — F-39: adoption 23.7 %; the shared calendar is fixed to English and Sunday-first; 28 `toLocale*()` without locale; 9 of 10 submit paths break CJK input; the Arabic fallback names a font the DS does not ship.
- **Closes** — F-39 (closure criteria in `audit/30-findings`).
- **Wave** — 4; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-DER-01.
- **Steps** —
  1. Catalog migration per family group (coordinated with the cuts); formatting helper with provider locale; `resolveSubmitIntent` in `foundation/behavior`; Arabic pack in `font-packs`.
- **Files** — `packages/core/src/infrastructure/runtime/i18n/**`; `packages/core/src/foundation/behavior/**`; `packages/core/src/foundation/tokens/css/foundation/typography/font-packs/**`; `packages/core/src/components/**`.
- **Acceptance gate** — `i18n-key-parity` adoption ≥ 90 % in Modern; `grep -rn "toLocale[A-Z][a-zA-Z]*(" src | grep -v locale | wc -l` = 0; test: date-picker with `locale='es'` renders `lun`; test: IME composition Enter does not submit.
- **Do NOT** — Do not hardcode English "temporarily" in a component with a catalog key available.
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-INV-02 (One i18n catalog with an English floor, locale-aware formatting and IME-safe submit) exactly as specified in `roadmap/platform-invariants.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-39 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-INV-03 Global accessibility floor: forced-colors, contrast posture, axe per family, no critical baseline
- **Outcome** — A global `@media (forced-colors: active)` block and `prefers-contrast` wired to `palette.contrast-posture` (D-23); axe per family for Modern × bithire (owner scope 2026-09-05; rottay/evnto matrices later) in CI with a baseline without `critical`; the touch-target gate runs in the manifest and rustic/classic are out of scope; ARIA ids generated; `pointerType` respected by `useInteractionState`.
- **Why** — F-40: `prefers-contrast` 3/469 files, forced-colors only in Modern skins, axe suite covers two tenants × one engine with critical violations grandfathered, 0 axe in inputs; F-47: the touch-target authority never runs.
- **Closes** — F-40, F-47 (closure criteria in `audit/30-findings`).
- **Wave** — 4; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-DER-03.
- **Steps** —
  1. Global floors in `foundation`; axe drill batch (24 inputs + display + overlays + patterns) in `e2e/a11y`; baseline cleaned; `touch-targets` in the gate manifest; matrix = Modern × bithire (two bithire tenants); evnto/rottay coverage deferred (D-24 decided 2026-09-05).
- **Files** — `packages/core/src/foundation/tokens/css/foundation/**`; `packages/showroom/e2e/a11y/**`; `packages/core/scripts/check/automation/gates/manifest/index.mjs`.
- **Acceptance gate** — `grep -c critical packages/showroom/e2e/a11y/axe-baseline.json` = 0; axe batch green for Modern × bithire (two tenants); `runner --list | grep touch` ≥ 1.
- **Do NOT** — Do not extend the a11y matrix to Classic/Rustic.
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-INV-03 (Global accessibility floor: forced-colors, contrast posture, axe per family, no critical baseline) exactly as specified in `roadmap/platform-invariants.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-40, F-47 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-INV-04 One responsive mechanism: contract-driven CSS first, JS behind useSyncExternalStore
- **Outcome** — `ResponsiveValue` + `generateResponsiveCSS` + `Show/Hide` over the responsive contract are the only mechanism; the six responsive authorities in structures/surfaces collapse into it; `useBreakpoints`/`useResponsiveValue` no longer call hooks conditionally; no `<style dangerouslySetInnerHTML>` per instance (channels per breakpoint instead); `@container` queries named; `100vh/100vw` → `dvh/dvw`.
- **Why** — F-46: conditional hooks, dead CSS-first family, `useResponsive` degrading to phone; F-35: 121 `@container` with 43 own thresholds; `responsive.posture` propagates as a JSON string.
- **Closes** — F-46, F-35 (closure criteria in `audit/30-findings`).
- **Wave** — 4; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-DER-04, WO-EMI-02.
- **Steps** —
  1. Rewrite the responsive runtime over the contract; migrate surfaces' six authorities; named containers; `dvh`.
- **Files** — `packages/core/src/infrastructure/runtime/responsive/**`; `packages/core/src/components/{structures/foundation/chrome/runtime/responsive,surfaces/runtime}/**`; `packages/core/src/components/primitives/{inputs,layout}/**`.
- **Acceptance gate** — `grep -rc "dangerouslySetInnerHTML" src/components/primitives/inputs` = 0; one responsive authority consumed by 33/33 surfaces; `grep -rn "100vh\|100vw" src | wc -l` = 0; ESLint hooks rule green.
- **Do NOT** — Do not keep `AdaptiveConfig` and the hook side by side.
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-INV-04 (One responsive mechanism: contract-driven CSS first, JS behind useSyncExternalStore) exactly as specified in `roadmap/platform-invariants.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-46, F-35 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-INV-05 Motion invariant: one vocabulary, zero inline literals, lint over every modern surface
- **Outcome** — No `transition`/`animation` literal in TSX (54 today, 52 in rustic which is frozen: only Modern counts); `no-motion-literals` covers `graphics/motion/**`; effects use `--ds-motion-*` eases; one icon size scale constant; reduced-motion kill switch universal.
- **Why** — F-31/F-114: two vocabularies, roles without rest values, easing hardcoded in effects outside the lint scope, icon scale declared three times.
- **Closes** — F-31, F-114 (closure criteria in `audit/30-findings`).
- **Wave** — 4; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-DER-04.
- **Steps** —
  1. Lint scope; migrate the 3 effect files and `icon/index.css` transitions; single `ICON_SIZE_MAP`; 12 animated CSS files without guard get the guard.
  2. Premium: page and view transitions (`view-transition-name` recipes for list→record, modal presence, tab changes) expressed only through the motion vocabulary and gated by `motion.character` and `prefers-reduced-motion`; no per-app animation code.
- **Files** — `packages/core/src/entrypoints/eslint/rules/no-motion-literals/**`; `packages/core/src/graphics/**`; `packages/core/src/foundation/tokens/css/presentation/components/icon/**`.
- **Acceptance gate** — ESLint `no-motion-literals` green over `graphics/motion/**`; `grep -rc "transition: '" src/components/*/*/engines/modern` = 0.
- **Do NOT** — Do not re-scope the lint to exclude a folder to make it pass.
- **Size** — S.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-INV-05 (Motion invariant: one vocabulary, zero inline literals, lint over every modern surface) exactly as specified in `roadmap/platform-invariants.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-31, F-114 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-INV-06 Surface posture contract: phone, tablet and desktop postures as app-owned configuration with a correct first paint
- **Outcome** — Every surface accepts `postures: { phone?, tablet?, desktop? }` where a posture declares which regions render, collapse or hide, the navigation mode (`sidebar | bottom-bar | drawer`), the density and the primary action placement; the DS resolves the posture on the server from the responsive contract (WO-INV-04) so the first paint is already the phone posture on a phone; `SurfaceRegion` implements it; the consumer fixture (WO-CON-04) exercises a simplified phone posture. The posture is app-owned configuration (level 2 of `consumer-contract.md` §7), not a tenant decision.
- **Why** — Owner requirement 2026-09-05: "que el móvil se vea distinto, muchísimo más simplificado". Today mobile is a scaled desktop (F-46: mobile-first first paint, six responsive authorities; F-35: 121 own container thresholds) and no surface can drop a region per posture.
- **Closes** — F-46 (partial: surface-level projection; the mechanism closes in WO-INV-04) (closure criteria in `audit/30-findings`).
- **Wave** — 4; after WO-FAM-10/11 on the same directories (coordinator serializes).
- **Depends on** — WO-INV-04, WO-FAM-10, WO-FAM-11.
- **Steps** —
  1. `surfaces/foundation/contracts/postures` (types, defaults per surface family) and `surfaces/runtime/postures` (resolution from the SSR hint + `useSyncExternalStore`).
  2. `SurfaceRegion` reads the resolved posture; `app-shell` navigation mode per posture (bottom bar on phone).
  3. Consumer fixture: list surface with a phone posture that hides the preview rail and the column menu and shows a bottom bar; computed-style/SSR test.
- **Files** — `packages/core/src/components/surfaces/foundation/contracts/postures/**` (new); `packages/core/src/components/surfaces/runtime/postures/**` (new); `packages/core/src/components/structures/shell/app-shell/**`; `packages/core/tests/integration/consumer/**`.
- **Acceptance gate** — SSR test: a phone request renders the simplified posture (no desktop chrome in the HTML) and desktop renders the full posture; a posture can hide a region by name; `grep -rn "useMediaQuery\|matchMedia" src/components/surfaces | wc -l` = 0 outside the runtime.
- **Do NOT** — Do not make postures a tenant decision (they are app composition); do not implement them with client-only media queries.
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-INV-06 (Surface posture contract: phone, tablet and desktop postures as app-owned configuration with a correct first paint) exactly as specified in `roadmap/platform-invariants.md`: read first `audit/README.md` (guide for the executor) and `audit/70-plan/roadmap-draft/consumer-contract.md` §7 and the fiche of F-46 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-INV-07 Adaptation slots: one typed `adapt` contract per family for viewport and container postures
- **Outcome** — Every family whose layout depends on space exposes `adapt?: Partial<Record<Posture, FamilyAdaptation>>` with the same posture names everywhere (viewport: `phone | tablet | desktop`; container: `compact | regular | expanded`) and a typed `FamilyAdaptation` per family; the app declares only deltas ("these are the columns that stay"); the DS resolves viewport postures on the server (first paint correct) and container postures by named container queries plus a `ResizeObserver` only where structure changes; the resolved posture is stamped as `data-posture` for skins; reference implementation on `PatternDataTable` (`columns: { keep, priority, shrink }`, `presentation: table | cards | list`, `rowActions: inline | menu | swipe`); the family-cut template requires the slot and a gate lists the families that must expose it.
- **Why** — Owner requirement 2026-09-05: customization lives in the BitHire screens, but the DS must stipulate the place: "la primitiva tiene que tener un lugar para decir 'estas son las columnas que van'". Today each pattern improvises (six responsive authorities, F-46; 43 own thresholds, F-35) and there is no typed place for the app to declare adaptation.
- **Closes** — F-35 (partial: named containers and posture names unified at the component level; the token contract closes in WO-DER-04) (closure criteria in `audit/30-findings`).
- **Wave** — 3; parallel with WO-DER-02…04 and WO-FAM-00 (coordinator merges the template change).
- **Depends on** — WO-DER-04, WO-FAM-00.
- **Steps** —
  1. `contracts/adaptation` (logical path): `Posture`, `ContainerPosture`, `Adapt<T>`, per-family `FamilyAdaptation` types with defaults; resolution runtime in `runtime/adaptation` (server hint + `useSyncExternalStore`; container via `@container` names of WO-INV-04 and a shared `useContainerPosture`).
  2. Reference implementation on `PatternDataTable` incl. phone `presentation: 'cards'` generated from the same column model (no second component); the family-cut template gains "expose `adapt` per WO-INV-07" and the gate `adapt-slot` (families listed in the catalog fan-out with `layoutSensitive: true` must accept `adapt` and stamp `data-posture`).
  3. Consumer fixture: a table that keeps three columns and switches to cards on phone, declared from the app side only.
- **Files** — `packages/core/src/foundation/contracts/adaptation/**` (new, logical path); `packages/core/src/infrastructure/runtime/adaptation/**` (new); `packages/core/src/components/patterns/data/data-table/**`; `roadmap/family-cut-template.md`; `packages/core/scripts/check/family-cut/**`; `packages/core/tests/integration/consumer/**`.
- **Acceptance gate** — `adapt-slot` gate green for `data-table`, `card`, `grid`, `form`, `app-shell`, `modal`, `charts` once their cuts land (red before, by design); SSR test: phone request renders the cards presentation with the three declared columns; a container 320 px wide flips `data-posture="compact"` without a viewport change; posture names identical across families (`grep` census = 1 vocabulary).
- **Do NOT** — Do not let a family invent its own posture names or thresholds; do not resolve viewport postures on the client only; do not make `adapt` a tenant decision.
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-INV-07 (Adaptation slots: one typed `adapt` contract per family for viewport and container postures) exactly as specified in `roadmap/platform-invariants.md`: read first `audit/README.md` (guide for the executor) and `audit/70-plan/roadmap-draft/consumer-contract.md` §6 and the fiches of F-35 and F-46 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-INV-08 Layout animation kernel: FLIP reflow, animated size, shared-element transitions, a perfection budget
- **Outcome** — One kernel in the motion runtime (`runtime/motion/layout`) provides: FLIP reflow for any container whose children move (grid reflow after a card grows, list reorder, view-mode switches), animated size changes (`interpolate-size`/`calc-size` where supported, measured FLIP fallback), shared-element transitions (list → record) and presence (enter/exit) through the `--ds-motion-*` vocabulary and `motion.character`; every animation uses `transform`/`opacity`/`clip-path` only (size via the kernel), respects `prefers-reduced-motion` and the tenant's motion dial; a perfection budget gate measures the consumer fixture and the widget board: 0 long tasks (> 50 ms) during a 1 s resize/reorder trace and no frame > 16.7 ms in the recorded trace on the CI machine's baseline.
- **Why** — Owner requirement 2026-09-05: "es importantísimo que sea muy animado, muy interactivo y muy perfecto". Without one kernel every family animates differently (two motion vocabularies, F-31; 13 invalid animations without artifact) and layout animations thrash layout.
- **Closes** — (decision / enabling WO; F-31 closes in WO-DER-04/WO-INV-05) (closure criteria in `audit/30-findings`).
- **Wave** — 4; parallel with the family cuts (write set disjoint: `runtime/motion/layout`).
- **Depends on** — WO-DER-04, WO-INV-05.
- **Steps** —
  1. Kernel API: `useLayoutAnimation(ref, { kind: 'reflow' | 'size' | 'presence' | 'shared', character })`, `LayoutGroup`, `AnimatePresence`-equivalent without a third-party runtime (or with one pinned, decided in this WO with a bundle budget).
  2. Adoption points: `Grid autoFit` (WO-FAM-12), collection view-mode switch, list reorder, accordion/collapse, modal/sheet presence, list → record shared element.
  3. Perfection budget gate (`motion-budget`): Playwright trace + CDP metrics on the consumer fixture and the widget board; lint rule: animated properties restricted to transform/opacity/clip-path outside the kernel.
- **Files** — `packages/core/src/infrastructure/runtime/motion/layout/**` (new, logical path); `packages/core/src/components/primitives/layout/{grid,collapse}/**`; `packages/core/src/components/patterns/data/grid-view/**`; `packages/core/src/components/patterns/visualization/kanban-board/**`; `packages/core/scripts/check/motion-budget/**` (new); `packages/core/src/entrypoints/eslint/rules/no-layout-property-animation/**` (new).
- **Acceptance gate** — Reflow of a 12-card grid when one card grows is animated with 0 long tasks in the trace; `prefers-reduced-motion` reduces every kernel animation to opacity-only; the lint rule fails on `transition: height`; bundle delta of the kernel ≤ 8 KB gzip.
- **Do NOT** — Do not animate `width/height/top/left` outside the kernel; do not add a second animation library per family.
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-INV-08 (Layout animation kernel: FLIP reflow, animated size, shared-element transitions, a perfection budget) exactly as specified in `roadmap/platform-invariants.md`: read first `audit/README.md` (guide for the executor) and the fiche of F-31 in `audit/30-findings` and `audit/70-plan/roadmap-draft/consumer-contract.md` §6; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.
