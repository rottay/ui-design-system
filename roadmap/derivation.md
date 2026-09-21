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

- Repo (CURRENT, owner routing correction 2026-09-15): `/Users/daniel/Developer/Rottay/r4-recon-opus`, branch `main` (macOS, pnpm). Delegation prompts below that still cite the old `/Users/daniel/Developer/Rottay/ui-design-system` path are historical prose from earlier lots — that checkout is a preserved detached tree, never a dispatch target; every dispatch routes to the Repo line above and records cwd/branch/HEAD. Paths are relative to the repo root unless prefixed; "logical path" means the target-tree grammar of `audit/40-architecture/target` §5. D-21 is decided (owner, 2026-09-05): grammar (b), first level — `packages/core/src/{contracts,kernel,tokens,graphics,compilers,runtime,components,entrypoints}`. A logical path written `.../src/infrastructure/compilers/theme/**` therefore materializes as `.../src/compilers/theme/**`, `.../src/foundation/contracts/theme/**` as `.../src/contracts/theme/**`, and `.../src/infrastructure/runtime/<x>/**` as `.../src/runtime/<x>/**`. New code is born with this grammar from WO-CAT-02; what is not rewritten is normalized in WO-RET-04. `packages/core/scripts/check/architecture/audits/structure/index.mjs` and `CLAUDE.md` still pin the four-tier grammar, so WO-CAT-02 — the first WO that materializes a new first-level root — also amends that gate, its test and the written law.
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
- **AMENDMENT (R4, 2026-09-08) — materialization grammar, and what the landed source did and did not close** — The source of this WO landed at committed `34790cf43` and the WO stays **open**, because none of its acceptance arms is proven. **(a)** The per-artifact 71/71 `--ds-material-*` acceptance is unproven (baseline 0 / 65 / 2). **(b)** The `≥ 10 families` bar is a *computed-style probe of emphasis-induced movement*; what was measured is a synthetic best-of-vertical element — 13 of 25 families in the best vertical and 0 of 25 in bithire — so movement on real families is not demonstrated. **(c)** Separately, and not the same measurement, the *static* `skins.stateGoverned` census stands at 16 of 123 Modern skins (13 %) against F-10's own `≥ 80 %` target; it has not moved and cannot move here, because it belongs to the family-cut lane and this WO's declared `Files` exclude the skins. Neither figure substitutes for the other: 16/123 is a coverage census, not a family-movement result, and the probe is a movement result, not a coverage census. Landing is not closing, and the partial is registered in this WO's progress log rather than being read as a close. **D-21 (b) materialization**: every file this WO creates is born under the first-level grammar `packages/core/src/{contracts,kernel,tokens,graphics,compilers,runtime,components,entrypoints}` — the `Files` line above is written in logical paths, and a logical `.../src/infrastructure/compilers/theme/derivation/**` materializes as `.../src/compilers/theme/derivation/**`. New code is born with the grammar; what is not rewritten is normalized by `WO-RET-04`, which also owns the final `structure:check` and `CLAUDE.md` alignment for any stray this lane leaves behind.
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

### AMENDMENT 2026-09-10 — close-scope of the derivation roots (owner-approved; audit 96 PRD-01)

The owner approved separating **root closure**, **family adoption** and **fleet certification**, preserving every requirement and threshold. The dependency cycle was textual: the roots demanded fleet evidence and the cuts demanded the roots `done`.

**The rule.** WO-DER-02/03/04 each close when their *root scope* is satisfied: (1) the single admission door with closed domains and named refusals, tier by direct authorship only (R1 law); (2) real derivation — typed route to the canonical owner, one authority per value, correct precedence (including pill vs an allowed radius override), provenance preserved across preview AND publication (R2 law); (3) truthful producer/emission evidence, with any known blind spot named as a residual with an owner; (4) negative controls at the compiler level. A root does **not** close with its own promised decisions still inert, nor with wrong precedence. Family adoption is proven per family in its cut (WO-FAM-01..13, WO-FAM-14 by its own chain); fleet causality in WO-EVI-02/EVI-05, standing thresholds untouched (the >= 10-family probe requirement, the >= 80 % by-axis fleet bar, the owner-decided floors of `kit-2026-09.md` §5b).

| Obligation | Was demanded of | Final owner |
| --- | --- | --- |
| F-10 `skins.stateGoverned` (16/123) + real emphasis probe | WO-DER-02 unbounded | WO-FAM-01..13 per family; WO-EVI-02 fleet. WO-DER-02 keeps per-artifact material coverage + the instrument |
| F-30 Modern skins consume typography roles | WO-DER-04 | Family cuts. WO-DER-04 keeps the derived typography family and its gates (landed) |
| F-31 `--ds-transition-*` = 0 | WO-DER-04 | Frozen engines: explicit exemption (below). Modern/family-cuts: the cuts. WO-DER-04 keeps the motion vocabulary with rest values (landed) |
| F-36 `LegacySizeAlias` = 0 outside Classic | WO-DER-04 | Family cuts (26 sites in primitives/engine) |
| F-35 breakpoint literals outside the contract | WO-DER-04 | Widened domain gate (gatefix lot, merged) + cuts for the 16 literals in Modern skins/bridge |
| Admitted-but-unlit decisions: `typography.role-weights`, `typography.numeric`, `shape.nesting`, `shape.control-height` | unowned | Bounded connection lots before WO-FAM-01, under the root that promised each. (`surfaces.border-style` and `motion.character` connected: connfix lot `a5da15828`; `palette.neutral-temperature` and `palette.contrast-posture`: palette lot `4624e4555`) |
| CC-02 responsive metadata stale | — | Gatefix lot (catalog, merged) + real adoption in WO-INV-07 |
| pill precedence vs allowed radius override | WO-DER-03 | Bounded shape lot before WO-FAM-01: painted value and provenance agree, or the combination is refused by name |
| Palette derivers (tints/inks/semantic, neutral-temperature, contrast-posture, accent ramp) | WO-DER-03 | Palette lot `4624e4555` (accent ramp removed by evidence; `ramps.accent` authorability routed to WO-DER-06) |

**Frozen-engine exemption.** The `zero --ds-transition-*` criterion sweeps all source, but this lane forbids touching Classic/Rustic. The criterion applies to the **Modern + family-cuts perimeter**; the 21 Classic/Rustic sites are a named frozen excluded population — neither counted as open debt nor as green. No frozen file is touched.

**EVI-05 (pilot) vs EVI-02 (fleet).** The pilot certifies one bounded cut end to end; the fleet certification keeps the six non-chromatic axes and its standing threshold (owner decision 2026-09-10, `kit-2026-09.md` §5b D3). The cuts do not share one dependency list: WO-FAM-14's chain runs through WO-INV-05, not through the DER-02/03/04 roots.

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
- **Depends on** — WO-DER-05, WO-CAT-02, WO-CON-03 (its decision→keypath adapter is deleted here or in WO-CAT-02, whichever lands last), WO-DER-07's candidate decision sets (which exist; the final pick is deferred — see the 2026-09-10 amendment on WO-DER-07).
- **Steps** —
  1. Author the bithire preset from a decision set of WO-DER-07's candidates (provisional until the deferred D-30 pick; the preset's final look remains an explicit open obligation of the branding stage, not of this conversion). Rottay and evnto receive structural-neutral decision sets only (owner scope 2026-09-05: only app-bithire matters now; their identities are a later program).
  2. Delete `brand-themes/*`, `BrandTheme`, `TenantAppearance*`, `VERTICAL_REGISTRY` visuals; `roster` keeps identity + engine + envelope.
  3. Strip chromatic opinion from `themes/default`; keep structure.
  4. Gate `preset-without-derivable-values`; regenerate the first-party artifacts through the pipeline.
- **Files** — `packages/core/src/foundation/presets/verticals/**` (exists today; it owns `VERTICAL_REGISTRY` at `index.ts:54`, so it is a real path, not a logical one); `packages/core/src/foundation/tokens/ts/presentation/brand-themes/**` (there is no `ts/presentation/verticals/`; the siblings are `expressive-profiles`, `recipe-profiles`, `responsive-postures`, `typography`); `packages/core/src/infrastructure/runtime/verticals/facade/**`; `packages/core/src/foundation/contracts/composition/tenants/themes/index.ts`; `packages/core/src/foundation/tokens/css/foundation/themes/default/index.css`; `packages/core/src/foundation/tokens/css/facade/artifacts/**`.
- **Acceptance gate** — `grep -rn "BrandTheme" src --include='*.ts' --include='*.tsx' | grep -v tests | wc -l` = 0; artifact name intersection across the three verticals ≥ 90 %; root reach ≥ 80 % per vertical (today 8–33 %); per-family artifact coverage equal across the three (today 11 input families differ).
- **HANDOFF RECEIVED (G103-02, audit/103-day-direction-2026-09-12/gates.md, 2026-09-12)** — Pinned channels transferred from WO-EMI-02: `--ds-experience-profile`, `--ds-recipe-profile` (they travel as data/provenance, not CSS paint). **Exit condition per channel:** demonstrate the pertinent effect route OR retire it from contract/emission, removing the pin in the same lot; a provenance-only channel gets an explicit classification adjudication — no fabricated CSS readers to satisfy a counter. Change of owner is not resolution.
- **POST-CLOSE RESIDUALS: receiving work order NOT adjudicated (registered 2026-09-16, quota handoff item 5; this WO stays `done`; its acceptance and the close evidence are unchanged)** — The close evidence (`registry.json:4543`) carries N2 and R3–N7 open with "named owners". The only owner it names for them is "derivation-lane and fleet-B obligations". FAM-06's close does the same for its tag-radius and neutral-ramp notes ("derivation lane", `registry.json:4994`). No open work order in this lane owns their source fix. WO-DER-07 is left with only the D-30 pick (`registry.json:6021`). WO-DER-08 is the studio transport (this file, WO-DER-08 Outcome). WO-EVI-02's Files are `scripts/check/**`, `tests/integration/**` and `e2e/**`, never the derivers or presets (`evidence-graph.md`, WO-EVI-02 Files). The table records where each obligation stands today. It does not assign the fix.

  | Obligation (as measured when registered) | Registered at | Live pin in the tree | Open WO whose standing acceptance it keeps short | Done root that promised the reach |
  | --- | --- | --- | --- | --- |
  | **N2** menu ink = sidebar ink; bithire `sidebar-tone: inverse` paints #f5f5f5 on a light ground, 1.04:1 | `registry.json:4494`; carried open at `:4499`, `:4529`, `:4543` | `Menu.causality.integration.test.tsx:198-202` and `:75` (text names WO-DER-06, which is closed, as owner); `Button.causality.integration.test.tsx:84-92` axe contrast scopes | WO-INV-03 ("axe batch green for Modern × bithire", `platform-invariants.md:64`); WO-EVI-02 owns the axe-debt identity pins (`registry.json:5605`) | WO-FAM-05 menu cut (`family-cuts.md:132`) under the `navigation.sidebar-tone` preset decision |
  | **R3** mode-palette seeding: bithire's dark block cascades the light ground; evnto dark contrast | `registry.json:4474` (P3); carried at `:4499`, `:4529`, `:4543` | `Button.causality.integration.test.tsx:84-92` ("the tenant's light ground cascades into the dark block") | WO-INV-03 for bithire only (its matrix is Modern × bithire, `platform-invariants.md:62`); the evnto cells have no open WO; WO-EVI-02 axe-debt pins | WO-DER-05 modes (this file, WO-DER-05) |
  | **N3** `palette.neutral-temperature` inert: `deriveNeutralAxis` only tilts an authored neutral ramp and no preset authors one | `registry.json:4494`; carried at `:4499`, `:4529`, `:4543` | `packages/core/src/foundation/tokens/tests/status-tint-floor/index.test.ts:326-331`; `Mentions.causality.integration.test.tsx:113` | None. It counts only against programme indicator 1 (target 29/29, owner WO-CON-03, which is done) and so against milestone C's off-registry clause | WO-DER-03 palette (`derivation.md:63`, "neutral-temperature", "the monochrome ramp derived from the tenant neutral") |
  | **N4** `shape.control-height` reader lost on the bithire button: the scale moves 0.9/1/1.15 and `min-block-size` stays 36px | `registry.json:4494`; carried at `:4499`, `:4529`, `:4543` | `Button.causality.integration.test.tsx:125-139` | WO-EVI-02 shape-axis numerator (`evidence-graph.md:54`); on its own it does not fail the ≥ 80 % bar | WO-DER-03 shape (`derivation.md:63`, `shape/{…,control-height}`) |
  | **N5** input hover border = rest border in bithire (#d4d4d4; same no-authored-neutral-ramp cause as N3) | `registry.json:4494`; carried at `:4499`, `:4529`, `:4543` | None located by this registration | WO-EVI-02 states-axis numerator (`evidence-graph.md:54`) | WO-DER-03 palette (neutral ramp) |
  | **N6** toggle `hoverFill` = fill in evnto on all four `states.emphasis` stops | `registry.json:4494`; carried at `:4499`, `:4529`, `:4543` | `Toggle.causality.integration.test.tsx:57-59`, `:132-137` | WO-EVI-02 states axis, under the D1 floor of 20 real families per `states` control (`README.md:552`) | WO-DER-02 states (this file, WO-DER-02) |
  | **N7** `behavior.motion` loses `entranceDuration`: an authored-theme field with no preset decision behind it | `registry.json:4494`; carried at `:4499`, `:4529`, `:4543` | None located by this registration | None | WO-DER-04 motion (this file, WO-DER-04), or a kit row via the D-27 amendment route (`kit-2026-09.md`) |
  | **tag-radius** `shape.radius-scale` reaches neither tag corner: the pill closes, and the authorable `--ds-tag-radius-md` outranks the decision in all three verticals | `registry.json:4955` (FAM-06 progress); close note `:4994` | `Tag.causality.integration.test.tsx:36-43` | WO-EVI-02 shape-axis numerator (`evidence-graph.md:54`) | WO-DER-03 shape radius (`derivation.md:63`) |
  | **neutral-ramp reach** (incl. the stack hairline: no `palette.*` decision reaches it, and its fallback is pinned per vertical) | `registry.json:4994` (FAM-06 close); `registry.json:5036` (FAM-07 L5) | `Stack.causality.integration.test.tsx:52-58` | None | WO-DER-03 palette (same root as N3/N5) |

  **Open question Q-DER06-RES (owner/DT; to be decided per row), exact options:** (A) route the fix as a POST-CLOSE block on the done root in the last column, with its status kept `done`, following the `platform-invariants.md:94` and `:128` precedent. No count moves, but milestones and the burn-down do not see the obligation. (B) Reopen that root. WO-DER-02/03/04 have done dependents, so validation cascades, as `platform-invariants.md:94` records; reopening WO-DER-05 removes a milestone-B gate from `done`. (C) Open one new work order in this lane plus a registry entry under the anti-sprawl law (`README.md:221`; the owner approves 1:1). The total goes 161 → 162 and milestone C's programme gate grows if it is tagged `audit-2026-09-05`; milestone B changes only if the owner adds it to B's gates. (D) Extend an open WO's Files and acceptance. WO-INV-03's Files already include `foundation/tokens/css/foundation/**` (`platform-invariants.md:63`), but its matrix is bithire-only. WO-EVI-02's Files cannot hold a source fix. Either extension is an acceptance redefinition, so it needs the owner or DT. Whichever option is chosen, the pins that name WO-DER-06 as owner (above) are rewritten by the receiving lot. No option is chosen here, and no pin, threshold or status is changed.
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

  **AMENDMENT 2026-09-10 — D-30 deferred (owner decision).** The owner deferred the final identity choice to a later branding stage: this stage builds and proves the customization *capability*, and the three candidates serve as provisional test variants (sufficiently contrasting, e.g. one circular/soft and one angular/compact), never as approved identities. Until the pick lands, this WO stays open with exactly one remaining obligation — the recorded owner pick with digest — and no fictitious choice is registered. The pilot (WO-EVI-05) and the preset conversion (WO-DER-06) use the candidates as provisional inputs and do not wait for D-30; the final look of the bithire preset remains an explicit open obligation of the branding stage.
- **Files** — `packages/core/src/foundation/presets/candidates/bithire/**` (new; `foundation/presets/` exists, `candidates/` does not; deleted after the pick); `packages/showroom/src/app/probe-ground/identity/**` (new; `packages/showroom/src/app/probe/` exists, `probe-ground/` does not); `roadmap/kit-2026-09.md`.
- **Acceptance gate** — The three candidates differ on ≥ 4 non-color axes of the by-axis probe; every candidate passes admission as a `pro` document; the owner's pick is recorded with its digest in `roadmap/kit-2026-09.md` and the WO-DER-07 `notes`, and `audit/**` is byte-unchanged; no candidate contains a raw `--ds-*` override.
- **OPEN ACCOUNTING QUESTION: milestone B versus the D-30 pick (registered 2026-09-16, quota handoff item 5; this WO's acceptance, milestone B's fleet acceptance and WO-EVI-02 are unchanged)** — Four texts disagree:
  - The executable authority, `PROGRAM_MILESTONES` (`scripts/maintain/roadmap/status/index.mjs:2763-2767`), gates B on `WO-DER-07` `done`. `roadmap/README.md:537-539` says that code is the authority.
  - The restating row at `roadmap/README.md:527` says `WO-DER-07` counts toward B as "technical preparation only… the D-30 pick is deferred to the branding stage and does not gate B".
  - This WO's acceptance gate above still requires "the owner's pick is recorded with its digest". The 2026-09-10 amendment above and the registry notes (`registry.json:6021`) leave the pick as its only remaining obligation, and DER-07 progress entry 2 records the technical connection as landed.
  - `kit-2026-09.md:241-253` §5c names the pilot, WO-DER-06 and the family cuts as proceeding without the pick. It does not mention milestone B.

  As derived today, B cannot be reached before the branding stage even when WO-EVI-02's fleet threshold passes. The test suite pins only that WO-EVI-02 gates B (`index.test.mjs:2063-2072`), not whether WO-DER-07 does. **Open question Q-B-DER07 (owner/DT), exact options:**
  - (1) Keep the code. B waits on the recorded D-30 pick, and `README.md:527` is corrected to say so. Fleet acceptance is unchanged, and B becomes a branding-stage milestone.
  - (2) Remove `WO-DER-07` from B's gates in `PROGRAM_MILESTONES`, with the matching test, to match `README.md:527`. B then gates no work order that holds the candidates and probe-ground evidence, and the pick stays open on this WO for milestone C.
  - (3) Split the WO. The technical preparation is closed or registered as its own work order, which B gates, and the D-30 pick stays on a branding-stage work order that B does not gate. This needs a new registry entry under the anti-sprawl law (`README.md:221`, owner 1:1), and the total changes.
  - (4) The owner amends this WO's acceptance gate so the pick moves out of it. The WO can then close on its technical evidence while the pick is registered in `kit-2026-09.md` §5c. Only the owner may amend an acceptance gate.

  No option lowers WO-EVI-02's six-axis ≥ 80 % threshold or its negative controls. No option is chosen here.

  **RESOLVED 2026-09-17 (owner handoff order, R17-05: "resolve Q-B-DER07 in machinery and tests, keeping the branding obligation visible") — option (2).** `WO-DER-07` is removed from milestone B's gates in `PROGRAM_MILESTONES` (`scripts/maintain/roadmap/status/index.mjs`), with a test pinning the exact five-gate set and pinning that `WO-DER-07` still gates milestone C through the `audit-2026-09-05` population, so the deferred pick cannot silently stop gating the programme's end. The README's milestone B row is brought into agreement. No threshold, population or acceptance criterion moved; the recorded owner pick with digest remains this WO's open obligation.
- **Do NOT** — Do not author CSS or channel values to make a candidate look right; if a decision is missing from the kit, file it as a kit amendment (D-27), never as an override.
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-DER-07 (BitHire reference identity: three candidate decision sets rendered for the owner to pick) exactly as specified in `roadmap/derivation.md`: read first `audit/README.md` (guide for the executor) and the kit table in `audit/50-matrices/customization-inventory` §5; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-DER-08 Studio draft transport to the governed Theme (or a v2 document): the flat shape loses its authoring role
- **Outcome** — The studio's authored draft no longer rides the flat shape that the lowering reads (FlatTheme after D6-2c-iii): the draft moves to the governed `Theme` or a v2 tenant document, with its governed ingress preserved, so "the flat shape is not an authoring surface" becomes true rather than aspirational. Registered by the D6-2c flat-type core review (Codex ACCEPT(a) guardrail 4, Fable CHANGES adopted 8; `evidence/der-06-flat-type-review/`).
- **Why** — Until this lot, the flat shape is ALSO the studio draft transport, so it keeps an authoring role the BrandTheme retirement narrative must not deny. `liftAuthoredTheme` has zero production callers (measured 2026-09-15), so the migration surface is the studio draft itself plus its serialization.
- **Closes** — the studio-exception residue of F-11 (the rest closes in WO-DER-06) (closure criteria in `audit/30-findings`).
- **Wave** — 4; after WO-DER-06 (the flat type's rename lands there as D6-2c-iii).
- **Depends on** — WO-DER-06.
- **Steps** —
  1. Inventory the studio draft's reads/writes of the flat shape (`value`/`onChange`, file export, `brandThemePath` — a serialized contract field, i.e. a data change, per Fable guardrail 3, unless D6-2c-iii already handled it under a written exception).
  2. Move the draft transport to the governed `Theme` or a v2 document, preserving the governed ingress and the intake's inactive-family omission with its `charts: {}` exception.
  3. Migrate or retire `liftAuthoredTheme`'s remaining callers (measured zero in production; confirm again at implementation time) and update the tenancy/studio docs in the same session.
- **Files** — the studio draft transport and its serialization (paths declared by the implementer's write set); tenancy READMEs and `docs/architecture/index.md` in the same commit.
- **Acceptance gate** — the studio draft no longer names the flat type; its transport round-trips through the governed ingress with no semantic edit to the lowering; the flat shape's documentation no longer needs the "also an authoring draft" caveat; grep for the old transport field names is zero outside registered migrations.
- **Do NOT** — Do not retype the lowering's reads to the governed Theme in this lot (that is the (b) retype deferred by the review, a separate later lot with its own write set); do not break the studio's editability or file export to force the move.
- **Size** — M.
- **Delegation prompt** — In the integration checkout, execute WO-DER-08 exactly as specified in `roadmap/derivation.md`: declare your write set, keep the governed ingress intact, finish when the acceptance gate passes; report the commands you ran and their output.

### WO-DER-09 Shared style presets and first-party migration
- **Outcome** — Reusable style registry/data, vertical references and brand data split under the checked ownership/precedence composition table adopted in WO-CAT-04; versioned upgrades and clear migration paths, not final tenant art direction. At least two contrasting style fixtures make reuse and differentiation proofs non-vacuous. Verticals reference a style and author their own brand/default data — never duplicate a style implementation; organization tenants remain database data (no checked-in folder per customer); application functionality stays in the application, not in visual presets. Preset DATA may sit beside the current vertical data at `foundation/presets/styles/` only as a named, bounded migration exception retaining the current unknown-document boundary: it moves ONCE with the verticals under RET-04 (whose 2026-09-20 owner amendment applies), with no blanket legacy-root exemption, identity-baseline widening, global relocation now or permanent forwarding wrappers; the final data owner/dependency direction is confirmed before the move. The resolver, admission, family derivers and emitter remain their existing unique owners.
- **Why** — Owner-approved scope 2026-09-20 (`roadmap/proposals.md`, style/history queue; Fable review ACCEPT at `evidence/style-history-roadmap-review/index.md`). Same style reused across BitHire/Evnto with their own brands; two styles in one vertical visibly affect declared non-color axes while controlled brand inputs stay fixed.
- **Closes** — no new source IDs, phase or DS-improvements authority (owner-approved registration 2026-09-20); programme membership `audit-2026-09-05`.
- **Wave** — 4 (target lane order 9); after WO-CAT-04's contract is adopted, individual style data packets may be disjoint; registry, vertical composition, generators and shared derivation remain singleton-owned.
- **Depends on** — WO-CAT-04, WO-DER-06.
- **Steps** —
  1. Build the style registry/data under WO-CAT-04's adopted contract (one authored representation per style; the two contrasting fixtures chosen to make reuse and differentiation proofs non-vacuous).
  2. Split the first-party vertical presets into style reference + brand/default data under the checked composition table; the named `foundation/presets/styles/` migration exception is recorded with its boundary, coordinating RET-04's single final move — never racing it.
  3. Migrate the three first-party baselines through the official pre/post path with byte-equal artifacts; re-certify DER-06's affected metrics without weaker gates.
  4. Prove reuse and differentiation with EVI-02's existing instrument (no new competing meter): compare style-owned leaves/normalized effects under controlled inputs — brand fonts, anatomy and container context may legitimately differ, so never ALL non-chromatic bytes across products.
- **Files** — `packages/core/src/contracts/theme/runtime/styles/**`; `packages/core/src/foundation/presets/**` (the named bounded exception); `packages/core/src/foundation/tokens/ts/presentation/brand-themes/**`; `packages/core/src/infrastructure/compilers/runtime/theme/**` (re-certification only); `packages/core/scripts/check/**` (gates, singleton-owned).
- **Acceptance gate** — official pre/post migration first-party artifacts byte-equal for all three existing baselines; DER-06 affected metrics re-certified without weaker gates; the same style reused across BitHire/Evnto with their own brands; two styles in one vertical visibly affect declared non-color axes while controlled brand inputs stay fixed; version pins unchanged until explicit upgrade; registration/source-truth and folder/index checks pass.
- **Do NOT** — Do not duplicate authored documents and family fragments; do not widen identity baselines or leave permanent internal forwarding wrappers; do not dispatch style data packets against the singleton registry/generator reservation; do not treat version pins as mutable.
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-DER-09 (Shared style presets and first-party migration) exactly as specified in `roadmap/derivation.md`: read first `audit/README.md` and the owner-approved spec transferred from `roadmap/proposals.md` (style/history queue 2026-09-20); declare your write set; finish when the acceptance gate passes; report the commands you ran and their output.
