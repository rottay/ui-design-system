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
| 1 | `navigation/Segmented` | modern | 29 | 100 | **2** | **LIVE** |
| 2 | `inputs/Button` | modern | 7 | 47 | **127** | **LIVE** |
| 3 | `display/Badge` | modern | 29 | 110 | **16** | **LIVE** |
| 4 | `display/Tag` | modern + rustic | 70 | 122 | **4** | **LIVE** |
| 5 | `feedback/Spinner` | modern | 1 | 4 | 12 | LIVE |
| 6 | `display/Avatar` | modern | 1 | 7 | 4 | LIVE |
| 7 | `navigation/Link` | modern + rustic | 30 | 51 | 1 | LIVE |
| — | `feedback/Skeleton`, `display/QRCode` | modern | 1 / 3 | 2 / 8 | 2 / 1 | LIVE, marginal |
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
