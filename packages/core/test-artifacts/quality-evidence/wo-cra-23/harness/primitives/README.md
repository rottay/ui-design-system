# Primitives-tier census harness

Measures **what a caller can take away from a primitive**, across all 89
engine-backed primitives in `src/ui/primitives`. Sibling of the base-layer
harness one directory up; that one measures channels, this one measures the
component boundary.

Run everything from this directory. Node only, no build step — except the render
harness, which needs vitest.

---

## The ranking. Read this before the numbers.

Rank is **CSS at risk × production call sites**, never rules alone. The largest
count in the tier costs nothing today; the row that a person would actually see
is eighth by count.

| # | primitive | engine | rules | decls | prod call sites | verdict |
|---|---|---|---|---|---|---|
| 1 | `navigation/Segmented` | modern | 29 | 100 | **2** | **REPAIRED** `ace62230d` |
| 2 | `inputs/Button` | modern | 7 | 47 | **127** | **LIVE** |
| 3 | `display/Badge` | modern | 29 | 110 | **16** | **REPAIRED** `a796001ad` |
| 4 | `display/Tag` | modern + rustic | 70 | 122 | **3** | **LIVE**, adjudicated (task #26) |
| 5 | `feedback/Spinner` | modern | 1 | 4 | 12 | LIVE |
| 6 | `display/Avatar` | modern | 1 | 7 | 4 | LIVE |
| — | `feedback/Skeleton` | modern | 1 | 2 | 2 | LIVE, marginal |
| — | `navigation/Link` | modern + rustic | 30 | 51 | **0** | **LATENT** — see trap 9d |
| — | `display/QRCode` | modern | 3 | 8 | **0** | **LATENT** — see trap 9d |
| — | `navigation/Menu` | modern | **83** | **300** | **0** | LATENT |
| — | `display/List` | modern | 72 | 132 | 0 | LATENT |
| — | `display/Descriptions` | modern | 40 | 129 | 0 | LATENT |
| — | `display/Timeline` | modern | 37 | 89 | 0 | LATENT |
| — | `feedback/Rate`, `display/Image`, `display/Empty`, `layout/Divider` | | 14 / 12 / 6 / 6 | | 0 | LATENT |

**Segmented is first because of what its callers already did.**
`view-mode-switcher` and `scope-switcher` both render
`<ModernSegmented data-part="switcher">`, which replaces `data-part="root"` and
kills all 29 rules in `segmented.css` — background, border, radius, shadow,
padding, height, transition, `forced-color-adjust`. `view-mode-switcher.css`
states the composition law in its own header (*"`segmented.css` owns option
chrome, the selected state and its own forced-colors contract"*) and records
that it **deliberately retired its own frame paint** on that basis. The family
deleted its compensation in favour of a channel its call site severs. That is
the `search-command-bar` law running backwards: that family was compensating for
lost primitive paint, this one removed its compensation and trusts paint that
never arrives.

**LATENT is not safe, it is unpriced.** Menu's 83 rules cost nothing only
because nobody passes it a part. It is a trap for the next lane that stamps one,
not a defect to schedule.

---

## REACH, not naming — and reach is nearly identical

The authorship table counts which families a vertical **names**. `reach.mjs`
resolves every painted `var()` chain through one cell's declaration order until
it terminates, which answers the different and load-bearing question: **does the
resolved value actually differ?** 381 skin files, 258 families, 14,666 painted
`var()` declarations, six cells.

```
CELL            VERTICAL   DS-LITERAL   FALLBACK   UNDECLARED
bithire/light       9787       2506       1980        393
bithire/dark        9739       2545       1989        393
evnto/light         8880       3148       2227        410
evnto/dark          8386       3565       2304        410
rottay/light        9830       2347       2093        396
rottay/dark         9943       2266       2061        396
```

**Families reached: 253 / 252 / 253 of 258.** A spread of ONE family, against a
naming table where bithire misses 23 and evnto misses 585. **The asymmetry is in
naming, not in reach** — which is the finding, and it is bigger than the table
it corrects.

**The divergence ceiling.** A declaration terminating in a DS literal, an inline
fallback, or nothing is identical in all three verticals *by construction*: no
amount of authoring moves it.

```
bithire   33.3% light · 33.6% dark      cannot differ, whatever anyone authors
rottay    33.0% light · 32.2% dark
evnto     39.5% light · 42.8% dark
```

So roughly **a third of the painted surface is pinned to the generic layer**.
The divergence we can produce is bounded there, not by family authorship — and
another wave of channel authoring cannot move it.

**Evnto is the outlier, and its gap is dark.** bithire and rottay are flat
across themes (66.7→66.4, 67.0→67.8); evnto drops 60.5→57.2. It is the only
vertical that reaches materially less in dark than in light, which is a
different defect from "evnto names fewer channels".

**Five families no vertical reaches at all** — and they split FOUR ways, not
three. "Unreached" turned out to name four different things, only one of which
is a tenant-reach question at all:

| family | rows | why no vertical reaches it | verdict |
|---|---|---|---|
| **`oauth-transition`** | **156** | reads `--rh-*`, a namespace **nothing in the monorepo declares**, with **no fallback on any of the 156** | **DEAD PAINT — the largest single finding in this lane** |
| `progress-compounds` | 4 | `--ds-progress-line-{trail,radius,fill}` undeclared, no fallback | dead paint, small |
| `watermark` | 3 | 2 undeclared without fallback, 1 degrades | mixed |
| `carousel-compounds` | 2 | `--ds-carousel-item-bg{,-image}` undeclared, **fallback fires** | degrades and paints; simply not tenant-reachable |
| `stats-header-keyframes` | 3 | `--_ds-*` private composition variable, `opacity` inside a keyframe | **correct as-is** — theme-neutral by construction |

**`oauth-transition` is not a reach defect, it is dead paint on a shipped
surface.** 338 rules; 156 declarations read `--rh-glow`, `--rh-bg`, `--rh-ink`,
`--rh-accent` and ten more. Zero of those names is declared anywhere — not in
the CSS tree, not in the screen's own TSX, not in the composed bundles, which
carry only reads. Every one of the 156 is a bare `var()` with no fallback, so
each declaration is invalid at computed-value time and drops entirely:
backgrounds, gradients, colours, shadows, borders. The surface is **publicly
exported** from `entrypoints/public/surfaces/oauth-transition/` and its screen
stamps the scope class 102 times.

The reach census could only ever report this as "no vertical reaches it",
because a vertical cannot reach a namespace the design system does not own.
**The right question for an unreached family is not "which vertical should
author it" but "is the channel a DS channel at all"** — and asking the first one
first would have produced an authoring work order for paint that no value can
switch on.
**103 families** have a three-way spread of ≥4 declarations — that is the real
divergence surface, and `collection-header` (200/173/178) and `card-compounds`
(92/67/90) lead it.

**Method and its limits.** Termination obeys the fallback-inert law: `var(--a, X)`
reaches `X` only where `--a` is undeclared *in that cell*, so the walk is a
property of the cell and not of the text. Cells are binned by the **block
opener**, tested negations-first — `:not([data-theme="dark"])` contains the
substring `[data-theme="dark"]`, and **rottay is dark-first**, its default block
being `:not([data-theme='light'])`; a classifier defaulting to light mis-bins 646
of its declarations. What this does *not* model: cascade between competing rules
for the same property, and `@media`/container conditions. It resolves each
declaration's chain as written, which is the question asked.

Control: four terminals separated on shapes lifted from the tree, not invented —
`--ds-surface-control` (bithire authors it), `--ds-surface-card` → a DS literal,
an undeclared name, and `--ds-font-family-base`, which rottay authors **only in
its dark default block**, so the same declaration must read VERTICAL in
rottay/dark and DS-LITERAL in rottay/light. A control that cannot invert with the
dark-first vertical cannot catch the trap this census exists to avoid.

## Orphan channels: class A disappears, class B lies

```
class A  reads the void       the declaration is severed · paint DISAPPEARS
class B  reads the wrong one  the declaration is severed · paint STAYS and LIES
```

Same structural precondition — a property declared only in root-keyed rules,
read from a rule that survives severance — differing on one bit: whether the
read carries a fallback. `void-reads.mjs` censuses A, `fallback-reads.mjs`
censuses B, and A's exclusion 2 is B's entry condition, so the two partition
the population instead of overlapping.

**35 class-B reads exist. 3 are reachable.**

| | |
|---|---|
| structurally present | 35 across 13 families |
| **reachable today** | **3** — `tag:250`, `tag:254`, `semantic-surface:257` |
| latent | 32, in families that hardcode their root part |

**The coupling has been measured in the good direction.** Both landed severance
repairs re-key the skin onto something a caller cannot take, which un-orphans
the declarations rather than stranding them. Attributed by re-running the
class-A census against the tree at `ace62230d^` rather than by reading the diff:

```
before (ace62230d^)   16 families · 252 reads · badge 4 · segmented 0
after  (HEAD)         15 families · 248 reads · badge 0 · segmented 0
```

So `a796001ad` closed Badge's 4 class-A reads as a side effect of repairing its
severance, and neither family carries a class-B row before or after. No
regression entered with either repair. The hazardous direction — a repair that
makes a root part *more* replaceable — did not occur, and is the one to check
next time.

**Class B is not an independent backlog — it is the amplifier on the severance
class.** A fallback fires only when the root-keyed declaration stops matching,
and every discriminator here (`data-size`, `data-variant`) is stamped
unconditionally, so the only trigger is a caller replacing the root
`data-part`. Almost every family hardcodes it. The consequence is directional:
**making a root part caller-replaceable drags that family's class-B rows live
with it**, so any severance repair must sweep both classes for the family it
touches. Both live Tag rows are downstream of the severance already adjudicated
in task #26 and are fixed by that repair.

The worst shape, and the reason severity is not a read count: `tag.css:250`
reads `var(--_ds-tag-root-height, var(--ds-tag-md-height, 1.75rem))` from the
close-button rule, while the five size rules each declare that channel to their
own height. Severed, the close button caps against the **md** cell in every
size — the pill loses its own `block-size` (class A) while the close button
keeps a confident, wrong one (class B). Nothing looks broken.

Severity is decided by comparing the fallback's **primary channel** against each
declaration's, never by comparing declaration text: `var(--x, var(--y))` and
`var(--x, 1rem)` differ as strings and resolve identically wherever `--x` is
declared. It is still a floor on similarity, not a value proof, and every run
prints that limit.

### The third anchor: default parts that are not `root`

Both halves test `[data-part='root']` as a literal, so a primitive whose
rendered root stamps something else is invisible to them — the matcher works
and the **hook** is wrong. `nonroot-parts.mjs` closes that hole.

The anchor set comes from the DOM: **13 distinct non-root default parts across
59 engine implementations**, led by `trigger` (10 primitives), `field` (6) and
`anchor` (5).

```
PRESENT    orphan rows on a non-root anchor    4   (A 4 · B 0)
REACHABLE  the anchor is caller-replaceable    0
UNSCOPED   cannot be bound to a selector      12 impls across 5 anchors
```

**The hypothesis that motivated this census is false, and that is the first
result.** `Menu` and `List` both stamp `root` — render-proven — so their large
latent counts were measured against the correct anchor all along and their
zeros mean what they appear to mean. The hole was real; it was just not where
it was expected to be.

The 4 rows are `popover.css` and `hover-card.css` reading a closed-transform
channel declared in their own `[data-part='trigger']` rule. Neither family's
root part is caller-replaceable, so none is reachable.

**Unscoped is not safe.** Twelve implementations — `Message`, the five
`anchor`-stamping overlays, `InputNumber`, `Splitter`, `Anchor` — render a root
that carries no class and own no skin file matching their name, so no selector
can be bound to them. They are printed on every run as not-measured rather than
folded into the zero.

### Reconciling the two halves

The two censuses partition one population, so a family appearing in one and not
the other is the partition working — not a denominator difference. Every case
where the counts looked inconsistent resolves:

| family | class A | class B | resolution |
|---|---|---|---|
| `switch` / `toggle` | 16 / 22 reads | **0** | the identical `track-w` / `track-h` / `thumb` triplet, every read WITHOUT a fallback. Pure A, and one repair pattern covers both families. |
| `data-table` | 36 | **3** | both classes in one family; the 39 split, it did not move. |
| `toast` | 2 | **0** | both reads are bare. |
| `form`, `mentions` | — | **1 each** | previously unresolved; they are **class B**. `--_ds-form-control-height` falls to `var(--ds-input-md-height)` (2 of 3 cells differ), `--_ds-mentions-dropdown-enter-offset` to `0.25rem` (1 of 2). Both latent — roots hardcoded. |
| `list-toolbar` | 1 at `:101` | **9** | the false positive is one READ, not the family. See trap 9b. |

Line numbers differ by convention between the halves: this census reports a
declaration's **start** line, so `list-toolbar`'s inner-radius read shows as
`:48` where a text scan sees the `var()` on `:49`. Same declaration.

## The other three classes

**Class 2 — style-prop drop.** Small and specific. `Input.Search` puts a
caller's `className` and `style` on the **root** under modern and on an **inner
element** under classic and rustic — same caller, three different targets.
`Statistic.Countdown` (all engines) and `Typography.Link/rustic` drop a caller
`marginTop`. `Toast.UndoToast` takes neither style nor className anywhere.
The reported `Text` `fontSize` drop **does not reproduce**: 30 cells (`Text` × 3
engines × 10 prop combinations) keep both declarations. See trap 5.

**Class 3 — pinned engine.** One, and it is declared:
`Button/compound/Icon/index.tsx` imports only `../../engines/modern` and says so
in its header. Consequence for an owner, not a sweep: `Button.Icon` paints
modern under classic and rustic. Zero pinned-engine props tier-wide, and that
zero has a control.

**Class 4 — the engines do not share the vocabulary.** Rendered, default export,
86 primitives with all three engines: **classic stamps a `data-part` in 3**
(Card, Typography, Button via `stampDataPart`), modern in 74, rustic in 64. A
caller's part wins on the root in modern 22 / rustic 11 / classic 11, with no
pattern. So every `[data-part]`-keyed rule is inert under classic for 83 of 86
primitives — **one systemic cause, not 76 findings** (see trap 3).

**Class 5 — paint that reads the void.** Found while adjudicating Badge, and it
is the only class here that **no "properties lost" measurement can detect**,
because the rule that suffers it is alive and matching. A skin declares a custom
property inside a root-keyed rule and reads it from a rule keyed on something
else — `[data-state~='hovered']`, a class, a media query. Severance kills the
declaration and leaves the read; the declaration that reads it is invalid at
computed-value time.

`void-reads.mjs` counts the **shape**: **16 families, 252 reads** at
`bd8cee1eb`. Shape is not defect — without a caller replacing the part, the
declaring rule never stops matching. Exposure is shape ∩ severed sites, and only
Badge and Tag have the second term measured.

Badge's instance is `--_ds-badge-hover-bg-fallback` / `--ds-badge-hover-ink-fallback`
(`badge.css:466-476` declaring, `:484-503` reading). The author wrote a comment
at `:499` explaining that pressed must fall through to hover's mix "or an
unconfigured tenant presses to transparent" — severance reintroduces exactly the
bug the comment defends against, by a route the comment does not consider. The
`--ds-badge-tone-*` block is **not** an instance: both its declaration and its
reads are root-keyed, so they die together.

Filed, out of scope here: `Typography/engines/rustic` still exports
`ApolloHeading`, `ApolloText`, `ApolloParagraph`, `ApolloLink`. `CLAUDE.md` says
those names are gone.

---

## Scripts

| script | what it does |
|---|---|
| `datapart.mjs` | Classifies every `data-part` emission per JSX element by walking the TS AST. Exports `scanFile` and `scopeClasses`. `--control` runs 16 planted shapes. |
| `selectors.mjs` | postcss + a compound tokenizer (`postcss-selector-parser` is not installed in this workspace). Exports `parseCssFile`. `--control` runs 9 selector shapes. |
| `callsites.mjs` | Every JSX call site passing `data-part` to a component, across 5 corpora. `--control` runs 3 checks over 8 planted shapes. Writes `callsites.json`. |
| `engine-pin.mjs` | Class 3: pinned engine props and single-engine imports. `--control` scans the planted fixture. |
| `join.mjs` | Joins the rendered roots against the CSS and writes `FINDINGS.json`, deduped. |
| `reach.mjs` | Resolves every painted `var()` chain per vertical x theme to the channel that terminates it. `--control` runs 5 assertions on shapes lifted from the tree. Writes `REACH.json`. |
| `nonroot-parts.mjs` | The same orphan-channel question on anchors that are not `root`, with the anchor set taken from the DOM. `--control` runs 6 shapes, 3 firing and 3 silent. Writes `NONROOT-PARTS.json`. |
| `fallback-reads.mjs` | Class B: reads whose fallback fires on severance and delivers another cell. Carries the reachability gate. `--control` runs 7 shapes, 3 firing and 4 silent. Writes `FALLBACK-READS.json`. |
| `void-reads.mjs` | The second-order class: a custom property declared inside a root-keyed rule and read from a rule that survives severance. `node void-reads.mjs <tree> <pkg-with-postcss>`; point the first argument at `control/void-reads` for the 7 planted shapes. |
| `render-census.test.tsx` | The render harness. **Copy into `src/ui/primitives/tests/` to run, then delete** — the header carries the exact commands. |
| `control/` | The three planted fixtures. They are the reason any zero here is reportable. |

```
node datapart.mjs --control && node selectors.mjs --control \
  && node callsites.mjs --control && node engine-pin.mjs --control   # all four, seconds
node callsites.mjs        # rewrites callsites.json
node join.mjs             # rewrites FINDINGS.json from render-census.json
```

Data: `FINDINGS.json` (21 rows, each with per-file rule counts and the exact
properties at risk), `callsites.json` (1,642 sites), `render-census.json` (462
rendered rows), `render-census-compounds.json`, `render-census-text-matrix.json`.

`FINDINGS.json` carries the pin it was generated at. The census reproduces
byte-stable across `698c2d803` → `9da78b91d`.

---

## Nine traps. Each one drew blood in this lane.

**1 — a census keyed on a module's DEFAULT export under-reports compound primitives.**
`List.Item` and `List.Meta` are separate rendered elements with their own parts
and their own skin rules. The default-only walk reported `display/List` at 47
rules; widened to every component export it is **72 across three parts**. Probe
every export whose name is capitalised, not just `default`.

**2 — one population under two names, and only one counted.**
Third instance in this lane, so treat it as the default failure mode rather than
a surprise. `Button` has **69** production call sites and `ModernButton` has
**58** more — the same primitive, reached through the composed component and
through a direct engine import. A count keyed on one spelling reported 73 and
missed a third of 127. The inverse also bites: the same rendered element reached
through `default`, `List` and `ModernDescriptions` is **one** finding, and
leaving the aliases in reported 27 where there are 21. `join.mjs` now dedupes on
`primitive|engine|part` and prints when it does.

**3 — a systemic cause reported per-instance inflates by twenty-five.**
Classic stamps a `data-part` in 3 of 86 primitives. Read naively that is "76
primitives whose engines disagree"; read correctly it is one fact about classic
with one fix. Before reporting N findings, ask how many distinct causes N has.

**4 — `data-part` is not always a JSX attribute, and an attribute reader returns a clean zero.**
`Button/modern` emits its root part as
`...partAttributes(dataPart ?? 'trigger', interaction)` **nested inside an
attribute object** that is then spread onto the element. The first version of
`datapart.mjs` scanned JSX attributes and object *properties*, found neither,
and reported Button as having no root part at all — a false zero that reads
exactly like "this primitive is fine". Three emission shapes exist: JSX
attribute, `partAttributes(...)` spread, and a hand-built attribute object.
`control/datapart-control.tsx` plants all three.

**5 — happy-dom discards a `var()` containing whitespace, and the miss reads as "this never painted".**
`CSS_VARIABLE_REGEXP` forbids whitespace inside `var()`, so `var(--x, fallback)`
is dropped by the typed setter under happy-dom with `react-dom/client`;
`renderToStaticMarkup`, jsdom and Chromium all keep it. That is the whole of the
reported `Text` `fontSize` defect. The style probe here uses `var(--probe-fs)`
with **no fallback**, and pairs it with the plain literal `margin-top: 3px` —
so every drop finding rests on a value happy-dom cannot mangle. Direction:
happy-dom **under**-reports. Full triage in commit `1cb429590`.

**6 — a probe that measures one engine three times looks like three engines agreeing.**
`EngineProvider`'s prop is `defaultEngine`, not `engine`. Passing `engine=`
silently renders the default three times, and every primitive reads as having
identical cross-engine behaviour. The harness asserts that `Text`'s three engine
rows do **not** all agree, which is what caught it. Any cross-engine probe needs
an assertion that the switch took effect.

**7 — `margin-top: 3px` serialises as `margin: 3px 0px 0px`.**
Checking only the longhand reported four primitives as dropping a caller's
margin when they keep it. The base-layer README's law — check both spellings of
a property that has a shorthand — applies to the DOM side too, and reading it
first was not enough to avoid it.

**8 — a rule in `runtime/engines/<engine>/skin/` belongs to that engine.**
The first join matched on the base class only, charging 27 rustic Input rules
and 60 rustic Button rules to modern defects. Attribute by the explicit
`--modern` / `--rustic` / `--classic` modifier first, then by the skin
directory, then agnostic.

**9e — a part NAME is not an identifier, and neither is an anchor's owner set.**
Three defects in one instrument, each caught by looking at its own output, and
each pointing the dangerous way. (i) Searching for `[data-part='group']` across
the tree charged 16 `edit-fields` rows to `InputNumber`: `edit-fields` writes
that part for its own anatomy. Scope by the owner's rendered class. (ii) Scoping
by class alone then printed a clean **0** while silently dropping 28 portal
implementations whose rendered root carries no class — a zero with a quarter of
the corpus missing looks exactly like a zero. Fall back to the family's own skin
file, and print whatever neither mechanism can bind. (iii) `trigger` is the
default part of **ten** primitives, so pooling their reachability let `Button`
— the one that IS caller-replaceable — lend its severability to `Popover` and
`HoverCard`, which are not. That alone moved the headline from 4 reachable to 0.
Attribute reachability to the owner whose FILE the row is in.

**9d — a tag name is not a component identity. Two rows shipped as false LIVE.**
`callsites.mjs` now records the **module each JSX name is bound to** and marks
it ours or foreign, and every ranking row has been resolved through it:

```
resolved 100% ours   Button 127 · Badge 16 · Spinner 12 · Tag 4 · Avatar 4
                     Skeleton 2 · Segmented 2
FALSE LIVE           navigation/Link   the one site binds Link to `next/link`
                     display/QRCode    the one site is antd's QRCode, inside our
                                       own primitive's internals, stamping a part
                                       on the AntD element rather than on our root
```

Both were LIVE on a single site and both are LATENT. Across production the sweep
finds 38 foreign bindings and 35 locally-declared components with no import —
neither is assumed to be ours. Operative rule: **a verdict resting on one or two
call sites needs those sites' imports resolved before it is quoted.** It does not
contradict *zero importers is not dead code*; the claim is narrower and exact —
Link's and QRCode's exposure to severance is zero, not Link and QRCode.

Note the two failure directions are not symmetric. This programme spent the
night cataloguing **false zeros** — a broken matcher, a regex skipping nested
fallbacks, a hook pointed at the wrong part. These are the first false
**positives**: a false LIVE spends a lane on a defect that does not exist and
announces itself the moment someone looks; a false zero licenses duplication and
blindness and is found by accident. Both need fixing; only one asks.

**9d(i) — the call-site census matches a TAG NAME, and `Link` is usually `next/link`.**
`navigation/Link` shipped in this ranking as LIVE on the strength of one call
site — `app-bithire/.../public-header/index.tsx:61`, `data-part="public-header-brand"`.
That file imports `Link` from **`next/link`**. The DS `navigation/Link` has
**zero** source importers anywhere outside its own directory, so its 30 rules
are latent, not live, and the row was wrong in the first published table.
`callsites.json` resolves nothing: it records the tag as written. Any row whose
verdict turns on a single call site must have that site's IMPORT resolved before
the verdict is quoted. Zero importers is still not proof of dead code — that
law stands — but it is proof of zero severance.

**9b — "family X is a false positive" is a property of a READ, not of a family.**
`list-toolbar` was handed to the class-B census as a known false positive of the
class-A one — and it is, at `:101`, where the declaration and the read share the
root-keyed rule at `:37` so severance takes both together. Nine **other**
list-toolbar reads, from descendant rules that survive, are genuine class B.
Dropping the family on the label would have dropped all nine. Check the row, not
the name.

**9c — an owner map that names a directory which does not exist prints as a fact about the code.**
Three families in the reachability gate were mapped to paths that are not there,
and the miss surfaced as `no root emission found` — indistinguishable from
"this family hardcodes its root". It would have marked 13 rows unreachable
without evidence. One of the three (`semantic-surface`) is in fact **severable**,
so the error pointed the wrong way as well as being unfounded. Resolve owners by
the scope class they stamp, and treat an unmapped owner as unknown, never as safe.

**9 — a regex over quote pairs desynchronises on the first apostrophe in a comment.**
Extracting scope classes with `/['"`]([^'"`]*)['"`]/g` returned **empty** for
Badge and Empty — a prose apostrophe shifts every subsequent pairing. Worse, the
correct AST version still cannot answer the question: `Button` and `Tag` build
their class list through `defineRecipe(...)`, so no static read states the scope
class at all. **Take the scope class from the rendered root.**

---

## Three laws this instrument is built on

**A `[data-part]` predicate against a composed primitive is settled only by rendering.**
Reading the primitive is insufficient and reading the call site is insufficient —
`Input/modern` routes the caller's `data-part` and `className` to *different
elements*. Every scope class and every default part in `FINDINGS.json` comes
from the DOM.

**When an executable contract exists, it is the authority.**
`Button.passthrough-contract.test.tsx` pinned the three-engine answer while
three careful readings of source produced three different wrong ones.
`datapart.mjs` is checked against it as a historical replay: it must reproduce
*modern — caller wins · rustic — keeps `trigger` · classic — stamps `trigger`*
on both the anchor and the button path. Capability and relevance are different
claims, so the control set proves the first and the replay proves the second.

**A zero is reportable only from an instrument shown to find something.**
Class 3a is zero across 636 files. That is only worth stating because
`engine-pin.mjs --control` finds a planted `engine="modern"`, a planted
`defaultEngine={'rustic'}`, and correctly ignores a dynamic `engine={someVar}`.
Two instruments here caught themselves before reporting; neither would have
without a control.

**A control is only as good as the case that motivated the instrument.**
`void-reads.mjs` shipped its first run with a full control set passing — and
without Badge, the family it was written for. Its `var()` walker read
`var(--a, var(--b))` as one read with a fallback and skipped to the closing
paren, so no nested read was ever enumerated, and every unprotected token
reached through a fallback chain was invisible. It reported 15 families and 238
reads, confidently. The blind spot survived six planted shapes because none of
them nested, and it was caught only by noticing that the founding case was
missing from the output. Recursing into the fallback: **16 families, 252 reads**.
Add the motivating case to the control set, not just the shapes you thought of.

---

## What is measured, and what is not

Counted: 89 engine-backed primitives × 3 engines × every capitalised component
export (462 rows), rendered under happy-dom with an `I18nProvider` and, for the
composed layer, an `EngineProvider`. CSS is all 477 `.css` files under `src`,
selector-split, 15,557 selector-rows.

Not counted, and each will mislead you if forgotten:

- **Two rows never rendered**, and both are `display/Carousel/classic` — its
  `default` and its `Carousel` export, same error. Everything else mounted.
- **Portal families render their trigger, not their surface.** A closed
  overlay's "dropped style" is an empty render, not a defect —
  `Input.Password` and `Stepper.Content` were excluded on exactly that ground.
  Check `rootTag` before believing a drop.
- **`MIN_PROPS` in the render harness is a hand-written table.** A primitive
  whose required props change starts failing to render and silently leaves the
  census. The rendered count is the guard, and it moved twice for two different
  reasons: **230 of 267** before the table, **266 of 267** once it supplied
  `items` / `options` / `dataSource`, and **460 of 462** once every capitalised
  export was probed rather than only `default`. Watch the failure list, not just
  the total.
- **Reachability is a property of the call site**, so a primitive can be
  perfectly correct and its skin still dead at every place it is used. That is
  what this harness measures and it is not a statement about the primitive.
- **Appearance.** These scripts prove which rules stop matching. They never
  prove the result looks wrong, and Segmented's 29 rules want a sighted check
  before and after.
