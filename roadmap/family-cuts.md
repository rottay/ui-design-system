---
title: "Design System Family cuts: chrome deriver + Modern skin + runtime + tests per family group"
date: 2026-09-05
status: canonical (adopted 2026-09-05 from audit/70-plan/roadmap-draft; state lives in roadmap/registry.json)
audience: ai-agent
sources:
  - audit/README.md (verdict, guide for the executor)
  - audit/30-findings/** (closure criteria of every F-nn cited below)
  - audit/70-plan/index.md (blocks, waves, indicators)
  - audit/50-matrices/customization-inventory/index.md §5 (identity kit, approved as-is by the owner on 2026-09-05, D-27)
---

# Family cuts: chrome deriver + Modern skin + runtime + tests per family group

Vertical cuts (Codex correction adopted): one WO per family group owns the chrome deriver, the Modern skin, the shared runtime and the tests of those families, so no family is written twice. Cuts run in parallel on disjoint directories after the shared roots exist. Classic/Rustic are never touched.

Lane-wide rules (binding on every WO):

- Repo: `/Users/daniel/Developer/Rottay/ui-design-system` (macOS, pnpm). Paths are relative to the repo root unless prefixed; "logical path" means the target-tree grammar of `audit/40-architecture/target` §5. D-21 is decided (owner, 2026-09-05): grammar (b), first level — `packages/core/src/{contracts,kernel,tokens,graphics,compilers,runtime,components,entrypoints}`. A logical path written `.../src/infrastructure/compilers/theme/**` therefore materializes as `.../src/compilers/theme/**`, `.../src/foundation/contracts/theme/**` as `.../src/contracts/theme/**`, and `.../src/infrastructure/runtime/<x>/**` as `.../src/runtime/<x>/**`. New code is born with this grammar from WO-CAT-02; what is not rewritten is normalized in WO-RET-04. `packages/core/scripts/check/architecture/audits/structure/index.mjs` and `CLAUDE.md` still pin the four-tier grammar, so WO-CAT-02 — the first WO that materializes a new first-level root — also amends that gate, its test and the written law.
- Engines: Modern is the only admitted engine; Classic and Rustic stay in the package frozen and fail-closed; no WO in any lane adds content, tokens, tests or a11y work to them (owner decision 2026-09-05).
- Every WO names the audit findings it closes (`Closes`) and is done only when the closure criterion of each cited `F-nn` (`audit/30-findings`) passes on the working tree, in addition to its own acceptance gate and a green DS build/test.
- Uniqueness: a WO that leaves two files or two processes with the same responsibility is not done.
- Executors are edit-only; the coordinator certifies and commits one lot at a time; never push.
- Write sets are declared before claiming; two in-flight WOs never share a file; the coordinator integrates shared files (`package.json`, CI, gate manifests).


### WO-FAM-00 Family cut template and per-family gate
- **Outcome** — A written, executable template for a vertical cut (what a family lot must deliver: deriver, skin, runtime, tests, causality probes) and the per-family gate that verifies it (`read-without-producer`, hardcode census, contract census TSX↔skin, class namespace, `data-state` coverage, axe). The template fixes the anatomy contract (`data-part`/`data-state`/`data-variant` mandatory) and the one-namespace rule.
- **Why** — Without a frozen template the cuts diverge (the audit measured 4 class vocabularies, 21/24 skins deciding state by pseudo-classes and stamped attributes nobody reads).
- **Closes** — F-67, F-66, F-37, F-09 (closure criteria in `audit/30-findings`).
- **Wave** — 3; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-DER-01.
- **Steps** —
  1. Write `roadmap/family-cut-template.md` and the gate script `scripts/check/family-cut/index.mjs` (reads the catalog fan-out and the family's skin).
  2. Template requirements beyond paint: the `adapt` slot of WO-INV-07 for layout-sensitive families; loading skeletons **derived from the family's `data-part` anatomy** by one shared skeleton renderer (no hand-made skeleton per component; shimmer through the motion vocabulary, reduced-motion safe); presence/enter animations only through the layout animation kernel (WO-INV-08).
  3. Calibrate on `button` (the family with cascade 4 today) before opening the other cuts.
- **Files** — `roadmap/family-cut-template.md (new)`; `packages/core/scripts/check/family-cut/** (new)`.
- **Acceptance gate** — Gate green on `button` and red on a planted `style={{ color }}` in its TSX and on a planted `--ds-button-x` read without producer.
- **Do NOT** — Do not open WO-FAM-01…11 before this gate exists.
- **Size** — S.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-FAM-00 (Family cut template and per-family gate) exactly as specified in `roadmap/family-cuts.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-67, F-66, F-37, F-09 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-FAM-01 Family cut: button, checkbox, radio, switch/toggle, segmented
- **Outcome** — For button, checkbox, radio, the unified switch/toggle (D-16) and segmented: the chrome deriver (`derivation/chrome/<family>`) emits every component channel from decisions (no channel read without producer; one namespace derived from the folder name); the Modern skin consumes typographic roles, material states, derived shadows, `--ds-radius-full`, the z-index scale and `[data-state]` anatomy (0 curated hardcodes); TSX carries no visual values; one class namespace `ds-<family>`; the shared runtime (state, overlay, listbox, calendar, direction, submit intent) is consumed instead of re-implemented; a11y, i18n and RTL follow the platform invariants; tests prove behaviour and causality, not CSS text.
- **Why** — Codex correction adopted: a family is written once, by one lot, across deriver + skin + runtime + tests. Audit scorecards for these families are in `audit/50-matrices/families/**`; the closure criteria per finding are in `audit/30-findings`.
- **Closes** — F-41, F-33, F-63, F-15 (closure criteria in `audit/30-findings`).
- **Wave** — 4; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-FAM-00, WO-DER-02, WO-DER-03, WO-DER-04, WO-INV-07 (adapt slot).
- **Steps** —
  1. Apply the WO-FAM-00 cut template; declare the family's decisions consumed and channels produced in the catalog fan-out.
  2. Skin migration: roles, material arms, `radius-full`, z-index scale, `data-state`, one class namespace; drain `style={{` and TSX literals (only runtime-computed `--ds-*` allowed inline).
  3. Runtime: adopt the shared kernels (`useInteractionState` with `pointerType`, `useFieldOverlay`, listbox/calendar kernels, `useOptionalDirection`, `resolveSubmitIntent`).
  4. Merge `Switch` and `Toggle` into one family with one token namespace (owner chooses the surviving name; the audit recommends keeping the richer contract).
  5. Tests: `EngineParity` is not needed (Modern only); add computed-style causality probes for the family's decisions, axe per family, RTL and i18n cases; delete text-of-CSS tests.
- **Files** — `packages/core/src/infrastructure/compilers/theme/derivation/chrome/<family>/** (logical path)`; `packages/core/src/foundation/tokens/css/runtime/engines/modern/skin/<family>/**`; `packages/core/src/foundation/tokens/css/presentation/components/<family>/**`; `packages/core/src/components/**/<family>/**`.
- **Acceptance gate** — `read-without-producer` = 0 for the family's channels; `top-hardcodes-curated` = 0 for the family's skins; contract census (attributes stamped vs consumed) = 0 mismatches; causality probes green for every decision the family declares; axe without serious violations; no `rottay-*` class emitted.
- **Do NOT** — Do not touch Classic/Rustic files of these families (frozen); do not split deriver/skin/runtime of the same family across different WOs.
- **Size** — L.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-FAM-01 (Family cut: button, checkbox, radio, switch/toggle, segmented) exactly as specified in `roadmap/family-cuts.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-41, F-33, F-63, F-15 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-FAM-02 Family cut: input, textarea, password, otp, tag-input, input-number, form-field and the form runtime
- **Outcome** — For input, textarea, password-input, otp-input, tag-input, input-number, form-field and `form` (runtime shared between engines): the chrome deriver (`derivation/chrome/<family>`) emits every component channel from decisions (no channel read without producer; one namespace derived from the folder name); the Modern skin consumes typographic roles, material states, derived shadows, `--ds-radius-full`, the z-index scale and `[data-state]` anatomy (0 curated hardcodes); TSX carries no visual values; one class namespace `ds-<family>`; the shared runtime (state, overlay, listbox, calendar, direction, submit intent) is consumed instead of re-implemented; a11y, i18n and RTL follow the platform invariants; tests prove behaviour and causality, not CSS text.
- **Why** — Codex correction adopted: a family is written once, by one lot, across deriver + skin + runtime + tests. Audit scorecards for these families are in `audit/50-matrices/families/**`; the closure criteria per finding are in `audit/30-findings`.
- **Closes** — F-78, F-26, F-39, F-33 (closure criteria in `audit/30-findings`).
- **Wave** — 4; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-FAM-00, WO-DER-02, WO-DER-03, WO-DER-04, WO-INV-07 (adapt slot).
- **Steps** —
  1. Apply the WO-FAM-00 cut template; declare the family's decisions consumed and channels produced in the catalog fan-out.
  2. Skin migration: roles, material arms, `radius-full`, z-index scale, `data-state`, one class namespace; drain `style={{` and TSX literals (only runtime-computed `--ds-*` allowed inline).
  3. Runtime: adopt the shared kernels (`useInteractionState` with `pointerType`, `useFieldOverlay`, listbox/calendar kernels, `useOptionalDirection`, `resolveSubmitIntent`).
  4. Extract `form/runtime/{state,validation}` (593 identical lines today); `FORM_DEFAULTS.layout` per D-22; unify the `inputnumber`/`input-number` namespace; IME-safe submit via `resolveSubmitIntent`.
  5. Tests: `EngineParity` is not needed (Modern only); add computed-style causality probes for the family's decisions, axe per family, RTL and i18n cases; delete text-of-CSS tests.
- **Files** — `packages/core/src/infrastructure/compilers/theme/derivation/chrome/<family>/** (logical path)`; `packages/core/src/foundation/tokens/css/runtime/engines/modern/skin/<family>/**`; `packages/core/src/foundation/tokens/css/presentation/components/<family>/**`; `packages/core/src/components/**/<family>/**`.
- **Acceptance gate** — `read-without-producer` = 0 for the family's channels; `top-hardcodes-curated` = 0 for the family's skins; contract census (attributes stamped vs consumed) = 0 mismatches; causality probes green for every decision the family declares; axe without serious violations; no `rottay-*` class emitted.
- **Do NOT** — Do not touch Classic/Rustic files of these families (frozen); do not split deriver/skin/runtime of the same family across different WOs.
- **Size** — L.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-FAM-02 (Family cut: input, textarea, password, otp, tag-input, input-number, form-field and the form runtime) exactly as specified in `roadmap/family-cuts.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-78, F-26, F-39, F-33 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-FAM-03 Family cut: select, auto-complete, cascader, tree-select, mentions, transfer, pickers and color-picker with shared listbox and calendar kernels
- **Outcome** — For select, auto-complete, cascader, tree-select, mentions, transfer, date-picker, time-picker and color-picker: the chrome deriver (`derivation/chrome/<family>`) emits every component channel from decisions (no channel read without producer; one namespace derived from the folder name); the Modern skin consumes typographic roles, material states, derived shadows, `--ds-radius-full`, the z-index scale and `[data-state]` anatomy (0 curated hardcodes); TSX carries no visual values; one class namespace `ds-<family>`; the shared runtime (state, overlay, listbox, calendar, direction, submit intent) is consumed instead of re-implemented; a11y, i18n and RTL follow the platform invariants; tests prove behaviour and causality, not CSS text.
- **Why** — Codex correction adopted: a family is written once, by one lot, across deriver + skin + runtime + tests. Audit scorecards for these families are in `audit/50-matrices/families/**`; the closure criteria per finding are in `audit/30-findings`.
- **Closes** — F-77, F-21, F-39 (closure criteria in `audit/30-findings`).
- **Wave** — 4; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-FAM-00, WO-DER-02, WO-DER-03, WO-DER-04, WO-INV-07 (adapt slot).
- **Steps** —
  1. Apply the WO-FAM-00 cut template; declare the family's decisions consumed and channels produced in the catalog fan-out.
  2. Skin migration: roles, material arms, `radius-full`, z-index scale, `data-state`, one class namespace; drain `style={{` and TSX literals (only runtime-computed `--ds-*` allowed inline).
  3. Runtime: adopt the shared kernels (`useInteractionState` with `pointerType`, `useFieldOverlay`, listbox/calendar kernels, `useOptionalDirection`, `resolveSubmitIntent`).
  4. Build `runtime/collection/listbox` over `roving-focus` + `typeahead` + `combobox` and a calendar kernel with `locale`/`weekStartsOn`/keyboard; adopt `useFieldOverlay` in all nine panels.
  5. Tests: `EngineParity` is not needed (Modern only); add computed-style causality probes for the family's decisions, axe per family, RTL and i18n cases; delete text-of-CSS tests.
- **Files** — `packages/core/src/infrastructure/compilers/theme/derivation/chrome/<family>/** (logical path)`; `packages/core/src/foundation/tokens/css/runtime/engines/modern/skin/<family>/**`; `packages/core/src/foundation/tokens/css/presentation/components/<family>/**`; `packages/core/src/components/**/<family>/**`; `packages/core/src/components/primitives/runtime/collection/**`; `packages/core/src/components/primitives/foundation/calendar/**`.
- **Acceptance gate** — `read-without-producer` = 0 for the family's channels; `top-hardcodes-curated` = 0 for the family's skins; contract census (attributes stamped vs consumed) = 0 mismatches; causality probes green for every decision the family declares; axe without serious violations; no `rottay-*` class emitted.
- **Do NOT** — Do not touch Classic/Rustic files of these families (frozen); do not split deriver/skin/runtime of the same family across different WOs.
- **Size** — XL.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-FAM-03 (Family cut: select, auto-complete, cascader, tree-select, mentions, transfer, pickers and color-picker with shared listbox and calendar kernels) exactly as specified in `roadmap/family-cuts.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-77, F-21, F-39 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-FAM-04 Family cut: modal, drawer, sheet, dialogs, popover, dropdown, hover-card, tooltip, tour and one Notifier
- **Outcome** — For modal, drawer, sheet, alert-dialog, confirm-dialog, popover, dropdown, hover-card, tooltip, tour, and the unified notifier (toast/notification/message, D-17) plus alert (callout removed): the chrome deriver (`derivation/chrome/<family>`) emits every component channel from decisions (no channel read without producer; one namespace derived from the folder name); the Modern skin consumes typographic roles, material states, derived shadows, `--ds-radius-full`, the z-index scale and `[data-state]` anatomy (0 curated hardcodes); TSX carries no visual values; one class namespace `ds-<family>`; the shared runtime (state, overlay, listbox, calendar, direction, submit intent) is consumed instead of re-implemented; a11y, i18n and RTL follow the platform invariants; tests prove behaviour and causality, not CSS text.
- **Why** — Codex correction adopted: a family is written once, by one lot, across deriver + skin + runtime + tests. Audit scorecards for these families are in `audit/50-matrices/families/**`; the closure criteria per finding are in `audit/30-findings`.
- **Closes** — F-41, F-68, F-40 (closure criteria in `audit/30-findings`).
- **Wave** — 4; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-FAM-00, WO-DER-02, WO-DER-03, WO-DER-04, WO-INV-07 (adapt slot).
- **Steps** —
  1. Apply the WO-FAM-00 cut template; declare the family's decisions consumed and channels produced in the catalog fan-out.
  2. Skin migration: roles, material arms, `radius-full`, z-index scale, `data-state`, one class namespace; drain `style={{` and TSX literals (only runtime-computed `--ds-*` allowed inline).
  3. Runtime: adopt the shared kernels (`useInteractionState` with `pointerType`, `useFieldOverlay`, listbox/calendar kernels, `useOptionalDirection`, `resolveSubmitIntent`).
  4. One `Notifier` with roles replaces toast/notification/message; `callout` folded into `alert`; mobile postures (fullscreen/`dvh`) for overlays; ARIA ids generated, never literal.
  5. Tests: `EngineParity` is not needed (Modern only); add computed-style causality probes for the family's decisions, axe per family, RTL and i18n cases; delete text-of-CSS tests.
- **Files** — `packages/core/src/infrastructure/compilers/theme/derivation/chrome/<family>/** (logical path)`; `packages/core/src/foundation/tokens/css/runtime/engines/modern/skin/<family>/**`; `packages/core/src/foundation/tokens/css/presentation/components/<family>/**`; `packages/core/src/components/**/<family>/**`.
- **Acceptance gate** — `read-without-producer` = 0 for the family's channels; `top-hardcodes-curated` = 0 for the family's skins; contract census (attributes stamped vs consumed) = 0 mismatches; causality probes green for every decision the family declares; axe without serious violations; no `rottay-*` class emitted.
- **Do NOT** — Do not touch Classic/Rustic files of these families (frozen); do not split deriver/skin/runtime of the same family across different WOs.
- **Size** — L.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-FAM-04 (Family cut: modal, drawer, sheet, dialogs, popover, dropdown, hover-card, tooltip, tour and one Notifier) exactly as specified in `roadmap/family-cuts.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-41, F-68, F-40 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-FAM-05 Family cut: menu, tabs, breadcrumb, pagination, steps and sidebar navigation
- **Outcome** — For menu, tabs, breadcrumb, pagination, the unified steps/stepper and sidebar navigation: the chrome deriver (`derivation/chrome/<family>`) emits every component channel from decisions (no channel read without producer; one namespace derived from the folder name); the Modern skin consumes typographic roles, material states, derived shadows, `--ds-radius-full`, the z-index scale and `[data-state]` anatomy (0 curated hardcodes); TSX carries no visual values; one class namespace `ds-<family>`; the shared runtime (state, overlay, listbox, calendar, direction, submit intent) is consumed instead of re-implemented; a11y, i18n and RTL follow the platform invariants; tests prove behaviour and causality, not CSS text.
- **Why** — Codex correction adopted: a family is written once, by one lot, across deriver + skin + runtime + tests. Audit scorecards for these families are in `audit/50-matrices/families/**`; the closure criteria per finding are in `audit/30-findings`.
- **Closes** — F-41 (closure criteria in `audit/30-findings`).
- **Wave** — 4; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-FAM-00, WO-DER-02, WO-DER-03, WO-DER-04, WO-INV-07 (adapt slot).
- **Steps** —
  1. Apply the WO-FAM-00 cut template; declare the family's decisions consumed and channels produced in the catalog fan-out.
  2. Skin migration: roles, material arms, `radius-full`, z-index scale, `data-state`, one class namespace; drain `style={{` and TSX literals (only runtime-computed `--ds-*` allowed inline).
  3. Runtime: adopt the shared kernels (`useInteractionState` with `pointerType`, `useFieldOverlay`, listbox/calendar kernels, `useOptionalDirection`, `resolveSubmitIntent`).
  4. Merge `steps` and `stepper` (same `StepStatus`).
  5. Tests: `EngineParity` is not needed (Modern only); add computed-style causality probes for the family's decisions, axe per family, RTL and i18n cases; delete text-of-CSS tests.
- **Files** — `packages/core/src/infrastructure/compilers/theme/derivation/chrome/<family>/** (logical path)`; `packages/core/src/foundation/tokens/css/runtime/engines/modern/skin/<family>/**`; `packages/core/src/foundation/tokens/css/presentation/components/<family>/**`; `packages/core/src/components/**/<family>/**`.
- **Acceptance gate** — `read-without-producer` = 0 for the family's channels; `top-hardcodes-curated` = 0 for the family's skins; contract census (attributes stamped vs consumed) = 0 mismatches; causality probes green for every decision the family declares; axe without serious violations; no `rottay-*` class emitted.
- **Do NOT** — Do not touch Classic/Rustic files of these families (frozen); do not split deriver/skin/runtime of the same family across different WOs.
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-FAM-05 (Family cut: menu, tabs, breadcrumb, pagination, steps and sidebar navigation) exactly as specified in `roadmap/family-cuts.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-41 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-FAM-06 Family cut: card, table, badge, tag, avatar, tree, list, descriptions and typography compounds
- **Outcome** — For card, table, badge, tag, avatar, tree, list, descriptions and the typography compounds (roles adoption): the chrome deriver (`derivation/chrome/<family>`) emits every component channel from decisions (no channel read without producer; one namespace derived from the folder name); the Modern skin consumes typographic roles, material states, derived shadows, `--ds-radius-full`, the z-index scale and `[data-state]` anatomy (0 curated hardcodes); TSX carries no visual values; one class namespace `ds-<family>`; the shared runtime (state, overlay, listbox, calendar, direction, submit intent) is consumed instead of re-implemented; a11y, i18n and RTL follow the platform invariants; tests prove behaviour and causality, not CSS text.
- **Why** — Codex correction adopted: a family is written once, by one lot, across deriver + skin + runtime + tests. Audit scorecards for these families are in `audit/50-matrices/families/**`; the closure criteria per finding are in `audit/30-findings`.
- **Closes** — F-30, F-63 (closure criteria in `audit/30-findings`).
- **Wave** — 4; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-FAM-00, WO-DER-02, WO-DER-03, WO-DER-04, WO-INV-07 (adapt slot).
- **Steps** —
  1. Apply the WO-FAM-00 cut template; declare the family's decisions consumed and channels produced in the catalog fan-out.
  2. Skin migration: roles, material arms, `radius-full`, z-index scale, `data-state`, one class namespace; drain `style={{` and TSX literals (only runtime-computed `--ds-*` allowed inline).
  3. Runtime: adopt the shared kernels (`useInteractionState` with `pointerType`, `useFieldOverlay`, listbox/calendar kernels, `useOptionalDirection`, `resolveSubmitIntent`).
  4. Typography compounds consume `--ds-type-<role>-*`; `Text/Heading/Paragraph/Link` through the factory (WO-CAN-06).
  5. Tests: `EngineParity` is not needed (Modern only); add computed-style causality probes for the family's decisions, axe per family, RTL and i18n cases; delete text-of-CSS tests.
- **Files** — `packages/core/src/infrastructure/compilers/theme/derivation/chrome/<family>/** (logical path)`; `packages/core/src/foundation/tokens/css/runtime/engines/modern/skin/<family>/**`; `packages/core/src/foundation/tokens/css/presentation/components/<family>/**`; `packages/core/src/components/**/<family>/**`.
- **Acceptance gate** — `read-without-producer` = 0 for the family's channels; `top-hardcodes-curated` = 0 for the family's skins; contract census (attributes stamped vs consumed) = 0 mismatches; causality probes green for every decision the family declares; axe without serious violations; no `rottay-*` class emitted.
- **Do NOT** — Do not touch Classic/Rustic files of these families (frozen); do not split deriver/skin/runtime of the same family across different WOs.
- **Size** — L.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-FAM-06 (Family cut: card, table, badge, tag, avatar, tree, list, descriptions and typography compounds) exactly as specified in `roadmap/family-cuts.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-30, F-63 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-FAM-07 Family cut: layout primitives with one implementation and a logical API
- **Outcome** — For box, flex, grid, stack, container, space, aspect-ratio, divider, splitter, scroll-area, collapse: the chrome deriver (`derivation/chrome/<family>`) emits every component channel from decisions (no channel read without producer; one namespace derived from the folder name); the Modern skin consumes typographic roles, material states, derived shadows, `--ds-radius-full`, the z-index scale and `[data-state]` anatomy (0 curated hardcodes); TSX carries no visual values; one class namespace `ds-<family>`; the shared runtime (state, overlay, listbox, calendar, direction, submit intent) is consumed instead of re-implemented; a11y, i18n and RTL follow the platform invariants; tests prove behaviour and causality, not CSS text.
- **Why** — Codex correction adopted: a family is written once, by one lot, across deriver + skin + runtime + tests. Audit scorecards for these families are in `audit/50-matrices/families/**`; the closure criteria per finding are in `audit/30-findings`.
- **Closes** — F-41, F-38, F-80 (closure criteria in `audit/30-findings`).
- **Wave** — 4; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-FAM-00, WO-DER-02, WO-DER-03, WO-DER-04, WO-INV-07 (adapt slot).
- **Steps** —
  1. Apply the WO-FAM-00 cut template; declare the family's decisions consumed and channels produced in the catalog fan-out.
  2. Skin migration: roles, material arms, `radius-full`, z-index scale, `data-state`, one class namespace; drain `style={{` and TSX literals (only runtime-computed `--ds-*` allowed inline).
  3. Runtime: adopt the shared kernels (`useInteractionState` with `pointerType`, `useFieldOverlay`, listbox/calendar kernels, `useOptionalDirection`, `resolveSubmitIntent`).
  4. One implementation per layout primitive (precedent `semantic-surface`); public props logical only (`ps/pe/ms/me`), `data-gap-preset` validated; `Collapse` Modern path owns its tokens (bridge deleted).
  5. Tests: `EngineParity` is not needed (Modern only); add computed-style causality probes for the family's decisions, axe per family, RTL and i18n cases; delete text-of-CSS tests.
- **Files** — `packages/core/src/infrastructure/compilers/theme/derivation/chrome/<family>/** (logical path)`; `packages/core/src/foundation/tokens/css/runtime/engines/modern/skin/<family>/**`; `packages/core/src/foundation/tokens/css/presentation/components/<family>/**`; `packages/core/src/components/**/<family>/**`.
- **Acceptance gate** — `read-without-producer` = 0 for the family's channels; `top-hardcodes-curated` = 0 for the family's skins; contract census (attributes stamped vs consumed) = 0 mismatches; causality probes green for every decision the family declares; axe without serious violations; no `rottay-*` class emitted.
- **Do NOT** — Do not touch Classic/Rustic files of these families (frozen); do not split deriver/skin/runtime of the same family across different WOs.
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-FAM-07 (Family cut: layout primitives with one implementation and a logical API) exactly as specified in `roadmap/family-cuts.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-41, F-38, F-80 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-FAM-08 Family cut: data-table, toolbars, column settings, saved views, widget-board, kanban, calendar-view, file-manager and shared DnD/export kernels
- **Outcome** — For data-table (+ mobile cards), list-toolbar/table-toolbar, column-settings/column-menu, saved-views(-menu), status-filter-pills/active-filters-bar, filter-panel/field-filters-panel, widget-board, kanban-board, calendar-view, file-manager, virtual-list, gallery/grid views: the chrome deriver (`derivation/chrome/<family>`) emits every component channel from decisions (no channel read without producer; one namespace derived from the folder name); the Modern skin consumes typographic roles, material states, derived shadows, `--ds-radius-full`, the z-index scale and `[data-state]` anatomy (0 curated hardcodes); TSX carries no visual values; one class namespace `ds-<family>`; the shared runtime (state, overlay, listbox, calendar, direction, submit intent) is consumed instead of re-implemented; a11y, i18n and RTL follow the platform invariants; tests prove behaviour and causality, not CSS text.
- **Why** — Codex correction adopted: a family is written once, by one lot, across deriver + skin + runtime + tests. Audit scorecards for these families are in `audit/50-matrices/families/**`; the closure criteria per finding are in `audit/30-findings`.
- **Closes** — F-22, F-81, F-69, F-82 (closure criteria in `audit/30-findings`).
- **Wave** — 4; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-FAM-00, WO-DER-02, WO-DER-03, WO-DER-04, WO-INV-07 (adapt slot).
- **Steps** —
  1. Apply the WO-FAM-00 cut template; declare the family's decisions consumed and channels produced in the catalog fan-out.
  2. Skin migration: roles, material arms, `radius-full`, z-index scale, `data-state`, one class namespace; drain `style={{` and TSX literals (only runtime-computed `--ds-*` allowed inline).
  3. Runtime: adopt the shared kernels (`useInteractionState` with `pointerType`, `useFieldOverlay`, listbox/calendar kernels, `useOptionalDirection`, `resolveSubmitIntent`).
  4. One implementation per capability duplicated between patterns and structures (structures compose patterns); one DnD kernel and one export; `PatternDataTable` consumes `--ds-density-*` and `aria-rowindex`; widget-board geometry by channel.
  5. Tests: `EngineParity` is not needed (Modern only); add computed-style causality probes for the family's decisions, axe per family, RTL and i18n cases; delete text-of-CSS tests.
- **Files** — `packages/core/src/infrastructure/compilers/theme/derivation/chrome/<family>/** (logical path)`; `packages/core/src/foundation/tokens/css/runtime/engines/modern/skin/<family>/**`; `packages/core/src/foundation/tokens/css/presentation/components/<family>/**`; `packages/core/src/components/**/<family>/**`.
- **Acceptance gate** — `read-without-producer` = 0 for the family's channels; `top-hardcodes-curated` = 0 for the family's skins; contract census (attributes stamped vs consumed) = 0 mismatches; causality probes green for every decision the family declares; axe without serious violations; no `rottay-*` class emitted.
- **Do NOT** — Do not touch Classic/Rustic files of these families (frozen); do not split deriver/skin/runtime of the same family across different WOs.
- **Size** — XL.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-FAM-08 (Family cut: data-table, toolbars, column settings, saved views, widget-board, kanban, calendar-view, file-manager and shared DnD/export kernels) exactly as specified in `roadmap/family-cuts.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-22, F-81, F-69, F-82 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-FAM-09 Family cut: charts with one series paint resolver and pure geometry
- **Outcome** — For the 18 chart families, renderers, geometry and theming runtime: the chrome deriver (`derivation/chrome/<family>`) emits every component channel from decisions (no channel read without producer; one namespace derived from the folder name); the Modern skin consumes typographic roles, material states, derived shadows, `--ds-radius-full`, the z-index scale and `[data-state]` anatomy (0 curated hardcodes); TSX carries no visual values; one class namespace `ds-<family>`; the shared runtime (state, overlay, listbox, calendar, direction, submit intent) is consumed instead of re-implemented; a11y, i18n and RTL follow the platform invariants; tests prove behaviour and causality, not CSS text.
- **Why** — Codex correction adopted: a family is written once, by one lot, across deriver + skin + runtime + tests. Audit scorecards for these families are in `audit/50-matrices/families/**`; the closure criteria per finding are in `audit/30-findings`.
- **Closes** — F-22, F-83, F-85 (closure criteria in `audit/30-findings`).
- **Wave** — 4; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-FAM-00, WO-DER-02, WO-DER-03, WO-DER-04, WO-INV-07 (adapt slot).
- **Steps** —
  1. Apply the WO-FAM-00 cut template; declare the family's decisions consumed and channels produced in the catalog fan-out.
  2. Skin migration: roles, material arms, `radius-full`, z-index scale, `data-state`, one class namespace; drain `style={{` and TSX literals (only runtime-computed `--ds-*` allowed inline).
  3. Runtime: adopt the shared kernels (`useInteractionState` with `pointerType`, `useFieldOverlay`, listbox/calendar kernels, `useOptionalDirection`, `resolveSubmitIntent`).
  4. Delete `useChartTheme` and the personality bifurcation; series painted by `var(--ds-chart-paint-N)`; geometry without color or locale (`'Mon'`, `timeMonday`, `DEFAULT_COLORS` out); legend by skin; `family-frame` deleted; rewrite `bithire-chart-palette.test`.
  5. Tests: `EngineParity` is not needed (Modern only); add computed-style causality probes for the family's decisions, axe per family, RTL and i18n cases; delete text-of-CSS tests.
- **Files** — `packages/core/src/infrastructure/compilers/theme/derivation/chrome/<family>/** (logical path)`; `packages/core/src/foundation/tokens/css/runtime/engines/modern/skin/<family>/**`; `packages/core/src/foundation/tokens/css/presentation/components/<family>/**`; `packages/core/src/components/**/<family>/**`.
- **Acceptance gate** — `read-without-producer` = 0 for the family's channels; `top-hardcodes-curated` = 0 for the family's skins; contract census (attributes stamped vs consumed) = 0 mismatches; causality probes green for every decision the family declares; axe without serious violations; no `rottay-*` class emitted.
- **Do NOT** — Do not touch Classic/Rustic files of these families (frozen); do not split deriver/skin/runtime of the same family across different WOs.
- **Size** — L.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-FAM-09 (Family cut: charts with one series paint resolver and pure geometry) exactly as specified in `roadmap/family-cuts.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-22, F-83, F-85 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-FAM-10 Family cut: forms and record surfaces on the ledger doctrine, headers with one contract
- **Outcome** — For FormSurface, WizardSurface, DetailFormSurface, GuidedDraftForm, record/* (edit-fields as the doctrine), the 12 headers, section-frame, surface-lifecycle: the chrome deriver (`derivation/chrome/<family>`) emits every component channel from decisions (no channel read without producer; one namespace derived from the folder name); the Modern skin consumes typographic roles, material states, derived shadows, `--ds-radius-full`, the z-index scale and `[data-state]` anatomy (0 curated hardcodes); TSX carries no visual values; one class namespace `ds-<family>`; the shared runtime (state, overlay, listbox, calendar, direction, submit intent) is consumed instead of re-implemented; a11y, i18n and RTL follow the platform invariants; tests prove behaviour and causality, not CSS text.
- **Why** — Codex correction adopted: a family is written once, by one lot, across deriver + skin + runtime + tests. Audit scorecards for these families are in `audit/50-matrices/families/**`; the closure criteria per finding are in `audit/30-findings`.
- **Closes** — F-55, F-41, F-64 (closure criteria in `audit/30-findings`).
- **Wave** — 4; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-FAM-00, WO-DER-02, WO-DER-03, WO-DER-04, WO-INV-07 (adapt slot).
- **Steps** —
  1. Apply the WO-FAM-00 cut template; declare the family's decisions consumed and channels produced in the catalog fan-out.
  2. Skin migration: roles, material arms, `radius-full`, z-index scale, `data-state`, one class namespace; drain `style={{` and TSX literals (only runtime-computed `--ds-*` allowed inline).
  3. Runtime: adopt the shared kernels (`useInteractionState` with `pointerType`, `useFieldOverlay`, listbox/calendar kernels, `useOptionalDirection`, `resolveSubmitIntent`).
  4. Forms stop being card stacks (`edit-fields`/`record/*` doctrine); one header contract (`getVariantTone` once); `SurfaceRegion` consumed by surfaces; drain the structures/surfaces inline styles baselined in WO-CAN-03.
  5. Tests: `EngineParity` is not needed (Modern only); add computed-style causality probes for the family's decisions, axe per family, RTL and i18n cases; delete text-of-CSS tests.
- **Files** — `packages/core/src/infrastructure/compilers/theme/derivation/chrome/<family>/** (logical path)`; `packages/core/src/foundation/tokens/css/runtime/engines/modern/skin/<family>/**`; `packages/core/src/foundation/tokens/css/presentation/components/<family>/**`; `packages/core/src/components/**/<family>/**`.
- **Acceptance gate** — `read-without-producer` = 0 for the family's channels; `top-hardcodes-curated` = 0 for the family's skins; contract census (attributes stamped vs consumed) = 0 mismatches; causality probes green for every decision the family declares; axe without serious violations; no `rottay-*` class emitted.
- **Do NOT** — Do not touch Classic/Rustic files of these families (frozen); do not split deriver/skin/runtime of the same family across different WOs.
- **Size** — L.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-FAM-10 (Family cut: forms and record surfaces on the ledger doctrine, headers with one contract) exactly as specified in `roadmap/family-cuts.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-55, F-41, F-64 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-FAM-11 Family cut: shells and workspace (app-shell regions, page-shell, workspace-shell, search, command palette, keyboard owner)
- **Outcome** — For app-shell, page-shell, workspace-shell, surface-chrome, search-command-bar, command palette, shortcuts overlay, action-dock, scope/view-mode switchers: the chrome deriver (`derivation/chrome/<family>`) emits every component channel from decisions (no channel read without producer; one namespace derived from the folder name); the Modern skin consumes typographic roles, material states, derived shadows, `--ds-radius-full`, the z-index scale and `[data-state]` anatomy (0 curated hardcodes); TSX carries no visual values; one class namespace `ds-<family>`; the shared runtime (state, overlay, listbox, calendar, direction, submit intent) is consumed instead of re-implemented; a11y, i18n and RTL follow the platform invariants; tests prove behaviour and causality, not CSS text.
- **Why** — Codex correction adopted: a family is written once, by one lot, across deriver + skin + runtime + tests. Audit scorecards for these families are in `audit/50-matrices/families/**`; the closure criteria per finding are in `audit/30-findings`.
- **Closes** — F-56, F-40, F-105 (closure criteria in `audit/30-findings`).
- **Wave** — 4; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-FAM-00, WO-DER-02, WO-DER-03, WO-DER-04, WO-INV-07 (adapt slot).
- **Steps** —
  1. Apply the WO-FAM-00 cut template; declare the family's decisions consumed and channels produced in the catalog fan-out.
  2. Skin migration: roles, material arms, `radius-full`, z-index scale, `data-state`, one class namespace; drain `style={{` and TSX literals (only runtime-computed `--ds-*` allowed inline).
  3. Runtime: adopt the shared kernels (`useInteractionState` with `pointerType`, `useFieldOverlay`, listbox/calendar kernels, `useOptionalDirection`, `resolveSubmitIntent`).
  4. `ShortcutProvider` mounted by `DesignSystemProvider` as the single keyboard owner (8 loose `keydown` removed; `/` and `mod+k` registered); `workspace-shell` without magic numbers or `data-cra-*`; copy through the catalog.
  5. Tests: `EngineParity` is not needed (Modern only); add computed-style causality probes for the family's decisions, axe per family, RTL and i18n cases; delete text-of-CSS tests.
- **Files** — `packages/core/src/infrastructure/compilers/theme/derivation/chrome/<family>/** (logical path)`; `packages/core/src/foundation/tokens/css/runtime/engines/modern/skin/<family>/**`; `packages/core/src/foundation/tokens/css/presentation/components/<family>/**`; `packages/core/src/components/**/<family>/**`.
- **Acceptance gate** — `read-without-producer` = 0 for the family's channels; `top-hardcodes-curated` = 0 for the family's skins; contract census (attributes stamped vs consumed) = 0 mismatches; causality probes green for every decision the family declares; axe without serious violations; no `rottay-*` class emitted.
- **Do NOT** — Do not touch Classic/Rustic files of these families (frozen); do not split deriver/skin/runtime of the same family across different WOs.
- **Size** — L.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-FAM-11 (Family cut: shells and workspace (app-shell regions, page-shell, workspace-shell, search, command palette, keyboard owner)) exactly as specified in `roadmap/family-cuts.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-56, F-40, F-105 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-FAM-12 Adaptive layout kit: auto-fit grids and card scale presets that absorb empty space
- **Outcome** — Grid views, gallery, widget-board, stats-grid and card collections lay out with `repeat(auto-fit, minmax(var(--ds-card-min-inline-size), 1fr))` driven by derived channels (`--ds-card-min-inline-size`, `--ds-grid-gap`, `--ds-card-scale`) so a larger card preset absorbs the free space instead of leaving gaps; the card family exposes `scale: sm | md | lg | xl` as an instance/surface-level prop mapped to channels; tenant `density.mode`, `spacing.rhythm` and `typography.scale` move the same channels; a container-query posture switches to a single column below the phone threshold of the responsive contract.
- **Why** — Owner requirement 2026-09-05: "cards más grandes, de modo que el espacio vacío se autoajuste". Today `widget-board` geometry and grid thresholds are hardcoded (F-81, F-35) and card size is not a channel.
- **Closes** — F-81 (partial: geometry by channel; the DnD/export kernels close in WO-FAM-08) (closure criteria in `audit/30-findings`).
- **Wave** — 4; after WO-FAM-06/07 on the same directories (coordinator serializes).
- **Depends on** — WO-FAM-06, WO-FAM-07, WO-DER-04, WO-INV-04, WO-INV-07 (adapt slot).
- **Steps** —
  1. Channels derived in `derivation/chrome/card` and `derivation/density`; the `scale` prop on Card maps to `--ds-card-scale` only.
  2. Grid/gallery/widget-board/stats-grid consume the auto-fit recipe from one layout primitive (`Grid` with `autoFit` + `minItem`), no per-pattern thresholds.
  3. Computed-style test: 3 cards at 1440 px with `scale="lg"` fill the row (no orphan gap); `density.mode=compact` reduces `--ds-card-min-inline-size`; single column at phone width.
- **Files** — `packages/core/src/components/primitives/layout/grid/**`; `packages/core/src/components/primitives/display/card/**`; `packages/core/src/components/patterns/data/{grid-view,gallery-view,stats-grid}/**`; `packages/core/src/components/patterns/data/widget-board/**`; `packages/core/src/foundation/tokens/css/runtime/engines/modern/skin/widget-board/**`; `packages/core/src/foundation/tokens/css/presentation/components/skin/widget-board/**`; `packages/core/src/infrastructure/compilers/theme/derivation/chrome/card/**` (logical path).
- **Acceptance gate** — Computed-style tests above green; `grep -rn "minmax(" src/components/patterns src/components/structures | grep -v "var(--ds-" | wc -l` = 0; the by-axis probe reports density moving ≥ 5 families.
- **Do NOT** — Do not add a per-pattern breakpoint; do not make card size a tenant decision (it is surface/instance level; the tenant moves it through density and scale only).
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-FAM-12 (Adaptive layout kit: auto-fit grids and card scale presets that absorb empty space) exactly as specified in `roadmap/family-cuts.md`: read first `audit/README.md` (guide for the executor) and `audit/70-plan/roadmap-draft/consumer-contract.md` §7 and the fiche of F-81 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-FAM-13 Widget board: resize and drag with animated reflow, content that adapts to its own size, snapping and persistence hooks
- **Outcome** — The dashboard widget board supports drag, resize (handles + keyboard), snapping to the grid of the adaptive layout kit and animated reflow of the other widgets through the layout animation kernel; each widget's content adapts to its **container posture** (`compact | regular | expanded`, WO-INV-07) so a KPI widget shows a number in compact and a chart in expanded, declared by the app through `adapt`; resize is committed through a typed layout model the app persists (the DS never stores it); phone posture stacks widgets in one column with reorder by long-press; all motion respects `motion.character`, the tenant dial and reduced motion; the perfection budget of WO-INV-08 applies.
- **Why** — Owner requirement 2026-09-05: "tenemos widgets que hacen resize, así que todo eso se tiene que autoajustar con animaciones, con tamaños, etcétera". Today `widget-board` geometry is hardcoded and DnD is re-implemented per pattern (F-81, F-69).
- **Closes** — F-69 (partial: one DnD kernel adopted by the board; the CSV/export kernel closes in WO-FAM-08) (closure criteria in `audit/30-findings`).
- **Wave** — 4; after WO-FAM-08 and WO-FAM-12 on `widget-board` (coordinator serializes).
- **Depends on** — WO-FAM-08, WO-FAM-12, WO-INV-07, WO-INV-08.
- **Steps** —
  1. Layout model (`WidgetLayout`: id, colSpan, rowSpan, order; per posture) and the app-side persistence contract (callbacks only).
  2. Interaction: pointer + keyboard resize/drag over the shared DnD kernel (WO-FAM-08), snapping to `--ds-grid-*` channels, live ghost, collision reflow animated by the kernel.
  3. Content adaptation via container posture; showroom probe-ground dashboard with six widgets exercising every case; Playwright trace for the budget.
- **Files** — `packages/core/src/components/patterns/data/widget-board/**`; `packages/core/src/foundation/tokens/css/runtime/engines/modern/skin/widget-board/**`; `packages/core/src/foundation/tokens/css/presentation/components/skin/widget-board/**`; `packages/core/src/infrastructure/runtime/application/interaction/drag-and-drop/**`; `packages/showroom/src/app/probe-ground/dashboard/**` (new).
- **Acceptance gate** — Keyboard-only resize and reorder work (axe clean); resizing one widget reflows the rest with animation and 0 long tasks; a widget declared `adapt: { compact: { view: 'number' }, expanded: { view: 'chart' } }` switches on resize without a viewport change; phone posture stacks in one column; no layout stored by the DS.
- **Do NOT** — Do not store layouts in `localStorage` inside the DS; do not implement a second DnD; do not animate size outside the kernel.
- **Size** — L.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-FAM-13 (Widget board: resize and drag with animated reflow, content that adapts to its own size, snapping and persistence hooks) exactly as specified in `roadmap/family-cuts.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-69 and F-81 in `audit/30-findings` and `audit/70-plan/roadmap-draft/consumer-contract.md` §6; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.
