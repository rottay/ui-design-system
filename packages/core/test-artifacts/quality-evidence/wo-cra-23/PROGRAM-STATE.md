# Programme state and operating law

Read this file FIRST. It is the resume point when a session ends or context is lost.

It carries **state and law**, never content. The content lives in three documents:

| Document | What it holds |
|---|---|
| `CHECKPOINT-2026-08-10.md` | the diagnosis — what is broken and why |
| `ROADMAP-TENANT-SYSTEM.md` | the model — how a tenant becomes pixels |
| `TOKEN-MANIFEST-SPEC.md` | the normative target — what must be, and the waves |

**Nothing in this file may be a number a command could produce.** If a figure appears here that
`git`, a gate, or a script can derive, the design has failed and the figure must be deleted.

---

## 1. IMMUTABLE OPERATING LAW

**These rules do not change until the programme is finished. A future session may not revise them
without an explicit owner instruction in that session.**

### 1.1 Two independent auditors, and they are not interchangeable

| Auditor | Sees | Answers |
|---|---|---|
| **Fable** | the diff | *does this change do what it claims?* |
| **Kimi** | the repository | *is what it claims true against the code?* |

Both audit every wave. **They are never merged into one review and never replaced by a single
model.** They cannot address each other directly — Fable is a subagent, Kimi is a separate CLI — so
the coordinator brokers: each audits independently, then **Kimi is given Fable's verdict as input and
must refute or confirm it explicitly.**

> The point of two auditors is not redundancy. Where they agree, the information is low. **Where they
> disagree is the finding.** A brokered loop preserves that; letting them converge destroys it.

A wave does not close while either auditor holds an unrefuted hard finding.

### 1.2 Model routing

| Model | Work | Condition |
|---|---|---|
| **Opus** | coordination, contracts, adjudication, anything expensive to get wrong | — |
| **Sonnet** | mechanical volume: headers, substitutions, wiring sweeps | **only work already PROVEN mechanical** |
| **Fable** | read-only adversarial review, with power to reject | — |

**Sonnet never receives work that merely looks mechanical.** It receives work that has passed a
value-parity pre-pass across all three verticals. Five separate times in this programme a change that
looked mechanical changed rendering; the pre-pass is what separates the two.

Every work order names its model **and its reason**. A lane that cannot complete the reason field is
not ready to be delegated — it is missing its pre-pass.

### 1.3 Nothing legacy survives, and compatibility is not a constraint

**There is no application in production.** Breaking an app is therefore permitted: the app adapts.

Consequences, all binding:

- **Delete, never alias.** No deprecation windows, no compatibility shims, no dual vocabularies.
- **No stored-document migration is required.** There are no live tenant documents to preserve.
- **A public export is not a reason to keep something.** `useTokens().transitions` and every other
  published surface may be deleted.
- **"An app might read it" is no longer a defence.** It remains true that a DS-internal read count of
  zero does not prove a name unused — but the consequence has changed: we do not protect the reader,
  we fix the app.

What has *not* changed: breaking an app creates work. Compatibility is not a constraint; **effort
still is.** A lane that breaks three apps must say so, and the repair is part of the wave.

### 1.4 Every token is under our control

There is no permanent ownerless class. A token that today has no declared owner is a **finding to
drain**, not a category to exempt:

- Names emitted only into generated artifacts inherit ownership from their generator.
- Names that exist only inside `var()` fallbacks are either declared under an owner or their reads
  are removed.

I1 (one declared owner per token) has no standing carve-out. The drain is tracked as a finding class
until it reaches zero.

### 1.5 Validation cadence — heavy work batches, cheap checks do not

**Suites, builds and the browser run ONCE per wave**, at a reconciliation point where tests are fixed
together. They are CPU singletons; running them per lane blocks every writer and turns the programme
into a queue. Code progress is the priority.

**But per-lane verification does not stop.** The build-free checks are cheap, need no `dist` and do
not touch the singleton — every lane still runs them before reporting:

- `channel-wiring-zero-delta-gate.mjs --baseline <pinned>`
- selector-multiset equality on its own diff
- the static per-vertical resolution check for any substitution

Without this split, batching destroys attribution: a rendering change made early in a wave surfaces
after twenty lanes have landed, and nobody can say which caused it. **Heavy validation is deferred;
cheap verification is not.**

At the reconciliation point, test failures are fixed as part of the wave — a wave does not close with
a red suite.

### 1.6 Comment economy

Comments are the minimum that makes the code correct to read. No essays, no restating what the code
says, no narration of what changed — git holds that. The same applies to commit messages and lane
reports: dense and short. Effort goes into the code being right, not into prose about it.

### 1.7 Standing fences

No tenant selector or tenant-conditional TSX · no second compiler, engine or icon supplier · no
public `--ds-*` minted by a family lane · no hand-edited `styles/**` or `dist/**` · no test or
baseline weakened to preserve a defect · Classic and Rustic are read-only · app-bithire is read-only
for this programme.

**Operational:** commits are allowed, **pushing is not**. Author `davila23 <daniel.avila@rottay.com>`,
conventional commits, no co-authors, no AI attribution, no emojis. Never `git checkout` or
`git restore` on a directory.

---

## 2. THE FIVE CLASSES OF UNSAFE "MECHANICAL" FIX

Every one of these was discovered *after* being described as mechanical. A lane brief that does not
guard against all five is not admissible.

| # | Class | How it hides |
|---|---|---|
| 1 | **Value-shifting emission cut** | Removing a "redundant" emitted value is not value-preserving when the vertical's scale differs |
| 2 | **Pass-through deletion** | Deleting a middle declaration is a no-op where an artifact declares the same name, and a repaint where it does not |
| 3 | **Permutation rename** | Two names for one concept usually hold two different live values |
| 4 | **Per-vertical class dependency** | A pair that is a safe alias in one vertical is a divergent fork in another |
| 5 | **Fallback-activation** | Declaring a name that today exists only inside `var(--name, fallback)` flips every read site **without editing any of them** — invisible to diff review and to read-count checks |

**The mandatory sentence in every lane brief, verbatim:**

> *Make only the edits enumerated in the substitution table. Never declare a token name that is not in
> your table — above all, never declare a name that currently appears only inside `var()` fallbacks.
> Do not reorder, reformat, dedupe, rename, or fix anything adjacent; every out-of-scope observation
> is a written finding, not an edit.*

**The mandatory build-free verification**, which every lane runs and nothing runs for them:
`scripts/channel-wiring-zero-delta-gate.mjs --baseline <pinned>` — static, needs no `dist`, collapses
every new `var()` read to its fallback and byte-compares. Plus selector-multiset equality on the diff,
and a static per-vertical resolution check for any substitution.

---

## 3. MEASUREMENT LAW

- A citation must prove what it **claims**, not that a symbol appears in the file. *This defect
  produced the wave-1 error: name overlap was measured and value identity was reported.*
- Every count carries its **scope** — what was scanned and what was excluded.
- Capture exit codes **directly**. `cmd | tail` reports the pipe's status; this reported three red
  gates as green in one session.
- `grep -- "x" DIR --include=…` filters nothing: `--` ends option parsing.
- CSS attribute selectors here use **single quotes**; `:not([data-theme="dark"])` contains the string
  `data-theme="dark"` and is a **light** selector.
- Interpolated names are invisible to text scans, so read counts are **floors**.
- A gate must assert a **floor on its own corpus**; a gate that scans nothing passes everything.
- Attribute a shared-tree failure by **re-running in a clean worktree**, never by reading the diff.
- A subagent's plain text is **invisible** to the coordinator — only `SendMessage` arrives.

---

## 4. STATE

<!-- lane-control:program-state v1 — DO NOT EDIT BY HAND. Rewrite it with:
     node packages/core/src/tooling/lane-control/program-state/index.mjs --write --intent <intent.json>
     head=c0bd3ca6a written=2026-08-10T23:47:31.317Z intent=3ddff5c387244f46 render=faecf1eff1095f5d -->

*Everything in this section is intent. Anything derivable is derived by command, not typed here.*

**Current wave:** 0 — unblock. **`hooks:check` is green; lane A's change is with the auditors and is NOT committed.**

**Blocked on:** The two-auditor verdict on lane A. Nothing downstream of the hooks manifest may open until Fable and Kimi have both ruled.

**Day-one lanes.** No family CSS lane opens until lane A's change is ratified and committed:

| Lane | Work | Model | Reason for the model |
|---|---|---|---|
| A | Adjudicated the unadjudicated DS reads; regenerated the hooks manifest. **Done, in audit, uncommitted.** Now read-only, scoping the DB tint-ramp defect it found | opus | Adjudication decides what a published surface means; expensive to get wrong and impossible to pre-pass. |
| B | Collapse the two-route registry read; regenerate the canon; re-derive the drifted ledger headers. **Held deliberately** — it regenerates the canon against the manifest lane A just changed | opus | Two routes disagreeing is a contract question, not a substitution. |
| C | The resolution instrument — the long pole. Opens once lane A is committed | opus ×2 | The instrument is what every later wave's evidence depends on; a defect here is invisible and inherited by everything. |
| D | Delivered the base-layer adjudication and the self-conflict census. Now producing the hard-fork list, per pair **per vertical** | opus | Fork classification changes between verticals, so a single-bundle answer is not adjudicable; this is judgement, not a sweep. |
| E | **Delivered.** writeSet intersection, containment, work-order validator, state-file writer. Not registered in the CI manifest — that is a coordinator decision | sonnet | Greenfield tooling in its own folder, touching no family and no existing file, so the blast radius is bounded by construction. |

**Refused until lane A is ratified and committed:** any family CSS lane · the base-layer rulings already taken — the dead spacing aliases, 14px canonical, the density hook, the dead-declaration sweep · wave 9 design, until its false new-axis premise is re-scoped against the existing weight and focus-ring token sets · two lanes on `themes/default.css` at once (single ownership, always)

`writeRoot` is enforced by `write-set-intersection`; a batch is admissible only when it passes. Disjointness is no longer prose.

Territory, not files: two lanes may share zero files today and still collide by shape. Overlap is decided symbolically, with a witness or a proof none exists.

Exit vocabulary is 0 clean · 1 violation · 2 could not run. Conflating 1 and 2 is how a broken invocation reads as a clean lane.

Any future lane under `src/` must use folder/index with layer-named owners; `structure:check` reads `.mjs` and is decrease-only.

A lane that cannot complete its model reason is missing its pre-pass and must not be delegated (§1.2).

### Derived at write time

*Produced by the command that wrote this section. Never typed, never edited.*

| Fact | Value | Derivation |
|---|---|---|
| `head.short` | c0bd3ca6a | git rev-parse --short HEAD |
| `head.committedAt` | 2026-08-10T19:34:02-04:00 | git log -1 --format=%cI |
| `tree.dirty` | yes | git status --porcelain |
| `ledger.families` | 252 | family-ledger.json rows.length |
| `ledger.syntheticRows` | 4 | synthetic-rows.json rows.length |
| `ledger.sharedSkinFiles` | 35 | re-derived from rows[].skinFiles: files claimed by more than one family |
| `ledger.driftClean` | yes | derived sharedSkinFiles vs the recorded map |
| `singleOwner.entries` | 39 | seeded single-owner regions + files derived as multi-owner from the ledger |
| `universe.files` | 6095 | git ls-files --cached --others --exclude-standard |
| `plan.lanes` | 6 | packages/core/src/tooling/lane-control/composition/plan/examples/plan.example.json lanes.length |
| `plan.coveredFiles` | 129 | packages/core/src/tooling/lane-control/composition/plan/examples/plan.example.json — files resolved by every lane's writeSet |


## 5. DECISIONS TAKEN

| # | Decision | Ruling |
|---|---|---|
| 1 | Unadjudicated DS reads | **Option A** — promote to tenant channels |
| 2 | Border authority | **`--ds-color-border*`** survives |
| 3 | Codex substitution | Authorised to amend the programme pack |
| 4 | Rottay default posture | Dark — **already satisfied**, the brand theme is dark by default |
| 5 | Graded scales | Yes, with today's named stops as presets |
| 6 | Raw token overrides | Demoted to internal |
| 7 | Shadow and the elevation ramp | **Components migrate to the ramp as it stands.** A deliberate visual-change wave: sighted capture review required, a green gate is not evidence |
| 8 | Tier split | **9 free / 7 premium**, by the rule *visible in a still frame is free; only felt in use is premium* |
| 9 | Control set | **Closed at 16** |
| 10 | Motion | Included, premium — `motion.energy` and `motion.character` |
| ~~11~~ | ~~Stored-document migration~~ | **RETIRED** — no application is in production, so there are no live tenant documents to migrate |
| ~~12~~ | ~~Breaking window~~ | **RETIRED** — compatibility is not a constraint; everything may break |

| 13 | Body text size | **14px canonical.** Move to `default.css`, delete the three artifact overrides via their BrandTheme sources, regenerate. Zero visible change — all three verticals already render 14px |
| 14 | `--ds-density-spacing-*` hook | **Add it to the winning `:root` declarations.** No-op until written; it is the only genuinely severed channel in that family |
| 15 | The 49 dead `:root` declarations | **One sweep, gated by a byte-level computed-value diff**, not eyeballed. `themes/default.css` becomes the sole `:root` authority. The two behavioural ones are reviewed separately first. **The gate keys on (file, canonical selector, prop)** — not on cross-file pairs — which covers within-file self-conflicts by construction. Add `--ds-divider-text-color` `default.css:1074`, a misfiled stray that no cross-file sweep would have caught |

| 16 | The hard forks | **Drift unless proven otherwise.** One name survives, the value unifies to the vertical that paints it, and any deliberate divergence is declared as a written exception per row. Turns 38 decisions into a sweep plus a short exception list |
| 17 | `--ds-border-color` ~ `--ds-color-border` (625 reads, the largest in the corpus) | **`--ds-color-border` survives; platform's value is preserved** by rewriting its declaration onto the survivor in the same commit. Zero visible change in all three verticals |

### The survivor rule — non-negotiable for every fork

Tenant paint is **unlayered and outranks every layer**, so a tenant override reaches readers only
through the exact name it declares. **The survivor is the name tenant paint overrides, never the name
with more reads** — that inverts the obvious choice in several rows. And the losing name's tenant
declarations must be **rewritten onto the survivor in the same commit**: deleting the loser and
repointing readers is not value-preserving in the 38 groups carrying tenant paint.

Classification is **per-vertical AND per-theme**. A pair can be an alias in light and a fork in dark;
three groups fork in exactly one of six cells, which is precisely what a single-bundle or light-only
audit waves through.

**39 permutation groups are declared-vs-read-only.** One side has no value, so they are not fork
candidates — they are class-5 fallback-activation hazards and are routed to that drain, never to the
merge wave.

### Lane D corrected the premise — record for anyone resuming

`base/spacing.css` (`:root`) and `base/density.css` (`:where(…:not(:root))`) **never compete**;
`:not(:root)` makes overlap impossible. The real winner is `themes/default.css`, imported later in the
same layer. **`density.css` agrees with the winner; the dead scale is `base/spacing.css`**, and the
conflict is 5 names, not the family. The density dial **is** reaching spacing (bithire 0.9, evnto
1.125, rottay 1 — BitHire's `--ds-spacing-md` computes 14.4px). It is not severed like radius.

Free action, no decision needed: delete the 5 dead alias declarations in `base/spacing.css`. They lose
today and their `/* 12px */` comments are what produced the false premise.

New defect class found: **a within-file self-conflict** — `--ds-divider-text-color` declared twice at
`:root` inside `themes/default.css`, different values, later wins. Nobody had looked for that shape.

### Still open

| # | Decision | Blocked by |
|---|---|---|
| c | The hard forks — per pair, **per vertical** | needs the list |
| d | Vertical identity authority — one slug/verticalKey owner instead of five sites | proposal pending |
| e | `--ds-type-code-font-variant-numeric` `tabular-nums` → `normal`, and numeric weight 600 → 500 — probable accidents of a re-alias sweep, not decisions | sighted check before the §15 sweep |
| f | Hardcoded hexes at `:root` in the theme layer (`#e5e5e5`, `#737373`) — they cannot follow a tenant palette | with the §15 sweep |

---

## 6. WHAT R0–R7 BECAME

Not obsolete — **absorbed**. One inventory, one status authority.

| Round | Disposition |
|---|---|
| R0 | Sealed and valid; the instrumentation stands |
| R1 | **NO-GO still standing**; its canaries become verification for the new programme |
| R2–R4 | **Executed, unsealed** — families touched, none reviewed. Their unfinished content *is* the plumbing work |
| R5 | Was "canon closure" — **is the manifest programme**, much larger than planned |
| R6 | Codex certification — **replaced by the Fable ↔ Kimi loop (§1.1)** |
| R7 | Customization depth — **is the sixteen-control set** |

The R-rounds measured from the **family** side; this programme measures from the **tenant** side. Both
are needed, and the R-rounds can pass while two tenants still read as one product — which is what
happened.
