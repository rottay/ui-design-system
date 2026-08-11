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
     node packages/core/src/tooling/lane-control/public/program-state/index.mjs --write --intent <intent.json>
     head=b41611ddd written=2026-08-11T03:25:57.104Z intent=333361e5241bc27d render=794b5da73a60464f -->

*Everything in this section is intent. Anything derivable is derived by command, not typed here.*

**Current wave:** 2 — vertical identity. Wave 0 unblocked and wave 1 landed and reconciled; lane A is ratified and committed, so the day-one refusal on family CSS lanes is LIFTED.

**Blocked on:** Nothing. The gating question is no longer permission, it is ordering: the identity wave changes painted pixels on purpose, so each lane owns exactly one vertical's brand theme and proves the other two did not move.

**Wave-2 lanes.** Family CSS lanes are open; brand-theme lanes are single-owner per vertical:

| Lane | Work | Model | Reason for the model |
|---|---|---|---|
| identity | Author a vertical's silent channels so it stops inheriting the DS default. One lane per vertical, never two — `platform` in flight, `evnto` queued behind the border lane, `bithire` last (it misses the fewest) | opus | Authoring a product's voice is judgement against a stated identity, not a substitution; a mechanical lane would copy a sibling and produce three identical products. |
| family | Elevate a structure family in place: its existing skin under `presentation/components/skin/`, its own folder, its own tests. No engine split — that shape is refused outright | opus | Every delivered family found a defect the brief did not predict, and three of them refuted the brief itself; a lane that cannot argue back is the wrong instrument here. |
| channel | Close a named runtime defect end to end — the radius dial's second emitter, evnto's silent border seeds. Owns compilers and one vertical's theme, never a family | opus | These sit where a compiler, an artifact and a skin disagree; the fix is only correct once all three are read together. |
| census | Read-only measurement against a pinned ref, parser only. Delivered the bare-`:root` denominator; now adjudicating which silent channels are product surface versus properly internal | sonnet | Bounded by construction — it edits nothing — and its correctness is a method question a parser settles, not a taste question. |
| audit | Adversarial refutation of a ruling before it is executed, and of a lane's evidence after. Fable and Kimi run it independently and are brokered, never merged | fable | An auditor that shares the author's technique cannot refute the author's blind spot; independence is the whole value. |

**Refused:** engine splits in the structures tier — three files delegating to one implementation add no divergence and `CLAUDE.md` forbids the shape · any new skin file under `runtime/engines/modern/skin/` for a structure — no structure stamps `ds-engine-modern`, so the file could never paint · two lanes inside one vertical's brand theme, or two inside `themes/default.css` (single ownership, always) · family-writer edits to `facade/entrypoints/*.css` — both must stay byte-synchronised, so the coordinator registers imports in one serialized pass · deleting a declaration until all four known scope holes are covered or excluded in writing — the DB/appearance path, the non-bundled tenant path, the read-only engines, and the tenant-free bundle · adopting a ruling that names a channel without first diffing it against the standing decision table

`writeRoot` is enforced by `write-set-intersection`; a batch is admissible only when it passes. Disjointness is no longer prose.

Territory, not files: two lanes may share zero files today and still collide by shape. Overlap is decided symbolically, with a witness or a proof none exists.

Exit vocabulary is 0 clean · 1 violation · 2 could not run. Conflating 1 and 2 is how a broken invocation reads as a clean lane.

Any future lane under `src/` must use folder/index with layer-named owners; `structure:check` reads `.mjs` and is decrease-only.

A lane that cannot complete its model reason is missing its pre-pass and must not be delegated (§1.2).

The identity wave is the first that changes painted pixels deliberately. Its bar is not zero-delta: every changed property must be one the lane intended, and any movement in a sibling vertical is a defect.

A census is only as wide as the bundle it read. State which bundles were measured, or the claim is unbounded.

Parse, never grep, for any claim about selectors, containers or declarations — and check both spellings of a property that has a shorthand and longhands.

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

### A fixture derived from CSS can measure a rule nothing renders

The probe's `button-modern-md` and `input-modern-md` fixtures matched `.ds-btn` / `.ds-input`, classes
no component emits. Replaced with the DOM the engines actually produce, obtained by **rendering** them
rather than reading it off the CSS. Comparing the two across 276 resting readings:

**Exactly 4 changed.** All BitHire, all `border-top-left-radius`, `9px → 10px`. Every colour, border,
shadow and font matched; platform and evnto matched entirely, because both chains resolve to
`--ds-radius-md` wherever a vertical authors no control geometry. **A lie with 98.6% cover** — and it
would have stayed hidden in any vertical that does not author control radii.

Stranger still: **the lie was printing the intended design.** The fake element read
`--ds-button-md-radius` directly — the channel the ramp was authored for — so the fixture showed 9px
while the component painted 10px. The instrument was accidentally displaying the design the engine had
stopped honouring.

**The doctrine is what licensed it.** The roster said a fixture's element shape "is DERIVED FROM THE
CSS". A selector states what an element must carry to be *matched*; it says nothing about whether any
component emits it. So a CSS-derived fixture can measure a rule that never paints and still look green.
Replaced: component fixtures take their shape from the component; synthetic fixtures standing for a
dial rather than a component are explicitly exempt. Second rule added: **pin selectors and the paint
statement, never a declaration's value** — otherwise a precedence ruling reads as a broken fixture.

Gap stated rather than hidden: the new fixtures are a pasted snapshot. `requiresSelectors` catches a
CSS-side rename; **nothing catches DOM-side drift**, so an engine changing its root anatomy makes the
fixture stale silently — a quieter version of the bug just fixed. Closure is a test that re-renders
both engines and compares against the fixture HTML [O].

### Two correct changes can be order-dependent, and only one order is safe

The precedence flip (family channel ahead of `--ds-radius-md`) was safe **only because** the dial fix
landed first. Flipping while the family channel was still a flat literal would have pinned BitHire's
controls at 9px at *every* dial position — trading a dead ramp for a dead dial, and the acceptance test
for either change alone would have passed.

Related, found in the same pass: `input.css` **contradicted itself.** Its root rule read
`--ds-radius-input` ahead of the ramp while its size rules read the ramp ahead — and the size rules
carry higher specificity, so they always won. A file can hold two mutually exclusive statements of its
own law and paint consistently, which is why Input and Button disagreed about a rule they both claimed.

Note also that the zero-delta gate went **red on purpose** here and must not be baselined away: it was
refusing to wave through a deliberate retune, printing exactly the flipped `var()` order and nothing
else, while the same gate at the pure baseline was green with `files=0`. That is §2 working.

### ⚠ NEVER run `build:vertical-css` without a full `pnpm build` first

`build-vertical-artifacts.mjs` imports the compiler from **`dist/`**, which lags `src/`. A
radius-scale wrap landed in source after the last build, so `lint:artifacts` reports bithire and
rottay stale and the regeneration would write the OLD form:

```
bithire:16  committed  calc(9px / 1.25 * var(--ds-radius-scale, 1))
            generated  9px
rottay:373  committed  calc(6px * var(--ds-radius-scale, 1))
            generated  6px
```

**Regenerating alone silently reverts the radius-dial lane's work.** Run the full build, or do not
regenerate. This is `artifact gates read dist, not src` arriving as a destructive operation rather than
a false reading — and it is why a lane that needed an after-arm artifact rendered it **in memory from
`src/`** and proved the harness with a null-arm control (byte-identical to the committed artifact on
unedited sources) before trusting a single number.

### Classic RE-BASES rem — a rem ladder is not engine-stable

A lane deferred two icon literals to the canonical ladder (`12px → --ds-icon-xs-size`,
`16px → --ds-icon-sm-size`), then caught itself: classic sets
`html[data-tenant] { font-size: var(--ds-font-size-base) }` and `--ds-font-size-base-base` is
**0.9375rem = 15px**. So `--ds-icon-xs-size` is 12px under modern and **11.25px under classic**. Both
reverted, because the skin in question is engine-agnostic.

Companion hazard in the same pass: **`--ds-spacing-*` is density-scaled and the verticals differ** —
bithire 0.9, evnto 1.125, platform 1. Mapping a `12px` literal to `--ds-spacing-3` yields 10.8px on one
vertical and 13.5px on another. Unsafe class 1.

Operative form: **"defer to the canonical ladder" is not free in an engine-agnostic skin.** Before
replacing a literal with a ladder token, ask what re-bases rem and what scales the ladder — and answer
per engine and per vertical, not once.

### `changedRows: 0` from the probe is a NEGATIVE CONTROL, not coverage

Volunteered by the lane whose earlier evidence it weakens, which is why it is trustworthy. The probe's
fixture roster is card / button / input / two skeleton dial controls / token readout. **No fixture
renders a detail header or a saved-views panel**, and the artifact contains no `saved-views`, no
`--ds-icon-*`, no `--ds-spacing-*`. So a `changedRows: 0` on such a lane proves its added **root** rules
caused no collateral movement — it says nothing about the component's own geometry.

The load-bearing proofs in both those lanes were the **static** ones: token identity against the
fallback arm, and the declared-nowhere census. Those stand. But **the instrument's silence is only
evidence within its roster**, and a roster of six fixtures is not the component library. Any lane
quoting `changedRows: 0` must state which fixtures could have moved.

### THE PRIMITIVES TIER, CENSUSED — one systemic cause, not seventy-six findings

Ranked by what a person would see, not by count:

| | exposure | live call sites |
|---|---|---|
| **Segmented** | 29 rules / 100 decls | 2 shipped switchers |
| **Button** | 7 / 47 | **127** across 38 files |
| **Badge** | 29 / 110 | 16 in 9 shipped patterns |
| **Tag** | 39 modern + 31 rustic | 4 — the only one losing under TWO engines |
| latent | Menu 83/300, List 72/132, Descriptions 40/129, Timeline 37/89 | **0** callers pass a part |

**Segmented is first and it is not the biggest count.** `view-mode-switcher` and `scope-switcher` both
render `<ModernSegmented data-part="switcher">`, severing all 29 rules — and `view-mode-switcher.css`'s
header states the composition law in writing and records that the family **deliberately retired its own
frame paint** on that basis. So it deleted its compensation in favour of a channel its own call site
severs. **The `search-command-bar` law running backwards**: that family was compensating for lost
primitive paint; this one removed its compensation and trusts paint that never arrives.

Consequence for a ruling I made: those are the two families whose headers say *"the correct read count
for this file is zero."* True — and true because the primitive should paint it. I left them alone for
the right reason and there is still a defect.

**Class 4 is ONE cause.** Rendered across 86 primitives: **classic stamps a `data-part` in 3**, modern
in 74, rustic in 64. So every `[data-part]`-keyed rule is inert under classic for 83 of 86. Reported
per-primitive it would have been 76 tickets and the single systemic fix would have been buried.

### One population, two names — three instances in one night

- **`Button` / `ModernButton`** — 69 call sites spell it one way, 58 import the modern engine directly.
  A census keyed on one spelling missed **a third of 127**.
- **`List` / `List.Item` / `List.Meta`** — a default-export-only walk reported 47 rules; the compounds
  are named-only exports with their own parts and their own skin rules. Real figure **72**.
- **Alias exports** — six rows of the same rendered element reached through different export names,
  correctly folded rather than reported as findings.

**A census keyed on a module's default export under-reports compound primitives**, and one keyed on a
single spelling under-reports everything.

### A mutation that breaks the parser proves nothing about the assertion

A mutation control came back 2/14 red and **the defect was the control's**: deleting from `[data-part=`
left a dangling selector prefix, so postcss threw `CssSyntaxError` instead of the assertion evaluating
false. Anchoring the mutation at the start of the selector line fixed it.

This is the false-signal class arriving **inside the instrument built to validate instruments** — the
one place nobody thinks to look. Alongside it, two more from the same tier: a part classifier returned
a **clean false zero on `Button`'s root** because the part is emitted inside an attribute object rather
than as a JSX attribute; and a render census passed `engine=` to a provider whose prop is
`defaultEngine`, **rendering the default engine three times and reading it as three engines agreeing**
— which is precisely the failure that produced the `Text` `fontSize` claim recorded below.

Companion, from the same round: **parsing beats the strict-substring / formatter-robust trade-off** —
it costs no detection (a re-indent holds, a changed fallback fails) and it is "parse, never grep"
applied to an assertion. And **a role rule has two sides**: asserting a skin declares a channel is half
a test until something asserts the DOM presents the hook the selector needs, with the negative case
(the disabled row must NOT match) as a control that fails on its own.

### THREE ENGINES ARE NOT THREE INSTRUMENTS — the retraction that cost the most

A lane reported, and I amplified as the largest finding of the programme, that `Text` drops an inline
`fontSize` whose value is a `var()` string in **all three engines** — and therefore that
`metrics-cards`' KPI hero had never painted at 28px on three shipped dashboards. **False.** I called it
shipped, dispatched a lane to adjudicate it, and told the owner the hierarchy was inverted in
production.

The probe that killed it removes the design system entirely:

```
document.createElement('span')
  style.fontSize = 'var(--x, 28px)'  →  ''      dropped
  style.fontSize = 'var(--x,28px)'   →  kept    same value, no space
  style.fontSize = '28px'            →  kept
```

**happy-dom 20.9.0 rejects any inline value containing a comma-SPACE inside a CSS function** —
`var()`, `clamp()`, `min()`, `max()`, `calc()` — on every property it validates (`font-size`, `width`,
`line-height`, `letter-spacing`, padding/margin/inset, height, colour). Properties it does **not**
validate — `font-family`, `min-width`, `gap` — accept everything. That asymmetry is why a `var()`
`fontFamily` survived beside a dropped `fontSize` **on the same element**, which is what made the
component look guilty. And **the rejection is not a reset**: it leaves the prior value, so a probe that
does not clear the style attribute first reads a stale one and concludes the opposite.

**The method failure, in the reporting lane's own words:** *"I had two instruments and they were the
same instrument."* The render said no font-size; the source reading was about a **different prop**
(`textStyle`, not `style`) and never predicted the drop. Agreement was read where none existed. And
**"all three engines" felt like triangulation when all three share one shim** — §3's law with a new
face, and the check that would have caught it in thirty seconds was to take the design system out of
the picture.

What survives, and it is real: of **373 sites** carrying that shape across 1,870 `.tsx` files, **10 are
in tests**. A test planting a value the shim drops asserts against something that never landed and may
be passing for the wrong reason. The 282 shipped sites render correctly in a browser; their only
consequence is that **they can never be asserted against in this environment**.

Standing rule: **before reporting a primitive defect, reproduce it on a bare `document.createElement`.**
If the DS-free element does it too, the defect is the environment.

**Confirmed independently, in a browser, with the line named.**
`happy-dom/lib/css/declaration/property-manager/CSSStyleDeclarationValueParser.js:10`:

```js
const CSS_VARIABLE_REGEXP = /^var\(\s*(--[^)\s]+)\)$/;   // [^)\s]+ forbids whitespace
```

so a fallback never matches, `getFontSize` falls through to `getMeasurement`, and the declaration is
**discarded rather than stored raw**. And "specific to `fontSize`" was also wrong: the split is
**whether the setter runs a typed parser at all**. Dropped: `fontSize`, `lineHeight`, `color`,
`background*`, `border*`, `padding`, `margin*`, `width`, `height`, `letterSpacing`, `borderRadius`,
`flexBasis`, `fontWeight`. Kept: `minWidth`, `maxWidth`, `gap`, `opacity`, `transform`, `boxShadow`,
`fontFamily`. `var(--a,9px)` **without the space** is kept; `calc(1rem * var(--a, 1))` is dropped — so
the trigger is a comma-space inside a function, which is the DS's own documented component-variable
idiom.

Four instruments: happy-dom + `react-dom/client` **drops**; `renderToStaticMarkup` keeps; jsdom 27
keeps; **Chromium computes 28px**. And all 740 shipping drops were triaged against Chromium — **444
distinct property/value pairs, 444 accepted, 0 refused.** There is no real dead paint in this class.

**The finding that survives is an instrument blind spot with a direction.** Every gate or test that
renders client-side under happy-dom and reads back inline paint **under-reports** it, and the miss
reads as *"this channel never painted"* — which is exactly how this was filed. **740 shipping
declarations are invisible to that class of instrument**, so any inline-paint census written that way
needs a `boxShadow`/`minWidth` control or it is silently measuring a subset.

That lane's own census was corrected twice by its controls: it first read `getAttribute('style')`,
which never enters the CSS parser, and then inflated to 2,551 because happy-dom's style object accepts
an unknown key as a plain JS property, so one probe seeded the next. **798** is the corrected number.

Two cheap workarounds for a lane that must assert on these: read the SSR string, or author
`var(--a,9px)` without the space.

### THE SIGHTED PASS — what it must answer, and why no counter can

Not a nice-to-have. After the runtime census it is **the only instrument left that can answer the
programme's own question**, and it carries four items that measurement has already sized and cannot
settle.

**Why it became load-bearing.** Bithire and rottay diverge on **1,984 and 1,876 channels — 6% apart**
— and one reads as a product while the other reads as the design system. So whatever makes BitHire a
product is **not channel count**, and no counter anyone here can build will find it. Authoring another
wave of channels cannot close a gap that channel count does not explain.

**Four questions, each earned by measurement:**

1. **Does the untenanted light surface look right?** 301 channels changed on a surface nobody has ever
   looked at. Values verified, appearance not — stated as a limit by the lane that changed them.
2. **Is `#f5f5f5` on `#fafafa` a boundary?** A 5/255 delta. And if not, does the ramp want a **rung
   between 100 and 200** rather than a reassignment — since both verticals with an opinion land
   *between* those rungs (`#EDEDEC`, `≈#F2F2F2`), and `0.08em` falls between `wider` and `widest` as an
   independent second case that the ramps have gaps.
3. **The Button repair**, specified and deliberately unshipped because jsdom cannot adjudicate cascade.
   Gate: variants × sizes × shapes × disabled × focus-visible, on all three verticals.
4. **BitHire's blue `successColor`** collapsing success into info in dark, and its dark shadows being
   *shallower* than its light ones (0.06–0.12 against 0.08–0.42). Both pre-existing, both now visible
   in more places, neither a rule violation — so only eyes decide.

**Execution constraints, all learned the hard way:** pixels require the **production** showroom (dev
paints non-deterministically); kill any stale 7001 by hand first, because `reuseExistingServer` will
silently attach and poison the captures and `pnpm next:free` does not free that port; and the machine
budget is one heavy build, one server, one chromium — so this cannot overlap a fix lane running suites.

### DEGRADED, NOT UNSTYLED — why the Button defect survived every review

Adjudicated, repair specified, **execution deliberately deferred**. `button.css` keys 7 selectors on
`[data-part='trigger']` and modern lets the caller's part win, so **73 call sites lose them** — 0 of
them dynamic, so the census is the answer and the fix is fully static.

The blast radius is why nobody saw it:

```
22 properties SURVIVE from class-only rules   size, shape, colour, padding,
                                              border, shadow, gap, transition
18 are LOST at all 73 sites                   justify-content (the sighted one),
                                              font-family/weight/letter-spacing,
                                              text-align/transform, appearance,
                                              position, isolation, overflow,
                                              forced-color-adjust
```

A button still has its size, shape, colour and padding. It still looks like a button. What it loses is
content centering, its typography (falling back to UA/inherited), `appearance` — so **native browser
button styling can leak back** — and `forced-color-adjust`, which drops **73 buttons out of the
forced-colors contract**.

**A defect that leaves the thing recognisable is exactly the one that survives every review.** Third
instance tonight: a partial hover regression that looked fine because the border still warmed, a
fixture wrong in 4 of 276 readings, and this.

**The deferral is upheld and is the point.** The repair is the same single-token change made to Input,
and the lane refused to ship it because it drops specificity (0,3,0)→(0,2,0) and **jsdom cannot
adjudicate cascade** — its static scan found no competing rule, but that is a mechanism argument, and
§ *an outcome test survives a false premise, a mechanism argument does not* applies to it directly. It
goes to the browser pass with the gate the lane specified: variants × sizes × shapes × disabled ×
focus-visible.

**Two of the 73 were introduced this session by the lane that adjudicated it**, stamping parts for skin
targeting exactly as instructed. Not a mistake to apologise for — the strongest available evidence that
the mechanism is **invisible at the point of use**, since it caught someone who had spent hours inside
it.

### THE BASE-LAYER BACKLOG: one mechanism, 270 live rows, two waves

Supersedes the 189 and the 26 — both were measured on a pre-rewire tree with a looser rule, and
re-derived they are **one population of 141 base-involved rows / 245 cells**. Sixth instance of the
collapse law, found by the lane on its own numbers.

**The mechanism is single:** the base tier declares light-mode literals **unconditionally**, and
**135 of 141 base-involved rows have no light/dark split in their declaring file at all.** An
unconditional light literal is wrong in dark; an unconditional dark literal is wrong in light. The two
populations that looked like separate backlogs are one defect read from opposite ends, so the work is
"add the missing counterpart" 177 times rather than "reconcile two lists".

```
declared corpus 4,027 → role rule 721 → exempt 451 → LIVE 270
  unreadable text (<3:1)        99      wrong ground        83
  invisible boundary (<1.15:1)  66      low-contrast text   22
141 base-involved · 129 vertical-owned · worst cell evnto/dark (155 rows)
```

The worst cluster is one literal: `--ds-form-label-color`, `--ds-popover-title-color`,
`--ds-checkbox-label-color` and seven more, all `#171717` at `default.css` `:root`, all **1.06:1** in
two dark themes. `--ds-menu-bg` is in it by name — `#ffffff` unconditionally, no dark counterpart;
platform escapes only because it declares its own.

**Two waves, split by owner count rather than by size:** `default.css` alone is 98 rows moving 245
inherited cells, one file and one edit shape; ~12 component files carry 43 more. The **129
vertical-owned rows are not this work order** — folding them in is how a base wave becomes a repaint
nobody signed off. Row-level data with per-cell values, roles, fix sites and blast radius lives in
`harness/`.

### Calibrate a threshold from the healthy population, do not pick one

The invisible-boundary cut is **1.15:1**, derived rather than chosen: healthy hairlines measure
1.25–1.46 (`--ds-color-border` at 1.34, 1.26, 1.46) and dead ones 1.06, so 1.15 separates them with
margin on both sides. **At 1.5 the same rule flagged 197 and was condemning every well-designed
hairline** — a demolition order wearing a backlog's clothes.

### Two more false-zero disguises, and a `grep` that lies about `--` names

**A rule can return zero because it asks the inverted question.** A severity rule tested "is this edge
on the wrong *side* of the page" and reported `invisible-boundary: 0` — but an invisible edge is
precisely one on the **same** side. Contrast for edges and ink; side only for grounds.

**A regex parser reported "not declared anywhere"** for names declared 1,057 times: a
`([^{}]+)\{([^{}]*)\}` pattern found **6 blocks** in a 99 KB file where postcss finds 13,602 rules.
"Parse, never grep" now has a number.

**And `grep` without `--` silently returns zero for any `--ds-*` name**, because the leading dashes
parse as options. A lane nearly reported a channel as declared in one artifact only; the bundle text
refuted it. Inverse of the recorded `rg -r` trap and not previously stated.

### OPEN, SEVERE: 26 inherited channels unreadable on BitHire's dark ground

Corrected upward from the 6 I first recorded. The blind-spot probe found **26** DS-inherited channels
sitting at near-zero contrast on bithire/dark — **5 grounds and 21 ink** — all `#171717`/`#000000` from
`foundation/themes/default.css`, none contract-writable.

**The 21 ink ones are body copy at 1.02:1**: `--ds-form-label-color`, `--ds-notification-title-color`,
`--ds-popover-title-color`. Effectively invisible text, and a far harder failure than the unreadable
focus ring the first count described. Base-layer lane; no vertical can reach these.

**They are one population, not two backlogs.** The 9 neutral candidates found from the *light* mirror
direction overlap this 26 by 6 — the focus borders. Two lanes measuring opposite directions found the
same channels twice, and merging the lists before anyone works them is the difference between one work
order and two that half-collide.

### A ROLE RULE HAS TWO SIDES — testing one is half a test

A lane's edge rule fired only on **light-valued** edges, so it structurally could not see a flat edge
**too dark to read on a dark ground**. It found the gap in its own instrument when a sibling measured
the mirror direction, probed for it, and reported: **0 bithire-declared channels in the blind spot** —
so its 291→0 headline survives the widened rule in *both* brightness directions. The 26 that do sit
there are `#171717`/`#000000` inherited from the base layer and none is contract-writable.

Same session, the mirror: a sibling's "20 bithire grounds" does not reproduce as a defect count. Of 51
candidates, **42 are correct** — 21 tone fills (a red progress bar, an amber warning edge) and 21
filled or inverted controls (a dark tooltip, a checked checkbox). A dark tooltip on a light page is the
light theme working. **9 are real**, and not one is a page-level ground: they are per-component focus
and hover edges, an identity gap rather than a contrast defect.

And **0 of the 51 are writable from the BrandTheme contract** — no field emits them, established by
perturbing all 754 leaf fields. The pinning plan could not have executed where it said it would, which
is a second independent reason the no-pin ruling was right.

**Converse of the pinning law already recorded:** pinning a *correct* inherited value is also wrong. It
freezes a dark tooltip and a red progress fill into a vertical's contract as though they were defects,
and it is churn someone later undoes.

Method worth keeping: a **hue self-audit** over the 460 moved channels found 0 saturated→neutral and
one shift >40° — and that one is pre-existing rather than introduced. **BitHire's dark palette defines
success as blue** (`successColor: #5ca6cf`); success and info are one hue family in that theme. A
rewrite that routes more channels through `var(--ds-color-success)` makes it visible in more places
without having caused it. Flagged for the sighted pass. Neither a value ledger nor a brightness rule can
see a tone turning neutral, because both values are "correct for a dark ground".

### THE DENOMINATOR, MEASURED — "bithire misses only 23" does not survive

The third correction to my own headline finding, and the most consequential. Runtime census, 4,027
names, 8 cells, tenant-less arm spliced from each vertical's own bundle:

```
                     STATIC     RUNTIME
partial, bithire         23         461
partial, rottay         485         569
partial, evnto          585        1136
channels each SPEAKS on   —   platform 1876 · bithire 1984 · evnto 1309
```

**Bithire and rottay are 6% apart on divergence, not 2×.** The "misses only 23" figure was the
load-bearing evidence for *"BitHire diverges, the other two fall back toward the DS baseline"*, and the
gap it implied is 20×. Measured, it is 1.2×.

**The two numbers answer different questions and neither is wrong.** Static measures **authorship** —
did this vertical literally redeclare the name. Runtime measures **divergence** — does it paint
differently from a tenant-less document. A vertical diverges *without* redeclaring whenever the DS value
is a formula over its own inputs, which is §6.0, and is why the static count over-reports silence so
heavily. The contract-density argument is about the former and survives; the conclusion I drew from it
does not.

**What follows is the important part: whatever makes BitHire read as a product is NOT channel count.**
Rottay already diverges on nearly as many channels. No counter can find the difference, so authoring
another wave of channels cannot close it. That is a question for the sighted pass, and it is now the
strongest argument for doing that pass before any further authoring wave.

### Roles cut the adjudication target from 1,582 to 469

Applied to the corrected census, every row carrying a paint role:

```
fully tenant-free (1,582)   ground 84 · ink 190 · edge 195 · type 246
                            geometry 506 · motion 113 · internal 43 · other 205
```

Only **469 are paint roles** — ground, ink or edge, where a vertical opinion can change how the product
looks. The 43 internal/`z`/composition names should be **struck rather than adjudicated**. Handing over
the raw 1,582 would have set the next lane up to repeat tonight's mistake at four times the scale.

Caveats that travel with these numbers: the corpus is 4,027 (every `--ds-*` in any bundle) versus the
static 3,303 (bare `:root` outside tenant scope), so bucket totals are not name-for-name comparable —
the per-vertical comparison is, being one corpus measured one way. Platform's figures include tonight's
two commits and bithire's include its lane's +355 lines. **Re-run `harness/census.mjs` after the
reconciliation build before quoting a density number.**

### A finding attributed to the WRONG INSTRUMENT gets fixed in the wrong place

Fourth instance tonight, and this one is mine. I routed the portal-timing defect — surface mounts one
tick before content, 44 false dead rules — to `skin-orphan-scope-audit`. **It cannot be that gate's
bug.** That gate is pure static analysis: `readFileSync` plus `postcss.parse`, no jsdom, no
`document`, no render. **Mount timing cannot bias an instrument that never mounts anything.** Its
sibling `skin-dead-part-audit` states in its own header that jsdom is not consulted either.

The defect lives in the *reporting lane's own fixture*, which is where the fix belongs. Had it been
"fixed" in the gate, the real instrument would have kept producing false findings behind a repair that
looked done.

Companion instances of the same shape tonight: three families triaged as "no skin" that each had one,
and a `ds-sr-only` false positive attributed to a family when it belonged to the walk's scope.
**Before routing a fix, verify the named instrument can exhibit the mechanism.**

### CORRECTION: `0cdae6e2a` claims an a11y defect that does not exist

The commit says the unmigrated glyph "emitted an SVG that is neither aria-hidden nor named". False:
`runtime/factory/phosphor-compat/index.tsx:122` reads
`"aria-hidden": hasAccessibleName ? undefined : ariaHidden ?? true`, so compatibility icons default to
`aria-hidden="true"` and `<PinOff size={13} />` was correctly hidden all along.

The `decorative` I added is harmless — it makes explicit what was defaulted — but the stated reason was
wrong. **What survives is only the supplier-fence point**: one of seven glyphs in that file bypasses the
governed facade, and there is no pin/unpin role in the corpus to migrate it to.

The reporting lane caught its own over-claim and named the cause: it inferred runtime behaviour from a
contract instead of checking it, for the third time in one session. Which is the same law already
recorded two sections down — **an executable contract outranks reading source** — arriving as a
near-miss rather than a defect, because I acted on the report before it self-corrected.

### A control that CANNOT FAIL manufactures confidence

Asked to add a portal family to its control set, a lane refused with the right reason: nothing in a
static gate can be affected by mount order, so that control would pass unconditionally. **A control
that cannot fail is the same defect as a gate that scans nothing and passes everything** — it looks
like compliance and is its opposite.

What it added instead spans a real second axis: its extractor reads `className=` **literals**, so every
`clsx()`, `cn()`, conditional object or bare identifier is invisible. That floor was prose; it is now a
measured number printed beside every run — **109 unreadable expressions in 78 files** — and the control
plants a `clsx(...)` shape and **fails unless the gate counts it as unreadable**. A scan that cannot see
something and does not say so is precisely the failure a control exists to prevent.

Its output now states the epistemic limit in every run: a finding means no selector in the printed trees
matches that class **by literal comparison**; it does not mean the element is unstyled; and the gate
reaches no states at all, which is also why mount timing cannot bias it.

### An OUTCOME test survives a false premise; a MECHANISM argument does not

The sharpest statement of method the programme has produced, and it explains why an over-broad belief
I recorded as law cost nothing.

I recorded *".dark is a complete override"* from one lane's reading. It is false of the file (66 names
against 1059). The lane executing on it did **not** reason from the premise — its four-cell run measured
`dark: 0 moved` in all four scopes across the full 4,027-name corpus. Had any of the seven seeds it
believed covered actually been uncovered, dark would have moved and the run would have said so.

**A mechanism argument built on the same premise would have shipped the defect silently.** Prefer the
test that observes the outcome to the derivation that predicts it, especially when the derivation rests
on a claim about a file rather than a measurement of one.

Companion, and the only agreement in this programme that carries real information: two instruments built
independently — neither derived from the other — read `html.dark` as **66** and **72**, and overrides as
**48** and **54**. Deltas of exactly +6 and +6, exactly the six dark pins one of them had added. Every
other "two instruments agree" recorded here turned out to share a module. This one did not.

### The pin that would have frozen the bug

Ruled: **do not pin.** A pin at the currently-resolved value is value-preserving by construction — which
is why I ordered it — but where the current value **is** the defect, pinning converts an *inherited*
defect into an **authored** one. It then reads as intentional and the next auditor loses the reason to
question it.

The evidence, not the principle, is what settled it: `--ds-color-bg-canvas` and `--ds-color-bg-hover`
are the only two near-black members of a family whose every other member is white in both verticals'
light themes, and neither vertical declares either name anywhere. `--ds-menu-item-hover-bg: #18181C`
means hovering a menu item in Evnto's light theme paints near-black. Nobody chose that.

The fence existed to stop an **unattributed** repaint. This one is attributed, measured and a fix.
Conflating those two is what produced the wrong order.

Consequence worth noting: the ruling **dissolved the atomicity problem** that had blocked the lane. The
window existed because pins in TypeScript do not paint until the build; with no pins, the change lives
entirely in source CSS and takes effect consistently.

Two more from the same execution. **After a rewire makes two blocks textually identical, any
line-anchored edit is ambiguous by construction** — a fail-closed anchor aborted rather than inserting
six dark pins into the light block, which would have been the defect being fixed, doubled. And
**re-deriving at write time paid for itself**: three of the thirteen seed names had been authored by
another lane since the measurement.

**The sizing law, now with five instances:** 585→333, 365→104, 129→13, 53→2, 44→5. Every scope in this
programme that was re-measured at execution time came back an order of magnitude smaller. That is the
expectation, not the surprise.

### A PORTAL FAMILY MOUNTS ITS SURFACE ONE TICK BEFORE ITS CONTENT

A reachability instrument reported **44 dead rules** in `column-menu`. All false. The Popover mounts
the governed surface (`.ds-structure.ds-column-menu-panel[data-part="surface"]`) **one tick before**
the family's content renders inside it, so a fixture that gates on the surface and then samples sees a
correctly-classed, entirely **empty** panel — and every content rule reads as dead.

```
gate on the surface   44 unmatched
gate on the content    5 unmatched      same skin, same commit
```

Gate on content (`…[data-part="surface"] [data-part="panel"]` **plus a row count**), never on the
container. This will hit `skin-orphan-scope-audit` and every reachability check on **every portal
family**, and its failure direction is the dangerous one: it manufactures dead-rule findings that
license deletion.

The 5 that remain are pointer-drag and resize runtime states, not dead rules — which is the other half
of the lesson: an unmatched selector in a static fixture is a **state you did not reach**, until proven
otherwise. A lane also recorded 3 `export-button` toast rules as **unverified rather than live**,
because `navigator.clipboard.writeText` cannot be stubbed in this environment. Saying "I could not
reach this" is a different claim from "this is dead", and only one of them is safe to act on.

### CORRECTION TO A COMMIT MESSAGE: `d5c255a1d` is NOT repaint-neutral

I committed the toolbar repair claiming "the repaint is provably identical across all six
vertical×theme cells", on a sibling lane's analysis of the *geometry* rules. The owning lane corrected
it: **that is true for evnto and rottay and false for bithire.** The change also adds 8 colour-bearing
declarations reading `--ds-toolbar-*` and `--ds-search-*`; bithire's artifact declares all 12 and 20 of
those, evnto and rottay declare none, so the fallback is inert for bithire and live for the other two.
BitHire's toolbar gains a ground it never had, plus its own rule, divider, glyph and search-shell paint.

**That divergence is the assignment, not a defect** — same tree, different companies. But the record
said neutral, and a BitHire capture would then have read as an unexplained regression. Corrected here
because the commit message cannot be.

Second colour-bearing change in the same commit, hitting **every** vertical and theme: the
active-filters count eyebrow moved from `--ds-color-primary` to `--ds-color-text-muted` and lost its
primary-tinted background and border. That is the de-pilling, and it is not tenant-conditional.

**Standing rule this earns:** a repaint claim inherited from another lane's analysis covers only the
slice that lane examined. Geometry-neutral is not paint-neutral, and the owning lane is the one that
knows which is which.

### `.dark` is NOT a complete override — it is 4.5% of the `:root` surface

Also a correction to something I recorded as law from a single lane's reading. Measured:

```
:root declares                            1059 names
html.dark declares                          66
  of which override a :root name            48   → 4.5% of :root
  dark-only                                 18
:root names html.dark does NOT touch      1011
```

The 48 are 26 `--ds-color-*` plus ground/ink/edge families. **So "`:root` is the light block" holds
precisely for the colour seeds being rewired and fails as a statement about the file.** For the other
1011 names `:root` is theme-neutral, not light-mode: the type-role block is the demonstrated case —
0 of its 65 names has a dark counterpart, and a tenant-less **dark** cell measured the `:root` value.

### CORRECTED: the light block is not missing, it is CONTAMINATED — 13 seeds

Replaces the section below, which I recorded from a first measurement. The bare `:root` **is** the
light block: `default.css` already follows light-first with a `.dark` override, and the `.dark` block is
complete and correct. What is wrong is narrower and more actionable — **13 seeds inside the light block
carry a vertical's dark values**, and the contamination is Rottay's palette, so the [O] drift reading
still holds.

The `.dark` block already demonstrates the target pattern in its own text
(`--ds-color-bg-primary: var(--ds-color-neutral-50)`), and the light neutral ramp is present and correct
on bare `:root`. So the rewire invents no colour: it makes the light block do what the dark block
already does. Six of the 13 need a dark pin; the other seven are already overridden in `.dark` and are
dark-neutral by construction. The ~62 downstream grounds collapse to these 13.

**The trap, and the lane that flagged it nearly fell into it.** A luminance filter over the source block
reports **129** dark literals — and **~111 are correct light-mode ink**: `--ds-tooltip-bg: #171717`,
`--ds-checkbox-checked-bg`, `--ds-tag-primary-bg`, the whole tail of the primary/success/warning/error
ramps. A dark tooltip on a light page is right. **Acting on 129 would destroy the light theme.**

The role rule must be applied to the **source block**, not only to the resolved runtime set. This is the
365→104 collapse arriving one level down, and the naive filter is the first thing anyone will reach for
on this file.

Left out deliberately, needing APCA rather than eyeballs [O]: `--ds-color-text-{secondary,tertiary,muted}`
pass a crude ink threshold but are dark-theme greys, weak on a light ground.

### A source-only commit cannot close a paint window

The lane refused to execute an instruction of mine, correctly. I required the vertical pins to land in
the same commit as the seed rewire so no window exists where two products repaint unattributed. They
cannot: the pins are **TypeScript** in `brand-themes/**`, while what paints is `facade/artifacts/**`.
`default.css` takes effect immediately — it is source CSS in the bundle — but a pin does not reach paint
until the artifacts regenerate. A source-only commit therefore opens exactly the window it was meant to
close, delayed by one build.

Closing it needs all three artifacts regenerated **inside the same commit**, which needs a full
`pnpm build` first (the compiler is imported from `dist/`, which lags). That build is the coordinator's
singleton. **So this class of change cannot be handed to a lane at all** — a lane can produce the source
and the proof, and only the coordinator can land it.

### ANSWERED: the untenanted default has no light theme at all

The open [O] question — *"whether the untenanted default should deliberately be its own neutral identity
rather than drifting toward whichever vertical was edited last"* — is closed, and it was never a
preference. It is a **missing layer**.

`foundation/themes/default.css` declares the neutral ground as **baked dark hex on bare `:root`**
(`--ds-color-bg-primary: #0A0A0C`, `-bg-secondary: #0F0F12`, `-bg-elevated: #18181C`,
`--ds-color-text-primary: #ECECEC`). A `.dark` block layers a *different* dark over them. And there is
**no light block anywhere in the tenant-free bundle** — zero `[data-theme='light']` selectors, the only
`.light` occurrence sitting inside a comment. An untenanted light document therefore falls through to
dark. Those literals are Rottay's own values: the default drifted toward the vertical edited last,
exactly as suspected, now with names.

**The repair requires no colour decision**, which is what makes it safe: the neutral ramp is already
correct in both themes (`--ds-color-neutral-0` light `#ffffff` / dark `#020617`). This is §1.4 read
forward — a literal sitting where a channel belongs. Wire the **~10 seeds** to the ramp and both themes
become correct by derivation; no new hex enters the tree.

**Classify by paint role, not luminance.** 365 channels resolve to a dark solid in the tenant-free
light cell; luminance alone would have called them all defects. By role: **ink 176 (correct)**, edge 80
(mostly correct), **ground 104 — the defect class**, of which ~9 are semantic fills legitimately dark in
light (`--ds-button-error-bg-active`). Genuine: ~95, and ~62 derive from the ten seeds. The same
collapse from a frightening candidate count to a handful of causes that two other lanes hit from
different directions.

**Blast radius, and why the fix is one commit:** 71 grounds are inherited by **no** vertical — the
untenanted surface nobody owns, repairable with provably zero movement. The other 53 are live defects
in shipping products: **evnto's light theme paints a dark ground on 33 channels, bithire's on 20.** So
the seed rewire must land together with value-preserving pins at each vertical's current resolved
value, or there is a window where the base repaint hits two products unattributed.

Two lanes measuring opposite directions of one defect — "dark leaks from light" and "dark ground in a
light document" — converged on the same 20 bithire channels. That convergence is evidence precisely
because the techniques were independent.

Method note kept: a lane's own byte-identity assertion **refused its first run**, because bithire's
font packs inject three `--ds-font-pack-*` names into the base. It narrowed the assertion (streams must
match once font-pack names are removed) rather than relaxing it to a byte compare that would have
passed by accident. **A font pack contributes `--ds-*` names to what everyone calls "the base."**

### Synthetic controls prove capability; historical replay proves relevance

The fixture-drift test ships with both, and they are different claims. Six planted mutations prove the
comparator **can** fail and that each failure **names** what drifted — a mutation that only trips a
child-count check would pass a weaker test. Then the two committed pre-ruling fixtures were restored
from git and replayed: it caught the real `.ds-btn` substitution on the first line, naming the exact
classes. Capability and relevance are not the same evidence, and a control set that only proves the
first is half a proof.

Its coverage rule is the part that stops recurrence: a test covering today's three fixtures re-opens
the hole at the fourth, so **every fixture must either register a render or declare itself synthetic**,
and anything that is neither fails with a message saying why. That is a doctrine made executable rather
than written down — the difference between a rule and a gate.

It found a third stale fixture before shipping: `card-modern-md` was missing `ds-card--elevated`.
**Latent, not live** — that class occurs zero times in all three composed bundles, because the card
skin keys on `data-variant`. It cost nothing yet and would have cost everything the day someone wrote
a class-keyed rule.

The pattern across all three: **the two that mattered were caught by the CSS side, the one that did not
matter yet by the DOM side. Neither instrument alone sees both.** Which is the positive case for the
two-instruments law — techniques that do not share a module see different halves.

### WHEN AN EXECUTABLE CONTRACT EXISTS, IT IS THE AUTHORITY — three narratives, all wrong

The single most expensive lesson of the programme, and the cheapest to have avoided.

Three separate careful readings of source produced three different answers about whether a caller's
`data-part` survives `Button`:

| # | claim | wrong because |
|---|---|---|
| 1 | a test comment: "Button drops it in EVERY engine" | modern honours it |
| 2 | a lane's correction: "Button honours it" | only modern does |
| 3 | the same lane's retraction: "modern ✓ rustic ✓ classic ✗" | rustic overrides too |

I recorded #2, then recorded #3 as its correction. **Both went into the state file as law.**

`primitives/inputs/Button/tests/Button.passthrough-contract.test.tsx` pinned the answer the entire
time and **passes green**: *modern — the caller's part wins; rustic — keeps `trigger`; classic —
stamps `trigger`.* Five assertions, exit 0, run in seconds.

**Read the contract before reasoning about the behaviour.** A test that asserts the thing outranks any
number of readings of the implementation, and it outranks a comment absolutely — comments drift, tests
fail when they drift. Every one of the three narratives came from reading source; none came from
running the test that already existed.

Consequence for the disposition: `ds-column-menu-control` is the anatomy hook for **two** engines, not
one. Wired, one declaration.

### A one-engine answer is not a family answer — check all three engines by name

A lane retracted its own correction before it propagated, and the retraction is the finding. It had
reported "the `HeadersBatch` comment is stale, `Button` honours a caller `data-part`" after reading
one engine. Measured across all three:

| engine | caller `data-part` | mechanism |
|---|---|---|
| modern | **survives** | destructured explicitly, P-79 note at `:197` |
| rustic | **survives** | `{...rest}` onto the `<button>`; `skinAttributes` carries no `data-part` |
| classic | **never survives** | `stampDataPart(rootRef.current, 'trigger')` in a `useLayoutEffect` that re-runs after **every commit** |

The original comment is right for classic and wrong for the other two; the correction was right for two
and wrong for classic. **Neither is safe as a blanket.** Classic does not merely ignore the attribute —
it removes it from a live DOM node after render, so a test asserting before the effect settles sees it
and then loses it.

Consequence that reverses an earlier disposition: `ds-column-menu-control` is **not** dead residue. It
is the only anatomy hook on that Button surviving all three engines, precisely because classic
overwrites `data-part`. A *reserved* hook, not a live one — deleting it under §1.3 is correct only if
we accept that column-menu's trigger is never styled under classic. That is an owner call.

Operative form: **before citing a per-engine behaviour, check all three engines by name.** A claim
about "the Button" tested against one engine is a claim about that engine. Same shape as the
single-instrument failures already recorded — one resolution, generalised past its corpus.

### Authoring a literal where the DS declaration is already a FORMULA is a regression

The rottay identity lane resolved all 289 in-scope names and split them:

```
rottay == evnto            138   genuinely no vertical identity — the real gap
rottay != evnto already    149   the DS declaration is a formula over per-vertical
                                 inputs, so it ALREADY carries rottay's palette
```

`material` 62/66 and `surface` 19/20 already diverge, because their DS declarations are
`var(--ds-surface-card)` / `color-mix(… var(--ds-color-primary) …)` chains bottoming out in the
vertical's own `--ds-color-*`. Authoring literals there would have **replaced a live formula with baked
paint**. The lane left both families alone.

This is §6.0 read forward for a third time tonight, in a third disguise. The census column "missing
from vertical X" answers *who redeclares at tenant scope*, never *what paints* — the same correction
the evnto lane made from the other direction.

### THE LARGEST DEFECT: a primitive's whole skin dies wherever a caller names a part

`runtime/engines/modern/skin/input.css` opens **82 rules** with
`.rottay-input.rottay-input--modern[data-part='root']`. `Input`'s modern engine writes
`data-part={dataPart ?? 'root'}` — the caller's part **replaces** the default. So **every consumer that
passes a `data-part` to `<Input>` silently loses the entire modern Input skin.** Measured: **46 call
sites across 6 files**. One is render-proven (`.rottay-input[data-part='root']` matches zero nodes in a
rendered `SearchCommandBar`); the rest are candidates, and the discovering lane correctly refused to
call them findings.

**The way it surfaced is the lesson.** `search-command-bar.css` was hand-painting a field surface to
compensate for primitive paint it was silently losing — **and its compensation was dead too**, by the
same mechanism, one token off. Repairing six arms in a family skin restored a workaround; it did not
touch the cause. Expect other families to have compensated the same way.

Generalisation: **a family hand-painting something a primitive should own is a symptom, not a style
choice.** Ask what the primitive stopped delivering before improving the compensation.

This is class A of the reachability model at scale, and it is why that model matters: reachability is a
property of the CALL SITE, so a primitive can be perfectly correct and its skin still dead at 46 places.

### "Has no skin file" is not a defect signal — it has at least three innocent causes

I offered a lane three families as "no skin at all". **All three were false positives**, each for a
different reason: `record/content` is served by `record.css` (folder name ≠ scope name, the same
mismatch that fooled a matcher earlier); `dashboard/insights` is a **group**, not a family, and its
leaves each own a skin; `workspace/connected-command-palette` **owns no DOM at all** — it returns two
composed patterns, so the paint is one layer down, exactly as `view-mode-switcher` correctly has almost
none. My error compounded it: I built that candidate list from a matcher I already knew was unreliable.

**The signal that means something is: stamps DOM that no skin selector can reach.**

### CSS→scopes and TSX→scopes are different instruments and find different defects

The census that answers it runs from the **other end**: collect every scope class any skin selector can
reach, then walk every family and ask which stamp a `data-part` plus a scope class nothing reaches.

Result across 27 structure directories: one genuine orphan —
`column-menu/index.tsx:1073` stamps `className="ds-column-menu-control"` and **nothing** in the token
tree or `styles/` targets it. A class on a shipped element that no rule can ever match.

The lane had already triaged that family as "drained" using a CSS→scopes pass, which **structurally
could not see this**: one direction asks what the skin declares, the other what the DOM stamps. This is
the matcher-blind-spot-has-a-direction law with a concrete instance, and it argues for a gate: an
orphan census shares no module with `skin-dead-part-audit` (skin selector → unstamped part versus
stamped class → unreachable selector), so unlike most of our instruments, **their agreement would carry
real information.** Authorised, with a positive control required.

One false positive stated by the lane rather than left to be discovered: `ds-sr-only` reads as
unreachable only because the walk covers the skin directory and that utility is declared in
`runtime/engines/**`. A census must state which trees it searched, in its output, not in a comment.

**And its positive control independently reproduced the corrected family count**: 27 directories minus
`shell/contracts` and `shell/styles`, which are support owners rather than families, is **25** — the
number reached earlier by an unrelated route after miscounting 28. Two techniques, no shared module,
same answer.

### Enumerate inline paint WITH its anatomy, or the one site that matters hides among the twenty that do not

An inline-style census finds sites; it does not tell you which ones matter. In a 34-site drain, the
site that mattered was a scroll region carrying `max-height` and `overflow-y` and **no `data-part` at
all** — the one element in the family owning a scroll frame was invisible to its skin. In a flat list
it was indistinguishable from twenty `display: block` and `min-width: 0` rows.

It surfaced only because the lane printed, beside each site, the host element and its nearest
`data-part`, and looked for the row reading `part=(none)` on a **structural** element rather than a
leaf. Add that column to any inline-drain pass.

Coordination fact from the same lane, for whoever drains next: a file whose paint counters are already
`0` cannot trip the audit, because its lexer does not count geometry as paint. A file whose counter is
**positive** will go red on completion until the baseline is tightened in the same change — and only
the coordinator can do that half.

### Load-bearing headers are also a maintenance surface

Recorded against the law two sections below, which it qualifies. *"A file that looks unfinished may be
finished on purpose, and the header is the evidence"* holds only while the headers stay true. Two of
three files read in one lane carried notes that were accurate when written and are now stale in the
opposite direction: the `HeadersBatch` claim that `Button` drops a caller `data-part` (it no longer
does), and a family comment citing a zero-local-SVG migration that then stopped at one icon of ten.

A stale header is worse than none: it is evidence that reads as current. When a lane's work falsifies
a header anywhere in its blast radius, correcting that header is part of the work.

### A census number without a POSITIVE CONTROL is not evidence

The most generalizable finding of the programme, and a lane found it by catching **its own** instrument
lying. Its functional-pseudo parser returned a **false zero** on first run: the regex required a
trailing `(` but was tested against the text *before* the paren, so it never matched and the real tree
reported "no further defects". A clean result that was pure instrument failure.

It was caught only because the lane built a control fixture of seven known shapes before trusting the
number. The control caught **2 of 7**; after the repair, 7/7 with correct classification. Had the first
run been reported, the programme would have recorded a false all-clear.

**Every census in this programme is now suspect unless it shipped with a positive control.** That
includes the v1 dead-selector census and, by the same standard, several counts recorded above. A census
must plant known instances of what it hunts and prove it finds them; a count that only ever returned
"found N" has never demonstrated it can find anything.

### `data-part` reachability is a property of the CALL SITE, and only rendering settles it

Three classes, not two:

| class | shape | sites |
|---|---|---|
| **REPLACE** | `data-part={dataPart ?? 'root'}` — says `root` ONLY if the caller passes nothing | 26 (19 defaulting to `root`) |
| **HARDCODED** | `data-part="root"` written literally; caller cannot change it | 179 |
| **NONE** | `Box` stamps no part at all, by explicit design | — |

`Box`'s own source names the hazard it is avoiding: *"a default part would put `data-part='root'` on
every nested Box in the fleet: a skin rule of the form `.rottay-x [data-part='root']` would then reach
into X's Boxes."*

So two families using the same primitive differ, and **reading the primitive is not sufficient.**
Worse, reading the call site is not sufficient either: `Input/modern` routes the caller's two
attributes to **different elements** — the painted shell at `:331` takes `data-part`, while `:443`
takes `className`. So `.caller-class:has(> .rottay-input[data-part='root'])` is wrong twice over, and
measurement confirms it matches zero in the whole rendered tree.

**Operative law: a `[data-part='X']` predicate against a composed primitive can only be settled by
RENDERING.**

Open total across both dead-selector classes: 22 rules / 48 declarations. The 6 in
`search-command-bar.css` are the exact twin of the table-toolbar defect already repaired. One hit in
`app-shell.css:421` is a **false positive and must not be touched** — `BottomTabBar` explicitly passes
`data-part="root"`, so the predicate is live.

Blind spots the lane stated rather than leaving implied: only `[data-part='root']` is censused, though
seven primitives default to non-root parts (`item`, `group`, `divider`, `meta`, `anchor`) with the same
idiom; only exact `=` is matched, not `~=` or `^=`; reachability was adjudicated for two families only;
and the tree drifted 146→147 files mid-run, so counts are as-of-now rather than stable.

### The governed icon drops every `data-*` except `data-part`, silently

`createSemanticIcon` forwards an **allowlist**, not a rest spread. `data-part` is passed explicitly and
survives; `data-active` and every other `data-*` is dropped with no error and no warning — the
attribute is simply absent and any selector keyed on it goes dead. A lane migrating a stateful icon to
the governed facade killed `[data-part='checkmark'][data-active='true']` this way; only a contract test
caught it. Move state attributes to a host element. Belongs beside the P-79 part pass-through note.

### A file that looks unfinished may be finished on purpose — the header is the evidence

Two of five workspace families assigned for elevation **forbid it in writing**.
`view-mode-switcher.css` is 3.9KB carrying exactly one rule with three declarations, and its header
states *"the correct read count for this file is zero"*, names the census that established it (the only
one of 25 skin-owning structures reading no radius, elevation, spacing, motion or type token), and
pre-empts the precise move an elevation lane would make: *"re-adding any of them here would rebuild a
lower layer."* `scope-switcher.css` carries the twin note as **MATERIAL INVARIANT — DELIBERATELY FLAT**.

Elevating either would have been a **regression dressed as progress**. This is the mirror of the law
recorded above about dead rules: that one says a rule may encode an outgrown assumption; this one says
a *sparse* file may encode a live decision. In both directions, **read the header before acting on the
shape.**

### A transient mid-edit state is not a defect, and a `git status` line is not an audit

Two false alarms in one session, both from reading the tree instead of the thing. A lane reported a
syntax error blocking every workspace test; by the time it was checked the JSX comment closed
correctly and the suite collected at 62/63 — it had observed another lane mid-write. A second lane
reported an engine-split fence breach because `index.tsx` was deleted and `index.ts` + `contracts/` +
`runtime/` appeared; that is the folder/index hierarchy `CLAUDE.md` mandates, and the refused shape is
specifically three `engines/*/index.tsx` files. **The two are indistinguishable in `git status` and
trivially distinguishable by `ls engines/`.**

Both lanes were right to escalate rather than assume. The rule is the check, not the silence.

### A formula may only bake a value the same file authors

The rule that settled where the radius-dial fix belonged, and it generalises. BitHire's `1.25` divisor
comes from `expressive.experienceProfile` lowered through `appearancePostureToVariables` — **not** from
the `surfaces` block beside the radii. Authoring `calc(9px / 1.25 * …)` into the brand theme would pin
a number that file never states, and a later profile change would silently mis-resolve all 31 radii.
The fix belonged in the compiler, where the scale is **derived** rather than threaded, so no call site
can pass a wrong divisor — a wrong divisor is a silent repaint, not a failure.

Companion ruling: **a partial dial is worse than a uniformly inert one.** Fixing only control radii
would have left buttons and inputs rounding while tables, tabs, badges and cards stayed pinned, which
reads as a design decision rather than a bug. Scope widened to all 31 emitted radius channels.

### The instrument's own fixtures were measuring something no component can render

`button-modern-md` and `input-modern-md` in the resolution probe match `.ds-btn` / `.ds-input` — class
names **no DS component emits**. The modern Button emits `rottay-button--modern`, the rustic one
`rottay-button--rustic`. The fixtures are labelled "modern" and are structurally rustic, so every
conclusion drawn from them about the modern button was measuring a different thing.

The defect they exposed was nonetheless real, and **that is the dangerous part**: a lying instrument
that produces a true finding teaches you to trust it. Queued for repair against the real components.

Related, same session: **`getComputedStyle` is not a cascade oracle in the unit suite.**
`src/tooling/testing/setup/index.ts:141-178` monkey-patches it under happy-dom to prefer inline
styles, and it reported values for provably dead rules — including a `30rem` that could not have come
from the rule it appeared to confirm, since the only declaration anywhere in the tree is `476px`. Use
`querySelectorAll` against a rendered tree to ask whether a rule is live. Note the lane built a
control (an unsatisfiable middle compound with `order: 42`), the control **disproved** its own
explanation, and it reported the narrower supportable claim instead of the tidy one.

### A dead ramp is a designed relationship existing only as source

BitHire authors a control radius ramp 7/8/9/10/11 paired with heights 26/32/36/40/46 — deliberately
tighter than the surface ramp. It does not paint. The R1 Cohort 1 repair made the family literal the
**fallback** arm of `var(--ds-radius-md, var(--ds-button-md-radius))`, and `--ds-radius-md` is declared
at `:root`, so by the fallback-inert law the family value is unreachable and every modern button paints
10px where 9px was designed.

Ruled: **flip the precedence back.** R1's rationale was that the family literal was not dial-reachable;
the compiler fix made it reachable *and* it carries the design value, so the rationale has expired.
This moves resting pixels and is therefore a deliberate visual change wanting sighted capture — and
the stale rationale comment must be rewritten, or the next reader re-derives R1's reasoning from a
premise that is no longer true.

### `probe run` is BLIND to a brand-theme edit — it will null-measure the identity wave

Established by measurement, and it invalidates the verification instruction I had given two identity
lanes. `composeFresh` reads the **committed** `facade/artifacts/<vertical>/index.css`. "Fresh" means
fresh with respect to the CSS tree and **stale with respect to the TypeScript brand themes**. A lane
editing `brand-themes/**` and verifying with `probe run` gets `changedRows: 0` **by construction** and
reads it as safety. Same family as *artifact gates read `dist`, not `src`*.

The working method, proven: run the real compiler **in memory** on the edited theme (no build, no
writes) and substitute the resulting tenant CSS into the fresh bundle before measuring.

Companion, and it applies to every lane right now: **a before/after in the shared tree is not a
controlled experiment while other lanes edit CSS.** Record the per-vertical bundle sha256 in every
run. The lane that did this correctly showed platform and bithire byte-identical across both runs
while only evnto's moved — which is what makes "the others did not move" a measurement rather than an
assertion. Pair it with a FULL `--ds-*` census per cell (~7,100 channels), not a check of the names
you touched: that is how ten downstream aliases reading a changed channel get found instead of missed.

### Removing an override hands the decision to source order — a sibling of class 5

A lane deleted a family's own `:active` rule so a shared premium hover could apply — correct intent —
but left `background: transparent` at the same specificity in the resting rule. Both files import into
the same layer, the family file loads last, so the no-op won and the back chip silently lost its hover
and active tint. It shipped, and it looked fine: the border still warmed and the 1px lift still fired,
because those sit at different weights. **A partial regression is the hardest kind to see.**

Class 5 is *declaring* a name flipping every read site. This is its mirror: **removing a competing
declaration hands the decision to whatever else sits at that weight, and at equal specificity that is
import order.** Before deleting an override, enumerate what else can hit the same element at the same
weight for the same property — restricted to pairs that can actually co-occur, or the tie list is
noise. The lane's first pass reported 50 ties and 49 were pairs no element can be both of.

Corollary the lane stated better than I would have: **one instrument run at two resolutions is not two
opinions.** Only the second pass was worth acting on.

### BROKERED: both auditors were wrong on D1, in opposite directions

The two-auditor law paying for itself. Fable counted **5** silent evnto border slots. Kimi counted
**2** and said no enumeration of 5 exists anywhere. I measured every `--ds-color-*border*` name
against all three artifacts:

```
                              bithire  evnto  rottay   default.css
--ds-color-border-subtle         2       0       2          1
--ds-color-border-tertiary       2       0       2          1     <- Fable missed
--ds-color-error-border          2       0       2          1     ┐
--ds-color-info-border           2       0       2          1     │ Kimi missed
--ds-color-success-border        2       0       2          1     │ all four
--ds-color-warning-border        2       0       2          1     ┘
--ds-color-border-secondary      2       2       2          2     <- not silent
```

**Six.** Fable had the status borders and missed `border-tertiary`; Kimi had `border-tertiary` and
dropped the status borders. Neither number was right, and a merged review would have produced one
confident wrong count instead of a disagreement worth measuring. This is what §1.1 means by *where
they disagree is the finding*.

Where they independently AGREE, and that agreement is evidence because their techniques differ:

- The derivation **cannot** land near-black on evnto light. It returns `undefined` on evnto's
  `rgba(0,0,0,0.08)` light border (the non-hex gate), and composited first yields ≈`#F2F2F2`.
  My conditional "if it lands near-black, evnto's ink/surface pair is wrong" **never fires** — the
  pair is documented, deliberate design, used by the derivations module as a calibration example of
  legitimacy.
- "The formula the other two verticals already use" is **false**. Both hand-author literals; the
  formula runs only on the DB appearance path and was fitted *to* rottay, not followed by it.
- Therefore D1 is **not** a value-preserving derivation. It is a **leak repair**: those six names
  today resolve to `default.css`'s tenant-less DARK literal, so evnto's light cell paints near-black
  hairlines on white right now. Repairing it repaints ~305 read sites on `border-subtle` alone. That
  is a deliberate visual-change wave with sighted review, and must be scheduled as one.

### A tenant-only channel consumed bare — second instance, now a confirmed class

Kimi's independent fifth finding is the same shape a family lane found in `--ds-motion-calm`:
`--ds-table-header-letter-spacing` and `-text-transform` (`default.css:1690-1691`) reference
`--ds-text-eyebrow-*`, which **only the tenant compiler emits** — nothing declares them at `:root` —
and modern consumes both with **no fallback** (`modern/skin/table.css:131-132`). Result: the
tenant-less table renders initial values, tenants render `0.08em/uppercase`, and Rustic's own
fallback diverges to a third value. Two instances found independently in one night makes this a class
to sweep, not an incident.

Kimi also named concrete instances of §2 clause 8 (a rename silently disabling its own guard):
`engine-token-audit`'s fallback-parity **skips** undefined tokens rather than counting them, and
`tenant-channel-consumer-gate` treats a rename as "revived" so the next `--seed` erases the debt
record. Any rename wave must re-key its guards in the same commit.

### The dead-selector class, and why the finder's own definition would have destroyed 81 good rules

A family lane found that rules written `.ds-<family> [data-part='root'] …` — descendant, note the
space — need a SECOND element carrying `data-part='root'` nested inside the family, and reported that
there is only ever one. A different lane censused it, and the correction is the finding.

**"There is only ever one root" is false.** 81 selectors legitimately target a nested root: every
composed DS primitive stamps its own (`.rottay-input[data-part='root']`, a composed Text as
`.<family>__muted-text[data-part='root']`). Acting on the broad definition would have swept all 81.

The real defect is narrower: **a bare, UNCLASSED `[data-part='root']` in a non-first compound.** Such
a compound can only match a nested root carrying no class of its own, and no family renders one.
Classified on exactly that, the census is 26 rules / 59 declarations / 4 files with **zero** false
positives — 25 of the 26 proven by running the FULL selector through `querySelectorAll` on a rendered
tree, not by counting roots, which would have misled here for precisely the 81-selector reason.

Two risk classes, and they must not be swept together:

- `table-toolbar.css` (10 rules) is **high risk**: the dead rules carry layout on BEM classes nothing
  else owns, so correcting them makes the whole arrangement live at every width plus a narrow posture
  that has never once applied. Sighted check per vertical, never a sweep.
- `field-filters-panel.css` + `selection-preview-rail.css` (15 hits) are probably **no-ops**: all are
  typography on composed Text parts, and the typography skin owns those properties from
  `rottay-engines`, a LATER layer than `rottay-components`, which wins on layer regardless of
  specificity. Verify the layer before claiming a repaint in either direction.

General law: **a rule that has been dead since it was written may encode an assumption the component
outgrew.** Reviving it is not automatically a fix. Where the revived intent is clearly wrong, the
correct action is to report, not to ship the correction.

Adjacent class, logged not chased: attribute repetition used as a specificity ladder
(`[data-part='root']` written three or six times in one selector), which the skin tree's own header
law already forbids.

### CORRECTION to THE DENOMINATOR — the census asks a different question than the one that matters

The section below stands as a measurement and **fails as an explanation**. An execution lane refuted it
by resolving all 585 of evnto's "missing" names in four cells — evnto light, evnto dark, and a
**tenant-less** document with the tenant artifact withheld — and calling a name silent only when
evnto's resolved value **equals the tenant-less one**.

```
census says evnto-missing        585
  already opinionated, both      249   <- false positives for PAINTING
  genuinely silent (>=1 theme)   333
  undeclared anywhere              3
```

The census asks *"is this name absent from the vertical's **unconditional block**"*. That is not
*"does this vertical inherit the DS default when painted"* — a vertical declares plenty in its **dark
block** and its **light extension**, neither of which the census counted. It is a runtime question and
must be asked at runtime. (Baseline against the artifact rendered from CURRENT source, not the
committed one: the committed artifact lags, so measuring against it re-discovers fixed defects.)

**And coverage is not the identity lever.** Most of the genuine 333 is one of three things authoring
cannot improve: *geometry* the DS rightly owns (`-height`, `-padding-x`, `-gap` — a ticketing product
has no opinion about them); *already correct by default* (evnto/light resolves `#171717` ink on
`#ffffff` grounds — the DS light default and Evnto's black-and-white identity **are the same thing**,
so declaring them repaints nothing); or inexpressible from the contract.

The real structural difference, compiled from the contract alone with extensions withheld:

| vertical | channels emitted |
|---|---|
| bithire | 1107 |
| rottay | 568 |
| evnto | 374 |

**BitHire reads as a product because its BrandTheme is populated roughly three times as densely**, not
because the others are silent on particular names. The lever is `surfaces.surfaceRoles` facets and the
`chrome.*` sections the other two leave empty — a design pass, not a sweep.

The lane authored **four** channels rather than three hundred, and was right to: declarations that move
zero pixels are churn that makes the next census dirtier without making the product look like itself.
It also confirmed the warning it was given — `--ds-glass-*` looked like a gap and is a deliberate
`none` in evnto's contract. **A sibling declaring a channel proves expressibility and nothing more.**

Reported as inexpressible, not worked around: `--ds-badge-secondary-bg: #722ed1`, an Ant Design purple
painting inside a black-and-white brand, unreachable from the contract [O]. 27 of the 333 are likewise
unreachable, and 36 of the 41 half-leaks route only through a full `surfaceRoles` facet authoring pass.

### THE DENOMINATOR — why the three verticals do not read as different companies

Censused 2026-08-11 at ref `17acb610c`, postcss on both sides, `base.css`'s full 439-file `@import`
graph resolved recursively. The artifact side matched each rule's selector structurally against the
unconditional tenant block rather than by line number, and the method independently re-isolated
`--ds-type-body-font-size` as the sole D2 miss — cross-validating itself against a known answer.

**3,303 unique custom properties are declared on bare `:root`** across 34 files (`default.css` 1,057 —
reproducing D4's independent figure exactly — plus `patterns.css` 326, `card.css` 243, `button.css`
233, `input.css` 176, and 29 more).

| bucket | count | meaning |
|---|---|---|
| tenant-overridden — all three verticals redeclare | **218** | the only channels where the three verticals provably differ |
| **partial** — some redeclare, some do not | **589** | one vertical has an opinion, another silently inherits the DS default |
| **fully tenant-free** — none redeclare | **2,496** | all three verticals resolve **identically** |

This is the answer to the question the programme exists to solve. It is not that the plumbing does not
reach; it is that **on 2,496 channels no vertical expresses an opinion at all**, so all three paint the
same DS default — and on 589 more, only some do.

The partial bucket is asymmetric and that asymmetry is the disease in miniature: **evnto misses 585,
rottay misses 485, bithire misses only 23**. BitHire diverges; the other two fall back toward the DS
baseline. That is precisely why BitHire reads as a product and the other two read as the design system.

**Why the partial bucket is the wave to run first.** It needs no design judgment: a sibling vertical
already declares the channel, proving both that it is expressible and what shape a value takes. The
2,496 do need judgment — a large part is legitimate component surface (`card` 162, `button` 137,
`select` 130, `modal` 128, `avatar` 112) that BrandTheme's `chrome.*` sections exist to own, but some
is properly internal (animation duration/delay/easing primitives, the `z` scale, `--_ds-*` composition
variables). The census deliberately did not adjudicate that split, which was the right call.

**Keep two questions separate, because they have different answers.** *Vertical identity* — do BitHire,
Evnto and Rottay look different — is what these buckets measure. *Tenant reach* — can a DB tenant look
different from its vertical — is a different question: the runtime tenant layer at (0,4,0) outranks
every artifact and bare `:root`, so a tenant can already override a channel no vertical declares.
Conflating them will produce the wrong wave.

Related class, found in passing and not chased: **24 names are declared on bare `:root` in two
different files** (e.g. `--ds-card-shadow-hover` in both `card.css` and `runtime/personality.css`) —
a cross-file sibling of the within-file self-conflict already recorded. Full per-name lists for all
three buckets: `scratchpad/WO-CRA-23-bare-root-census-report.md`.

### Identical declarations, divergent resolutions — two lanes disagreed, both were half right

Adjudicated by measurement after two family lanes reached opposite conclusions about the same channel.

`--ds-type-page-title-*` is **byte-identical text** in all three artifacts. One lane concluded from
that "wiring a title to it yields ZERO divergence." False:

```
--ds-type-page-title-font-family:    var(--ds-font-family-heading)
     resolves  bithire Space Grotesk · evnto Inter · rottay Inter (different stack)
--ds-type-page-title-letter-spacing: var(--ds-letter-spacing-heading, -0.02em)
     resolves  -0.025em / -0.02em / -0.015em
```

Identical declarations, divergent resolutions, because the declarations are **formulas over
per-vertical inputs**. This is §6.0's formula-or-literal law read forward instead of backward: a
static emitter is harmless if it emits `var()`. Comparing declaration TEXT and reporting identity of
VALUES is the same error already recorded against a density/spacing claim earlier in this programme —
it recurs because the two look alike in a diff.

Both lanes' wiring choices were nonetheless correct, for a reason neither stated: a page title and a
collection hero are different **roles**. `page-title` is a fixed `calc(1.5rem * …)`, so a fluid hero
wired to it would collapse to 24px. Role first, divergence second — the divergence follows the role's
inputs automatically.

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

### A severance repair is ATOMIC, so "fix the broken ones" is not a plan

Measured 2026-08-11 on Badge, and the finding is a correction to a lane's recommendation that was
otherwise the best adjudication of the night.

Badge severs at 16 shipped sites. The lane render-proved the damage in Chromium against all three
vertical bundles — an uncompensated severed badge loses **12 of 14** measured properties, every
colour-bearing one among them, and paints as bare text. It then did the thing a census usually
skips: it asked whether the owning pattern repaints the replacement part, and found **6 of the 16
compensated**. Its recommendation followed naturally — repair the 10 bare, stage the 6 behind the
sighted pass.

**That partition is not implementable, and the reason generalises.** The repair is a change to the
*selector* in `badge.css`, and the class it keys on is written by the engine, not the caller. Every
badge carries it, severed or not. The instant the selector is class-keyed, 41 root-keyed properties
return at all 16 sites simultaneously. There is no per-site switch.

**The law: when the defect is per-site but the repair is per-selector, the decision is binary.** A
census that partitions sites into repair-now and repair-later has answered a question the repair
cannot act on. The question that *is* actionable is different and sharper: *do the compensated sites
survive the base returning?* At a compensated site the engine's restored rule and the pattern's own
rule land on the same element, so the risk is not merely "new properties appear" — it is the shipped
pattern **losing paint it deliberately authored**. `display: inline → inline-flex` is the specific
one to fear, because those patterns were authored against bare text.

Corollary on where such an ordering fight is settled: neither the source skins nor the built
`bithire` artifact contains a single `@layer` declaration — the artifact is tokens only. Whatever
decides the winner, it is not the layer ladder in those files, and it must be **read from a render**
rather than argued from specificity. This programme has punished the mechanism argument every time.

### A token declared in a severed rule and read from a surviving one paints from the void

Second-order defect, found in the same adjudication and invisible to both instruments that ran.

Badge's tone tokens (`--ds-badge-tone-*`) are **declared** inside the `[data-part='root']` rules and
**consumed** by the class-keyed hover / pressed / selected rules. Severance kills the declaring rules
and leaves the consuming ones matching. The result is not lost paint: it is live paint reading
custom properties nothing declared.

**No "properties lost" measurement can count this, because the rule that suffers it is alive.** Both
the property census and the Chromium render proof scored those rules intact — correctly, by their
own definitions. The defect lives in the gap between the two questions they ask.

The shape is not plausibly unique to Badge. Wherever a skin declares custom properties in its root
rule and reads them from state rules keyed elsewhere, severance produces the same silent hole; that
census is task #27.

### The third repair option: an anchor the caller cannot take

Shipped 2026-08-11 as `ace62230d`, and it is the pattern to reach for first from here on.

Severance had two known answers, both bad. Stop severing at the call site — treats a symptom, and the
next composer re-breaks it by accident. Rekey onto the scope class — works, but **drops one weight
unit at every selector**, which is why the Button repair is still deferred waiting on a browser pass.

Segmented took a third: rekey onto `[role='radiogroup']`. The engine stamps it unconditionally and
**spreads no props** (fixed destructure), so no caller can suppress it, and the swap is
weight-identical at all 29 selectors — `(0,3,0)` stays `(0,3,0)`. Nothing changes hands in the
cascade, so no sighted adjudication is owed and it ships the same night.

**The law: prefer an anchor the caller cannot reach over one the caller merely happens not to use.**
The test is not "is this attribute present" but "can a caller remove it" — which is a question about
the engine's prop handling, not about the CSS. A component that spreads props has no such anchor and
must take the specificity hit or the call-site fix.

The lane also proved the negative properly: it ran the bare-class form as a control and got **29/29
drifts**. A repair that claims to preserve weight must be able to show the form that does not.

### Two classes of orphaned channel, and no single instrument names both

Reconciled 2026-08-11 from two censuses that disagreed — 16 families / 252 reads against 12 families
/ 29 channels. Neither was wrong; they asked different questions.

```
class A   reads the void          the declaration is invalidated · the paint DISAPPEARS
class B   reads the wrong thing   the fallback fires · the paint STAYS and lies
```

`void-reads.mjs` counts A only, deliberately: it excludes any read carrying a fallback, because
severance makes the property undeclared and the fallback correctly fires. That exclusion is sound
about validity and blind about meaning.

**CORRECTED — I stated the tag case wrong twice and a lane caught it by reading the selector.** I
wrote "an `xs` tag renders at `md` height". It does not. `tag.css:69` declares the pill's own
`block-size: var(--ds-tag-xs-height)` inside the root-keyed xs rule, so severance **deletes the
pill's height outright** — class A. The rule that survives and lies is
`tag.css:240`, `… > [data-part='close'][data-part='close']`: the close button caps against
`calc(var(--_ds-tag-root-height, var(--ds-tag-md-height, 1.75rem)) - 0.125rem)`, so at every one of
the five sizes it sizes itself against the **`md`** cell.

So the two classes land on the same family at once: the pill loses its height entirely while the
close button keeps a confident, wrong one. That is a worse picture than the one I described and a
sharper argument for B, and it was only visible to whoever read *which rule* the fallback sits in.

**B is the harder class to find and the more expensive to leave**, because A announces itself as
missing paint and B looks like a design decision. The damage in B is not the orphaning — it is *what
the fallback delivers*, so any census of B that does not report the fallen-to value has not measured
the defect.

**Both classes were then re-derived independently, from different families, by the other lane** —
`--ds-badge-tone-soft-color` at `badge.css:243` falls to `currentColor` and takes a success chip's
ink from `rgb(21,128,61)` to `rgb(0,0,0)`, measured in Chromium. Two instruments, two families, the
same split. That convergence is stronger evidence than either census alone.

Two disciplines from that lane belong with the taxonomy. It went to **check** the third channel
rather than accept my correction as retiring it — and was right: six of its seven reads are
root-keyed, but the seventh sits on `[data-part='count']`, an internal part the caller cannot
replace. My correction would have destroyed a real finding. And it **refused the neater story**: it
expected the degraded read to re-create the R0 contrast failure, found it does not (the severed
badge's own ink is black, so the pairing stays legible), and said so. Fidelity defect, not an
accessibility one.

A companion note on instruments: that lane's parser survived the nested-fallback blind spot that
broke mine, but by accident — a global regex matches every `var(` including the inner one. **An
accidental correctness is not a property.** Nothing in its control set holds it, so the next refactor
removes it with every test still green.

**"Family X is a false positive" is a property of a READING, not a family.** I checked
`--ds-list-toolbar-radius-shell`, found its declaration and its reads inside the same root-keyed rule
(`:46` and `:101` both under the selector at `:37`), and struck the whole family. Two lanes
independently corrected it: `--ds-list-toolbar-radius-control` is declared at `:47` in that same root
rule and read from **four** rules that are not root-keyed, and `--ds-list-toolbar-radius-inner` falls
from `max(calc(shell − 4px), control)` to a flat `--ds-radius-md` — the entire nesting relationship
collapsing to a fixed token. Nine genuine class-B readings, dropped by a label derived from one.

Verifying one channel and retiring the family is the same error as the single-spelling walk, one
level up.

### The reachable term is the only one that authorises work

Class B was censused at **35 structurally present, 3 reachable** — the seventh instance of the
collapse law, and the first where the instrument reported both terms in the same line. The one that
made it collapse:

**Class B is not an independent backlog. It is the AMPLIFIER on the severance class.** A fallback
fires only when the root-keyed declaration stops matching, and every discriminator in the corpus
(`data-size`, `data-variant`) is stamped unconditionally — so the sole trigger is a caller replacing
the root part, and almost every family hardcodes it. The consequence is directional: **making a root
part caller-replaceable drags that family's class-B rows live with it.** Every severance repair must
therefore sweep both classes for the family it touches.

The lane's own gate failed first in the dangerous direction and it said so: three families mapped to
directories that did not exist, and the failure printed `no root emission found` — indistinguishable
from "this family hardcodes its root". It would have marked 13 rows unreachable with no evidence.
Resolving owners by the scope class they stamp turned one of the three (`semantic-surface`) out to be
**severable**, so the error pointed the wrong way as well as resting on nothing. An unmapped owner is
now `unknown`, never `safe`.

Declared blind spot on both halves: they only examine declarations in rules keyed on `root`. Seven
primitives carry default parts that are not `root` (`item`, `group`, `divider`, `meta`, `anchor`)
with the same idiom, and neither census sees them.

### The dark gap is authorship, not the compiler — and the two-option framing was mine to check

`#34` closed: **the compiler is innocent.** `brand-themes/bithire/index.ts` has `modes.dark` spanning
`:38-629` with its `chrome:` block at `:296`; `badge:` is inside it and **`segmented:` appears once in
the whole file, at `:1328` — past the close of `modes`, in the base chrome.** The compiler emits 11
dark badge channels and 0 dark segmented channels because that is exactly what it was handed.

Proved by running **both families through the same emitter**, which a single specimen could not have
settled: `chrome-variables/index.ts` maps both and contains no occurrence of "dark" at all, while the
mode split upstream demonstrably works — `--ds-badge-count-bg` is emitted twice for bithire, base and
`[data-theme='dark']`.

So the 3:1-to-8:1 ratios across bithire's 24 families are **the shape of a partially-populated
`modes.dark.chrome`**, not a branch dropping values. That reframes the work entirely: a per-family
authorship pass, and a genuinely sighted one, because someone must choose the dark values. The four
families with zero dark authorship are the starting set; the other seventeen are gap-filling against
an existing posture.

And an honest caveat the lane raised: bithire's base `segmented` values are already semantic —
`var(--ds-surface-control, …)`, `var(--ds-material-control-border, #C7D6E5)`. If those authorities
resolve correctly in dark, some of the 38 may need **no** dark override at all. Measuring which
actually change is the first step, and it is the same question as prediction flag 1.

**The framing was mine and I did not check it.** I offered "compiler drops dark" and "source never
authored it" as two live options; the chrome emitter has no dark path at all, so the first was never
possible, and one grep would have established that before the task was written. A two-option question
is a claim about the mechanism, and it needs the same evidence as any other.

### A ratio threshold with no floor fires hardest where the denominator is smallest

The authorship table's second bug, caught because the assignment named three families as correctly
placed and the lane **checked its own output against them instead of assuming a match**. It had not
matched: `approval-inbox`, `command-palette` and `moderation-gallery` each read 45, 25 and 45
channels of which **2 are non-generic** — and a 50% dominance threshold fires on a single stray name
when the denominator is 2. Adding an absolute floor of 3 alongside the share moved `unknown` from 2
to 9 and put those three where they belonged.

Same shape as the proximity grep discarded earlier tonight. Final table, and the ordering never moved:

| | DIRECT families | own channels | per family | top-5 | median generic |
|---|---|---|---|---|---|
| rottay/platform | **48 / 113** | 593 | 12 | 51% | 11 |
| bithire | 24 / 113 | 723 | **30** | 51% | 12 |
| evnto | 13 / 113 | 113 | 9 | 76% | 10 |

### Three more false zeros, and the sharpest rule yet for catching them

**A control that mirrors the code cannot fail.** A cross-family census returned a clean 0 against a
corpus with three known instances: its index was built only from the engine-suffixed class
(`rottay-button--modern`) while **the corpus writes the base class**, because a composing family
targets the primitive regardless of engine. Its 6-shape control passed straight through, having
planted the engine-suffixed spelling too. The control validated compound attribution while sharing
the implementation's assumption about which class to look for. Plant the corpus's shape, not the
code's.

**Verify a census's input before believing its output.** A second lane's check reported "HEAD: 0 dead
selectors", which would have meant its own earlier report was invented. A `git show` had failed and
written **0 bytes** — a repo-relative path passed against the cwd, `exit=128` — and postcss parsed the
empty file into a spotless zero. Caught by checking the byte count before trusting the count. *When a
census returns zero, check that its corpus is not empty: the input before the result.*

**A module-scope side effect keyed on argv is contagious to every importer.** `selectors.mjs` fires
its own control at module scope on `process.argv[2] === '--control'`, so a different module invoked
with that flag printed **9 pass / 0 fail** — someone else's control, while the caller's never ran.
Guard a census on `import.meta.url === argv[1]` and give each instrument its own flag name.

### Twenty headers repeating a premise are not twenty pieces of evidence

The worst documentation finding of the programme, and it invalidates a justification carried in about
twenty skin files.

Those headers justify their specificity ballast by citing a **P-48 floor** — a tenant rule at
`html[data-tenant]:not([data-theme]):not(.light) *`, `(0,3,1)`. Grep the shipped bithire bundle and it
appears **47 times**. Parse it and there are **zero rules**: all 47 occurrences are *comments*, this
header and its siblings, carried into the bundle by the bundler. The floor exists in none of the
three corpora anyone here can read.

> A grep finds 47 and confirms. A parser finds 0 and refutes. Prose replicated across twenty files
> may be describing the other nineteen rather than the tree.

**The ballast stays, and the reasoning for keeping it is stronger than the premise it replaces.**
Tenant paint is genuinely unlayered — 9 such rules in the bithire bundle — so it outranks every
layer including `rottay-engines`, and the non-bundled DB tenant path is the one corpus no instrument
in this programme reads. An unlayered tenant `*` there would be settled by specificity alone.
Weight preservation is therefore the only choice that **needs no premise about the corpus nobody can
see**. That is the correct way to reason under a declared unknown, and it is now what the header says,
along with an instruction not to cite the floor as measured.

Same class, still open: `segmented.css` opens with *"DELIBERATELY UNLAYERED (P-47)"*, and in the
shipped bundle it sits inside `@layer rottay-engines` because the bundler wraps it. The authored file
carries no `@layer`, so **P-47 describes the source file, not the shipped cascade position.** Every
header repeating either law needs checking against a parse rather than against its siblings.

### Reachability is a property of a COMPONENT, not of a part name

`#30` closed at 4 orphan rows present and **0 reachable**, and the headline moved from 4 to 0 because
of an instrument defect the lane found in its own output: **`trigger` is the default part of ten
primitives**, and grouping reachability by part name let `Button` — the only caller-replaceable one —
lend its severability to `Popover` and `HoverCard`, which are not. Reachability is now attributed to
the owner of the *file* the row lives in.

Two more from the same census, both pointing the dangerous way. Searching `[data-part='group']`
tree-wide loaded **16 rows of `edit-fields`** onto `InputNumber`, because `edit-fields` writes that
part for its own anatomy — the third instance tonight of a shared identifier treated as unique.
And scoping only by rendered class printed a clean zero while **dropping 28 implementations**: portal
families render an unclassed trigger wrapper, so class-scoping excluded them wholesale, and a zero
missing a quarter of its corpus looks exactly like a zero.

The census also **refuted its own motivating hypothesis**, which is the result worth keeping: `Menu`
and `List` do stamp `root`, render-proved in both engines, so their large latent counts (83/300 and
72/132) were measured against the correct anchor all along and their zeros mean what they appear to.
There was no eighth false absence there. And the **12 implementations across 5 anchors that cannot be
tied to any selector are printed every run** rather than folded into the zero.

### evnto themes at the foundation layer, not the component layer

The evnto null is two-sided, and the second side changes what it means. Across the 13 rewired
`default.css` seeds:

| vertical | overrides | inherits the rewired seed |
|---|---|---|
| rottay/platform | **13 / 13** | none |
| bithire | 11 / 13 | `bg-hover`, `bg-canvas` |
| evnto | 11 / 13 | `bg-hover`, `bg-canvas` |

So the seed rewiring **changes nothing at all on platform**, and reaches the other two through
exactly two channels each — the same two. 37 of the 39 vertical×seed cells are overridden downstream.
That is the "repaired a channel this vertical does not use" outcome, and it is nearly total.

Put beside the component-layer figures: evnto authors **zero of 185** Badge and Segmented channels
but **11 of 13** foundation seeds. evnto is not an un-themed tenant — **it themes at the foundation
layer and not at the component layer.** Its badges will differ from bithire's by inherited palette
only, and that is a deliberate-looking authorship shape rather than an omission. It is a question for
whoever owns evnto's brand, not a gap to file.

Caveat the lane attached to its own table: the override counts are per name, not per cell, so a name
overridden in light but not dark still reads as overridden. bithire declaring
`--ds-color-bg-primary: #ffffff` beside `--ds-color-bg-secondary: #151d2b` is the light/dark split,
not an inconsistency. Resolving it properly is the same per-cell question the probe answers.

### THE ANSWER: reach is near-identical, and a third of the painted surface cannot diverge at all

Measured 2026-08-11 by resolving every `var()` chain to its terminal, per cell — 381 skin files, 258
families, **14,666 painted declarations**, six cells. This is the question the programme has been
circling since the runtime census refuted the original thesis, and it is answered without a pixel.

```
CELL             VERTICAL   DS-LITERAL   FALLBACK   UNDECLARED
bithire/light        9787        2506       1980         393
bithire/dark         9739        2545       1989         393
evnto/light          8880        3148       2227         410
evnto/dark           8386        3565       2304         410
rottay/light         9830        2347       2093         396
rottay/dark          9943        2266       2061         396
```

**Families reached: 253 / 252 / 253 of 258** — a spread of ONE family, against a naming table where
bithire misses 23 and evnto misses 585.

> **The asymmetry is in NAMING, not in REACH.**

And the consequence that decides what work is worth doing:

> A declaration terminating in a DS literal, an inline fallback, or nothing is **identical across all
> three verticals by construction**. No amount of authorship moves it. bithire 33.3% light / 33.6%
> dark, rottay 33.0% / 32.2%, evnto 39.5% / 42.8%.

**A third of the painted surface is pinned to the generic layer.** The divergence this design system
can produce is bounded there, not by family authorship — so another wave of channel authoring does
not move it. That is what the naming table could not say, and it is what the sighted pass should be
checked against.

Three actionable rows beneath the headline: **evnto is the outlier and its gap is DARK** (bithire and
rottay are flat between themes at 66.7→66.4 and 67.0→67.8; evnto falls 60.5→57.2); **five families no
vertical reaches at all** — `carousel-compounds`, `oauth-transition`, `progress-compounds`,
`stats-header-keyframes`, `watermark`; and **103 families carry a spread of ≥4 declarations**, led by
`collection-header` (200/173/178) and `card-compounds` (92/67/90). That 103 is the real divergence
surface.

Declared limits: it does not model cascade between rules competing for one property, nor
`@media`/container conditions. It resolves each declaration's chain as written.

The control lifts its four terminals from the tree, and the decisive one is `--ds-font-family-base`,
which rottay authors **only in its dark-default block** — so the same declaration must read `VERTICAL`
in rottay/dark and `DS-LITERAL` in rottay/light. A control that does not invert on the dark-first
vertical cannot catch the trap this census exists for. Confirmed with a number: rottay's default block
is `:not([data-theme='light'])` carrying **646 declarations** that a light-else classifier would bin
backwards.

### CORRECTED AGAIN: segmented's 38 channels are UNCONDITIONAL, and I recorded the wrong mechanism

Both of my earlier accounts of "0 of 38 dark authorship" were wrong about the mechanism, and the
second was mine.

Measured directly — which block do the 38 live in? **Unconditional 38, light-only 0, dark-only 0.**
An unconditional channel paints in *both* themes, and the reach census shows bithire/light and
bithire/dark landing on identical 34 VERTICAL / 3 DS-LITERAL / 6 FALLBACK.

So the correct reading of "0 dark channels" is not *"it inherits in dark"* and not *"a formula one
level down delivers it"* — it is ***"it is declared once, for both themes."*** The authorship table
was counting the dark **block**, and a declaration outside both blocks is a declaration in both.

I recorded the `--ds-surface-control` explanation as the correction; that channel is indeed
dark-authored, but it is not what delivers segmented's dark paint. The defect is simpler than either
account: **the table does not count as dark what paints in dark.** Nothing is missing from
`segmented`'s dark authorship — the binning is wrong.

Same trap as rottay's dark-first block, from the other side: there the risk was classifying dark as
light; here it is classifying unconditional as neither.

### The sighted pass inverted its own target: bithire/dark is the healthiest cell

Chromium 149, drills 18/18, bundles sha-pinned, fixture captured from a real render of the shipped
composition rather than hand-written. Resting states, five cells.

```
cell             track/page  border/track  selected/track  selInk  restInk
bithire/dark        1.00         1.46           1.21        12.32    7.86
bithire/light       1.00         1.48           1.10 weak   13.65    4.76
evnto/light         1.00         1.20           1.00 FAIL   17.93    7.81
evnto/dark          1.00         1.34          18.72        17.93    2.40 FAIL
platform/dark       1.07         1.09 FAIL      1.17        13.42    3.51 FAIL
```

**The cell we suspected is the top of the healthy band.** Two real defects, neither predicted:

1. **evnto/dark unselected labels at 2.40:1** — below AA and below even 3:1, on a shipped control.
2. **platform/dark unselected labels at 3.51:1**, and it is also **the one cell with neither fill nor
   edge** — track/page 1.07 *and* border/track 1.09, under the calibrated 1.15 cut. No boundary at all.
3. evnto/light's selected chip is *exactly* the track colour (1.00) on a 1.20 hairline: selection
   carried by ink weight alone.

And `track/page` is **1.00 in four of five cells**, so "the track is the page ground" was never a
bithire quirk — it is universal, and the reformulated question *"is a border-only track still a
track?"* is a whole-DS question. Answer per cell: yes where the hairline is healthy, **no on
platform/dark**, marginal on evnto/light.

Mechanism, and it is an existing backlog row rather than a new finding:
`--ds-segmented-item-bg-selected: #ffffff` is declared once at `default.css:1968` **with no dark
counterpart**. rottay declares both arms, bithire routes through `--ds-material-control-*`, **evnto
declares neither** and inherits the base literal in both themes — a white chip on a near-black dark
track, and white-on-white in light. Identical shape to the recorded `--ds-menu-bg` row, and
`background-image: none` in the reading proves the authored gradient never fires, because the base
declaration satisfies the family var before the fallback arm is reached.

### The dark gap has TWO signatures, and one of them is a channel bithire authored that nothing reads

Measured on the same sha-pinned bundles as the segmented run. **Three of six Badge variants are
byte-identical across bithire light and dark** — success, warning and info move 0 of 7 painted
properties, while default/secondary/danger move 3/2/2.

```
variant   chip fill  ink        dark        light
success   #112726    #003d5b    1.36 FAIL   10.60
warning   #26231e    #4d3200    1.32 FAIL   10.98
info      #132035    #0f3867    1.39 FAIL   10.52
```

The light treatment is correct; it simply never adapts. Dark ink on a dark chip, worse than the
segmented failures. `box-shadow` is identical in all six — a 78% white top keyline over a light-navy
tint, unchanged on dark.

**Signature A — the compiler resolved the palette to literals.** `--ds-badge-frame` is declared once,
in bithire's **unconditional** block, as `color-mix(in srgb, #3A6FB0 16%, #D4E0EA)` — both terms
bithire's *light* values (dark primary is `#1e84e6`, dark border `#253545`). Resolved: `#bbcee1`,
which is **1.61:1 on white** (a correct subtle hairline) and **11.34:1 on the dark ground**. The frame
is inverted — subtle in light, blazing in dark. Same shape on `-frame-hover`, `-frame-pressed`,
`-selected-frame`, `-icon-border`, `-remove-border`, `-count-border`, `-focus-ring`.

> **A literal in the unconditional block has no dark counterpart and no `var()` left to re-resolve.**
> Of the 132 `--ds-badge-*` channels the skin reads: **17 move with the theme, 59 identical, 56
> empty — and the movers are exactly the ones left as `var()` references.** This is the
> formula-vs-literal law at compiler scale, from the same emitter as the 32 surface-leak rows.

**Signature B — pre-composed alpha, and it is a different mechanism.** The skin reads
`--ds-badge-tone-soft-bg: var(--ds-color-alpha-success-10)`. rottay declares light *and* dark arms for
it; **bithire declares neither**, so it inherits the base literal in both themes. The lane nearly
filed this as more signature A and was stopped by arithmetic: bithire authors its success tint at
**12%** and the measurement read **10%**, so bithire's own declaration was not what painted.

**And the consequence that matters most.** `extension.css:613` declares
`--ds-badge-success-bg: color-mix(in srgb, var(--ds-color-success) 12%, var(--ds-control-surface))` —
a formula over `var()`s, which *would* follow the theme correctly. **The modern skin never reads that
channel.**

> bithire already authored the fix. Nothing consumes it. The vertical looks authored, measures
> authored on any naming census, and paints from a base literal instead.

That is "declaration is not reach" with a live instance, and it is why the 32-name count was never
going to answer the question. It also means the `--ds-color-success` / `--ds-color-warning` repair
made earlier tonight **does not reach these badges** — they read `--ds-color-alpha-success-10`, a
different name with no dark arm.

### The counts are 6% apart because the DISTRIBUTION hides inside them

The programme's central refutation stands and now has a shape. Runtime channel counts put bithire at
1984 and rottay at 1876 — 6% apart, which killed the thesis that the verticals fail to diverge
because they lack channels. What that number could not show is **where** the channels are.

Measured 2026-08-11 across two repaired families, own-family prefixes only:

| | Badge (132 channels) | Segmented (53) |
|---|---|---|
| bithire | **43 light / 11 dark** | **38 light / 0 dark** |
| rottay/platform | 4 / 0 | 7 / 7 |
| evnto | **0 / 0** | **0 / 0** |

**evnto authors zero. Not few — zero, in both themes, across all 185 channels of both families.**

The nuance that stops this being an overclaim, and the lane stated it before I could ask: evnto does
author **430 `--ds-*` tokens, 146 of them generic** palette/surface/material, so the skins' inline
fallback chains *do* reach evnto's own colours — its primary is `#171717` against bithire's
`#3A6FB0`. evnto's badges will not look like bithire's. But they will differ **only by inherited
palette**, with no badge- or segmented-specific identity of their own.

So the working hypothesis, which is a hypothesis and not yet a finding: **bithire reads as a product
because its authorship is concentrated per family; evnto's is palette-level only.** Equal totals,
opposite distributions. If that generalises past these two families it is the answer the programme
has been looking for, and it is measurable without a single pixel.

**IT GENERALISED, AND THE HALF THAT WAS WRONG IS WHICH VERTICAL IS WHICH.** Measured across all 122
modern families, direct and indirect authorship kept in separate columns, with the two-family run
reproduced exactly as a control:

| | families authored DIRECTLY | own-family channels | top-5 concentration | indirect only | median generic ch/family |
|---|---|---|---|---|---|
| rottay/platform | **39 / 122** | 409 | 65% | 82 | 12 |
| bithire | 13 / 122 | 396 | **80%** | 108 | 13 |
| evnto | **5 / 122** | 75 | 100% | 115 | 10 |

**Platform is the broadly-authored vertical, not bithire** — three times the breadth at essentially
the same volume (409 against 396, which is the 1984/1876 runtime split seen from the family side). So
the divergence is neither volume nor "bithire concentrates and the others do not". bithire puts
**four-fifths of its authorship into five families** — input, button, tabs, badge, segmented — while
platform spreads a nearly identical budget across three times as many.

And evnto's null needed softening too: it authors **5** families, not zero — button 55, input 9, card
5, table 5, layout 1. The Badge and Segmented zeros were not a coincidence, but "evnto authors
nothing" was too strong. What is true: **evnto authors only the most generic controls and nothing
above the control layer** — no pattern, no structure, no compact-label family.

**The unexpected result is the one that answers the question.** Indirect shaping is nearly identical
across all three: median generic channels per family 12 / 13 / 10, and each vertical fails to touch
at most **2** families out of 122. Every vertical reaches nearly every family through the generic
layer at nearly the same density.

> All the divergence lives in **direct family authorship**, and none of it in indirect. The three
> verticals differ in *which families they own*, not in how much generic ground they cover. Platform
> owns broadly (39), bithire owns narrowly and deeply (13, four-fifths in five), evnto owns only the
> control layer (5). Indirect shaping is a constant, not a differentiator.

**THE CAPTION THAT MUST TRAVEL WITH THIS TABLE.** The lane that built it corrected its own inference
after another lane read two scopes it had only inferred, and the correction is wider than the flag
that triggered it:

> The direct column measures which families a vertical **NAMES**, not which families **LOOK
> different**. Wherever a DS value is a formula over inputs the vertical does author, the family
> diverges with **zero own-prefix channels**.

Concretely: bithire's segmented track has 0 of 38 own-family dark channels *and* resolves to a dark
value anyway, because `--ds-surface-control` is dark-authored one level down and the base value is
`var(--ds-surface-control, …)`. The name count was right; the identity claim drawn from it was not.

So, precisely:

- **The counts stand.** They are name counts and they are correct.
- **The inference does not.** "evnto authors zero badge and segmented channels" is true; "evnto's
  badges have no dark or brand identity" does not follow, and it was asserted more than once tonight,
  by that lane and by me repeating it.
- **The 3:1–8:1 dark asymmetry is an upper bound on outstanding work, not a backlog.** Part is
  already covered a level down; only resolution says how much.

The two-column design was necessary and not sufficient: direct and indirect were separated, and then
the direct column was still read as identity. The missing third fact is that **indirect inputs
propagate through DS formulas into families nobody named** — which is unmeasurable statically and is
exactly what the probe answers.

Honest caption for any citation: *these are the families each vertical names; divergence is at least
this and probably more.*

**CORRECTED once the prefix map was fixed — two numbers above are wrong and the mechanism is not
concentration.** Deriving each family's prefix from *what it reads* rather than from its filename cut
the misfiled families from 19 to 2 (`tree-view`, `typography`, both carried as `unknown` and excluded
from every figure rather than counted as zero):

| | DIRECT families | own channels | **channels per family** | top-5 concentration | median generic |
|---|---|---|---|---|---|
| rottay/platform | **48 / 120** | 593 | 12 | 51% | 11 |
| bithire | 25 / 120 | **724** | **29** | 51% | 13 |
| evnto | 13 / 120 | 113 | 9 | 76% | 10 |

What survives: **platform is the broadest** (48 > 25 > 13, the same ordering as 39 > 13 > 5), and
**indirect shaping is still a near-constant** (13 / 10 / 11). Both headline claims hold.

What is wrong above, and both were mine to repeat:

1. **"bithire concentrates four-fifths of its authorship into five families" is false.** It is 51% —
   *identical* to platform's 51%. Concentration does not separate bithire from platform at all. Only
   evnto is concentrated, at 76%, and that is an artefact of having 13 families to spread across.
2. **The totals no longer tie.** v1 had platform 409 ≈ bithire 396; corrected, bithire authors
   **724 against platform's 593** — *more* channels across *half* as many families.

The mechanism is **depth per family**, not concentration, and it is a better-supported statement:

> Platform owns broadly and shallowly — 48 families, 12 channels each. bithire owns narrowly and
> deeply — 25 families, 29 each. evnto owns little and shallowly — 13 families, 9 each. Indirect
> shaping is a constant across all three, not a differentiator.

The bug was dull and worth recording anyway: `'--ds-badge-x'.split('-')[2]` is `'ds'`, because the
leading `--` yields two empty segments, so every channel grouped into one bucket. **All six controls
failed on the first run**, which is the only reason it cost a minute instead of shipping.

### The dark-authorship gap has one signature, so it is one fix

Chased on the corrected instrument. Across bithire's 24 directly-authored families, own-family
channels split by cell: **4 with zero dark authorship** (`segmented` 38/0 the clean specimen), **17
light-heavy and dark-thin**, **3 at parity**.

```
input 105/38 · button 82/10 · password-input 82/28 · tabs 50/12 · badge 43/11
ratios cluster 3:1 to 8:1 — button worst at 8:1, tree-select 12:1
```

**bithire authors dark at roughly a quarter of its light density, everywhere.** Systematic, not
per-family — which makes it **one compiler fix rather than a twenty-family sweep**, and it is the
same 32-channel shape already seen on Badge and on the surface dark leak repaired earlier. The
symptom is measured; the compiler itself has not been read.

**The DIRECT column was a floor, not a count**, and the lane said so before quoting it. 19 of 122
families derive zero own-prefix channels, and most are **naming mismatches rather than genuine
non-authorship**: `data-table` reads `--ds-table-*` (120 channels), `password-input` reads
`--ds-input-*` (93), `date-picker` likewise, `back-top` reads `--ds-backtop-*`. The prefix comes from
the filename stem, so those families are misfiled into indirect-only. The relative shape 5 / 13 / 39
is unlikely to invert from a 19-family correction, but the absolutes must not be quoted until the
prefix map is fixed. Others in the 19 — `approval-inbox`, `command-palette`, `moderation-gallery` —
genuinely read only generics and are correctly placed.

Where to look for the compiler-gap signature, unchased but visible: bithire authors badge **43 light
/ 11 dark** and segmented **38 light / 0 dark**. A family authored densely in light and not at all in
dark is exactly that shape, and segmented is the cleaner specimen because its dark count is exactly
zero. If the gap is real it repeats across bithire's other twelve directly-authored families — one
query, and worth running before anyone repairs family by family.

Scope limit the lane declared and which matters for reading the table: it counts own-family prefixes,
so a vertical that shapes a family *indirectly* through `--ds-surface-control` or `--ds-material-*`
reads as "does not author" — true of the family, misleading about the intent. Flag 1 below is exactly
that case.

Three cells for the sighted pass, in value order:

1. **bithire's Segmented has no dark authorship at all, 0 of 38.** Its track resolves
   `var(--ds-surface-control, color-mix(in srgb, #EAF2FA 76%, #FFFFFF))` — a near-white literal. If
   `--ds-surface-control` is dark-authored the mix never fires; if not, that is a near-white track on
   a dark bithire page. A yes/no question, and the highest-value cell in the set.
2. **bithire's Badge is 43 light / 11 dark**, and the 32 unauthored are *the same 32* as the surface
   dark leak already fixed in this programme — one compiler gap is a likelier explanation than two
   coincidences. Badge was severed at 10 sites that rendered as bare text, so dark bithire is exactly
   where restored paint lands on values authored for light.
3. Restoring Badge puts bithire's brand blue on more surfaces — the frame is primary at 16%, and two
   of the ten restored sites are in the dense `list-toolbar`. Second family to carry that flag.

Everything above is **declared authorship, printed as formulas rather than numbers** wherever a
`color-mix`, `calc` or density multiplication is involved, because resolving those needs the cascade
and the probe is a singleton that was not run.

### A cell classifier that defaults to "light" mis-bins a dark-first vertical

The lane's first pass had these numbers wrong and said so rather than shipping the fix quietly. Its
classifier treated "not obviously dark" as light, which binned rottay's `:not([data-theme='light'])`
**default** cell as light — and rottay/platform is dark-first. Segmented went 7 light / 0 dark to
7 / 7, and every figure from before the correction is void.

It was caught by noticing that a cell labelled light was declaring `#131316`. **The instrument's
default branch encoded an assumption about the corpus that one of three verticals violates**, and no
control containing a dark-first default cell would have passed it either.

### The law has a SIGN, and both repairs moved it the safe way

The directional law as I first wrote it was incomplete. Verified by re-running the class-A census
against the tree at `ace62230d^` rather than reading a diff: Badge carried **4 class-A reads before
its repair and 0 after** — `a796001ad` closed them as a side effect of fixing its severance — and
Segmented never had orphan rows in either class. 16 families / 252 reads before, 15 / 248 after.

Both repairs re-anchored the skin onto something the caller cannot take (the scope class in Badge,
`[role='radiogroup']` in Segmented), which **de-orphans** the declarations instead of stranding them.

> A repair drags orphan rows **in the direction it moves root-replaceability.** Moving it down closes
> rows; moving it up opens them. "Every repair drags rows" is the wrong statement of it.

The dangerous direction — a repair that makes the root part *more* replaceable — has not happened
yet, and is the one to check first next time.

### A false LIVE costs a lane; a false zero costs the programme

`navigation/Link` was ranked LIVE on one production call site. The site is
`app-bithire/…/public-header/index.tsx:61`, and that file does `import Link from "next/link"`. It is
Next's Link, not ours. Resolved by import rather than by name, `primitives/navigation/Link` has
**zero importers in source** anywhere in the repo outside its own directory — the only other
references are in `storybook-static/`, which is build output. The row moves LIVE (1) → LATENT (0) and
its 30 rules are unreachable.

The cause was a declared limitation whose consequence went unchased: `callsites.json` records the tag
**as written** and resolves nothing, and `Link` is the most collidable name in the ecosystem.
Operative rule: **any row whose verdict rests on a single call site needs that site's import resolved
before the verdict is quoted.**

This is the first false **positive** of the night among a long catalogue of false zeros, and the two
fail differently. A false LIVE spends a lane on a defect that does not exist and is caught the moment
someone looks. A false zero licenses duplication and blindness, and is caught only by accident. Both
are worth fixing; only one of them announces itself.

Note this does not contradict the standing law that zero importers is not dead code. The claim is
narrower and exact: Link's **severance exposure** is zero, not Link.

**There was a second, and the right fix was the instrument rather than the row.** `display/QRCode`
also ranked LIVE on one site — and that site is **AntD's QRCode, inside our own primitive's
internals**, stamping a part onto the AntD element rather than our root. It moves to LATENT. Rather
than hand-check two rows, the lane gave `callsites.mjs` **import resolution**: it now records the
module each JSX name binds to and marks it ours or foreign, then re-ran every ranking row.

```
resolve 100% ours   Button 127 · Badge 16 · Spinner 12 · Tag 4 · Avatar 4 · Skeleton 2 · Segmented 2
false LIVE          navigation/Link · display/QRCode      — exactly the two rows resting on one site
```

The reassuring half: **Tag resolves 4 of 4 to our primitive**, one of them through
`facade/index.ts:39` re-exporting ours, so the `#26` adjudication and its committed test stand whole.
The sweep also found 38 foreign bindings and 35 locally-declared components with no import in
production, none of which is assumed ours.

This is the correct response to the false-LIVE / false-zero distinction: **a false LIVE announces
itself the first time someone looks, so the fix is not to look — it is to stop the instrument
matching by name.** Another one would be born mute otherwise.

### Two files named for the same vertical, and only one of them has the skins

My error, 2026-08-11. Asked where the cascade layers were, I searched
`src/foundation/tokens/css/facade/artifacts/bithire/index.css`, found no `@layer` and no component
rules, and reported that ordering could not be decided by layers. The conclusion was right and the
file was wrong.

```
src/…/facade/artifacts/<vertical>/index.css     2,196 lines · 0 badge rules   TOKENS
dist/<vertical>.css                           124,844 lines · 89 badge rules  THE SHIPPED BUNDLE
```

The lane I was answering had reached the same conclusion from `dist`, which is the file that
actually carries skins. **I agreed with a correct finding by looking at the wrong evidence**, which
is indistinguishable from confirming it until someone checks.

The operational half is sharper and has bitten this programme before: `dist/bithire.css` was
**3.5 hours stale** while three lanes measured against it — it still carried the 32 severed Segmented
rules after `ace62230d` had fixed them in source. Source and paint are separated by a build, so a
repair in `src` is not a repair anyone renders, and **any measurement taken against `dist` is a
measurement of whenever the build last ran**. Lanes commit source; the coordinator runs one build per
wave, because the build is a machine singleton.

**And `dist` is not one age.** Running `build:vertical-css` to land the retirement above rewrote
`dist/*.css` at 05:38 while leaving `dist/**/*.js` at 01:44 — a four-hour split inside one directory.
One half of that command bundles CSS from `src`, the other imports the compiler from `dist`, so the
same invocation refreshed the paint and could not possibly refresh the emitter that produces it. A
lane then reported "`dist` is no longer stale" from a CSS timestamp, correctly for CSS and not for
anything else.

Two consequences. Measuring "against `dist`" is meaningless without naming which half. And running
`build:vertical-css` mid-wave **captures every in-flight source edit into the bundles** — mine pulled
an uncommitted `button.css` into all five `styles/*.css` and into `dist/*.css`. Generated files, so
nothing was lost, but a lane measuring the bundle in that window would have been reading another
lane's half-finished work as shipped.

### A repeated-attribute specificity ladder is built on the step that breaks

`rustic/tag.css` carries `[data-part='root'][data-part='root']` on **31 rules**; `list-toolbar` does
the same in modern. The skin tree's own header law forbids the shape, but the sharper reason is
mechanical: repeating an attribute to buy weight **couples the specificity to the one hook a caller
can replace**. When the part is replaced the rule does not lose one level, it loses both at once —
`(0,4,0) → (0,2,0)`, against `(0,4,0) → (0,3,0)` where the ladder is built from classes.

Recovering the lost weight by doubling the class instead is the same ladder in another spelling, so
it is a decision, not a mechanical fix.

### P-79 and the skins contradict each other, and the family that documented it best got hurt

Three independent instances tonight — Segmented's two switchers, `active-filters-bar`, `TagInput`.
The mechanism is one sentence: **P-79 says the caller's `data-part` wins the root anatomy hook, and
every skin is written against the literal string `root`. Winning the hook is what kills the paint.**

`active-filters-bar.css` states both halves in its own header — the caller's part wins per P-79, and
each primitive's own skin owns its paint — and retired its hand-rolled chip chrome as duplication on
that basis. Both halves are true; together they are the defect. `TagInput` delegates the same way in
its own comment. The families that reasoned most carefully about ownership are the ones that removed
their fallback before the paint arrived.

### A single-spelling walk finds a defect at a third of its size

Badge has 218 JSX call sites across four spellings — `Badge` 160, `ModernBadge` 38, `RusticBadge`
11, `ClassicBadge` 9. Of the 16 severed sites, **9 are `ModernBadge` and 7 are `Badge`**: a walk on
the bare name finds 7 of 16, **44%**.

This is the fifth disguise of the false zero, and the first that is a false *fraction* rather than a
false absence — more dangerous, because a partial number looks like a measurement and gets reported
as one. A primitive re-exported under an engine-qualified alias must have every spelling enumerated
before any site count is quoted.

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
