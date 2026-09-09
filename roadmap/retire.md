---
title: "Design System Retire: dead code, legacy CSS, manifest and evidence quarantine, physical tree, showroom"
date: 2026-09-05
status: canonical (adopted 2026-09-05 from audit/70-plan/roadmap-draft; state lives in roadmap/registry.json)
audience: ai-agent
sources:
  - audit/README.md (verdict, guide for the executor)
  - audit/30-findings/** (closure criteria of every F-nn cited below)
  - audit/70-plan/index.md (blocks, waves, indicators)
  - audit/50-matrices/customization-inventory/index.md §5 (identity kit, approved as-is by the owner on 2026-09-05, D-27)
---

# Retire: dead code, legacy CSS, manifest and evidence quarantine, physical tree, showroom

Removal lots. Nothing here is deleted before the consumer census gate proves zero productive consumers; the owner authorized breaking legacy public APIs (D-07).

Lane-wide rules (binding on every WO):

- Repo: `/Users/daniel/Developer/Rottay/ui-design-system` (macOS, pnpm). Paths are relative to the repo root unless prefixed; "logical path" means the target-tree grammar of `audit/40-architecture/target` §5. D-21 is decided (owner, 2026-09-05): grammar (b), first level — `packages/core/src/{contracts,kernel,tokens,graphics,compilers,runtime,components,entrypoints}`. A logical path written `.../src/infrastructure/compilers/theme/**` therefore materializes as `.../src/compilers/theme/**`, `.../src/foundation/contracts/theme/**` as `.../src/contracts/theme/**`, and `.../src/infrastructure/runtime/<x>/**` as `.../src/runtime/<x>/**`. New code is born with this grammar from WO-CAT-02; what is not rewritten is normalized in WO-RET-04. `packages/core/scripts/check/architecture/audits/structure/index.mjs` and `CLAUDE.md` still pin the four-tier grammar, so WO-CAT-02 — the first WO that materializes a new first-level root — also amends that gate, its test and the written law.
- Engines: Modern is the only admitted engine; Classic and Rustic stay in the package frozen and fail-closed; no WO in any lane adds content, tokens, tests or a11y work to them (owner decision 2026-09-05).
- Every WO names the audit findings it closes (`Closes`) and is done only when the closure criterion of each cited `F-nn` (`audit/30-findings`) passes on the working tree, in addition to its own acceptance gate and a green DS build/test.
- Uniqueness: a WO that leaves two files or two processes with the same responsibility is not done.
- Executors are edit-only; the coordinator certifies and commits one lot at a time; never push.
- Write sets are declared before claiming; two in-flight WOs never share a file; the coordinator integrates shared files (`package.json`, CI, gate manifests).


### WO-RET-01 Retire code without productive consumers and the legacy public API (changeset 3.0)
- **Outcome** — ~17K LOC without productive consumers (admin surfaces, dead data/list surfaces, `application/data`, `patterns/runtime/*`, 41 orphans, 95 dead barrels, `extensions`, `IconFrame`/`Meter` decision), 97/121 public subpaths, 75 `@deprecated`, dead transports (`DEFAULT_TENANT_CONFIG`, `createTenantConfig`, `useTenantBranding`) are removed behind a consumer-census gate; `icons/bithire`, vertical pictograms and marks move to presets; the legacy icon catalog moves to `./icons/legacy` with an end-of-life date; effects/spatial/application-runtime decided per D-19 (adopt with a real consumer or remove).
- **Why** — F-42/F-94: APIs nobody consumes are published and documented; F-109/F-113: product semantics inside shared corpora; F-111/F-115: governed capabilities re-implemented by the apps.
- **Closes** — F-42, F-94, F-91, F-88, F-109, F-110, F-111, F-113, F-115, F-84 (closure criteria in `audit/30-findings`).
- **Wave** — 5; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-EMI-02, WO-FAM-01, WO-FAM-02, WO-FAM-03, WO-FAM-04, WO-FAM-05, WO-FAM-06, WO-FAM-07, WO-FAM-08, WO-FAM-09, WO-FAM-10, WO-FAM-11.
- **Steps** —
  1. Consumer census gate (`entrypoint → consumers` across showroom + 3 apps) as a decrease-only anchor; then delete in lots with the 3.0 changeset and codemods.
  2. Icons: legacy subpath with EOL; `bithire` pack to a preset; marks/pictograms by preset.
  3. D-19 dispositions recorded per capability.
- **Files** — `packages/core/src/components/**`; `packages/core/src/infrastructure/runtime/application/**`; `packages/core/src/entrypoints/**`; `packages/core/package.json`; `packages/core/src/graphics/**`; `.changeset/**`.
- **Acceptance gate** — Import graph: 0 unreachable modules; `exports` with a censused consumer per subpath; `grep -rn "@deprecated" src | wc -l` = 0; `grep -c '"pack": "bithire"' corpus/manifest.json` = 0.
- **Do NOT** — Do not delete anything whose census shows a consumer without first migrating that consumer (consumer notes X-01…X-06).
- **Size** — L.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-RET-01 (Retire code without productive consumers and the legacy public API (changeset 3.0)) exactly as specified in `roadmap/retire.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-42, F-94, F-91, F-88, F-109, F-110, F-111, F-113, F-115, F-84 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-RET-02 Retire legacy CSS: DaisyUI projection, dead Daisy rules, framework bridge, emitter-less selectors, showroom Tailwind, engine bundle split
- **Outcome** — `framework-token-projection` deleted; the Daisy rules in `modern/theme` deleted (now visible thanks to the honest counter); the `framework-bridge` utilities and dead rules removed and the file ratcheted or deleted; `rustic/theme` and `personality` selectors without emitter deleted only where they are Modern-visible (Rustic content frozen: delete only what is provably unreachable); the showroom Tailwind toolchain removed; `styles.css` for Modern no longer pays for Classic/Rustic CSS (bundle split with the frozen engines behind their own subpath).
- **Why** — F-52: 100 % dead projection, ~150 dead Daisy lines certified alive by a fail-open counter, 462 bridge lines with literals; F-62: a Modern-only consumer downloads three engines.
- **Closes** — F-52, F-62 (closure criteria in `audit/30-findings`).
- **Wave** — 5; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-CAN-02, WO-CAN-03, WO-FAM-06.
- **Steps** —
  1. Delete/ratchet in that order; extend `themeCss.lineCount` to the bridge; selector-liveness gate; split the bundle.
- **Files** — `packages/core/src/foundation/tokens/css/runtime/engines/modern/{framework-token-projection,framework-bridge,theme}/**`; `packages/core/src/foundation/tokens/css/runtime/personality/**`; `packages/core/scripts/build/verticals/css-build/index.mjs`; `packages/showroom/{tailwind.config.ts,postcss.config.mjs,package.json}`.
- **Acceptance gate** — `ls runtime/engines/modern/framework-token-projection` does not exist; `themeCss.unreferencedSelectors` = 0 with the honest counter; `grep -c tailwindcss packages/showroom/package.json` = 0; the Modern bundle contains no Classic/Rustic bytes.
- **Do NOT** — Do not rewrite Rustic/Classic CSS; only remove what is unreachable.
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-RET-02 (Retire legacy CSS: DaisyUI projection, dead Daisy rules, framework bridge, emitter-less selectors, showroom Tailwind, engine bundle split) exactly as specified in `roadmap/retire.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-52, F-62 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-RET-03 Quarantine the manifest and historical evidence; move agent orchestration out of the package
- **Outcome** — `governance/manifest/**` (42 MB, 5,355 UNKNOWN cells), `artifacts/quality/**` receipts, `test-artifacts/`, `docs/history/audits/repository-architecture/2026-08/` are moved to an archive location or a quarantine folder with a one-line README no gate reads as authority (D-05, D-08); `scripts/check/{modern-rescue,orchestration,evidence}` leave the published package (D-09); five token-population generators collapse into `ds:derive`; `CLAUDE.md` becomes an index that links `docs/architecture` and the roadmap instead of restating them; the documentation journal of WO-CRA-23 is archived.
- **Why** — F-04/F-53: the manifest simulates and five generators diverge; F-58: 240 MB of evidence vs 53 MB of code; F-87: three restatements of the architecture law and two competing laws.
- **Closes** — F-04, F-53, F-58, F-102, F-87 (closure criteria in `audit/30-findings`).
- **Wave** — 5; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-EVI-01.
- **Steps** —
  1. Quarantine moves with a verifiable README; delete generators superseded by `theme-graph`; scripts extraction; `CLAUDE.md` rewrite (< 200 lines) with the `RETIRED_OWNER_PATHS` check running over `CLAUDE.md`, `AGENTS.md`, `roadmap/README.md`.
- **Files** — `packages/core/governance/**`; `packages/core/artifacts/quality/**`; `test-artifacts/**`; `docs/history/**`; `packages/core/scripts/check/{modern-rescue,orchestration,evidence}/**`; `packages/core/scripts/generate/tokens/manifest/**`; `CLAUDE.md`; `AGENTS.md`.
- **Acceptance gate** — `du -sh packages/core/governance` < 1 MB; evidence/code ratio < 0.5; `grep -c "kernel/runtime/brand-theme" CLAUDE.md` = 0; `wc -l CLAUDE.md` < 200; no gate reads a receipt as authority.
- **Do NOT** — Do not delete the measured cascade graph (`artifacts/generated/manifest/cascade/*`) before `theme-graph` consumes it.
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-RET-03 (Quarantine the manifest and historical evidence; move agent orchestration out of the package) exactly as specified in `roadmap/retire.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-04, F-53, F-58, F-102, F-87 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-RET-04 Physical tree normalization: D-21 grammar applied to what remains, monoliths split, repeated path words removed
- **Outcome** — The tree matches `audit/40-architecture/target` §5 in the grammar decided by D-21 (new code already uses it since WO-CAT-02; this WO moves what was not rewritten): no authored file > 800 lines (pipeline ≤ 250), 0 repeated words inside a path, no single-child folders or empty facades, `graphics → runtime` dependency law corrected, `structure:check` green in CI with a decreasing baseline; showroom with 0 loose files; kernel utilities adopted (`warnOnceInDev`, `changeKey`).
- **Why** — F-44: 141 files > 800 lines, 116 repeated-segment paths, 161 single-child folders, scripts at 42 % of the volume; the audit's position (vs. an up-front global move): move code when it is rewritten, normalize the remainder here.
- **Closes** — F-44, F-96, F-98, F-99, F-101, F-116, F-82 (closure criteria in `audit/30-findings`).
- **Wave** — 5; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-DER-06, WO-EMI-02, WO-RET-01.
- **Steps** —
  1. Codemod moves with `engine-audit:relocate-paths` dry-run; split the remaining monoliths (`provider` 1,339, `collection-workspace` 2,787, `tokens/audit` 2,866); repeated-word script = 0; `docs/architecture/index.md` §6 corrected.
- **Files** — `packages/core/src/**`; `packages/core/scripts/**`; `packages/showroom/src/**`; `docs/architecture/index.md`.
- **Acceptance gate** — Repeated-path-word script = 0; `wc -l` max in `compilers/theme/**` ≤ 250 and no authored file > 800; `structure:check` in the gate manifest, green; `find packages/core/src -type d -empty` empty.
- **AMENDMENT (R4, 2026-09-08; the original acceptance above stands, this is added to it)** — Cross-note from the derivation lane: this WO owns the **final** structure-gate and `CLAUDE.md` alignment for every owner the derivation and family-cut lanes leave outside the D-21 (b) first-level grammar. New code born after `WO-CAT-02` uses the grammar already, so what reaches this WO is the un-rewritten remainder plus any stray; neither a lane nor a cut may widen the `structure:check` identity baseline to absorb its own stray instead of leaving it here. The baseline stays decrease-only.
- **Do NOT** — Do not perform the global move before the derivation lane lands (it would move code that is about to be rewritten).
- **Size** — L.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-RET-04 (Physical tree normalization: D-21 grammar applied to what remains, monoliths split, repeated path words removed) exactly as specified in `roadmap/retire.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-44, F-96, F-98, F-99, F-101, F-116, F-82 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-RET-05 Showroom and Storybook through the mount law; probes as configurations
- **Outcome** — One `probe-ground` module over `mountTenantTheme` replaces the five showroom mechanisms and both Storybook decorators; the showroom chrome uses the DS; `DOC_COUNTS` and tenant catalogs are derived; profile is not coupled to the engine; Storybook builds in PRs; matrices stay Modern × bithire (D-24 decided 2026-09-05: evnto/rottay coverage deferred).
- **Why** — F-45: seven mechanisms to apply a tenant, Storybook bypasses the door, `(docs)` has no SSR/CSR parity, the DS showroom does not use the DS.
- **Closes** — F-45, F-92, F-93 (closure criteria in `audit/30-findings`).
- **Wave** — 5; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-EMI-02.
- **Steps** —
  1. `probe-ground`; migrate `ds-reference`, `torture-tenant`, `showroom-tenant`, `divergence-surface`, `visual-authority-probe`; Storybook `preview.tsx` via `getKnownTenantConfig`; `showroom-ui` deleted (17 consumers migrated); CI job for Storybook on PR.
- **Files** — `packages/showroom/src/**`; `packages/core/.storybook/**`; `packages/core/src/components/surfaces/foundation/common/story-helpers/**`; `.github/workflows/ci.yml`.
- **Acceptance gate** — `grep -rl "compileTenantThemeConfig\|compileTenantTheme(" packages/showroom/src | wc -l` = 1; `grep -rl "@/components/showroom-ui" packages/showroom/src | wc -l` = 0; Storybook `tenant=bithire` computed `--ds-color-primary` equals the bithire preset.
- **Do NOT** — Do not keep `torture-tenant` and `ds-reference/ground` as two stamp scripts.
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-RET-05 (Showroom and Storybook through the mount law; probes as configurations) exactly as specified in `roadmap/retire.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-45, F-92, F-93 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.
