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
`scripts/channel-wiring-zero-delta-gate.mjs --baseline <pinned>` — static, needs no `dist`. Plus
selector-multiset equality on the diff, and a static per-vertical resolution check for any
substitution.

> **The baseline is HEAD at the moment YOUR lane starts, on a clean tree.** Capture the sha before
> your first edit. A fixed older commit measures accumulated prior-wave work, so the gate reports
> files the lane never touched and **every lane inherits a red it cannot clear** — which is what
> happened while a stale pin was the standing instruction.

The gate certifies **deletions** positionally — was this declaration already losing, and does it
still lose — and never by comparing values, because comparing values fails a file for an edit two
files away. It no longer passes a silent retune: a wave that deliberately changes a value now goes
red and must say so.

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
     head=7f1735923 written=2026-08-11T00:00:59.142Z intent=5477bd8baa12f764 render=5a716dbf91e54cdd -->

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

*These figures change only when somebody changes what this section is about, so a
disagreement between them and the repository is a real finding. Facts that move with
ordinary work — HEAD, the file count, what the lanes have written — are deliberately
absent: pinning them here would make this document stale the moment it was committed.*

| Fact | Value | Derivation |
|---|---|---|
| `ledger.families` | 252 | family-ledger.json rows.length |
| `ledger.syntheticRows` | 4 | synthetic-rows.json rows.length |
| `ledger.sharedSkinFiles` | 35 | re-derived from rows[].skinFiles: files claimed by more than one family |
| `ledger.driftClean` | yes | derived sharedSkinFiles vs the recorded map |
| `singleOwner.entries` | 39 | seeded single-owner regions + files derived as multi-owner from the ledger |
| `plan.lanes` | 6 | packages/core/src/tooling/lane-control/composition/plan/examples/plan.example.json lanes.length |


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

### A sixth unsafe class: the alias that bridges engines

An alias whose only purpose is to carry a value **into a read-only engine**. The compiler emits one
spelling; a vertical's extension declares the other as `var(first)` so tenant paint reaches Rustic.
Retiring it cannot repoint the readers — Rustic is read-only by standing fence — so it **activates
the hardcoded fallbacks** and strips that vertical's paint from the read-only engine.

> **The pure-alias shape is precisely what makes it look safe.** Class 5 inverted: instead of
> declaring a name and flipping fallbacks on, this deletes a name and flips fallbacks on.

Before retiring any alias, check whether a read-only engine reads the losing spelling.

### Two instruments agreeing is not evidence when they share a technique

Two blocking gates were treated as corroborating each other. **They import the same module** — one
gate's manifest builder imports the other's parser outright. Their agreement carried **literally zero**
independent information, not merely low information.

> **Concurring instruments must be shown not to share a derivation module before their agreement
> counts as anything.**

Known shared-derivation pairs, and their agreement must not be cited as confirmation:

| pair | shares |
|---|---|
| theme-channel-parity + app-ds-hook-contract | the typed-graph parser — **this is the one that cost us** |
| engine-token-audit + gat-07-exact-proof | **three** libraries — paint counter, zero-lock policy, token governance |
| engine-token-audit + literal-ownership-gate | corpus selection — a file the shared module fails to enumerate is invisible to both |

*(A writer and its checker sharing a hash module is not this defect — that is one mechanism, not two
confirmations.)*

**The genuinely independent check for this class reads the EXECUTED emitter output, not the parsed
declaration.** Run the compiler, read the variable map it returns, compare against what the graph
claims. That corpus already exists: the generated artifacts *are* executed output, and a check
diffing "names in the artifacts" against "names the graph resolves" would have caught this on day
one while sharing no code with either gate.

It is the same move the resolution probe made for CSS — **stop parsing the source, run the thing and
read the result** — arrived at independently by three lanes wanting certainty.

*This is why the auditor law (§1.1) pairs a diff reader with a repository reader rather than two of
either: the value is in the difference of technique, not in the second opinion.*

### Simulate; do not filter by proxy

A rule that predicts whether a change is safe is a **proxy**. Where the change can be *simulated* and
the corpus re-resolved, the simulation is the measurement and the proxy is lossy — in both directions.

Observed: "move a channel between tiers only when both themes agree" correctly blocks a light-only
declaration becoming unconditional, and **wrongly blocks 96 provably-safe channels** whose themes
differ only because a higher-specificity mode block wins regardless of where the unconditional
declaration sits. The proxy over-blocked by a factor of six.

**Move the declaration, re-resolve everything, compare.** Reason about the result, not about the rule.

### Comparing a generated artifact against a committed one measures regeneration debt

The committed artifacts go stale the moment any compiler changes. A lane that resolves its freshly
generated output against the committed file is measuring the backlog, not its own change — one lane
saw ~200 phantom deltas that way. **Generate both sides with the same compiler**, baseline from a
clean worktree.

### An eighth unsafe class: a rename can silently disable the guard that watches it

A guard that reconciles two emitters of one channel identifies them **by name**. Change the name one
emitter writes — even for a correct reason — and the guard stops seeing the pair. It does not fail; it
**stops covering that channel**, silently, while continuing to report green on everything else.

Observed: a repair moved one emitter from `--ds-radius-md` to `--ds-radius-md-base` while a second
emitter kept writing the flat name from the same authored value. The two landed in the same block, the
unlayered flat beat the layered calc so the repair was defeated outright — and because the names no
longer matched, the single-emitter guard's coverage of that channel lapsed without a single red.

**After any rename, re-check every guard that keys on the old name.** A guard's silence is not
evidence that its subject is still in scope.

### The probe cannot see the non-bundled tenant path

The resolution probe measures the three bundled verticals. The provider's brand-chrome path runs
**only for tenants that are not bundled**, so the instrument is blind exactly where white-label
tenants live. Any claim about that path needs a different proof.

### A seventh unsafe class: tier relocation changes SCOPE

> **Expressibility is a property of the contract. Movability is a property of the contract AND the
> block the old declaration lived in.**

The authoring tiers do not share a scope: a `BrandTheme` base body emits into the **unconditional**
tenant block, `modes.<mode>` into that mode's block, and a hand extension into whatever block it was
written in — and extension blocks are usually theme-scoped. Tenant paint is unlayered, so an
unconditional declaration outranks the theme layer **in both themes**.

So a move that is **value-identical by construction is still a repaint** wherever the two tiers'
scopes differ. Measured: of the channels in the three extensions, **evnto has exactly ONE that is
scope-safe**; platform has three, and 559 of its 645 are theme-split pairs.

**And it interacts with the leak.** Moving a light-authored extension value into the unconditional
contract block manufactures another light-value-winning-a-dark-cell — in the two verticals where that
defect was already measured at 151 and 112. A drain scoped on expressibility alone would **deepen the
leak rather than drain debt**.

Before moving any channel between tiers, establish what the other theme does with it: differs,
undefined, or agrees. Only *agrees* is movable. "Undefined in the other theme" is class 5 run
backwards — the move defines a name that today falls to its fallback arm.

### Tenant-paintable is NOT "declared in an artifact"

A name the **chrome compiler can write** is tenant-paintable even when no first-party theme populates
it. A census built from what the three artifacts declare therefore misses part of the tenant surface,
and a survivor chosen against that census can sever a DB tenant's paint. This shipped as a wrong
survivor once and was caught by the lane's own residual sweep before reporting.

**Check every candidate against the emitter set and the override allowlist, not against the
artifacts.**

### The zero-delta gate cannot express a permutation merge

It has two models: collapse an added channel to its fallback arm, and delete a declaration that
already loses. **A merge is neither** — it deletes a declaration that WINS while moving that
declaration's readers to a different name resolving to the same value. Each half is non-inert alone;
only the pair preserves value, and the gate cannot see the pairing. It reports the deletion as live
and the repoint as an unrestored collapse.

Until it grows a `--merge <loser>=<survivor>` pairing, merge lanes prove value-preservation by
**full-corpus resolution across all six cells** — surviving names unchanged, none newly declared,
removals exactly the retired set × 6.

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

### An aesthetic question escalated to the owner is a mis-framed architecture question

Owner ruling, 2026-08-10, after four decisions were wrongly put to him as choices of colour and
typeface. He does not pick values. A value is either the **tenant's** (it belongs in a channel) or
**ours** (it is an architecture decision, decided here and audited by Fable and Kimi).

The tell: if a question can be phrased "which colour / which font / which size", it has been framed
wrongly. Re-read it as **"should a literal exist where a tenant channel belongs?"** and the answer
under §1.4 is always no. Rows c–f above are all this shape.

Corollary: idling for an answer is itself the defect. An hourly heartbeat now re-enters the programme
if a lane has stalled waiting on a decision that was never the owner's to make.

### D2 IS WITHDRAWN — the theme layer is the tenant-free baseline, not dead code

The execution lane refuted the whole ruling, and the refutation is structural.

`foundation/themes/default.css` declares on bare `:root`, which paints unconditionally. The three
tenant artifacts apply only under `:is(html[data-tenant='X'], :where([data-ds-root][data-vertical='X']))`.
`facade/entrypoints/base.css` is the **tenant-free** bundle — its own header says so ("compiled tenant
paint is intentionally unlayered and omitted here") — and it imports `default.css` with no tenant
scoping. So on any consumer without the tenant attribute, those 62 rows are not the losing layer:
**they are the only layer.** Deleting them strips typography from every untenanted surface.

The zero-delta gate reported all 62 as "WON in base.css/styles.css before this change." It was right
and both prior reviewers were wrong.

**Why two reviewers missed it, which matters more than the ruling.** An adversarial auditor simulated
the deletion in Chromium across six cells and measured zero change; I accepted that as proof. Every one
of those six cells is **tenanted**. The simulation was structurally incapable of observing the only
consumer that depended on the rows. This is §3's law arriving from the other side — two instruments
agreeing is not evidence when they share a technique, and *my ruling and its audit shared the technique*.
The gate refuted us because it reasons positionally about which declaration wins **per bundle**,
including the tenant-free one.

Standing correction: a claim of the form "layer L is dead" must enumerate **which bundles** were
measured. Four scope holes are now known on this question — the DB/appearance path, the non-bundled
tenant path, the read-only engines, and the tenant-free bundle. A deletion is legal only when all four
are covered or explicitly excluded in writing.

What survives: the theme layer's relationship to the artifacts is not duplication, it is default versus
override, and that is correct architecture. The residual real question is different and stays open [O]:
whether the untenanted default should deliberately be its own neutral identity rather than drifting
toward whichever vertical was edited last.

### A selector census must be PARSED, never grepped

I reported that `form-header.css` and `edit-header.css` each claimed both scope classes, and called it
a duplication finding. A family lane refuted it with postcss:

```
form-header.css   selectors touching .ds-edit-header : 0     raw string hits : 1  (a comment)
edit-header.css   selectors compounding both classes : 0     raw string hits : 14 (13 real + 1 comment)
```

My instrument was `grep -oE '\.ds-[a-z0-9-]+'`, which counted the lane's own file-header prose. And the
13 real cross-scope selectors were not duplication but its opposite — comma-grouped **pairs** sharing
one declaration block, written once and consumed by both families.

Two distinct errors, worth separating: a comment produced a phantom, and grouped selectors were read
as compounded ones. Only a parser distinguishes `A, B { }` from `A.B { }`, and that distinction is the
whole question. Related, from §3: two instruments agreeing is not evidence when they share a technique.
The inverse bit here — one instrument, of the wrong kind, and no second reading to contradict it.

Corrected numbers from the same pass: the tier has **25** real families (I had said 28, counting
`tests/`, `contracts/` and `styles/` directories as families). The `.ds-structure` count of 18 files
survives re-verification with all `/* */` blocks stripped.

The real defect underneath, which the false one hid: shared paint for two families lives in a file
**named after one of them**, so an agent editing "the edit header skin" silently repaints the form
header. Extraction to a neutral third file is queued — a relocation, not a merge.

### Structures do not get engine splits — decided 2026-08-10

A family lane asked for the `engine-token-audit` baseline to be cleared so it could split its two
families into `contracts/` + `runtime/rendering/` + three `engines/*/index.tsx`. **Refused.**

In this tier three engine files delegating to one implementation contributes **zero divergence**, and
`CLAUDE.md` forbids creating fake forwarding engines when one is absent. The four that already exist
(`stats-header`, `mobile-header`, `bottom-tab-bar`, `action-dock`) are a pre-existing violation, not a
precedent. Divergence here arrives through channels and the skin. Binding for every structure lane.

Worth noting how the gate behaved: the split would have deleted 3 baselined `fleet.*` counters and
added ~30 new ones, and `--update-baseline` cannot repair either shape (it only tightens existing
counters). The gate was right to block; the work was in the wrong place.

### A tenant-only channel with no fallback kills its whole shorthand off-tenant

Found by a family lane, independently confirmed. `--ds-motion-calm` is declared in `foundation/`
exactly once — `animations/transitions.css:396`, as the reduced-motion `0s !important` — and otherwise
only by the three artifacts. `form-header.css` wrote `animation: ds-header-enter var(--ds-motion-calm) …`
with **no fallback**, so on any untenanted page (showroom, default theme) the undeclared var made the
entire `animation` shorthand invalid at computed-value time and the entrance simply did not run, while
its byte-identical twin animated.

This is the inverse face of the fallback-inert law, and both must be checked: a fallback never fires
when the name IS declared in scope; and a **missing** fallback takes the whole shorthand down when the
name is declared only in the tenant tier. Auditing one direction proves nothing about the other.

### Wrong tree is not untidiness — it is permanently inert CSS

Same lane, and a sharper statement of the census error recorded above. A structure skin authored under
`runtime/engines/modern/skin/` would be scoped `.ds-engine-modern`, a class **no structure stamps**, so
it would never match anything. Not a misfiled file: a file that cannot paint. It would also have forced
edits to the two shared `facade/entrypoints/*.css` (`skins.unwired` is exact-0, both entrypoints
required), dragging a reserved shared file into five concurrent lanes.

### A ruling that names a channel must be diffed against the decision table first

Fable's fifth finding, adopted as law. D2 below and standing Decision 13 commanded **opposite**
treatments of the same declaration — `themes/default.css:534` — four rows apart in the same document.
Separately, the `#161619` escalated to the owner as an aesthetic choice turned out to be the DS's own
dark fallback (`themes/default.css:227`) leaking into evnto's light theme.

Neither was caught by any gate, because no gate compares a NEW ruling against the STANDING ones. The
fix is cheap and mandatory: **before adopting any ruling that names a channel, grep the decision table
for that channel.** A ruling that contradicts a standing decision is not a ruling; it is a conflict
that must be resolved explicitly, with one of the two withdrawn in writing.

### The four rulings, as corrected by adversarial audit

Recorded in corrected form. Fable's verdicts are [M] where it ran the measurement; Kimi's independent
read is still outstanding, and the two are **brokered, never merged** — a disagreement is itself the
finding.

| | Corrected ruling |
|---|---|
| **D1** evnto border slots | Direction CONFIRMED, execution wrong on four counts. `#161619` is not a proposal — it is `themes/default.css:227`, the DS dark fallback evnto paints **today**: measured, evnto/light renders `rgb(22,22,25)` hairlines on `rgb(255,255,255)`. Authoring it would freeze a live defect into the tenant tier. But "the formula the other two verticals use" was FALSE: bithire and platform author literals too, and bithire's cells are hand-picked (hue moved 7.7° and 37.5°), so a derivation would not reproduce them. The derivation `deriveBorderSubtle` (mix of border and **ground**, not ink/surface, 1/3) is reached only by the DB path. My conditional — "if it lands near-black, evnto's pair is wrong" — cannot fire: derived from evnto's own light border the slot lands ≈`#F1F2F2`, a proper hairline. Evnto's pair is fine; the **seed** is missing. Blockers to budget: evnto's light palette declares no border seed in the contract, `deriveBorderSubtle` refuses non-hex seeds, and static emission was deliberately withheld under EXTENSION-CANNOT-BEAT-TENANT. Expressible today with no new contract field via `borderSubtleColor` as a `var()`-based `color-mix` string. **Reads are 348 across the five, not 305; 305 is border-subtle alone.** |
| **D2** delete the theme typography rows | REFUTED AS STATED, by exactly one — the worst one. Deletion simulated and measured in all six cells: 62 of 63 change nothing (all three artifacts declare them in the unconditional base block, which outranks the layered theme). The 63rd, `--ds-type-body-font-size`, has its **only** declaration in the repo at `themes/default.css:534`, carrying the type-scale dial; deleting it collapses the composed shorthand and moves painted body text **13.125px → 15px in all six cells**. Standing Decision 13 deliberately made that row the sole authority. Corrected ruling: **delete 62**, and either keep the body row or first restore a tenant-reachable builder emission and delete within the same wave. Unresolved scope hole [O]: the DB/appearance compiler emits no `--ds-type-*` role channels, so wherever DB-compiled CSS is the only tenant layer all 63 rows are live — and the probe is blind to that path, so "dead on every tenanted page" was claimed from an instrument that cannot see it. The "19 disagreeing rows" does not reproduce (26/27/26 by declaration); immaterial to deletion legality but the number is [U]. |
| **D3** collapse the 38 forks | REFUTED AS A SWEEP; sound only per pair. The corpus never pinned 38 or 6 — the spec says 32–41 of 95–100 groups, and Fable's own census finds 18 dual-declared groups. Four carve-outs are mandatory: (i) `--ds-color-border-focus` ~ `--ds-border-color-focus` is a **live two-concept distinction** — rottay paints them at different strengths in both themes and the loser feeds the composed 2px focus shorthand; collapse destroys tenant freedom, which is the opposite of the goal; (ii) Decision 17's "zero visible change in all three verticals" is **FALSE at HEAD** — `--ds-color-border` ~ `--ds-border-color` fork in rottay dark (`#1C1C20` vs `#2A2A2F`) and the loser has two real painted readers; (iii) pairs whose only reader is the read-only `rustic` engine cannot be collapsed without severing that engine's sole channel, and keeping an alias violates §1.3 — carve out or lift the fence, explicitly; (iv) zero-reader pairs belong in the class-5 drain, never the merge wave. Where collapse IS right: mode-split pairs, one concept whose theme halves wear different spellings, proven per-scope. |
| **D4** palette relocation | CONFIRMED structurally — 1,057 root declarations, all eight per-component counts, the layer ranks, and the 17-flip set all reproduce independently, and pair-moves neutralise all 17. Two corrections. First, **"sole authority for the 37/63/77% ramp" garbles its own source**: those are per-vertical sole-authority **fractions** of the 1,057 (platform 391, bithire 666, evnto 811), not ramp steps. Stated as "the ramp" it invites a future lane to delete everything "non-ramp" — the deletion bar actually protects up to 811 winning declarations in evnto. Second, the ruling silently added an unmeasured operation: 6.0-pal measured a value-preserving **relocation**; "relocate to formulas" is relocation **plus** a literal→formula rewrite of 547 values, whose per-cell identity was never measured. Each formula needs its own six-cell proof or an explicit visible-change declaration. Still unchosen [O]: pair-move versus the `expectedLayer()` gate amendment — different blast radii. |

| | Ruling |
|---|---|
| **D1** evnto's 5 silent border slots | Never author a literal. **Derive** the slot from the tenant's own ink/surface relationship, using the formula the other two verticals already use. If the derived value lands near-black on white, evnto's ink/surface pair is itself wrong — that is the fix, not a hand-picked hex. |
| **D2** 19 typography rows, builder vs theme | **One authority.** The builder wins; it is the layer the tenant reaches. The 63 dead theme channels are deleted, not retuned. Deletion is only legal if the theme layer loses in EVERY scope — Fable and Kimi are both attacking exactly that. |
| **D3** the 38 hard forks | Collapse to the surviving name; where both are tenant-painted (6), the tenant channel survives. Guarded by the survivor rule above. **Refutable**: collapsing two names a tenant moves independently REMOVES a degree of freedom, which is the opposite of the goal. |
| **D4** the DS default palette | It stays (sole authority for the 37/63/77% ramp) but **stops being a paint authority**. The 547 component channels relocate to formulas over tenant-reachable names, leaving the palette as pure ramp mathematics. Constrained by §2 clause 7 — relocation changes scope, and 17 channels were previously measured to flip. |

### A tier has more than one skin tree, and searching one of them is not a census

Measured 2026-08-10, and **the first version of this section was wrong** — recorded here because the
error is the lesson, not the finding.

What is true: the four structures that appear to have a modern engine — `stats-header`,
`mobile-header`, `bottom-tab-bar`, `action-dock` — are nine-line files doing
`export { default } from '../../runtime/rendering'`. `CLAUDE.md` forbids exactly this shape.

What I then concluded, and what was FALSE: "structures have no scope-class convention and no skin."
I had searched `runtime/engines/modern/skin/` (123 files, all `.ds-pattern-*`) and reported zero
coverage. The structures skin tree is a DIFFERENT directory —
`presentation/components/skin/`, **146 files**, every one imported by both entrypoints, **18 of them
scoped `.ds-structure`** plus a family class (`.ds-structure .ds-collection-header`). Every family I
had just dispatched a lane to "establish a convention for" already had a skin, some 400+ lines.

**The law: a tier's styling can live in more than one tree, so a census of one directory is not a
census of the tier.** The failure mode is specific and expensive — a false "nothing exists here"
licenses five lanes to CREATE what already exists, in the wrong tree, producing exactly the
second-paint-path defect this programme keeps finding. Two competing skins for one family is worse
than none.

Companion law, same shape: **a name matcher has a direction.** Matching family `collection` against
`collection.css` reported "no skin" while `collection-header.css` sat beside it. A false negative on
existence licenses duplication; a false positive merely blocks. Prefer a prefix match and read the
directory before concluding absence.

The real convention, verified: one engine-agnostic rendering, skin at
`presentation/components/skin/<family>.css` scoped `.ds-structure .ds-<family>`, already aggregated.
Divergence arrives through the skin and the channels, not through per-engine branches. The forwarder
files remain a (minor) `CLAUDE.md` violation; do not create more.

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
