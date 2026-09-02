# T-1 Microfix P0-1 — Kimi K3 Focal Reaudit (WO-CRA-23)

- Date: 2026-08-14. Auditor: Kimi K3. Read-only except this advisory; no stage/commit/push;
  neither audited path nor any product file was edited.
- Object: the two live hunks against my REJECT `c88cf737…` — `program-check.mjs` (SHA
  `8c86e7dbec3a794f6eeb646f04beba6ccd790bf73625577783edf32d0e8b136d`) and `program-check.test.mjs`
  (SHA `98db6e03f57f69acbf309cbc8fa52e7ac3aa1bf4e6d11d20291f945c0afe405b`). Both MATCH live.

## Executed this pass

- `node program-check.mjs` → exit 0, `CONSTITUTION_READY`.
- `node --test program-check.test.mjs generator.test.mjs` → 42/42/0 = drills 15 + generator 27.
- My own in-memory counterexamples against the restored battery (not the drill's): rubric weight
  −3 → red (`must equal 100, got 97`); lab route → red (`/probe/ds-reference`); inventory
  forbidden layer → red; R2 scope +1 → red (`R2 must cover 105 primitives`). A fifth attempt
  misaimed a field name (`hardVetoes` vs the real `hardVisualVetoes`) — my harness error, not a
  checker gap; the drill's visual-craft group covers it.

## Coverage accounting — 169 HEAD sites vs the microfix

Semantic word-level match of every HEAD failure message against the new checker (1,311 lines;
`collectHistoricalContractFailures` :421-1270, 214 messages total):

- **Covered: 160/169** — including the manifest deep gate, wired at :1281-1284
  (`validateCustomizationManifest` spread into failures; old wrapper message reworded, semantics
  intact, physically proven by the drill's `button.json` rename mutant). Reference lab, rubric,
  inventory, checkpoint/registry, rounds/cohorts, visual craft, evidence batteries: restored.
- **Correctly dropped as obsolete-by-redesign: 3** — creative/mechanical role triad, adaptive
  routing, Sonnet parallelism bound: their fields were deleted by the constitutional rewrite and
  the replacement fixed-role/no-Sonnet checks are stronger. Keeping them would be red-by-design.
- **Still ungated on live fields: 10** — see P1-1.

## Finding

**P1-1 — orchestration-mechanics residue: 10 HEAD guards dropped while their contract fields are
live in `orchestration/index.json`.** Exact list (field → HEAD guard):

1. `graph.agentCount` (:77) → "agent count must be dynamic, never a fixed number".
2. `schemaVersion: 2` (:2) → "agent orchestration schema must remain v2 with model routing".
3. `efficiency` (:235) → "agent efficiency must require useful comments and structured receipts".
4. `laneTypes[architecture-integrator].singleton` (:111) → singleton guard.
5. `laneTypes[quality-integrator].singleton` (:122) → singleton guard.
6. `reservedPaths` (:158) → length ≥10 guard; the contract itself delegates: "a checker must
   read the rule from here" (:176) — and none does.
7. R7 process budget (`heavyBuildOrTest` :272 + server/Chromium) → one-heavy-process guard.
8. `r7Execution.longIterationLaw` (:276) → "R7 MAIN must run long checkpoint-sized iterations".
9. `workOrderAdmission.requiredBeforeWrite` (:81-82, extended law :213) → "complete lane work
   orders must block writes rather than advise them".
10. `graph.integratorBatchRecalculationRequired` (:75) → conflict-graph recalculation guard.

No drill group covers this cluster either (the 6 new historical groups cover reference lab,
rubric, inventory, checkpoint/registry, rounds/cohorts, visual craft/evidence — all causal).

Minimal fix: re-add the 10 guards to `collectHistoricalContractFailures` (~12 lines reading the
live fields verbatim) plus one drill test "historical orchestration mechanics fail closed" with
mutants (singleton flip, `reservedPaths` pop, `integratorBatchRecalculationRequired=false`,
`requiredBeforeWrite=false`, fixed `agentCount`). No constitution content changes needed.

## Verdict

**REJECT — finite: exactly P1-1.** 160/169 sites restored and causal, 3 correctly obsolete,
10 ungated on live fields; the bar for ACCEPT is P0=0 P1=0 and P1-1 is measurable, so the packet
cannot be signed yet. Everything else is ACCEPT-grade: hashes 2/2, gates green, drills causal,
scope 2 paths, staging empty. Flip condition: focal re-audit of the same two paths once the 10
guards + their drill land — nothing else needs re-audit.

## Seal

The SHA-256 of this file is stated in the accompanying audit reply; a file cannot contain its own
final hash.

— Kimi K3, maximum-instance auditor. Read-only; this file is the only write.
