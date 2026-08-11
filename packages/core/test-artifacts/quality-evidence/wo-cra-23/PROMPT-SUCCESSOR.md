# Prompt for the successor session — WO-CRA-23 `modern-rescue`

Open a fresh terminal in `/Users/daniel/Developer/Rottay/ui-design-system`. Paste from `---` down.

---

You are continuing WO-CRA-23 (`modern-rescue`) on `ui-design-system`. The previous session ran to
context exhaustion and handed off deliberately. Everything you need is written down; if it is not,
that is a defect worth reporting.

## Read first, in this order

```
packages/core/test-artifacts/quality-evidence/wo-cra-23/AUDIT-BRIEF.md      ← start here, 537 lines
packages/core/test-artifacts/quality-evidence/wo-cra-23/PROGRAM-STATE.md    ← the resume authority
packages/core/test-artifacts/quality-evidence/wo-cra-23/family-ledger.json  ← 252 rows, state column STALE
packages/core/test-artifacts/quality-evidence/wo-cra-23/harness/primitives/README.md
```

The brief's §1C has the plan and the honest execution status. §7 has the eight things never verified.
The task list carries ownership and briefs.

## The goal

**From each tenant's configuration, the same React tree must render as genuinely different
companies.** That question is already answered — do not re-open it, build on it. §2.1 of the brief.

## The owner's standing law — non-negotiable

- Nothing legacy. No production app. No compatibility owed. Every token under our control. **Nothing
  hardcoded.**
- **Never escalate an aesthetic or typographic choice to the owner.** It is either the tenant's (a
  channel) or yours (an architecture decision). If you are about to escalate, you have mis-framed it:
  re-read it as *"should a literal exist where a tenant channel belongs"* and decide.
- **Commits and version publishes are allowed. Never push.**
- Author `davila23 <daniel.avila@rottay.com>`. No `Co-Authored-By`, no AI attribution, no emoji — text
  icons only (`✓ ✗ → • ─ │ ├ └`).
- **Never `git checkout` or `git restore` on a directory.** A 2026-02-05 incident destroyed a week of
  work. Back a file up and restore by copy.

## How to work — this is the part that matters

**Measure, do not argue.** A mechanism argument lost every single time it was tried this programme.
If you find yourself justifying a claim by reading source, stop and run something instead.

**Every zero needs a positive control, and the control must come from the tree.** A control that
mirrors the code instead of the corpus cannot fail. Plant the case that motivated the instrument, not
only the shapes you thought of.

**A green must name its scope.** Six contracts sat red for hours because a filtered run was read as a
suite run. The command that finds them is
`pnpm --filter @rottay/design-system exec vitest run --project unit src/foundation/tokens` — 40
files, 355 tests. Put it in your routine.

**A count is a floor.** Every re-measured scope collapsed: 585→333, 35→3, 16→13. And an instrument
that reports one item at a time hides its own total.

**Attribute by re-running per commit, never by reading a diff.** Use a tree with `node_modules`; a
fresh worktree returns `ERR_MODULE_NOT_FOUND`, which reads exactly like a failing gate.

**Distinguish a live defect from an aged contract.** One is repaired, the other corrected. Never
baseline either.

**Refuse the thin win.** A value clearing a floor by a hair retires the finding without fixing it.
Twice this programme nearly shipped the step judgement would take, sitting just under where it needed
to be.

**Report what you did not verify**, in the same message as what you did. Lead with a correction to
your own earlier claim when you have one — the previous session retracted ten and every retraction
made the record more usable, not less.

**Verify authorship before deconflicting.** Check `git status` and file mtimes before touching
anything; three near-collisions were avoided this way and one was not.

## Delegation

Spawn named lanes and give each a task with the **full brief in the task description, not in chat**.
Splitting a brief across two channels caused two near-collisions and one lane answering four
questions it never received. The task description is the sole authority on ownership and scope.

Route Opus to delicate work, Sonnet to mechanical. Batch tests at the end of a wave, not per lane —
the build and chromium are **machine singletons**; announce before taking one.

Gate every commit on the test exit code, **captured directly and never through a pipe**. A trailing
command eats it: a build exited 1 three times while the harness reported 0. Commit with explicit
pathspecs; never `git add -A` in a shared tree.

## Two auditors, brokered

`Fable` sees the diff and answers *does this change do what it claims*. `Kimi` — CLI at
`/Users/daniel/.kimi-code/bin/kimi`, invoke with `-p "<prompt>"` alone, it combines with neither
`--auto` nor `--yolo` — sees the repository and answers *is what it claims true against the code*.

They never merge and never address each other; you broker. Each audits independently, then Kimi
receives Fable's verdict and must explicitly refute or confirm it. **Where they agree the information
is low. Where they disagree is the finding.**

## Open work, all measured and unowned

```
4 token contracts red      elevation-surface-lift · reduced-motion-guard ·
                           root-component-authority (repaired but INCOMPLETE — it names one
                           channel at a time and exposed -hover after three were fixed) ·
                           4 contracts naming oklch, adjudicated AGED, correct them not the compiler
fluid-ramps ×3             aged — return the 1.875rem rung between the declared 1.5 and 2,
                           removed by edf91a41f's deletion sweep. TWO ramp gaps exist; this
                           contract points at the lower one
evnto/light hairline 1.20  last edge below the band. Diagnostic FIRST: if evnto's light ramp
                           has a usable step, the compression is specific to the dark end
R1's NO-GO                 still standing — responsive overflow and focus never proven, and
                           this session built no gate for either
```

Start with a full `test:run` at HEAD. Nobody has run one.
