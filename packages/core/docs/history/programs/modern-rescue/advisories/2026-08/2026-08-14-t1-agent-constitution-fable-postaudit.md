# T-1 Agent Constitution — Fable Postaudit (final)

- Date: 2026-08-14. Auditor: Fable 5, read-only; this advisory is the only write. No stage/commit/push; no edit to the seven audited paths or any product file.
- Audited against: Fable ruling `1f567bc549f1db682a3a…` and Kimi K3 ratification `297b477061e59e23d4bd…` (both present in this directory; hashes recomputed live).

## Scope and identity — EXACT

The seven live paths hash byte-exact to the declared SHAs, in order:
`AGENTS.md 8043c82e…`, `CLAUDE.md 142b2e5d…`, `modern-rescue/README.md 73aefa99…`, `orchestration/index.json 2ea3078e…`, `customization-model/index.json 749e60bc…`, `program-check.mjs b35c1614…`, `program-check.test.mjs 47fcb19d…` (full 64-hex values verified; all seven matched). Staging index: **empty (0)**. No product path was touched by this audit.

## D1 — deep gate preserved, constitution ADDITIVE: VERIFIED

`program-check.mjs` (405 lines) now composes three layers in one exported validator `validateModernRescueContracts`: textual anti-drift (`collectTextualFailures`), contract cross-checks (`collectContractFailures`) AND the deep manifest gate — `validateCustomizationManifest` imported from `manifest/generator.mjs` at :19 and executed at :377 with `includeManifestGate: true` by default; a thrown deep-gate error is converted into a failure, not swallowed. The blocking gate `modern-rescue-program-contract` therefore runs constitution + deep manifest validation together. My prior D1 (gate narrowed) is CLOSED. Executed live: `CONSTITUTION_READY`, exit 0.

## D2 — drills causal and non-vacuous: VERIFIED

`program-check.test.mjs`: **9 tests, 9 pass, 0 fail** (executed). Every mutant routes through the SHARED validator on a `structuredClone` of the live contracts and asserts the specific failure string: role drift (Opus coordinator, Sonnet implementer, swapped roles, dropped advisor, Sonnet in routing law), Standard-14/Pro-8 (both program/index.json and model sides), `--_ds-*` erasure / namespaceLifecycle deletion / deny-list full drop, target-model promotion to OPERATIONAL, r7 true in each of the three contracts, doubleAccept deletion / empty notAuthorizationFor / dropped actor / non-Codex coordinator, cross-contract baseline mismatch and Expert-295. Test 1 asserts the LIVE tree returns zero failures INCLUDING the deep manifest gate. The deep-gate causality drill renames a real family manifest (`manifest/families/primitive/inputs/button.json`) and asserts the composed validator reports it, restoring in `finally` — verified clean after the run (git shows zero delta on that path). `manifest/generator.test.mjs`: **27 pass / 0 fail** (executed). My prior D2 (red, vacuous-risk drill) is CLOSED.

## D3 — scratch gone, T0 untouched: VERIFIED

`packages/core/gen-iso-shape.cjs` and `packages/core/src/_tmp_extract.test.ts`: both ABSENT. The six T0 THEME-ISO worktree files (`iso.ts`, `iso-shape.ts`, `first-party-themes.ts`, `migrate-v1.ts`, `theme-iso.test.ts`, plus the modified compiler/entrypoint set) remain present and unmodified by the T-1 packet. T0 stays outside this postaudit's verdict, as ruled.

## D4 — doubleAccept exact, without commit authority: VERIFIED

`orchestration/index.json#doubleAccept` (live): law text states verbatim that a Fable 5 + Kimi K3 ACCEPT "is not itself a commit authorization, it does not substitute for Codex sighted acceptance… and it does not bypass the no-stage/no-commit/no-push fence"; `requiredFor: requesting an explicit owner order`; `notAuthorizationFor: [local commit, push, release, R7 execution, owner decision]`; actors Fable 5 + Kimi K3; coordinator Codex; implementationActor Kimi 2.7. This encodes my ruling's decision 10 exactly (necessary-not-sufficient). The checker enforces presence, actors, coordinator, implementer and non-empty notAuthorizationFor; the drill covers all four mutations. My prior D4 is CLOSED.

## Twelve-law coherence, counterexamples planted

All twelve constitutional decisions of the Fable ruling re-verified against the live seven files: namespace triad + lifecycle + drainLaw (`customization-model/index.json#namespaceLifecycle`), deny-list in both namespaces/keypaths/compiler, 13+7 operational vs 9+7 PROPOSED, Expert 294/200 frozen, transport equality with the five named prohibitions, mirror law, manifest denominators (255 visibleFamilies pinned), apps non-authority, fixed roles, commit fence ("No stage, commit or merge without an explicit owner order"; the old "Local commits are allowed after an audited packet" phrase is now itself a NEGATIVE sentinel at checker :155-157), persistent bootstrap pointers (AGENTS.md -> 6 authorities; CLAUDE.md -> AGENTS.md + 4 pointers; both banned from citing test-artifacts/advisory as authority), and anti-simplification sentinels (the six phrases including "universal `--ds-*` only" now trip the checker — my own base report's phrasing is machine-banned, correctly).

Eight in-memory counterexamples planted by me against the composed validator (contract layer): dashboard dropped from deny-list -> DETECTED; 14th Standard -> DETECTED; Expert 295 -> DETECTED; private prefix erased -> DETECTED; "second compiler" removed from transportEquality.forbidden -> DETECTED; r7 flipped true in all three contracts simultaneously -> DETECTED; single-pattern drop of `event` only -> survives; `notAuthorizationFor` reduced to `[R7 execution]` (dropping `local commit`) -> survives.

**Adjudication of the two survivors:** both are sentinel-DEPTH bounds, not vacuity — the checker causally detects full-drop, keystone-drop (`dashboard`), emptying, and every drilled mutation; the live values are complete and correct; and any future edit of these seven files re-enters T-1 verification plus double-audit by constitution. They are recorded as **two non-blocking hardening notes** for the next legitimately authorized edit of `program-check.mjs`: (H1) iterate ALL seven `forbiddenPatterns` instead of the `dashboard` keystone; (H2) require `local commit` (and `push`) membership in `doubleAccept.notAuthorizationFor` instead of only non-emptiness. Neither contradicts a mandated D1-D4 property nor a live law value; neither is counted as P1. One further observation, also non-blocking: the deep-gate drill's on-disk rename has a theoretical crash window between rename and restore; acceptable for a serially-run drill on a programme-owned file, noted for awareness.

## Commands executed (all green)

`node program-check.mjs` -> `CONSTITUTION_READY` exit 0 · `node --test program-check.test.mjs` -> 9/9 · `node --test manifest/generator.test.mjs` -> 27/27 · seven SHA-256 recomputations -> 7/7 exact · staging index 0 · drill-target file byte-clean post-run.

## Verdict

D1 additive VERIFIED · D2 causal VERIFIED · D3 clean VERIFIED · D4 exact VERIFIED · twelve laws coherent · scope exact · staging empty · counterexamples adjudicated (2 hardening notes, non-blocking).

**ACCEPT — P0=0, P1=0**

- This file: `packages/core/docs/history/programs/modern-rescue/advisories/2026-08/2026-08-14-t1-agent-constitution-fable-postaudit.md`. Its SHA-256 is stated in the accompanying reply (a file cannot embed its own final hash).
