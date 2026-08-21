# Agent Constitution — Modern Rescue (WO-CRA-23)

Any agent that loads this project for the Modern Rescue programme **must** read
these files in order and obey the machine checks before editing.

## Read order

1. `CLAUDE.md` — project-wide bootstrap and general rules.
2. `packages/core/scripts/quality-evidence/programs/modern-rescue/README.md` —
   **only human entry point** for WO-CRA-23: product promise, authority tree,
   fixed scope, lifecycle, resume algorithm, test-truth policy, fences.
3. `packages/core/scripts/quality-evidence/programs/modern-rescue/program.json` —
   programme identity, fences, denominators and invariants.
4. `packages/core/scripts/quality-evidence/programs/modern-rescue/customization-model.json` —
   operational controls, namespace lifecycle, target/proposed distinction.
5. `packages/core/scripts/quality-evidence/programs/modern-rescue/agent-orchestration.json` —
   exact roles, commit policy and routing for this programme.
6. `packages/core/scripts/quality-evidence/programs/modern-rescue/program-check.mjs` —
   run this to verify the constitution is internally consistent.



## Hard fences

- **No stage, commit or push** without an explicit owner order for that exact
  change. `R7` is disabled.
- **No source edits** outside the bounded packet delegated by the owner/DT.
- **No redefinition** of programme authority, denominator, namespace law or
  acceptance criteria in Markdown, comments, JSON or tests.
- **No `.tmp`/scratch files** left in the final worktree.

## Roles for this programme

| Role | Actor |
|---|---|
| DT / coordinator | Codex |
| Implementer | Claude implementer pool (Sonnet/Opus) |
| Auditor | Fable 5 (independent, closure audits) |

DT succession: Codex → Kimi K3, by explicit owner order of 2026-08-20
(decision 13 of the sequencing amendment); Kimi K3 → Codex, by explicit owner
order of 2026-08-21, which activated the documented backup DT
(`docs/prompt-codex-continue.md`) after Kimi K3 exhausted its quota. Each seat
was transferred, not removed; exactly one DT authority exists before, during
and after both successions.

Kimi K3 left the read-only audit seat on 2026-08-20, the day it assumed the DT
seat — DT ≠ auditor (decision 13) is a conflict-of-interest fence, not a
removal of audit capacity; the capacity is consolidated in Fable 5, which
remains independent of the DT. Kimi K3 is now retired from the live seat and
does **not** re-enter as auditor or writer: the 2026-08-21 succession names
Codex as successor and therefore discharges the
`kimi-capacity-removal-lacks-successor-or-death-proof` stop condition by a
named successor rather than suppressing it. Fable 5 keeps its full independent
audit capacity across both successions, and Codex — as the live DT — holds no
audit seat.

Implementer succession: Kimi 2.7 → Cloud Opus implementer pool, by explicit
owner order of 2026-08-17; Cloud Opus implementer pool → Claude implementer
pool (Sonnet/Opus), by explicit owner order of 2026-08-20. Each seat was
transferred, not removed; exactly one implementer authority exists before,
during and after both successions.

No other model may claim programme authority, commit permission, or final
sighted acceptance.

## Verification command

```bash
node packages/core/scripts/quality-evidence/programs/modern-rescue/program-check.mjs
node packages/core/scripts/quality-evidence/programs/modern-rescue/program-check.test.mjs
```

Run these before and after any T-1 constitution edit. Fail-closed on drift.
