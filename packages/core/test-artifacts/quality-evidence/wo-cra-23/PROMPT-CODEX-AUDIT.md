# Prompt for Codex — full audit of WO-CRA-23

Paste from `---` down.

---

You audited an earlier plan for `ui-design-system` — the rounds-based **R0 through R7** programme with
sealed evidence, hashed manifests and admission packets. **That plan is superseded. Do not audit
against it.**

The replacement, the work executed under it, and the evidence are all in one document:

```
packages/core/test-artifacts/quality-evidence/wo-cra-23/AUDIT-BRIEF.md
```

Read it first. It is written to be falsified, not summarised — §0 tells you how to attack it
efficiently, §1A explains what the R-rounds became and why they were replaced, §1C states the current
plan so you can audit plan-versus-execution as a gap.

**Your job: try to break it.** Confirm nothing you have not re-derived yourself.

## What I want from you, in priority order

1. **The central claim.** §2.1 says reach is near-identical across the three verticals (253/252/253
   of 258) and that ~⅓ of all painted declarations terminate in a DS literal, an inline fallback or
   nothing — identical by construction. **A programme was re-scoped on that.** Is it sound? The
   census explicitly does not model cascade between competing rules nor `@media`/container
   conditions. Does that omission change the ⅓?

2. **Plan versus execution.** §1C claims this session was phases 1 and 2, and that phase 3 — the
   craft elevation — has not begun. Check whether anything was called finished that does not meet the
   seven-item contract in that section. Three of its items (i18n, responsive, probe scene) were
   applied to **no** family.

3. **The unverified list, §7.** Eight items. Start there. In particular: no full `test:run` was
   executed at HEAD, four token contracts remain red, and `family-ledger.json`'s 252 `state` values
   were never reconciled with the work done.

4. **The retractions, §4.** Ten claims were corrected mid-programme. **Find the ones that were not.**
   That table is a calibration sample, not a complete list.

5. **The fences.** §1C lists five, unchanged from the plan you know. §2A shows one is breached today:
   the engine skin layer authors 182 names declared in no other layer, with no guard. Are the other
   four intact?

## Rules for your report

- **Every finding needs the command or `file:line` that settles it.** A claim you cannot re-derive is
  a hypothesis; label it as one.
- **A claim about a repaired state is not verifiable at HEAD** — every repair removed the thing it
  describes. Where the brief pins a pre-repair commit, use it. Where it does not and you cannot
  verify, ask rather than record it as unfounded.
- Traps that produce false results are listed in §6. The expensive ones: a fresh worktree has no
  `node_modules` and returns `ERR_MODULE_NOT_FOUND`, which reads exactly like a failing gate; `dist`
  is not one age; exit codes must be captured directly, never through a pipe.
- **Distinguish a live defect from an aged contract.** Four contracts in this repository describe a
  compiler that no longer exists. Those are corrected, not repaired, and the difference matters.
- If you disagree with one of the nine rulings in §3, say so and give the measurement that would
  settle it. They are decisions, not facts.

Write the report to
`/docs-engineering/archive/audits/YYYY-MM-DD-wo-cra-23-audit-codex.md`, dated the day you run it.

Do not modify source. This is an audit.
