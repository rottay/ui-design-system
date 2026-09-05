---
title: "Design System Evidence graph: theme-graph, causal gates, tests through the door, docs and roadmap truth"
date: 2026-09-05
status: canonical (adopted 2026-09-05 from audit/70-plan/roadmap-draft; state lives in roadmap/registry.json)
audience: ai-agent
sources:
  - audit/README.md (verdict, guide for the executor)
  - audit/30-findings/** (closure criteria of every F-nn cited below)
  - audit/70-plan/index.md (blocks, waves, indicators)
  - audit/50-matrices/customization-inventory/index.md §5 (identity kit, approved as-is by the owner on 2026-09-05, D-27)
---

# Evidence graph: theme-graph, causal gates, tests through the door, docs and roadmap truth

Continuous lane. The derived `theme-graph` replaces the manifest; gates measure causality (a decision moves computed styles), never text presence; STATUS publishes the indicators of `audit/70-plan/index.md` §3.

Lane-wide rules (binding on every WO):

- Repo: `/Users/daniel/Developer/Rottay/ui-design-system` (macOS, pnpm). Paths are relative to the repo root unless prefixed; "logical path" means the target-tree grammar of `audit/40-architecture/target` §5. D-21 is decided (owner, 2026-09-05): grammar (b), first level — `packages/core/src/{contracts,kernel,tokens,graphics,compilers,runtime,components,entrypoints}`. A logical path written `.../src/infrastructure/compilers/theme/**` therefore materializes as `.../src/compilers/theme/**`, `.../src/foundation/contracts/theme/**` as `.../src/contracts/theme/**`, and `.../src/infrastructure/runtime/<x>/**` as `.../src/runtime/<x>/**`. New code is born with this grammar from WO-CAT-02; what is not rewritten is normalized in WO-RET-04. `packages/core/scripts/check/architecture/audits/structure/index.mjs` and `CLAUDE.md` still pin the four-tier grammar, so WO-CAT-02 — the first WO that materializes a new first-level root — also amends that gate, its test and the written law.
- Engines: Modern is the only admitted engine; Classic and Rustic stay in the package frozen and fail-closed; no WO in any lane adds content, tokens, tests or a11y work to them (owner decision 2026-09-05).
- Every WO names the audit findings it closes (`Closes`) and is done only when the closure criterion of each cited `F-nn` (`audit/30-findings`) passes on the working tree, in addition to its own acceptance gate and a green DS build/test.
- Uniqueness: a WO that leaves two files or two processes with the same responsibility is not done.
- Executors are edit-only; the coordinator certifies and commits one lot at a time; never push.
- Write sets are declared before claiming; two in-flight WOs never share a file; the coordinator integrates shared files (`package.json`, CI, gate manifests).


### WO-EVI-01 theme-graph: derived cascade graph with a byte-exact check
- **Outcome** — `scripts/generate/theme-graph` runs a dry-run of the pipeline (3 verticals × 2 modes) plus a static read of the skins (postcss `var()` with file:line) and TSX `data-part` stamps, and emits `artifacts/generated/theme-graph/{nodes,edges,by-control,by-family}.json` + digest (< 5 MB, not tracked if > 1 MB; release asset); `ds:derive --check` fails on any drift; views regenerated for `docs/` and `docs-engineering`; it is never read at runtime nor used as acceptance authority (`audit/40-architecture/manifest`).
- **Why** — F-04: the manifest prescribes 4,035 channels of which 32 exist; the measured graph (10,513 edges) had no consumer.
- **Closes** — F-04, F-53 (closure criteria in `audit/30-findings`).
- **Wave** — 4; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-DER-01.
- **Steps** —
  1. Schema `CascadeNode/CascadeEdge`; generator over existing measured artifacts; `--check`; views.
- **Files** — `packages/core/scripts/generate/theme-graph/** (new)`; `packages/core/artifacts/generated/theme-graph/** (new)`; `docs/generated/theme-graph/** (new)`.
- **Acceptance gate** — `ds:derive --check` green; a planted change in a deriver or a skin turns it red; 0 UNKNOWN cells (the graph only contains measured facts).
- **Do NOT** — Do not hand-author any node or edge; do not "complete" the old manifest.
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-EVI-01 (theme-graph: derived cascade graph with a byte-exact check) exactly as specified in `roadmap/evidence-graph.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-04, F-53 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-EVI-02 Causal gates: transport parity, tier rejection, computed-style propagation, tenant-difference probe by axis, coverage and liveness
- **Outcome** — Gates that measure causality in CI: `intent-literal` (AST + mutant), `theme-transport-parity` (static/DB/preview/publish), tier rejection, `capability-propagation` with computed styles (Playwright, 3 verticals × 2 modes) mutating the real `documentPath`/`brandThemePath` of each decision, `artifact-coverage` per family, `read-without-producer`, `entrypoint-parity`, `hardcode-census`, selector liveness, and the tenant-difference probe **by axis excluding color with a negative test** (`audit/50-matrices/customization-inventory` §5 rule 4) run on two bithire tenants (owner scope 2026-09-05); baselines with published debt ratio and no `--widen`; the APCA contrast baseline empty.
- **Why** — F-23: the verification is decorative; F-72: propagation suites mutate the wrong doors; F-54: `variant-parity` accepts 3,943 placeholders; F-86: ratchets at their ceiling.
- **Closes** — F-23, F-72, F-74, F-75, F-76, F-86, F-54 (closure criteria in `audit/30-findings`).
- **Wave** — 4; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-CAT-03, WO-DER-01.
- **Steps** —
  1. One gate per property above, each with a drill; runner summary with debt per gate; retire `variant-parity`, `mirror-parity`, `root-checklists`.
- **Files** — `packages/core/scripts/check/**`; `packages/core/tests/integration/**`; `packages/showroom/e2e/**`.
- **Acceptance gate** — Every property of `audit/20-rubric/tests-gates` J.1–J.7, J.12, J.22, J.23 has an executable gate with a drill; the by-axis probe passes only when the six non-color axes reach ≥ 80 % and the negative test (palette-only documents → 0 % on non-color axes) is green.
- **Do NOT** — Do not accept a gate whose ground truth is text presence.
- **Size** — L.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-EVI-02 (Causal gates: transport parity, tier rejection, computed-style propagation, tenant-difference probe by axis, coverage and liveness) exactly as specified in `roadmap/evidence-graph.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-23, F-72, F-74, F-75, F-76, F-86, F-54 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-EVI-03 Tests through the door: door-parity suite, harness reduction, liveness-based channel tests, dated visual baselines
- **Outcome** — A `door-parity` suite exercises one case per family through `compileThemeIntent`; `lowerBrandThemeFixture` consumers are counted and decrease to 0; `*.skin-channel.test` use the liveness graph (READ ≠ PAINT) instead of `toContain`; showroom visual baselines are marked pre-migration with an expiry and regenerated only after the owner approves the reference identity; `retry` stays 0.
- **Why** — F-48: 58 test files bypass the door, 452 assertions compare CSS text, tests are green over dead channels, byte-for-byte baselines freeze hardcodes.
- **Closes** — F-48 (closure criteria in `audit/30-findings`).
- **Wave** — 4; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-CAT-03, WO-DER-07 (visual baselines are regenerated only after the owner picks the bithire reference identity).
- **Steps** —
  1. Suite; `testConsumers` counter; rewrite channel tests; baseline policy.
- **Files** — `packages/core/tests/**`; `packages/core/src/**/tests/**`; `packages/showroom/e2e/visual/**`.
- **Acceptance gate** — `testConsumers` of the harness decreasing to 0; 0 tests asserting `toContain('--ds-…')` without a producer; visual baselines carry an expiry note.
- **Do NOT** — Do not regenerate visual baselines before the reference identities are approved.
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-EVI-03 (Tests through the door: door-parity suite, harness reduction, liveness-based channel tests, dated visual baselines) exactly as specified in `roadmap/evidence-graph.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-48 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-EVI-04 Roadmap and documentation truth: STATUS indicators, fingerprint re-seal, Modern Rescue sealed, docs regenerated
- **Outcome** — `STATUS.md` publishes the indicators of `audit/70-plan/index.md` §3 (root reach, channels without producer, material 71/71, roles in skins, `data-state` coverage, by-axis probe, green gates without `dist/`, emitters outside `emission/`, files > 800, LOC without consumers) instead of `% WOs done`; the DS-improvements fingerprint is re-sealed as an audited change; the phase model of DS-improvements (eight phase keys opened with one owner GO on 2026-09-05) is either collapsed into the program waves in a separate machinery commit with its 77 tests updated, or kept with a written reason; WO-CRA-23 (Modern Rescue) is sealed with its R0 instrumentation retained; `CLAUDE.md`, `docs-engineering` and the engine docs stop citing retired paths and "DaisyUI"; `claim-exactness` sinks adjudicated.
- **Why** — F-51: `roadmap:check` fails on a stale fingerprint; 0/255 families is the real indicator; F-50: the bootstrap doc names a compiler that does not exist.
- **Closes** — F-50, F-51, F-106 (closure criteria in `audit/30-findings`).
- **Wave** — 1; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-CAN-01.
- **Steps** —
  1. Extend `scripts/maintain/roadmap/status/index.mjs` with the indicator section (measured by the gates of WO-EVI-02 when they exist; `n/a` before); re-seal `DS_IMPROVEMENTS_PLAN_SHA256` with an owner-approved mapping; seal WO-CRA-23; docs fixes.
- **Files** — `scripts/maintain/roadmap/status/index.mjs`; `roadmap/STATUS.md (generated)`; `roadmap/registry.json (via the script)`; `CLAUDE.md`; `docs-engineering/engineering/design-system/**`.
- **Acceptance gate** — `node scripts/maintain/roadmap/status/index.mjs check` exit 0 with `docs-engineering` present; `STATUS.md` shows the indicator section; `grep -i daisyui docs-engineering/engineering/design-system/README.md` does not describe Modern.
- **Do NOT** — Do not hand-edit `registry.json` statuses; use the script.
- **Size** — S.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-EVI-04 (Roadmap and documentation truth: STATUS indicators, fingerprint re-seal, Modern Rescue sealed, docs regenerated) exactly as specified in `roadmap/evidence-graph.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-50, F-51, F-106 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.
