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
- **AMENDMENT (R4, 2026-09-08; the original acceptance above stands verbatim and is NOT relaxed)** — This WO is the **fleet** obligation and it stays open until its full acceptance passes. Four clarifications, no thresholds changed:
  1. **The threshold is fleet-wide, restated verbatim from `roadmap/kit-2026-09.md` §5 rule 4**: "Threshold per axis: at least 80 % of the families that declare they consume that axis… A global PASS requires all six axes at threshold." A pilot population may not be substituted for it. The pilot is `WO-EVI-05`, which gates `A2-pilot`; this WO gates **milestone B**.
  2. **Both negative controls are mandatory and are quoted verbatim** from the same rule: "two documents differing **only** in palette must give 0 % on the six non-chromatic axes, and two differing only in `states.emphasis` must give 0 % on shape and typography." Neither may be dropped, weakened, or replaced by the other.
  3. **Populations are versioned.** Each axis's denominator is the set of families that DECLARE they consume it, read from the typed catalog at a recorded revision and published with the run. A percentage whose denominator moved between runs is not comparable, and a denominator may never be shrunk to reach a threshold.
  4. **Per-family `adapt` adoption evidence** — the fleet-wide half of `WO-INV-07`'s obligation — is measured here, per family, from the family's own cut. It is not part of `WO-INV-07`'s effective closure scope.
- **BLOCKED (OWNER-PENDING floors, R4 2026-09-08)** — This WO's fleet by-axis acceptance depends on the absolute minimum families that `kit-2026-09.md` §5 rule 1 fixes in the catalog. The consolidated floor decision is the owner's and has not landed. Until it does, **this acceptance may not be certified**, and neither may milestone B or the fleet side of the former A2. Choosing a floor inside the programme to unblock the claim is forbidden; existing explicit minima stand verbatim.
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
- **AMENDMENT (R4, 2026-09-08; the original acceptance above stands, this is added to it)** — The 2026-09-08 re-audit reopened this WO on three delivery findings, plus the reopen-provenance machinery this lane owns.
  1. **DEL-01** — CI checks out docs-engineering `9865c253eca40093515f6662630280aef2818f13` at `.github/workflows/ci.yml:158` and supplies it to the gate through `DOCS_ENGINEERING_ROOT` (:175), while the committed seal at `packages/core/scripts/check/evidence/certification/claims/exactness/documentation-seal/index.json:4` requires `e048d2f9b5c5bf1684445792f5d7b732d6f3ba5b`; the exactness implementation reads the checkout's HEAD and rejects unequal revisions. Added acceptance: the CI checkout and the reviewed seal are **equal**, proven on the actual workflow configuration, and a planted mismatch fails.
  2. **DEL-05** — F-106 is named by this lane and the recorded done evidence does not establish the sink closure. Claim-exactness run against a docs checkout at exactly the sealed revision exits 1 with 49 error entries: 48 documented component/`data-part` rows without a statically established source stamp, plus an aggregate of **116 unresolved governed `data-part` sinks**. Added acceptance: **per-finding, per-subclause** evidence for F-50, F-51 and F-106 — each owner/forwarder adjudicated or given a reliable proof route. Widening or ignoring the error is explicitly not a close. The result is a static proof failure, not proof that every named runtime DOM lacks its stamp.
  3. **DEL-07** — STATUS republished a September 6 decisions-lit run while the producer artifact recorded a newer one. Added acceptance: every published indicator is republished **from its producer** at generation time, and the explicit recorded-versus-measured distinction is preserved rather than resolved.
  4. **Reopen provenance (machinery this WO owns).** `scripts/maintain/roadmap/status/index.mjs` is in this WO's declared Files. `reopen` cleared `evidence`, `claimedBy`, `claimedAt` and `doneAt` and appended no progress entry, so a withdrawn closure left no trace anywhere. The R4 lot added `reopenWorkOrder` with `--reason`, which appends the prior status, completion metadata, **prior evidence verbatim** (never a digest) and the replaced notes to `progressLog` in its existing closed `{at, by, note}` schema before clearing. Added acceptance: **reopen preserves the prior completion record**, proven by positive and negative tests, and the record stays inside the closed progress schema.
- **Do NOT** — Do not hand-edit `registry.json` statuses; use the script.
- **Size** — S.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-EVI-04 (Roadmap and documentation truth: STATUS indicators, fingerprint re-seal, Modern Rescue sealed, docs regenerated) exactly as specified in `roadmap/evidence-graph.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-50, F-51, F-106 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-EVI-05 Causal-gate pilot: the instrument, its drills, and one family green on the pilot population
- **OWNER-RATIFIED 2026-09-08** (GO del owner post-checkpoint DER-02) — activated 1:1 per the anti-sprawl law of `roadmap/README.md`; need identified by the 2026-09-08 re-audit (A2-vs-fleet scope, `audit/95-reaudit-2026-09-08/recommendations/index.md` lot R4). Registered as `todo` so the milestone gate resolves to a real work order; the owner activates it 1:1 per the anti-sprawl law of `roadmap/README.md`. It exists because `PROGRAM_MILESTONES` gates on work orders, not on prose: an unregistered "EVI-02-pilot" is neither a WO nor a supported partial-completion state.
- **Outcome** — The causal instrument of `WO-EVI-02` exists and is proven on the **pilot population**: the by-axis computed-style probe, its drills and its published denominators run end to end, and the families of the first vertical cut (`WO-FAM-01`) are green on every axis they declare they consume. This is the evidence that "decisions → derivation → channels → skin" works at all; it is **not** the fleet threshold.
- **Why** — Milestone A2 required `WO-EVI-02`, whose acceptance is a fleet obligation (six axes × ≥ 80 % of each axis's declared consuming families, with both negative controls). A one-family cut cannot discharge it, and keeping A2 gated on the fleet made a reachable pilot milestone unreachable. Splitting the instrument from the threshold lets the pilot be certified honestly while `WO-EVI-02` stays open.
- **Closes** — (repair ticket; it changes throughput accounting, not the 116-finding product denominator) (closure criteria in `audit/30-findings`).
- **Wave** — 4; runs beside the first family cut.
- **Depends on** — WO-CAT-03, WO-DER-01, WO-FAM-01.
- **Steps** —
  1. Stand up the by-axis probe and its drills as the instrument `WO-EVI-02` will later run fleet-wide — one instrument, not a second one.
  2. Publish the pilot population explicitly: which families, which axes each declares, at which catalog revision.
  3. Run both negative controls of `kit-2026-09.md` §5 rule 4 on the pilot pair, unchanged.
- **Files** — `packages/core/scripts/check/**` (the same instrument `WO-EVI-02` runs); `packages/showroom/e2e/**`.
- **Acceptance gate** — The instrument runs with its drills proven red on planted mutants; the pilot cut's families are green on every axis they declare; **both** negative controls green on the pilot pair (palette-only → 0 % on the six non-chromatic axes; `states.emphasis`-only → 0 % on shape and typography); the pilot population and its denominators are published with the run. Explicitly **NOT** in this gate: the fleet ≥ 80 % threshold of `WO-EVI-02`, which stays that WO's alone.
- **Do NOT** — Do not write a second probe; do not report a pilot percentage as a fleet percentage; do not let the pilot's smaller denominator appear in a fleet claim.
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-EVI-05 (Causal-gate pilot: the instrument, its drills, and one family green on the pilot population) exactly as specified in `roadmap/evidence-graph.md`: read first `audit/README.md`, `roadmap/kit-2026-09.md` §5 rule 4 and the WO-EVI-02 block above; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate passes; report the commands you ran and their output.
