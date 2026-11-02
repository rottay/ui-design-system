# Agent Constitution — Modern Rescue (WO-CRA-23)

<!-- CORE-ADOPT-01 -->
## Mandatory Core adoption

Before changing consumption of `@rottay/core`, read and apply [CORE-ADOPT-01](../docs-engineering/architecture/foundations/module-contract/core-consumption/README.md). Adapt to its current published contracts; do not copy Core types or mechanisms, recreate retired APIs, or add legacy compatibility to hide a build/test failure. Fix consumer configuration/usage or the owning public API and adopt its published fix. Record the per-actor reading receipt required there before implementation; reviewers verify compliance in the diff. Pass the absolute rule path and revision explicitly to delegated agents. This rule does not change local roles or authorize unrelated work.
<!-- /CORE-ADOPT-01 -->


## Permanent documentation maintenance

Read the [shared agent contract](../docs-engineering/development/agent-instructions/README.md) and [change matrix](../docs-engineering/development/agent-instructions/change-matrix.md); resolve documentation authority with [the source-of-truth rules](../docs-engineering/development/documentation/authority/README.md). Apply the relevant documentation updates and evidence requirements in the same delivery. Local scope, staffing, roadmaps, verification and Git rules remain in force.

For applicable module normalization, [ROADMAP](../platform/normalization/ROADMAP.md), [TRACKING](../platform/normalization/TRACKING.md) and the owning dossier govern sequence and acceptance. App, UI, tooling and standalone-template work retains its own approved program.

The local DS roadmap, ownership, staffing, sealed programme gates and generated-claim rules remain authoritative for DS implementation. This section governs documentation synchronization and cross-product contract references; it does not reopen a programme, change roles or authorize implementation/publication.

## Current owner succession — 2026-10-04

The owner explicitly appointed Kimi as the sole active DT, coordinator,
auditor and integrator of the current Design System roadmap on main at
`/Users/daniel/Developer/Rottay/ui-design-system`, replacing the Claude
assignment of 2026-10-03. The handoff barrier was met at checkpoint
`bb663f566613a6d0f804f06e815553a9a77b3b23`: the outgoing DT declared
`READY_FOR_KIMI` with no active writers or integrators, the handoff was read
in full, and HEAD/branch/index/worktree were verified against it before any
write. Claude Opus (real `claude-admin` on `admin@rottay.com`, model
`claude-opus-5-5`) is the delegated writer; verify the effective account and
model receipt on every dispatch, never an alias. (Until 2026-10-04 evening the
writer used the normal `claude` profile on `daniel.avila@rottay.com`; that
account's weekly quota exhausted and the owner ordered claude-admin.) Kimi
never approves product code it wrote itself: independent review uses a
separate Opus session with a real receipt. Codex stays completely outside the
loop per the 2026-09-19 restriction below. No push, no branches/worktrees,
apps read-only. Registry, DAG, acceptance criteria and the sealed programme
are unchanged.

## Prior owner succession — 2026-10-03 (superseded by 2026-10-04)

The owner explicitly appointed Claude as the sole active DT, implementation
owner, auditor-coordinator and integrator of the current Design System roadmap
on main at `/Users/daniel/Developer/Rottay/ui-design-system`, replacing the
temporary Codex assignment of 2026-10-02 for this continuation only. The
handoff barrier was met at checkpoint `e74bf6e31`: the last delegated Kimi
packet (read-only RET-01 compat census) reached its terminal receipt before
any successor writer was dispatched. Effective account, recorded by receipt:
normal `claude` on `daniel.avila@rottay.com`, model `claude-opus-5-5`; the
intended `claude-admin` profile failed authentication on 2026-10-03 and the
owner authorized this account instead. Codex's goal stays paused and the
2026-09-19 restriction below applies again in full: no agent invokes Codex.
The DT never approves its own product code; independent review uses real
Fable when verified, otherwise a separate Opus session with a real receipt.
Registry, DAG, acceptance criteria and the sealed programme are unchanged.

## Prior owner succession — 2026-10-02 (superseded by 2026-10-03)

The owner explicitly appointed Codex as the autonomous DT, implementation owner,
reviewer and integrator of the current Design System roadmap on main at
`/Users/daniel/Developer/Rottay/ui-design-system`. This supersedes the
2026-09-19 Codex exclusion for the active continuation only. Kimi 2.8 may perform
bounded delegated work; Claude Opus may join after the owner-confirmed quota
reset on 2026-10-03 at 03:00 America/New_York. Model names must match real
provider receipts. Independent review of code written by the DT still applies.
The sealed Modern Rescue programme below remains historical evidence.

## Current owner restriction — 2026-09-19: Codex outside the loop

Codex has no autonomous role in this project: not DT, writer, auditor,
consultant, checkpoint approver or fallback. Only the human owner may request
Codex work directly. Kimi, Claude and other agents must not invoke Codex through
CLI, API, MCP, task messages, hooks, watchers or scheduled jobs; do not wait for
its approval or reactivate it when quota is exhausted. Use the current
Kimi/Opus/Fable execution policy in `roadmap/README.md`. Prior Codex findings
remain usable static evidence, not an instruction to request another review.
This owner restriction overrides historical role/debrief requirements below
without reopening or rewriting the sealed Modern Rescue programme.

Any agent that loads this project for the Modern Rescue programme **must** read
these files in order and obey the machine checks before editing.

## Read order

1. `CLAUDE.md` — project-wide bootstrap and general rules.
2. `packages/core/scripts/check/modern-rescue/README.md` —
   **only human entry point** for WO-CRA-23: product promise, authority tree,
   fixed scope, lifecycle, resume algorithm, test-truth policy, fences.
3. `packages/core/scripts/check/modern-rescue/program/index.json` —
   programme identity, fences, denominators and invariants.
4. `packages/core/scripts/check/modern-rescue/orchestration/index.json` —
   exact roles, commit policy and routing for this programme.
5. `packages/core/scripts/check/modern-rescue/check/index.mjs` —
   run this to verify the constitution is internally consistent.

The `customization-model/index.json` contract that used to sit at step 4 was
deleted by WO-CAT-02: the typed catalog
(`packages/core/src/contracts/theme/runtime/catalog`) is the only list of
controls, and `theme-single-listing` is the gate that keeps it that way.



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
(`docs/history/prompts/architecture-refactor/2026-08/code-audit-continuation/index.md`) after Kimi K3 exhausted its quota; Codex →
Kimi K3, by explicit owner order of 2026-08-23
(`docs/history/prompts/architecture-refactor/2026-08/design-lead-session/index.md`), which consummated the present
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
node packages/core/scripts/check/modern-rescue/check/index.mjs
node packages/core/scripts/check/modern-rescue/check/index.test.mjs
```

Run these before and after any T-1 constitution edit. Fail-closed on drift.
