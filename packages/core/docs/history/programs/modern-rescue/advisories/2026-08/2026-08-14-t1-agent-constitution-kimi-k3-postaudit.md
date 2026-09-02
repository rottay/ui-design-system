# T-1 Postaudit — Kimi K3 Final Verdict (WO-CRA-23)

- Date: 2026-08-14. Auditor: Kimi K3, maximum-instance auditor. Read-only except this advisory;
  no stage/commit/push; none of the 7 audited paths and no product file was edited.
- Object: postaudit of the T-1 microfix (D1-D4 closure) over exactly 7 live paths, against my
  2026-08-14 ratification and Fable's ruling (SHA `1f567bc5…` verified earlier).

## 1. Hash, scope, staging — clean

7/7 SHA-256 MATCH against the owner-transmitted values (AGENTS `8043c82e…`, CLAUDE `142b2e5d…`,
README `73aefa99…`, orchestration `2ea3078e…`, customization `749e60bc…`, checker `b35c1614…`,
drills `47fcb19d…`). `git diff --cached` empty — zero staged. Worktree scope confirmed: the T-1
packet is exactly these 7 paths; the D1-drain exact4, cert-fence and T0 files are other packets
and were not touched by this wave.

## 2. Gates executed by me this pass

- `node program-check.mjs` → exit 0, `CONSTITUTION_READY`.
- `node --test program-check.test.mjs generator.test.mjs` (blocking gate
  `modern-rescue-tooling-drills`, `ci-gates.manifest.mjs:63-72`) → 36 tests / 36 pass / 0 fail
  = drills 9 + generator 27.
- Independent in-memory counterexamples (my harness, not the drill's): 14th Standard id → red
  ("exactly 13 controls"); drop `namespaceLifecycle` → red; empty `notAuthorizationFor` → red;
  `r7Enabled=true` → red in three contract checks. Live full gate → `[]`.

## 3. D1 — NOT closed: the retained contract cross-checks are carried by nothing (P0)

Fixed part (real): `program-check.mjs:19,377` imports and runs `validateCustomizationManifest`
with `includeManifestGate` defaulting true and fail-closed catch (:379-381); the blocking gate
`modern-rescue-program-contract` (`ci-gates.manifest.mjs:73`) therefore runs constitution + deep
manifest validation. That half of the D1 fix landed.

Dropped part (the defect): Fable's accepted fix text required "constitution cross-check AND
`validateCustomizationManifest` **+ the retained contract cross-checks**". HEAD's checker (1,252
lines, 169 failure sites) enforced, beyond the manifest validation, live laws whose targets are
all unchanged files today: R1 reference lab (route `/probe/ds-reference`, same-tree render, 8
scenes, substrate, forbidden product deps, markers — HEAD :201-269), checkpoint intent (:178-184),
workOrderId/statusAuthority/registry standalone (:149-155, :344-356), family inventory 255 rows /
unique ids / layer counts / sourceRoots / SemanticSurface / retired-counting (:275-331), quality
rubric (v3, weight 100, no craft points for tests, Codex final sighted authority, stressMatrix
lifecycle, ≥20 hard vetoes, canary 95 — :364-397), family elevation/completion laws (:404-426),
material improvement floors (:446-455), receipt fields (:471), CSS ownership / dead-CSS /
R5-R6 audit / tenant dual-authority laws (:487-504). Evidence of absence, all verified live:

- Repo-wide grep for `must retain at least 20 hard vetoes` / `reference lab must render the same
  tree` / `must remain roadmap/registry.json` → zero matches in the worktree.
- `v2/contracts.mjs` is a pure loader (0 validation sites) — nothing migrated there.
- `manifest/generator.mjs` is byte-unchanged (not in the packet) — nothing migrated there.
- The full blocking-gate list (`ci-gates.manifest.mjs:29-291`) contains no gate covering
  reference-lab, rubric, checkpoint, registry or inventory-authority laws.
- New checker: 62 failure sites, constitution-focused; the ~109 old contract checks are gone.

This is the identical drift class D1 named — silent narrowing of a blocking gate — reduced in
degree, not eliminated. D2's mutants guard only the new checks, so the dropped battery is also
drill-unguarded.

## 4. D2 — CLOSED

Drill rewritten (204 lines, 9 tests, 36/36 with generator): role drift ×5, 14th Standard id and
8th Pro capability, `--_ds-` namespace loss ×3, target-model promotion, r7=true ×3, doubleAccept
×4, cross-contract baseline drift ×2 — each asserting a specific error fragment against a proven
green baseline (test 1), so non-vacuous. The physical mutant (rename of
`manifest/families/primitive/inputs/button.json`, restore in `finally`) causally proves the deep
manifest gate fires inside the program gate. My independent counterexamples (§2) concur.

## 5. D3 — CLOSED

`packages/core/gen-iso-shape.cjs` and `packages/core/src/_tmp_extract.test.ts` absent. T0 files
(`iso.ts`, `iso-shape.ts`, `first-party-themes.ts`, `migrate-v1.ts`, `theme-iso.test.ts`) all
predate the fix wave (mtimes 13:14–13:58 vs checker/drill 15:24–15:25) and sit outside the
7-path scope — byte-untouched by this packet.

## 6. D4 — CLOSED

`orchestration/index.json:4-17` codifies `doubleAccept`: scoped law ("not itself a commit
authorization… does not bypass the no-stage/no-commit/no-push fence"), `notAuthorizationFor`
[local commit, push, release, R7 execution, owner decision], actors Fable 5 + Kimi K3, coordinator
Codex, implementationActor Kimi 2.7. Checker enforces it (:305-321); drill mutants cover it.

## 7. The twelve laws — intact and machine-enforced

Namespace triad + deny-list + drainLaw (`customization-model/index.json:5-51`), transportEquality five
forbiddens (:77-87), `r7Execution.enabled:false` in all three contracts with cross-equality
checks, 13/7/294/200 baselines cross-anchored program↔model, `PROPOSED_NOT_IMPLEMENTED`, commit
fences (README :369, AGENTS hard fence), bootstrap pointers, and the forbidden-simplification
sentinels (program-check.mjs:160-179) — all present, all under causal check.

## 8. Findings

- **P0-1 (the only one): D1 partial.** Restore the retained contract cross-check battery
  (§3 list) into `program-check.mjs` alongside the constitution checks, or register a new named
  blocking gate in `ci-gates.manifest.mjs` carrying it explicitly; add drill mutants proving each
  check group fires (the D2 bar). Targets are unchanged files, so the HEAD battery can be
  re-adopted nearly verbatim.
- Observation (non-blocking, no P): dead no-op conditional at `program-check.mjs:349-356` —
  inert, remove when the file is next touched for P0-1.

## Verdict

**REJECT — finite: exactly P0-1.** D2, D3, D4 and the twelve laws are ACCEPT-grade and verified;
hashes 7/7; staging empty; gates green. The audit lane's prior double-ACCEPT of the constitution
stands untouched — this REJECT concerns only the T-1 packet's gate completeness. Once P0-1 lands
with its mutants, the packet can flip to ACCEPT on a focal re-audit of program-check.mjs +
ci-gates.manifest.mjs alone; D2-D4 need no re-audit.

## Seal

The SHA-256 of this file is stated in the accompanying audit reply; a file cannot contain its own
final hash.

— Kimi K3, maximum-instance auditor. Read-only; this file is the only write.
