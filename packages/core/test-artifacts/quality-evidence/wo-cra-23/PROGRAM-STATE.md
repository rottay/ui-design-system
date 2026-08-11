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
