# T-1 Microfix — Fable Focal Reaudit

- Date: 2026-08-14. Auditor: Fable 5, read-only; this advisory is the only write. No stage/commit/push; neither audited path nor any product file edited.
- Scope: exactly two live hunks. `program-check.mjs` SHA-256 `8c86e7dbec3a794f6eeb646f04beba6ccd790bf73625577783edf32d0e8b136d` (1,311 lines) and `program-check.test.mjs` SHA-256 `98db6e03f57f69acbf309cbc8fa52e7ac3aa1bf4e6d11d20291f945c0afe405b` (339 lines) — both recomputed and byte-exact. Staging index 0 before and after.

## K3 P0 (postaudit `c88cf73794ef…`) — CLOSED

The historic contract battery is restored ADDITIVELY. `validateModernRescueContracts` now composes four layers in one exported validator: (1) `collectTextualFailures` (constitution text/pointers/sentinels), (2) `collectContractFailures` (constitution contracts: roles, namespace lifecycle, transport equality, 13+7, Expert 294/200, r7, doubleAccept, cross-baselines), (3) **`collectHistoricalContractFailures` (:421 — the restored battery: `EXPECTED_COUNTS` layer partition summing to the family total, `SHADOW_STATE_KEYS` recursive scan, inventory layer/denominator reconciliation (:566-:582), rounds R2/R3/R4 cohort scopes (:972-:974, :1138-:1152), checkpoint/registry, reference-lab, quality-rubric, visual-craft and evidence-receipt checks)**, and (4) the deep manifest gate `validateCustomizationManifest` (import :21, executed with `includeManifestGate: true` default, thrown errors converted to failures). Nothing from the constitutional layer was removed to make room: additive, not substitutive.

## Executed — all green

- `node program-check.mjs` -> `CONSTITUTION_READY`, exit 0.
- `node --test program-check.test.mjs` -> **15 tests, 15 pass, 0 fail**: the original 9 T-1 drills unchanged (live consistency incl. deep gate; role drift x5; Standard-14/Pro-8; `--_ds-*` loss x3; target-model promotion; r7 x3; deep-regression via rename+restore; doubleAccept x4; cross-baselines) PLUS 6 new historical drills ("historical reference lab / quality rubric / family inventory / checkpoint and registry / round and checkpoint cohort / visual craft and evidence receipt checks fail closed"), every mutant routed through the shared validator on `structuredClone` copies asserting exact failure strings — causal, not vacuous.
- `node --test manifest/generator.test.mjs` -> **27 pass / 0 fail**.
- Deep-regression drill cleanup verified: zero git delta under `manifest/` after the run.

## Counterexamples planted (11, in-memory via the exported API)

DETECTED (9): dashboard dropped from deny-list; 14th Standard control; Expert 295; `--_ds-*` prefix erased; "second compiler" removed from transportEquality.forbidden; r7 flipped true in all three contracts; **historical layer live**: `denominators.primitives=104` -> "program denominator primitives must be 105"; planted shadow-state `program.status` -> rejected; `visibleFamilies=254` -> rejected.
SURVIVE (2, unchanged from my postaudit): single-pattern drop of `event` only (H1) and `notAuthorizationFor` reduced to `[R7 execution]` (H2).

## D1-D4 and H1/H2 — no regression

- D1 (additive deep gate): intact and now stronger — four layers instead of three.
- D2 (causal drills): intact and extended 9 -> 15; the original nine unchanged in substance.
- D3: no scratch reintroduced; T0 files untouched by this packet.
- D4: doubleAccept object and its four drill mutations unchanged; live `notAuthorizationFor` still lists `local commit, push, release, R7 execution, owner decision`.
- H1/H2 hardening notes: NOT implemented and NOT regressed — the checker still sentinels `dashboard` membership (:279) and non-empty `notAuthorizationFor` (:349) exactly as before. Correct under the bounded-packet law: this microfix was authorized to close the K3 P0 only. H1 (iterate all seven `forbiddenPatterns`) and H2 (require `local commit`/`push` membership) remain open, non-blocking, for a future authorized edit.

## Verdict

Scope exact (2/2 SHAs), K3 P0 closed additively, 15/15 + 27/27 + checker green, 9/11 counterexamples detected with both survivors pre-adjudicated as non-blocking hardening notes, zero regression on D1-D4/H1/H2, staging 0.

**ACCEPT — P0=0, P1=0**

- This file: `packages/core/test-artifacts/quality-evidence/wo-cra-23/advisory/2026-08-14-t1-microfix-fable-reaudit.md`; SHA-256 stated in the accompanying reply.
