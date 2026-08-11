# lane-control

Coordinator machinery for running many writer agents in parallel over one shared tree.

`writeRoot` lives in `test-artifacts/quality-evidence/wo-cra-23/family-ledger.json` and, before this
folder existed, appeared in **no executable anywhere in the repository**. "Provably disjoint lanes"
was prose. These four commands make it a mechanism.

Everything here runs **without a build** — no `dist` import, no dependency, no install step. The build
has been red for this programme's whole life; a check nobody can run while the build is red is not a
check.

Nothing here is registered in the CI manifest. That is the coordinator's decision, not this folder's.

---

## The four commands

All paths are repo-relative and every command is run from the repository root.

### 1. `write-set-intersection` — before the work

```bash
node packages/core/src/tooling/lane-control/public/write-set-intersection/index.mjs \
     --plan packages/core/src/tooling/lane-control/composition/plan/examples/plan.example.json
```

| Rule | What it computes |
|---|---|
| `R1-bound` | every declared pattern resolves inside its row's `writeRoot`, outside its `writeExcludes` |
| `R2-collision` | pairwise intersection over files that **exist today** — computed, never asserted |
| `R3-territory` | pairwise intersection over paths that **do not exist yet**, reported with a synthesised witness |
| `R4-single-owner` | no lane silently covers a single-owner file; at most one lane may *claim* each per plan |
| `R5-ledger-drift` | the ledger's `sharedSkinFiles` map agrees with the map re-derived from `rows[].skinFiles` |

**R2 is not enough on its own, and R3 is why.** Two lanes shaped `scripts/**/*-gate.mjs` and
`scripts/**/build-*.mjs` share no file today — a file-level intersection calls them disjoint and is
wrong the first time anybody writes `build-something-gate.mjs`. R2 proves today; R3 bounds tomorrow.
The overlap question is decided by a product search over the two filename globs **carrying both
lanes' exclusions as negatives**, so it returns either a concrete witness path or a proof that none
exists.

Where the reduction cannot decide, it widens the territory and reports a collision. A false positive
blocks a lane and costs a conversation; a false negative lets two agents write the same file. Every
approximated verdict says so in its finding.

### 2. `containment` — after the work

What the auditors run.

```bash
# against a plan
node packages/core/src/tooling/lane-control/public/containment/index.mjs \
     --plan <plan.json> --lane F1 [--mode worktree|staged|range --range A..B] [--expect-changes]

# without a plan
node packages/core/src/tooling/lane-control/public/containment/index.mjs \
     --write-root <dir> --write-set '<glob>' [--write-set '<glob>'…] [--exclude <dir>…]
```

- **A rename is two paths.** Both ends are checked: a rename *into* the lane is a deletion of a file
  the lane never owned, and only a check that reads both ends can see it.
- **Membership is decided against the patterns**, not a pre-resolved file list, so a file the lane
  *created* is judged by whether it was allowed to create it there.
- **`--expect-changes` refuses an empty diff.** A check that scans nothing passes everything.

### 3. `work-order` — the delegable unit

```bash
node packages/core/src/tooling/lane-control/public/work-order/index.mjs \
     --work-order packages/core/src/tooling/lane-control/public/work-order/examples/wo-example.json
```

`public/work-order/schema.json` states the shape. The validator states what a shape cannot:

| Rule | What it refuses |
|---|---|
| `W1-model-reason` | a padded or boilerplate reason; a `sonnet` lane with no pre-pass, or one whose cited evidence is not on disk |
| `W2-edit-class` | a substitution table on a lane not allowed to substitute; a deletion with no death proof |
| `W3-mandatory-sentence` | a paraphrase of the verbatim sentence — **and a sentence that has drifted out of the Modern Rescue README**, so the gate cannot quietly enforce a retired law |
| `W4-build-free` | a verification needing the build; a work order omitting `channel-wiring-zero-delta-gate.mjs` |
| `W5-commit-pathspec` | `.` or `-A`; a pathspec outside the write set; a pathspec **containing an excluded region**, because `git commit -- <path>` stages the working tree under that path |
| `W6-findings-file` | a findings destination with no directory to land in |
| `W7-bound` | a write set escaping its row — checked by the *same* machinery the plan checker uses |

Length is checkable and meaning is not, so `W1` puts a floor on **distinct words**: `"Mechanical" +
51 dots` clears the schema's `minLength` and says nothing.

**Synthetic ledger rows** for the non-family waves live in `public/work-order/synthetic-rows.json`, in the
same shape as a family row: `layer:base`, `tooling:gates`, `tooling:generator`, `contracts:registry`.
Their derivable fields are `null` on purpose.

### 4. `program-state` — the README checkpoint as command output

```bash
node packages/core/src/tooling/lane-control/public/program-state/index.mjs --write --intent <intent.json>
node packages/core/src/tooling/lane-control/public/program-state/index.mjs --check --intent <intent.json>
```

The Modern Rescue README declares that no derived status may be typed into its checkpoint. A rule a
document states about itself is enforced by whoever last edited it. This command is the enforcement.

The checkpoint is **rendered**, never edited: intent in, derivation performed at write time, document out. The
rest of the file is untouched byte-for-byte. The rule is enforced **on the intent**, before rendering
— once a figure is in the document, nothing can tell whether it was derived or typed.

#### Volatility — why `--check` is satisfiable

Every derived fact carries a `volatility`, and it decides whether the fact may be written into the
document at all.

| | Meaning | Where it goes |
|---|---|---|
| **`pinned`** | changes only when somebody changes what the checkpoint is *about* — adjudication counts, `singleOwner.entries`, `plan.lanes` | rendered into the body, **byte-verified, full teeth** |
| **`provenance`** | changes as a side effect of ordinary work — `head.*`, `tree.dirty`, `universe.files`, `plan.coveredFiles` | **never** in the body; HEAD lives in the stamp, the rest is reported live by `--check` |

The first version pinned `head.short` into a byte-verified body. Committing the render moved HEAD
past the value the render contained, so the document was stale the instant it was committed and no
sequence of operations could make the check green again — `P5`, `P7` and `P8` all fired, all for the
same reason. The cut is not "HEAD-sensitive": `universe.files` and `plan.coveredFiles` move whenever
a lane does its job, and pinning them puts the check back where it started one commit later.

Removing them does not weaken the check — it is what lets the check be **read**. While the checkpoint was
permanently red over HEAD drift, a real `ledger.families` disagreement was invisible underneath it.

`P5` is gone as a violation. "Has HEAD moved?" was only ever a *proxy* for "is this document still
true?", and `P7`/`P8` answer that directly by re-deriving every pinned fact and byte-comparing. The
drift is still **reported**, with its distance and whether the file itself moved, so the signal
survives without the unsatisfiable predicate.

| Rule | What it catches |
|---|---|
| `P1-typed-figure` | a sha, or any integer equal to a **pinned** figure. Escape via `allowedLiterals`, each entry carrying a written reason |
| `P2-unknown-derivation` | a `{{derived.…}}` placeholder nothing produces |
| `P4-unstamped` | the checkpoint was hand-written, not transitioned |
| `P6-intent-drift` | the intent changed and the checkpoint was not re-rendered |
| `P7`/`P8` | a fresh render disagrees with the file — hand-edited, or a **pinned** figure no longer matches the repository |
| `P9-provenance-pinned` | a provenance fact listed in `derivedFacts`, or interpolated into prose. **This is the guard that stops the defect returning**, and it closes both paths |

Only strings the renderer actually reads are scanned for typed figures; a field that never reaches
the document cannot put a figure in it. `P1` compares against pinned figures only — comparing prose
against a volatile value would make this rule's verdict depend on unrelated repository activity,
which is the same disease.

---

## Drills

```bash
node packages/core/src/tooling/lane-control/quality/runtime/drills/index.mjs
```

Every check ships a drill that shows it **failing on an injected violation**, plus a positive control
showing it passing on clean input. A check never seen to fail proves nothing; a check rigged to always
fail proves less. Drills run against temp directories and a throwaway git repository — never the
working tree, and never the real Modern Rescue README.

---

## Exit codes

One vocabulary across every command, so a batch script can tell a refusal from a crash without reading
the text.

| Code | Meaning |
|---|---|
| `0` | ran, found nothing |
| `1` | ran, **found a violation** |
| `2` | **could not run** — bad arguments, missing file, unparseable plan |

---

## The lane plan

```jsonc
{
  "planId": "wave-2-batch-a",
  "lanes": [
    { "id": "F1", "row": "primitive/display/avatar", "model": "sonnet" },
    { "id": "B",  "row": "layer:base", "model": "opus",
      "claimsSharedFiles": ["packages/core/src/foundation/tokens/css/foundation/themes/default.css"] }
  ]
}
```

- `row` binds the lane to a ledger row (family or synthetic) and inherits its `writeRoot` /
  `writeExcludes`. A lane may narrow with its own `writeSet`; it may not escape.
- A lane with **no row and no explicit `writeRoot` is refused**. An unbounded lane cannot be checked,
  and "the agent will be careful" is not a boundary.
- `writeExcludes` naming a directory excludes a subtree; one carrying glob magic excludes a **shape**,
  which is the only way two lanes sharing a directory can be proven apart.
- Negation (`!`) inside a `writeSet` is refused: exclusion is a field the checker can reason about,
  not punctuation it passes through to a matcher.

## Single-owner files

Seeded by architecture (the default theme, the base CSS layer, the tenant capability registry, the
TypeScript token sources) and derived by arithmetic (every skin file the ledger shows has more than
one family owner). Silence is refusal: a write set that covers one of these fails. A lane that
genuinely owns the file declares `claimsSharedFiles`, and then exactly one lane per plan may claim it
— *single ownership, always*. Without the escape the base-layer lane could not run at all; without the
check the rule would be prose again.
