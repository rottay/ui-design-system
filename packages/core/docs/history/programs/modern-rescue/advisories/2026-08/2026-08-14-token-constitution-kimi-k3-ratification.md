# Token Constitution — Kimi K3 Final Ratification (WO-CRA-23)

- Date: 2026-08-14.
- Auditor: Kimi K3, maximum-instance auditor (read-only; this advisory is the only write; no
  stage/commit/push; no product edits; the T-1 draft was inspected, not edited).
- Object: independent ratification of `2026-08-14-token-constitution-fable-ruling.md`, confronted
  against my two 2026-08-14 advisories (`kimi-k3-token-system-audit`, `kimi-k3-token-namespace-addendum`),
  the canonical contracts, and the owner's resolutions of my addendum §8 questions.

## 0. Hash verification — exact

- Expected (owner-transmitted): `1f567bc549f1db682a3a6c175042b4ee5ffaf8bf3926c092352b875bff6ef62d`.
- Live `shasum -a 256` over the file at audit time:
  `1f567bc549f1db682a3a6c175042b4ee5ffaf8bf3926c092352b875bff6ef62d` — MATCH. 83 lines, intact.

## 1. Independent re-verification (executed by me this pass, not trusted)

- `program-check.mjs`: worktree 310 lines with 0 references to `validateCustomizationManifest`;
  HEAD version 1,252 lines with 2 references. (The ruling says "~1,450" — the only factual
  imprecision found; immaterial to substance.)
- Re-executed `node program-check.mjs` → exit 0, `CONSTITUTION_READY`.
- Re-executed `node program-check.test.mjs` → exit 1, load-time
  `SyntaxError: … does not provide an export named 'readModernRescueContracts'` — the drill targets
  the old API, exactly the D2 mechanism.
- Re-executed `node manifest/generator.test.mjs` → 27 pass / 0 fail. Real mitigation, but masked:
  `modern-rescue-tooling-drills` runs both test files under one `node --test`, so the gate is red
  while the drill file is red.
- Blocking registration verified: `ci-gates.manifest.mjs:63-73` — `modern-rescue-tooling-drills`
  (both test files) and `modern-rescue-program-contract` (checker alone), both `blocking: true`.
- Scratch files present and untracked: `packages/core/gen-iso-shape.cjs` (1,573 B),
  `packages/core/src/_tmp_extract.test.ts` (1,186 B).
- `orchestration/index.json`: zero occurrences of `double-ACCEPT`.
- `AGENTS.md`: 50 lines, untracked T-1 draft. README: "Binding constitution" :65; hard fence
  "No stage, commit or merge without an explicit owner order" :369.
- `customization-model/index.json`: `namespaceLifecycle` :5-51 (`forbiddenPatterns` verbatim:
  event/ticket/dashboard/rottay/bithire/evnto/`--rt-`; `allowedDispositions` [PROMOTE, DERIVE,
  RETIRE] with six required fields; `drainLaw` anti-parking verbatim); `transportEquality` :77-87
  (forbidden: second compiler, subset/intersection fixture, invented neutral Theme, silent default
  vertical, slug/product branch); `r7Execution.enabled: false` :108-109.
- T0 in flight, untracked: `iso.ts`, `iso-shape.ts`, `first-party-themes.ts`, `migrate-v1.ts`,
  `theme-iso.test.ts` (+ modified kernel compiler, tenant-theme, brand-themes index). Correctly
  excluded from this ruling; it will be audited as its own packet.
- Staging: `git diff --cached` empty — zero staged.

## 2. The twelve decisions — K3 position

1. Namespace triad (`--ds` canon / `--_ds` governed private / `data-` axis) — RATIFY. Matches my
   addendum §0/§3 (`rules.mjs:34`, `semanticOwner` law). My count: 483 unique `--_ds-*` in
   `packages/core/src`, 0 in extensions; the ruling's 482-483 is the same measurement.
2. Deny-list in both namespaces, Theme keypaths and compiler — RATIFY. Codified at
   `namespaceLifecycle.publicCanon.forbiddenPatterns`; matches my audit §6 census (16 evnto decls,
   5 bithire `--rt-*` read sites, compiler emissions clean).
3. Lifecycle PROMOTE/DERIVE/RETIRE inside R0-R6; R7 prohibited — RATIFY. Codified dispositions +
   `r7Execution.enabled: false`. The owner resolved my addendum Q2 by prohibition — stricter than
   my written-deadline reading, and correct.
4. `extension.css` drains by cohorts; never parked in `--_ds-*` — RATIFY. `drainLaw` verbatim.
   My audit §5 cohort law stands under this constraint: each declaration's verdict is decided at
   touch time.
5. 13 Standard + 7 Pro operational; 9+7 PROPOSED; Expert 294/200 frozen — RATIFY. Triple anchor
   confirmed (customization-model + `program/index.json#controlBaselines` + generated controls catalog).
6. Static/DDB total transport equality, one compileTheme; subset fixture condemned — RATIFY.
   `transportEquality` codified verbatim; matches my addendum §5 and audit §2/§3. The subset test
   is replaced under T0, never accommodated.
7. Three-themes mirror (structure/order/comments equal; values/dispositions differ) — RATIFY. My
   C0 finding (emission rosters 35/29/25, key-set divergence) is the evidence base; shape-hash
   equality + per-theme compiled-digest invariance is the correct gate.
8. Manifest 255 × 20 = 5,100 as final assessment, not parallel authority — RATIFY. Matches my audit
   §8 verbatim: the drain awards zero manifest progress; reconciliation at T9; denominator fixed.
9. Apps irrelevant as authority — RATIFY. Both my audits were scoped `packages/core` under the
   same law.
10. Roles fixed; double-ACCEPT scoped to the audit lane — RATIFY, including the precision:
    double-ACCEPT is necessary, not sufficient; Codex keeps sighted acceptance and the owner keeps
    commit authorization. Consistent with the program invariant.
11. No commit/stage/push/R7 without explicit owner order — RATIFY. README :369 + AGENTS.md hard
    fence; the worktree complies (zero staged).
12. Persistent constitution (pointers + contracts + causal gate) — RATIFY the design; the two
    implementation defects are confirmed in §3.

## 3. D1-D4 — K3 ruling

- D1 (P0): CONFIRMED. Correction: the HEAD checker is 1,252 lines, not "~1,450". Substance exact:
  2 manifest-validation imports reduced to 0; the blocking `modern-rescue-program-contract` gate
  now checks constitution consistency only. Required fix as the ruling specifies — one gate runs
  both, or a new named blocking gate carries the manifest validation explicitly. Silent narrowing
  of a blocking gate is the drift class this constitution exists to prevent.
- D2 (P0): CONFIRMED with mechanism (load-time SyntaxError on `readModernRescueContracts`). The
  rewrite must include planted-drift mutants (mutated role table, a 14th Standard id, a dropped
  `--_ds-` prefix each turning the checker red) — that is the correct causality bar.
- D3 (P1): CONFIRMED. Both scratch files exist; `_tmp_extract.test.ts` additionally risks vitest
  glob collection. Both must be gone before any owner order.
- D4 (P1): CONFIRMED. `double-ACCEPT` appears nowhere in `orchestration/index.json`; encoding the
  audit-lane scope there prevents both wrong readings.

## 4. My addendum §8 questions — closed

- Q1 (promotion route): resolved — `publicCanon.mintingAuthority` names both legal routes (control
  declaredOutputs or Expert allowlist entry) with the atomic-migration note.
- Q2 (intermediate `--_ds-*` parking of extension debt): resolved — prohibited by `drainLaw`.
- Q3 (denominators): resolved by construction — `transportEquality.inventory` is public-layer;
  `--_ds-*` never enters `dormantPublicChannels` or provenance volume ratchets.

## 5. Finite conflicts with the Fable ruling — complete list

(a) The "~1,450 lines" figure (actual 1,252) — imprecision, not an error of substance. Nothing
else. No constitutional content, census figure, hash or verdict is contested. Prior inter-auditor
differences remain settled as recorded: derivation-over-flat-leaves (K3 direction, accepted),
total-input compiler (Fable direction, accepted), SEV-RECEIPT-MODE (Fable authoritative; my audit
§12 withdrawn).

## 6. Verdict

The twelve decisions are ratified on independently re-derived evidence. D1/D2 are P0 inside the
T-1 packet and block any owner commit-order on it; D3/D4 belong to the same packet. With this
ratification the audit lane reaches double-ACCEPT on the constitution; per decision 10 that is
necessary, not sufficient — the packet may request the owner order only with D1-D4 closed.

**ACCEPT — hash `1f567bc549f1db682a3a6c175042b4ee5ffaf8bf3926c092352b875bff6ef62d` verified live.**

## Seal

The SHA-256 of THIS file is stated in the accompanying audit reply; a file cannot contain its own
final hash. The DT records it in the consensus tree.

— Kimi K3, maximum-instance auditor. Read-only; this file is the only write.
