---
title: "Design System Derivation: the cascade as one deriver per family"
date: 2026-09-05
status: canonical (adopted 2026-09-05 from audit/70-plan/roadmap-draft; state lives in roadmap/registry.json)
audience: ai-agent
sources:
  - audit/README.md (verdict, guide for the executor)
  - audit/30-findings/** (closure criteria of every F-nn cited below)
  - audit/70-plan/index.md (blocks, waves, indicators)
  - audit/50-matrices/customization-inventory/index.md §5 (identity kit, approved as-is by the owner on 2026-09-05, D-27)
---

# Derivation: the cascade as one deriver per family

Station 4. Decisions in, channels out; nothing intermediate is authored. This lane replaces transcription (`chrome-variables`, 9K-line brand themes) with derivers that declare what they consume and produce. Shared roots first (states, shape, palette, typography, density, rhythm, elevation, motion, modes), then presets as decisions.

Lane-wide rules (binding on every WO):

- Repo: `/Users/daniel/Developer/Rottay/ui-design-system` (macOS, pnpm). Paths are relative to the repo root unless prefixed; "logical path" means the target-tree grammar of `audit/40-architecture/target` §5. D-21 is decided (owner, 2026-09-05): grammar (b), first level — `packages/core/src/{contracts,kernel,tokens,graphics,compilers,runtime,components,entrypoints}`. A logical path written `.../src/infrastructure/compilers/theme/**` therefore materializes as `.../src/compilers/theme/**`, `.../src/foundation/contracts/theme/**` as `.../src/contracts/theme/**`, and `.../src/infrastructure/runtime/<x>/**` as `.../src/runtime/<x>/**`. New code is born with this grammar from WO-CAT-02; what is not rewritten is normalized in WO-RET-04. `packages/core/scripts/check/architecture/audits/structure/index.mjs` and `CLAUDE.md` still pin the four-tier grammar, so WO-CAT-02 — the first WO that materializes a new first-level root — also amends that gate, its test and the written law.
- Engines: Modern is the only admitted engine; Classic and Rustic stay in the package frozen and fail-closed; no WO in any lane adds content, tokens, tests or a11y work to them (owner decision 2026-09-05).
- Every WO names the audit findings it closes (`Closes`) and is done only when the closure criterion of each cited `F-nn` (`audit/30-findings`) passes on the working tree, in addition to its own acceptance gate and a green DS build/test.
- Uniqueness: a WO that leaves two files or two processes with the same responsibility is not done.
- Executors are edit-only; the coordinator certifies and commits one lot at a time; never push.
- Write sets are declared before claiming; two in-flight WOs never share a file; the coordinator integrates shared files (`package.json`, CI, gate manifests).


### WO-DER-01 FamilyDeriver contract, pipeline orchestrator and ranked merge
- **Outcome** — `FamilyDeriver(LoweringContext) → channels` with typed `consumes`/`produces`; `compilers/theme/pipeline/index.ts` is the only orchestrator (`runtime/variables` and `kernel/runtime/appearance` retired); precedence is one ranked merge (`tenant > vertical-override > derived`, `PRODUCER_RANK` real); one color owner (`foundation/kernel/color`); no channel has two producers; a `read-without-producer` ratchet with an honest baseline and `cascade.transitivelyUnwired` published.
- **Why** — F-71: expressive expansion ×4 inside the lowering (+2 outside), a second orchestrator of 489 lines; F-34: 5 channels assigned twice; F-43: two color owners, 5 hex parsers, a dead `wcag` with its own `contrastRatio`; F-09: `PRODUCER_RANK` exists and is not used.
- **Closes** — F-71, F-34, F-90, F-43, F-09 (closure criteria in `audit/30-findings`).
- **Wave** — 3; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-CAT-03.
- **Steps** —
  1. Define the contract and a per-family contract test template; freeze it before opening WO-DER-02…04 and the family cuts.
  2. Write `pipeline/index.ts`; delete `lowering/runtime/variables` as orchestrator and `kernel/runtime/appearance` (move `withExpressiveFieldDefaults` into `derivation/expressive`).
  3. Ranked merge in one place; remove `{...paletteVars, ...chromeVars}` spreads.
  4. `foundation/kernel/color` as the only color math; delete `color-math` duplicates, `wcag/index.ts`, extra hex parsers and chart CSS→hex resolvers.
  5. Ratchets: `read-without-producer` (skins Modern, honest baseline) and transitive `cascade-wiring`.
- **Files** — `packages/core/src/infrastructure/compilers/runtime/theme/runtime/lowering/**`; `packages/core/src/infrastructure/compilers/kernel/{runtime/appearance,foundation/css/color-math}/**`; `packages/core/src/foundation/kernel/color/**`; `packages/core/scripts/check/engine/cascade-wiring/**`.
- **Acceptance gate** — Every file under `derivation/**` ≤ 250 lines; 0 duplicate producers (`channel-liveness` reports none); contract test per family template green; `grep -rn "function contrastRatio\|parseHex" src | wc -l` = 1 each.
- **Do NOT** — Do not port `chrome-variables` as-is into a deriver; the family cuts (WO-FAM-*) rewrite it per family.
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-DER-01 (FamilyDeriver contract, pipeline orchestrator and ranked merge) exactly as specified in `roadmap/derivation.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-71, F-34, F-90, F-43, F-09 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-DER-02 States and materials as derived roots
- **Outcome** — `derivation/{materials,states}` emit the 71 `--ds-material-*` roots × states for every vertical; `states.emphasis` and `states.focus-style` exist in the catalog; component state channels resolve through `var(--ds-<comp>-…, var(--ds-material-…))`; a gate forbids a component state channel without a material arm.
- **Why** — F-10: material coverage is 0 % (rottay), 3 % (evnto), 92 % (bithire); 488 state channels are hand-authored; `[data-state]` is read by 13 % of Modern skins.
- **Closes** — F-10 (closure criteria in `audit/30-findings`).
- **Wave** — 3; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-DER-01.
- **Steps** —
  1. Derivers for material roots and state deltas; emission mandatory for all verticals.
  2. Catalog rows `states.emphasis`, `states.focus-style` with fan-out and minimum families.
  3. Gate: no `--ds-<comp>-*-hover/-active/-selected/-disabled` declared without a material fallback.
- **Files** — `packages/core/src/infrastructure/compilers/theme/derivation/{materials,states}/** (logical path)`; `packages/core/src/foundation/tokens/css/foundation/themes/default/index.css (material block becomes derived)`.
- **Acceptance gate** — Per artifact 71/71 `--ds-material-*` keys (today 0 / 65 / 2); computed-style probe: `states.emphasis` moves ≥ 10 families; gate for state channels without material arm green.
- **AMENDMENT (R4, 2026-09-08) — materialization grammar, and what the landed source did and did not close** — The source of this WO landed at committed `34790cf43` and the WO stays **open**: `states.emphasis` moves 16 of 123 skins (13 %), well under its own `≥ 10 families` computed-style bar read against the fleet, and the 71/71 material-key acceptance is unproven. Landing is not closing, and the partial is registered in this WO's progress log rather than being read as a close. **D-21 (b) materialization**: every file this WO creates is born under the first-level grammar `packages/core/src/{contracts,kernel,tokens,graphics,compilers,runtime,components,entrypoints}` — the `Files` line above is written in logical paths, and a logical `.../src/infrastructure/compilers/theme/derivation/**` materializes as `.../src/compilers/theme/derivation/**`. New code is born with the grammar; what is not rewritten is normalized by `WO-RET-04`, which also owns the final `structure:check` and `CLAUDE.md` alignment for any stray this lane leaves behind.
- **Do NOT** — Do not hand-author any material value in a preset.
- **Size** — L.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-DER-02 (States and materials as derived roots) exactly as specified in `roadmap/derivation.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-10 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-DER-03 Shape and palette derived once
- **Outcome** — `derivation/shape/{radius,nesting,button,control-height}` applies the radius dial exactly once (foundation stops rescaling); `derivation/palette/{seeds,ramps,tints,inks,semantic,neutral-temperature,contrast-posture}`; semantic shadows derived by `color-mix` over the semantic color; the monochrome ramp derived from the tenant neutral; the `accent` ramp gets readers or is removed; button style derived in station 4 for both transports.
- **Why** — F-07: the Standard radius dial cancels itself (compiler divides, foundation multiplies; only `skeleton` moves); F-08: `shape.button-style` diverges static/DB because the derivation lives in the DB ingress; F-32: shadows hardcoded to a foreign palette are consumed by rottay/evnto artifacts; Rottay's mono ramp ships to every tenant.
- **Closes** — F-07, F-08, F-32 (closure criteria in `audit/30-findings`).
- **Wave** — 3; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-DER-01.
- **Steps** —
  1. Move `buttonGeometry` derivation from `document-patch:517-534` into `derivation/shape/button`.
  2. Radius: final values emitted by the deriver; remove the `calc(… * var(--ds-radius-scale))` re-scaling in foundation CSS.
  3. Palette derivers incl. the two new decisions; shadows and mono derived; decide readers for `--ds-color-accent-*`.
- **Files** — `packages/core/src/infrastructure/compilers/theme/derivation/{shape,palette}/** (logical path)`; `packages/core/src/infrastructure/compilers/runtime/theme/runtime/ingress/foundation/document-patch/index.ts`; `packages/core/src/foundation/tokens/css/foundation/{base/shadows,monochrome,base/*}/index.css`.
- **Acceptance gate** — Computed-style probe: `--ds-radius-md` differs between `radiusScale` 0.8 and 1.2 in ≥ 20 families; `theme-transport-parity` equal for `shape.button-style`; `grep -cE "rgba\(" foundation/base/shadows/index.css` = 0; `grep -c "#" foundation/monochrome/index.css` = 0; `channel-liveness` green.
- **Do NOT** — Do not keep both the compiler and the foundation applying the dial "for safety".
- **Size** — L.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-DER-03 (Shape and palette derived once) exactly as specified in `roadmap/derivation.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-07, F-08, F-32 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-DER-04 Typography roles, density, rhythm, elevation and motion as derived families
- **Outcome** — `derivation/typography/{roles,scale,pairing,weights,numeric,packs}` (31 `--ds-text-*` derived; one typographic authority; `compat/typography-scale` deleted); `derivation/{density,rhythm}` (one vocabulary; `normal` expressible; one `:root` owner of the spacing ramp); `derivation/elevation` (roles 0…6 with 3 scales, `border-style`, z-index scale emitted); `derivation/motion` (one `--ds-motion-*` vocabulary with rest values for every role; `--ds-transition-*` deleted; `motion.character`); the responsive contract (breakpoints + postures) projected to CSS tokens; a root-authority gate over all of `foundation/**` with the `type` family included.
- **Why** — F-30: role channels reach 14/123 skins; F-31: two motion vocabularies and roles without rest values (13 invalid animations without artifact); F-36: `normal` inexpressible, three spacing declarers, four `size` vocabularies; F-26: 71 tokens with competing defaults; F-35: 0 breakpoint tokens, 5 vocabularies.
- **Closes** — F-30, F-31, F-36, F-26, F-35, F-21, F-84 (closure criteria in `audit/30-findings`).
- **Wave** — 3; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-DER-01.
- **Steps** —
  1. One deriver per family with contract tests; delete `lowering/foundation/type-ramp` fixed channels and `facade/compat/typography-scale`.
  2. Root-authority gate: any `:root` channel declared in two files with different values fails (today ≥ 2 in `type`, 71 measured).
  3. Responsive contract: `--ds-breakpoint-*`/`@custom-media` projected; the 15 literal breakpoints migrate.
  4. z-index: the scale from WO-CAN-05 is emitted by the compiler.
- **Files** — `packages/core/src/infrastructure/compilers/theme/derivation/{typography,density,rhythm,elevation,motion,responsive}/** (logical path)`; `packages/core/src/foundation/tokens/css/foundation/{base/typography,base/spacing,base/density,animations/transitions,responsive}/**`; `packages/core/src/foundation/tokens/ts/facade/compat/**`.
- **Acceptance gate** — `grep -rc -- "--ds-transition-" src | grep -v ":0"` empty; `--ds-motion-calm` has a rest value in the engine bundle; root-authority gate = 0 conflicts; `grep -rn -- "--ds-breakpoint" src/foundation/tokens/css | wc -l` ≥ 1 and literal `min-width: Npx` = 0 outside the contract; `LegacySizeAlias` = 0 outside classic.
- **Do NOT** — Do not add a fifth typographic vocabulary; migrate skins to roles in the family cuts, not here.
- **Size** — L.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-DER-04 (Typography roles, density, rhythm, elevation and motion as derived families) exactly as specified in `roadmap/derivation.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-30, F-31, F-36, F-26, F-35, F-21, F-84 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-DER-05 Modes derived from decisions and one default-mode law
- **Outcome** — `derivation/modes` derives the light/dark overlay from the same decisions (never from an authored overlay); `resolveDocumentMode(vertical, document)` reads the roster first (`?? "light"` = 0); a tenant's decisions cross modes; `auto` emits one `prefers-color-scheme` block; the vertical baseline is compiled once and cached by digest.
- **Why** — F-05: the vertical overlay restores its values over the tenant patch (delta for the non-default mode = 0 in all verticals); a rottay tenant with `palette.primary` gets an empty base block and flips to light; previews drop mode blocks.
- **Closes** — F-05, F-73 (closure criteria in `audit/30-findings`).
- **Wave** — 4; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-DER-02, WO-DER-03, WO-DER-04.
- **Steps** —
  1. Deriver `modes`; remove `mode-overlay` transcription; per-mode adjustments only as `SanctionedOverrides` by mode.
  2. Single `resolveDocumentMode`; delete the 10 `?? "light"` sites.
  3. `auto` one block; baseline cache by digest.
- **Files** — `packages/core/src/infrastructure/compilers/theme/derivation/modes/** (logical path)`; `packages/core/src/infrastructure/compilers/runtime/theme/runtime/lowering/{foundation/mode-overlay,runtime/mode-blocks}/**`; `packages/core/src/infrastructure/compilers/composition/tenant-theme/index.ts`; `packages/core/src/infrastructure/runtime/foundation/root-attributes/ssr/index.ts`.
- **Acceptance gate** — Test: rottay document `{palette.primary}` → non-empty base block, `colorScheme: dark`, and `[data-theme='light']` carries the tenant primary; `grep -rn '?? "light"' packages/core/src` = 0 outside the roster; an `auto` artifact contains exactly one dark block.
- **Do NOT** — Do not special-case a vertical inside the mode deriver.
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-DER-05 (Modes derived from decisions and one default-mode law) exactly as specified in `roadmap/derivation.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-05, F-73 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-DER-06 Vertical presets as decisions; BrandTheme retired; neutral foundation without opinion
- **Outcome** — `presets/verticals/{rottay,bithire,evnto}` are `ThemeDecisions` (+ closed `SanctionedOverrides`); `brand-themes/*` (9,345 / 9,323 / 4,975 lines), `BrandTheme` and the visual fields of `VERTICAL_REGISTRY` are deleted; `foundation/themes/default` keeps only structural, opinion-free values (D-14); evnto and rottay receive identity by decisions; a gate fails on a preset containing a derivable value.
- **Why** — F-11: the neutral "Vercel black & white" theme ships in every bundle and evnto overrides 20.8 % of it; nine input families receive zero channels in bithire and evnto; F-25/F-54: three artifacts are three different surfaces (12 % intersection of authored leaves).
- **Closes** — F-11, F-25, F-54, F-108 (closure criteria in `audit/30-findings`).
- **Wave** — 4; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-DER-05, WO-CAT-02, WO-CON-03 (its decision→keypath adapter is deleted here or in WO-CAT-02, whichever lands last), WO-DER-07 (the chosen bithire identity).
- **Steps** —
  1. Author the bithire preset from the decision set chosen in WO-DER-07; rottay and evnto receive structural-neutral decision sets only (owner scope 2026-09-05: only app-bithire matters now; their identities are a later program).
  2. Delete `brand-themes/*`, `BrandTheme`, `TenantAppearance*`, `VERTICAL_REGISTRY` visuals; `roster` keeps identity + engine + envelope.
  3. Strip chromatic opinion from `themes/default`; keep structure.
  4. Gate `preset-without-derivable-values`; regenerate the first-party artifacts through the pipeline.
- **Files** — `packages/core/src/foundation/presets/verticals/**` (exists today; it owns `VERTICAL_REGISTRY` at `index.ts:54`, so it is a real path, not a logical one); `packages/core/src/foundation/tokens/ts/presentation/brand-themes/**` (there is no `ts/presentation/verticals/`; the siblings are `expressive-profiles`, `recipe-profiles`, `responsive-postures`, `typography`); `packages/core/src/infrastructure/runtime/verticals/facade/**`; `packages/core/src/foundation/contracts/composition/tenants/themes/index.ts`; `packages/core/src/foundation/tokens/css/foundation/themes/default/index.css`; `packages/core/src/foundation/tokens/css/facade/artifacts/**`.
- **Acceptance gate** — `grep -rn "BrandTheme" src --include='*.ts' --include='*.tsx' | grep -v tests | wc -l` = 0; artifact name intersection across the three verticals ≥ 90 %; root reach ≥ 80 % per vertical (today 8–33 %); per-family artifact coverage equal across the three (today 11 input families differ).
- **Do NOT** — Do not port authored channel values into `SanctionedOverrides` wholesale; every override needs a written reason.
- **Size** — L.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-DER-06 (Vertical presets as decisions; BrandTheme retired; neutral foundation without opinion) exactly as specified in `roadmap/derivation.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-11, F-25, F-54, F-108 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-DER-07 BitHire reference identity: three candidate decision sets rendered for the owner to pick
- **Outcome** — Three candidate identities for app-bithire, each expressed **only** as a `ThemeDecisions` set over the approved kit (no authored channels), rendered side by side in the probe-ground of the showroom on the same six screens (list, record, form, dashboard, modal, phone posture) in light and dark; the owner picks one (or amends); the chosen set becomes the bithire preset (WO-DER-06) and the reference for the visual baselines (WO-EVI-03). Rottay and evnto get a structural-neutral set only (owner scope 2026-09-05: only app-bithire matters now).
- **Why** — The aesthetic direction is the owner's decision and cannot be taken in a chat: it needs rendered candidates. Until it exists, presets and baselines have no reference (F-11 closes in WO-DER-06 with this input).
- **Closes** — (decision / enabling WO; F-11 closes in WO-DER-06) (closure criteria in `audit/30-findings`).
- **Wave** — 3; parallel with WO-DER-02…04.
- **Depends on** — WO-DER-01, WO-CON-03.
- **Steps** —
  1. Three decision sets (e.g. "editorial quiet", "product dense", "warm humanist") written as v2 documents; every value inside the kit's closed domains.
  2. Probe-ground route rendering the six screens × 3 candidates × 2 modes through `mountTenantTheme` (no ad-hoc CSS).
  3. Owner review recorded in `roadmap/kit-2026-09.md` (a `D-30 — chosen BitHire identity` section) and in the `notes` of WO-DER-07 in `roadmap/registry.json`, with the chosen set's sha256 digest. Do not write to `audit/**`: the audit tree is evidence and rubric, never a target of this programme (same rule as WO-CAT-01).
- **Files** — `packages/core/src/foundation/presets/candidates/bithire/**` (new; `foundation/presets/` exists, `candidates/` does not; deleted after the pick); `packages/showroom/src/app/probe-ground/identity/**` (new; `packages/showroom/src/app/probe/` exists, `probe-ground/` does not); `roadmap/kit-2026-09.md`.
- **Acceptance gate** — The three candidates differ on ≥ 4 non-color axes of the by-axis probe; every candidate passes admission as a `pro` document; the owner's pick is recorded with its digest in `roadmap/kit-2026-09.md` and the WO-DER-07 `notes`, and `audit/**` is byte-unchanged; no candidate contains a raw `--ds-*` override.
- **Do NOT** — Do not author CSS or channel values to make a candidate look right; if a decision is missing from the kit, file it as a kit amendment (D-27), never as an override.
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-DER-07 (BitHire reference identity: three candidate decision sets rendered for the owner to pick) exactly as specified in `roadmap/derivation.md`: read first `audit/README.md` (guide for the executor) and the kit table in `audit/50-matrices/customization-inventory` §5; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.
