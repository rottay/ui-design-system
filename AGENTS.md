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
| Implementer | Cloud Opus implementer pool |
| Auditors | Fable 5, Kimi K3 (read-only) |

Implementer succession: Kimi 2.7 → Cloud Opus implementer pool, by explicit
owner order of 2026-08-17. The seat was transferred, not removed; exactly one
implementer authority exists before and after. Kimi K3 keeps its full read-only
audit seat, so no audit capacity was removed.

No other model may claim programme authority, commit permission, or final
sighted acceptance.

## Verification command

```bash
node packages/core/scripts/quality-evidence/programs/modern-rescue/program-check.mjs
node packages/core/scripts/quality-evidence/programs/modern-rescue/program-check.test.mjs
```

Run these before and after any T-1 constitution edit. Fail-closed on drift.
