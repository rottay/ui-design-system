# Agent Constitution — Modern Rescue (WO-CRA-23)

Any agent that loads this project for the Modern Rescue programme **must** read
these files in order and obey the machine checks before editing.

## Read order

1. `CLAUDE.md` — project-wide bootstrap and general rules.
2. `packages/core/scripts/tooling/quality/evidence/programs/modern-rescue/README.md` —
   **only human entry point** for WO-CRA-23: product promise, authority tree,
   fixed scope, lifecycle, resume algorithm, test-truth policy, fences.
3. `packages/core/scripts/tooling/quality/evidence/programs/modern-rescue/program/index.json` —
   programme identity, fences, denominators and invariants.
4. `packages/core/scripts/tooling/quality/evidence/programs/modern-rescue/customization-model/index.json` —
   operational controls, namespace lifecycle, target/proposed distinction.
5. `packages/core/scripts/tooling/quality/evidence/programs/modern-rescue/orchestration/index.json` —
   exact roles, commit policy and routing for this programme.
6. `packages/core/scripts/tooling/quality/evidence/programs/modern-rescue/check/index.mjs` —
   run this to verify the constitution is internally consistent.



## Hard fences

- **Never push.** Local commits run under the owner's standing authorization
  (2026-08-29): the lot belongs to the roadmap, the write-set is explicit,
  Fable's audit is ACCEPT or fully remediated, applicable gates are green,
  `git diff --check` is clean and no foreign files enter the staging. Anything
  outside those conditions still requires an explicit owner order for that
  exact change. `R7` is disabled.
- **No source edits** outside the bounded packet delegated by the owner/DT.
- **No redefinition** of programme authority, denominator, namespace law or
  acceptance criteria in Markdown, comments, JSON or tests.
- **No `.tmp`/scratch files** left in the final worktree.

## Roles for this programme

| Role | Actor |
|---|---|
| DT / coordinator | Kimi K3 |
| Primary source writer | Opus |
| Scout / exact mechanical work | Sonnet |
| Primary auditor | Fable 5 |
| Checkpoint and architecture auditor | Codex |

DT succession: Codex → Kimi K3, by explicit owner order of 2026-08-20
(decision 13 of the sequencing amendment); Kimi K3 → Codex, by explicit owner
order of 2026-08-21, which activated the documented backup DT
(`docs/prompt-codex-continue.md`) after Kimi K3 exhausted its quota; Codex →
Kimi K3, by explicit owner order of 2026-08-23
(`docs/prompt-dt-fresh-session-2026-08-23.md`), which consummated the present
succession and left Codex outside the DT seat.
Each seat was transferred, not removed; exactly one DT authority exists
before, during and after every succession.

Kimi K3 does not hold an independent audit seat while it is DT. It may write
shared integration or unblock code under an explicit write-set, but may not
self-audit it. Fable 5 audits each integrated lot. Codex independently audits
each product-slice/checkpoint close and every compiler, manifest, public-control
or hard-to-reverse architecture change; its review may run while disjoint work
continues. Opus is the primary source writer. Sonnet performs source-bound
scouting and exact mechanical work and may not make semantic or architecture
decisions.
Naming Kimi K3 as successor discharges the
`kimi-capacity-removal-lacks-successor-or-death-proof` stop condition by a
named successor rather than suppressing it. Fable 5 keeps its full independent
audit capacity across all three successions.

No other model may claim programme authority, commit permission, or final
sighted acceptance. Source comments default to zero and never narrate agents,
rounds, migrations or programme history; a short comment is allowed only for a
non-obvious product invariant, accessibility constraint, browser quirk or
public API requirement.

## Verification command

```bash
node packages/core/scripts/tooling/quality/evidence/programs/modern-rescue/check/index.mjs
node packages/core/scripts/tooling/quality/evidence/programs/modern-rescue/check/index.test.mjs
```

Run these before and after any T-1 constitution edit. Fail-closed on drift.
