# WO-CRA-23 `modern-rescue` — adversarial audit brief

**For an independent auditor. Your job is to falsify what is written here, not to summarise it.**

This programme ran one overnight session on `ui-design-system`, ~300 local commits, none pushed.
Every claim below is stated with the evidence that produced it and the command that re-derives it.
Where a number is a floor rather than a total, it says so. Where we did not verify something, it is
listed in §7 rather than omitted.

**Write the resulting report to** `/docs-engineering/archive/audits/YYYY-MM-DD-wo-cra-23-audit-{user}.md`.

---

## 0. How to attack this efficiently

The programme's own failure modes are the fastest attack surface, because they recurred:

1. **A green that does not name its scope.** Four contracts described a compiler that no longer
   exists with no visible red, because nobody ran the suite whole. Assume more of these exist.
2. **A count that is a floor.** Every re-measured scope collapsed — 585→333, 35→3, 16→13. Assume any
   headline number is an upper bound on confidence, not on size.
3. **A mechanism argument instead of an outcome test.** Every time one was tried it lost. Look for
   claims justified by reading source rather than by running something.
4. **A control that mirrors the code rather than the corpus.** Several instruments passed their own
   controls while sharing the implementation's blind spot.

**A claim about a repaired state is not verifiable at HEAD.** Every repair in §2 removed the thing
it describes. Where a pre-repair commit is needed the section says so; where it does not, ask for one
before recording the claim as unfounded. This is the failure mode of citing an audit at the wrong
commit, and it applies to this brief as much as to anything it describes.

**The single most valuable thing you can do:** re-run
`pnpm --filter @rottay/design-system exec vitest run --project unit src/foundation/tokens` (40 files,
355 tests) and every gate below at HEAD, then check whether the numbers in §2 still hold. We only
discovered that command mattered near the end.

---

## 1. What the programme set out to do, and what changed

**Goal, unchanged:** *from each tenant's configuration, the same React tree must render as genuinely
different companies.*

**The coordinator's opening thesis was wrong and was refuted by measurement**, not by argument: the
verticals were assumed to under-diverge because they lack channels. A runtime census put bithire at
1984 channels and rottay at 1876 — 6% apart. **Audit target: was the refutation itself sound, or did
the census measure the wrong thing?**

What replaced it is in §2.1 and is the programme's central claim.

---

## 1A. The inherited programme, and why it was replaced

**This work did not start from nothing. It replaced a formal programme mid-flight, and an auditor
should judge whether that replacement was justified or convenient.**

### What was inherited

A rounds-based plan, **R0 through R7**, with sealed evidence per round, hashed manifests, admission
packets, per-batch status notes and round report templates. Its governing artifacts:
`visual-craft-contract.json` (20 categories / 120 checks / 12 hard-veto incidents),
`tenant-art-direction.json` (≥8 observable axes, ≥6 of them non-colour, on the same tree),
`customization-model.json`, `quality-rubric.json`, and the lane classes and `reservedPaths` from
`agent-orchestration.json`.

### The state it was actually in

**The formal programme had stalled at R1 Cohort 1 with a NO-GO, while the tree ran ~67 commits of
R2/R3/R4 work with zero filed status and no sealed evidence.** Two hard vetoes were never cleared —
responsive overflow (`scrollWidth` 332 against 320/280 viewports, both tenants) and focus not proven
— plus five capture-harness defects including Next's dev-tools badge in every capture and
reduced-motion captures that were not distinct.

So the ceremony had stopped producing evidence while the work continued producing changes. That gap
is the reason for the replacement, and it is the first thing to check.

### What was kept and what was dropped

```
KEPT   the binding quality law: visual-craft-contract, tenant-art-direction,
       customization-model, quality-rubric, the lane classes, reservedPaths,
       and every fence — no tenant selector or tenant-conditional TSX, no second
       compiler/engine/icon supplier, no public --ds-* minted by a family lane,
       no hand-edited styles/** or dist/**, no test or baseline weakened to
       preserve a defect.

DROPPED  per-round seals · hashed evidence manifests · admission packets ·
         per-batch roadmap:status notes · round report templates.
         Replaced by ONE durable ledger and ONE status note per block.
```

### What each round became

| round | disposition |
|---|---|
| R0 | sealed and valid; the instrumentation stands |
| R1 | **NO-GO still standing** — its canaries became verification for the new programme |
| R2–R4 | **executed, unsealed** — families touched, none reviewed. That unfinished content *is* the plumbing work |
| R5 | was "canon closure" — became the manifest programme, much larger than planned |
| R6 | was Codex certification — **replaced by the Fable ↔ Kimi loop** (§1B) |
| R7 | customization depth — became the sixteen-control set |

### The reason the change was made, stated as a claim you can attack

> The R-rounds measured from the **family** side. This programme measures from the **tenant** side.
> Both are needed, and **the R-rounds can pass while two tenants still read as one product — which is
> what happened.**

**Audit targets.** (a) Is that framing correct, or was the family-side measurement abandoned because
it was failing? (b) **R1's NO-GO is still standing and was never cleared** — responsive overflow and
focus remain unproven, and no new gate was built for them this session. (c) The five capture-harness
defects were never repaired; the sighted capture in §2.6 used a different harness built from the
resolution probe. (d) Was dropping the seals a loss of auditability, or of ceremony? This brief and
`PROGRAM-STATE.md` are the replacement — judge whether they carry the same weight.

---

## 1C. The plan as it now stands — audit this against what was executed

**Codex holds the R0–R7 plan. That plan is superseded. This section is the current one, stated so
plan-versus-execution can be audited as a gap.**

### The programme in one line

Make a small set of tenant controls move many downstream properties, so the same React tree renders
as different companies — and **prove it by measurement from the tenant side**, not by certifying
families from the family side.

### The four phases, and where execution actually is

| phase | intent | executed? |
|---|---|---|
| **P1 Plumbing** | make declared paint reach the screen: severance, dead channels, illegible values, unreachable literals | **substantially, and it is where the session ended** |
| **P2 Measurement** | answer whether the verticals can diverge at all, and by how much | **done — this is the reach census and it changed P3** |
| **P3 Elevation** | take families to the Quiet Premium standard | **NOT STARTED. Zero families carry a review verdict.** |
| **P4 Certification** | independent audit, sighted acceptance per block | **partial — one family, six cells** |

> **The honest state: this session was P1 and P2. P3 has not begun.** `family-ledger.json` shows 206
> of 252 rows `SOURCE_TOUCHED`, and its own vocabulary says that means only that a file was edited —
> not elevated, not reviewed, not compliant. **`reviewVerdict` is unset on every row.**

### What P2 did to P3, and this is the part worth auditing hardest

The reach census found that **~⅓ of all painted declarations terminate in a DS literal, an inline
fallback, or nothing — identical across all three verticals by construction.** That bounds what
elevation can achieve and makes "elevate all 252 families" partly futile as a goal.

**Audit target:** is that conclusion sound enough to re-scope a programme on? If it is, P3 should be
re-planned around the 103 families carrying a ≥4-declaration spread rather than around the full 252.
If it is not, P3's original scope stands and the census mis-scoped the work.

### The fences, unchanged from the inherited plan and still binding

```
no tenant selector, no tenant-conditional TSX
no second compiler, engine, or icon supplier
no public --ds-* minted by a family lane          ← see §2A: the engine skin layer breaches this today
no hand-edited styles/** or dist/**
no test or baseline weakened to preserve a defect
```

### The verification contract for a family to be called DONE

Declared, never executed at scale this session:

1. one named observable defect closed, with a before/after — **not** a token rename, a selector tweak
   or a green test alone
2. token reads only through the chain: foundation → semantic channel → recipe/anatomy →
   family-private `--_ds-*` → stable DOM part
3. every visible string keyed in all five locales, RTL-safe
4. container-aware at 320 / 390 / 768 / 1440; mobile a simplified posture, not a compressed desktop
5. a focused test under the family's `tests/` **and** a probe scene so it is visually observable
6. ledger row updated with state and evidence
7. adversarial review accepts it

**Audit target:** items 3, 4 and 5 were not applied to any family this session. Check whether any
family was called finished without them.

---

## 1B. How the two auditors were used

Codex certification (R6) was replaced by a **brokered two-auditor loop**. It is not a redundancy
scheme and should not be judged as one.

| auditor | sees | answers |
|---|---|---|
| **Fable** | the diff | *does this change do what it claims?* |
| **Kimi** | the repository | *is what it claims true against the code?* |

Both audit every wave. **They are never merged into one review and never replaced by a single
model.** They cannot address each other directly — Fable is a subagent, Kimi is a separate CLI — so
the coordinator brokers: each audits independently, then **Kimi receives Fable's verdict as input and
must explicitly refute or confirm it.**

> The point of two auditors is not redundancy. Where they agree, the information is low. **Where they
> disagree is the finding.** A brokered loop preserves that; letting them converge destroys it.

A wave does not close while either auditor holds an unrefuted hard finding.

**Audit targets.** (a) The coordinator is the broker, so **the coordinator is a single point of
failure in the loop** — check whether any verdict was softened in transit. (b) At least one recorded
adjudication has both auditors wrong in opposite directions; find whether that pattern recurs.
(c) Model routing was Opus for delicate work, Sonnet for mechanical, Fable read-only as adversarial
reviewer — check whether anything delicate was routed cheaply.

---

## 2. Claims, with their evidence and how to break them

### 2.1 CENTRAL — reach is near-identical; ~⅓ of painted surface cannot diverge

```
families reached      bithire 253 · evnto 252 · rottay 253   of 258
naming table          spread of 562 families
terminal in DS-literal / inline fallback / undeclared
                      bithire 33.3% light · 33.6% dark
                      rottay  33.0%       · 32.2%
                      evnto   39.5%       · 42.8%
```

Method: every `var()` chain in 381 skin files resolved to its terminal, per cell — 258 families,
14,666 painted declarations, six cells. Instrument and control in `harness/primitives/`.

**Attack it:** the census resolves each declaration's chain *as written* and explicitly does **not**
model cascade between rules competing for one property, nor `@media`/container conditions. Does that
omission change the ⅓? Its control lifts four terminals from the tree, the decisive one being
`--ds-font-family-base`, which rottay authors only in its dark-default block — the same declaration
must read `VERTICAL` in rottay/dark and `DS-LITERAL` in rottay/light. **Check that the control
actually inverts.** rottay is dark-first and its default block is `:not([data-theme='light'])`
carrying 646 declarations; a light-else classifier bins it backwards, and one instrument did exactly
that before correction.

### 2.2 The authorship table counts names, not identity — and was corrected twice

```
                DIRECT families   own channels   per family   top-5   median generic
rottay/platform      48 / 113           593          12        51%         11
bithire              24 / 113           723          30        51%         12
evnto                13 / 113           113           9        76%         10
```

**Two published versions were wrong before this one.** v1 claimed bithire concentrated 80% of its
authorship into five families — it is 51%, identical to platform's. v1 also had the totals tying at
396/409; they do not. The mechanism is **depth per family**, not concentration.

Caveat we attached ourselves and which you should test: **the direct column measures which families
a vertical NAMES, not which look different.** A vertical diverges with zero own-prefix channels
wherever a DS value is a formula over inputs it does author. Honest caption: *these are the families
each vertical names; divergence is at least this and probably more.*

**Attack it:** the prefix map derives from what each family reads, corroborated against the filename
or requiring ≥50% dominance **with an absolute floor of 3**. That floor was added only after three
families were misfiled by a ratio with no floor. Are there others?

### 2.3 Severance — the largest defect class, repaired

`data-part` is the anatomy hook; P-79 gives the caller's value priority; every skin was written
against the literal `root`. So a composing family that names a part **deletes the primitive's whole
skin**.

| family | exposure | repair |
|---|---|---|
| Button | 123 of 127 production sites, 38 files, 411 declarations | `[data-variant]`, weight-identical at 7 selectors — **a DIFF claim, verify at `cb1e3645f`** |
| Badge | 16 sites / 9 patterns, 10 truly bare | scope class at (0,2,0), **deliberately below** the (0,3,0)–(0,4,0) pattern rules |
| Segmented | 2 shipped switchers, 29 selectors / 97 declarations | `[role='radiogroup']`, weight-identical |
| list-toolbar | 34 selectors / 117 declarations, dead against its own engine | `[data-variant]`, weight-identical |
| Tag | 3 of 4 sites, two engines | adjudicated, **deliberately unshipped** — specificity drops unequally |

Second-order, invisible to any "properties lost" measurement because the suffering rule stays alive
and matching: **`prefers-reduced-transparency: reduce` was silently not honoured on 123 buttons** —
its one suppressing declaration lived inside the severed block.

**The "7 selectors" is a property of the repair diff, not of the file.** `git show cb1e3645f` has
exactly seven `[data-part='trigger']` selector lines re-keyed. At HEAD `button.css` has **one**
selector block on bare `[data-variant]` and 71 selectors mentioning it, so a naive re-count gets
anything but 7. The zero-on-`trigger` and zero-on-`root` claims do hold at HEAD — the only remaining
textual hits are comments.

**Attack it:** Badge's repair drops specificity on purpose. We measured 0 of 6 compensated sites
losing pattern paint, in Chromium against three shipped bundles. Re-measure. Also check the claim
that `[data-variant]` is total — it was asserted across a 28-cell matrix, not read off the source.

### 2.4 Contrast — eight failures on shipped controls, repaired

```
platform/dark segmented label   3.51 → 6.32      evnto/dark label        2.40 → 7.77
Badge success dark              1.36 → 6.62      Badge warning dark      1.32 → 7.04
Badge default light             3.82 → 10.09     Badge default evnto/dark 4.39 → 8.58
DS semantic success text        41.3 → 56.7 Lc   DS semantic warning     38.8 → 55.5 Lc
```

**Three of these were not regressions — a repair stopped hiding them.** The semantic colours failed
because the light block's `--ds-color-bg-primary` had been `#0A0A0C`, a near-black contaminating the
light block; fixing that revealed colours that were never legible on a real light ground. Same shape
twice more.

**Attack it:** `bithire` was held byte-identical as the control for the base change — verify that.
And Badge `info` dark reaches only **3.68**, still under AA, declared and not repaired.

### 2.5 A public surface that shipped 2,248 lines and painted no colour

**Verify this one at `646151dc4^`, not at HEAD.** The repair renamed the namespace, so today the
tree has **zero** `--rh-*` reads and a naive check reads the claim as fabricated. At `646151dc4^` the
file carries **182** of them.

`oauth-transition` read `--rh-*`, a namespace **declared in zero files**, with no fallbacks — every
colour-bearing declaration invalid at computed-value time. Partition: 156 declarations lost across 8
properties, all chromatic; 966 survive across 69, all geometric. Repaired by renaming into the
private composition namespace and declaring 13 channels once, mapped to DS channels, with glow
derived from the tenant accent via `color-mix`.

**Attack it:** three foreign namespaces were found this way (`--rh-*`, `--rt-*`,
`--ds-progress-line-*`). **Are there more?** The instrument that finds them is a var-chain resolver,
not a grep.

### 2.6 The sighted evidence, and the run that was thrown away

Six captures in `sighted/`. Read them as three products.

**The first run of that capture came out untenanted and identical** — `rootAttributesToHtml` takes
the attributes object and was handed the scope, so all six rendered at the DS default primary. Six
images that would have "proved" the three verticals look the same. Kept run asserts the resolved
root attribute and primary per cell.

**Attack it:** one variant family of four, one provider, one phase, resting states only. Is the
conclusion robust to the other three variant families?

---

## 2A. The manifest — families, layers, and where a token is allowed to live

Two artifacts carry this and **both are living documents**. The brief summarises; the files are the
authority.

### `family-ledger.json` — 252 rows, the completion ledger

Row shape: `id · layer · category · family · sourceOwner · layerProfile · state · sourceCommits ·
lastCommit · lastCommitDate`. Seven `layerProfile` values.

```
layer      primitive 100 · pattern 56 · surface 36 · structure 27 · chart 18 · commercial 11 · surface-composition 4
state      SOURCE_TOUCHED 206 · UNTOUCHED 35 · TESTS_ONLY 11
```

**Its `stateVocabulary` is deliberately negative and you should hold it to that.** `SOURCE_TOUCHED`
means only that a non-test file under `sourceOwner` was edited — *not* done, elevated, reviewed or
compliant. `UNTOUCHED` does *not* mean unstyled. `TESTS_ONLY` does *not* mean covered. The verdict
column (`reviewVerdict`) **is not set by this file and was never populated**.

> **Audit target.** The state column was not reconciled against the work actually done in this
> session. Treat all 252 rows as stale, and check whether `SOURCE_TOUCHED` 206 is being read anywhere
> as progress.

### `TOKEN-MANIFEST-SPEC.md` — 867 lines, 45 sections, the token law

It tags every figure by evidence class, and **revision 2 downgraded several of its own revision-1
numbers** from measured to unverified:

```
[M] MEASURED     reproducible from a COMMITTED script over a stated corpus
[U] UNVERIFIED   asserted from an ad-hoc script never committed —
                 directionally load-bearing, NUMERICALLY UNUSABLE
[D] DECLARED     a human wrote it; a gate checks it against measurement
[O] OPEN         owner decision required; nothing downstream may assume an answer
```

**Audit target: every `[U]` figure below is quoted in the spec and must not be consumed by any gate
or target until re-derived.** Check whether any has leaked into one.

### The nine declaration layers — where a token may be declared

**All paths below are relative to `packages/core/src/foundation/tokens/css/` unless they begin with
`packages/`.** The token spec writes them relative to that root and the first draft of this brief
copied them unprefixed, which makes them unresolvable — an auditor flagged exactly that.

| # | layer | distinct names | declared in (under `packages/core/src/foundation/tokens/css/`) |
|---|---|---:|---|
| 1 | raw ramps | **453** [M] | `foundation/base/*` |
| 2 | semantic role channels | 1,075 [M] | **one file** — `foundation/themes/default.css` |
| 3 | component channels | 1,949 **[U]** | `presentation/components/*.css` |
| 4 | family skin | 124 names / 30 declaring files [M] | `presentation/components/skin/` (146 files) |
| 5 | engine skin | 214 modern / 4 rustic [M] | `runtime/engines/*/skin/` |
| 6 | generated vertical artifacts | 1,910 total, **605 exclusive** [M] | `facade/artifacts/*` |
| 7 | private `--_ds-*` | **99 declared**, 310 mentions [M] | co-located with the family |
| 8 | framework projection | 28 [M] | `framework-token-projection.css` |
| 9 | runtime TS channels | ~356 **[U]** | `packages/core/src/foundation/tokens/ts/`, `packages/core/src/ui/**` |

**Total distinct declared across `src/**/*.css`: 4,164 — CORRECTED BY AUDIT, read the qualifier.**

> **This figure is `--ds-*` ONLY, at commit `d3cb7dec0`, and the brief did not say so.** Distinct
> custom properties overall were **4,418** at that commit and are **4,506** at HEAD; the 4,164
> silently excludes `--_ds-*` (97 then, 182 now) and ~157 names in other namespaces. At HEAD the
> `--ds-*` count is 4,167.
>
> **Two rows of this table reproduce under no counting method and their `[M]` tags are unfounded.**
> L1 claims 453, measures 320 distinct / 360 occurrences. L4 claims 124 names in 30 files, measures
> 236 in 147. **No committed script reproducing any layer row was found** — so every `[M]` in this
> table should be read as `[U]` until one exists. That is exactly the failure §0 warns about, wearing
> the tag that exists to prevent it.
>
> Row 5's numerator survives: 182 exclusive, confirmed exactly. Its denominator was 214 at the spec's
> commit and is **218 at HEAD**, because `7516eaa37` — this programme's own commit — added three
> `--ds-button-*-shadow` names after the spec was written.

Two structural facts the spec names, both of which an auditor should press on:

- **The engine skin layer AUTHORS.** 182 of 214 modern-skin names are declared in **no other layer**.
  A family lane mints public channels, and **there is no guard against it today.**
- **Layers 3–5 are unreachable through `tokenOverrides`** but ARE reachable through `chrome`, which
  kebab-cases chrome objects into `--ds-*` names. So the documented tenant surface and the real one
  differ.

### Where a token is allowed to live — the rule this programme applied

```
foundation/base/*                      raw ramp steps. Values, not roles.
foundation/themes/default.css          semantic roles. The ONLY file for layer 2.
                                       Light block + dark block; a value belonging to one
                                       theme must not sit unconditional.
presentation/components/*.css          component channels — the DECLARED OWNER of a family's
                                       public channels. A channel found elsewhere has left
                                       its owner; return it, do not move the contract.
presentation/components/skin/*.css     STRUCTURES — .ds-structure .ds-<family>
runtime/engines/<engine>/skin/*.css    PRIMITIVES + PATTERNS. An engine with richer
                                       vocabulary DECLARES its own value here rather than
                                       smuggling it through a fallback arm.
facade/artifacts/<v>/_source/*.css     ONE vertical's palette. Hand-authored. Costs no
                                       client bytes — prefer this over the brand-theme TS.
facade/artifacts/<v>/index.css         GENERATED. Never hand-edit; lint:artifacts fails.
tokens/ts/…/brand-themes/<v>/index.ts  the vertical's typed theme. 43% of a "use client"
                                       entrypoint. Even a one-line comment can breach the
                                       byte budget — put the why in the commit.
--_ds-<family>-*                       family-private. Correct for composition internals,
                                       and a COUNTER-DODGE when used to hide a literal that
                                       should be tenant-reachable.
```

**Audit target:** that last distinction is a judgement call the programme made repeatedly. Check
whether any `--_ds-*` introduced this session is hiding paint a tenant should reach.

---

## 3. Rulings — architecture decisions taken by the coordinator, not the owner

Each is a decision an auditor may disagree with. All were taken under the standing law that
aesthetic and typographic choices are never escalated.

1. **Prefer an anchor the caller cannot remove** over one it merely happens not to use. Test is not
   "is the attribute present" but "can a caller remove it" — a question about the engine's prop
   spreading, not the CSS.
2. **Weight preservation is correct only when nothing competes in the band you would occupy.**
3. **A family compensation expires when its underlying channel is fixed.** Removing it is part of the
   repair, and only its author remembers it exists. Demonstrated: a segmented patch would have become
   the one place still below the band after the authority was raised.
4. **`oklab` over `oklch`** — the mix's second endpoint is the page ground, achromatic, and hue is
   undefined at chroma 0, exactly where cylindrical interpolation is unstable. Attributed to
   `8d2062008`, a deliberate `feat`. **Four contracts name `oklch` and are aged.**
5. **The fill is not supposed to separate; the edge is.** `track/page` is 1.00–1.07 in all five
   cells. A border-only track is still a track when the border is healthy.
6. **Do not mint a public channel for one surface** — derive from the tenant accent instead.
7. **Retire an undeclared chain arm; never declare it.** Declaring a name that was undeclared flips
   every read site at once without any being edited.
8. **A dark ramp spaced linearly in hex cannot express a boundary.** rottay's eight steps span
   `#0A0A0C`–`#252529` and produce 0.19 of contrast spread; it got a new rung (`#28282C`) rather than
   a re-point.
9. **A three-declaration repair in a brand theme blew a public entrypoint budget.** 43% of
   `runtime/tenant` is brand-theme source reachable from a `"use client"` entrypoint. Repairs were
   routed to `_source/extension.css` instead. **This is unresolved architectural debt, not a fix.**

---

## 4. Self-corrections already made — check for the ones we missed

Listed so you can calibrate how much we caught ourselves. **The existence of this many suggests more
remain.**

| retracted claim | corrected to |
|---|---|
| "`Text` never painted at 28px on three dashboards" | happy-dom's typed parser, not the component |
| "199 deliberately unlayered headers", then 155 | **9** — the matcher counted three senses of one word |
| "bithire authored the fix and nothing reads it" | engine-scoped: `classic/theme.css:662`, `rustic:724` read it |
| "an `xs` tag renders at `md` height" | the pill loses its height entirely; the **close button** carries the wrong one |
| "`list-toolbar` is a false positive" | true of one reading; nine other channels are genuine |
| "segmented gets dark paint via a formula one level down" | its 38 channels are **unconditional** and paint in both themes |
| "the static ramp is missing rungs at the top" | the unbindable value is **1.875rem**, a missing *middle* rung; there are **two** gaps |
| "bithire concentrates 80% into five families" | 51%, identical to platform |
| "the compiler stopped emitting the tone channels" | it emits all 25 — the contract names the wrong colour space |
| "`--ds-color-bg-canvas` dark is an orphaned literal" | a documented deliberate pin the coordinator himself wrote |

---

## 5. Instruments — audit these, not just their outputs

All in `harness/primitives/`, each with a control set and a README carrying its traps.

```
datapart.mjs · selectors.mjs · callsites.mjs · engine-pin.mjs · join.mjs
void-reads.mjs · fallback-reads.mjs · crossfamily-parts.mjs · nonroot-parts.mjs
render-census.test.tsx
```

Known instrument defects **found and fixed during the programme** — verify the fixes:

- a root resolved one level short made 4 of 5 corpora silently report ABSENT
- a `var()` walker skipped nested reads, hiding the family it was written for
- `callsites.mjs` matched JSX tags by name until import resolution was added — it then found **two**
  false LIVE rows (`Link` bound to `next/link`, `QRCode` to AntD's)
- a reachability gate grouped by part name, letting `Button` lend its severability to two primitives
  that do not have it
- a ratio threshold with no absolute floor fired hardest where the denominator was smallest
- a cell classifier whose default branch assumed light mis-binned the one dark-first vertical

---

## 6. Verification commands

```bash
cd ui-design-system
pnpm --filter @rottay/design-system run typecheck
pnpm --filter @rottay/design-system run lint:artifacts     # BEFORE build — build regenerates in place
pnpm --filter @rottay/design-system run gates:ci
pnpm --filter @rottay/design-system exec vitest run --project unit src/foundation/tokens
pnpm --filter @rottay/design-system run test:run
pnpm --filter @rottay/design-system run build               # last
node packages/core/scripts/engine-token-audit.mjs --check
```

Traps that produce false results:

- **A fresh worktree has no `node_modules`** and returns `ERR_MODULE_NOT_FOUND`, which reads exactly
  like a failing gate. Symlink from the repo root and from `packages/core`.
- **`dist` is not one age.** `build:vertical-css` rewrites `dist/*.css` from `src` while leaving
  `dist/**/*.js` untouched, because the artifact half imports the compiler *from* `dist`.
- **Capture exit codes directly, never through a pipe.** A trailing command eats them — a build
  exited 1 three times while the harness reported 0.
- **`rg -r` is `--replace`,** not recursive, and silently corrupts output.

---

## 7. What we did NOT verify — audit these first

1. **Six token contracts were red before the session and four remain red.** `elevation-surface-lift`
   and `reduced-motion-guard` are untouched. `root-component-authority` is repaired but incomplete —
   the contract names one channel at a time and exposed `-hover` after three were fixed.
2. **No full `test:run` was executed at HEAD.** Gates, typecheck, `lint:artifacts` and targeted
   suites are green; the whole suite is unverified.
3. **The visual evidence covers one family in six cells.** No contact sheet across the tier.
4. **`track/page` at 1.00–1.07 and evnto/light's chip-equals-track** are classified as design
   questions rather than failures. That classification is a judgement, not a measurement.
5. **The entrypoint byte debt** — 43% of a `"use client"` entrypoint being brand-theme source — was
   documented and worked around, never fixed.
6. **Three foreign namespaces were found by accident.** No systematic sweep was run for others.
7. **`family-ledger.json` has 252 rows** and was not reconciled against the work actually done this
   session. Treat its `state` column as stale.
8. Whether the repairs **look** right beyond the six captures. The programme's own standard was that
   a paint change on a shipped surface wants eyes; most of them did not get any.
