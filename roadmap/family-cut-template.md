---
title: "Family cut template: what one vertical cut delivers, and the gate that verifies it"
date: 2026-09-08
status: canonical (WO-FAM-00; binding on WO-FAM-01…11 and on every later family)
audience: ai-agent
gate: packages/core/scripts/check/family-cut/index.mjs
drills: packages/core/scripts/check/family-cut/index.test.mjs
roster: packages/core/scripts/check/family-cut/baseline/index.json
---

# Family cut template

A **family cut** is one work order that owns one family end to end: its chrome
deriver, its Modern skin, its shared runtime and its tests. The cut exists
because the alternative — a deriver lot, then a skin lot, then a runtime lot —
writes the same family three times and lets the three disagree.

This file is the template. `packages/core/scripts/check/family-cut/index.mjs`
is the same template as a command that can fail. Where the two could ever
disagree, the command is the authority: prose that nothing executes is how four
class vocabularies, and twenty-one of the twenty-four input skins deciding state
by pseudo-class, survived being written down as forbidden.

Run it before claiming a cut:

```bash
node packages/core/scripts/check/family-cut/index.mjs --family=<family>
node packages/core/scripts/check/family-cut/index.mjs              # the whole roster
node --test packages/core/scripts/check/family-cut/index.test.mjs  # its teeth
```

Modern is the only engine a cut touches. Classic and Rustic are frozen (owner
decision, 2026-09-05): a cut adds no content, tokens, tests or accessibility
work to them, and the gate never reads them.

---

## 1. What a cut delivers

Five deliverables. A cut that lands four of them is not done.

### 1.1 The deriver

`derivation/chrome/<family>` — one `FamilyDeriver`, registered in
`lowering/runtime/derivation`, that turns decisions into the family's channels.

- It declares `consumes` (Theme keypaths) and `produces` (channel patterns) and
  emits nothing it did not declare.
- Every channel the family's skin reads has a producer. "Has a producer" means
  one of exactly two things — a `--ds-x: value` declaration in the authored CSS,
  or an emission from a family deriver — and the set is measured once, in
  `scripts/libraries/tokens/producers`. A `var(--ds-x, LITERAL)` whose name
  nobody writes always resolves to the literal: the channel looks customizable
  and is not, and no new token will ever move it.
- One namespace, derived from the folder name. `inputnumber` and `input-number`
  are not two families.
- It is pure. It reads the `LoweringContext` and the channels merged below it;
  it never imports another deriver, and it never mutates either input.
- It is registered with a rank, not with a position: precedence is
  `profile < derived < verticalOverride < tenant`, and two derivers at the same
  rank may not name the same channel.
- Its contract test is generated from `tests/support/family-contract`, never
  written by hand. A contract each family restates in its own words is a
  contract each family can quietly weaken.

### 1.2 The Modern skin

`foundation/tokens/css/runtime/engines/modern/skin/<family>/index.css` paints
the family, and nothing else does.

- It reads component channels with the chained fallback to the cascade roots:
  `var(--ds-<family>-<channel>, var(--ds-<root>))`.
- It selects on the anatomy the TSX stamps (§2), never on structural
  descendants that the component is free to move.
- Zero colour literals. A colour is `#rrggbb`, `rgb()`, `hsl()`, `oklch()`,
  `lab()`, `lch()` or `oklab()`; the forced-colors system keywords
  (`Highlight`, `GrayText`, `CanvasText`) are not colours in this sense and are
  correct inside `@media (forced-colors: active)`.
- Typographic roles, material state arms, derived shadows, `--ds-radius-full`
  and the z-index scale come from the cascade, not from the file.
- No `--ant-*`. An Ant Design private variable is not a channel of this design
  system, and in Ant 5 without `cssVar` it is not even a variable.

### 1.3 The runtime

The family consumes the shared kernels instead of re-implementing them:
`useInteractionState` (with `pointerType`), `useFieldOverlay`, the listbox and
calendar kernels, `useOptionalDirection`, `resolveSubmitIntent`. A behaviour
that two families need is one kernel, not two implementations that drift.

### 1.4 The tests

- Causality probes, not text-of-CSS. A probe changes one decision and asserts
  the resulting computed style moved. `expect(css).toContain('--ds-button-bg')`
  proves a string exists in a file; it proves nothing about the cascade.
- One executable accessibility assertion per family, in the family's own suite.
  The gate proves the family *owns* one; the suite proves it *passes*. The axe
  run itself is WO-GAT-04's — it needs a rendered DOM and a decrease-only
  finding baseline over the per-state galleries — and a static gate cannot do
  it.
- RTL and i18n cases where the family has direction- or locale-dependent
  behaviour.
- `EngineParity` is not needed. Modern is the only productive engine.

### 1.5 The causality evidence

The cut states, in its report, which decisions of the typed control catalog
(`src/contracts/theme/runtime/catalog`) declare this family in their fan-out,
and shows a probe per decision. A control that names a family it never reaches
is a fan-out claim with no cascade behind it, and the gate counts it
(`fanOutUnreached`).

---

## 2. The anatomy contract (mandatory)

Three attributes, and both sides of each.

| Attribute | Stamped by | Read by | Rule |
|---|---|---|---|
| `data-part` | the TSX, via `partAttributes(part, interaction)` or an explicit property | the skin, as `[data-part='…']` | every stamped part has a rule; every rule has a stamp |
| `data-state` | the anatomy kernel, serialized from one `InteractionState` | the skin, as `[data-state~='…']` | one place decides when a part is hovered, pressed, focused or disabled |
| `data-variant` | the TSX, from the family's closed variant domain | the skin, as `[data-variant='…']` | present on both sides or on neither |

Parts are structural (`trigger`, `content`, `indicator`), never semantic. A part
name never encodes what the component means to a product.

**State is decided once.** A skin may pair a platform pseudo-class with the
kernel state it stands for — `:is([data-state~='hovered'], :hover)` is one
decision with a platform fallback — but a bare `:hover`, `:active`,
`:focus-visible` or `:disabled` is a second authority on the same question and
the gate counts it (`unpairedStatePseudoSelectors`). This is F-37: the kernel's
thesis is that one place decides when a part is pressed, and the audit measured
that thesis false for 88 % of families.

**The TSX carries no visual values.** The only thing that may travel inline is a
runtime-computed `--ds-*` custom property; a caller's own `style` prop and a
spread of the recipe's variable block are opaque and allowed. `style={{ color:
… }}` is a paint decision in the wrong layer, and it is blocking.

---

## 3. The one-namespace rule

One family, one class vocabulary, spelled `ds-<family-kebab>`, generated from
the folder name.

The audit measured four root vocabularies (`ds-`, `rottay-`, `rt-`, `ant-`),
eleven engines mixing two of them, and the same family written
`rottay-inputnumber` in one engine and `ds-input-number` in another. Product
overrides written against either spelling break when the other wins.

The gate measures two things about a family's own classes — those whose name
after the prefix is the family or begins with it:

- `classVocabularies` — how many distinct prefixes the family answers to. The
  target is 1.
- `legacyNamespaceClasses` — how many of its classes are not under `ds-`. The
  target is 0.

A class from another owner (`.ds-visually-hidden` inside a button rule) is not
the family's namespace and is not counted.

---

## 4. Beyond paint

Three requirements a cut owes that are not about colour. Each names the work
order that makes it enforceable; until that work order lands, the gate prints
the arm as **OWED** on every run rather than reporting it green.

### 4.1 The `adapt` slot — WO-INV-07

A layout-sensitive family exposes
`adapt?: Partial<Record<Posture, FamilyAdaptation>>` with the posture names
every family shares (viewport `phone | tablet | desktop`; container
`compact | regular | expanded`) and stamps the resolved posture as
`data-posture` for the skin. The app declares deltas only — "these are the
columns that stay" — and never a threshold of its own. Viewport postures resolve
on the server so the first paint is correct; container postures resolve through
named container queries, with a `ResizeObserver` only where structure changes.

A family does not invent its own posture names, its own thresholds, or a second
component for the small posture. `adapt` is not a tenant decision.

### 4.2 Loading skeletons derived from the anatomy — owner UNASSIGNED

A family does not hand-write a skeleton. One shared skeleton renderer reads the
family's `data-part` anatomy and builds the loading state from it, so the
skeleton cannot drift from the component it stands in for — which is what every
hand-made skeleton eventually does.

The shimmer comes from the motion vocabulary (`--ds-motion-*`), never from a
per-component keyframe, and it is reduced-motion safe: under
`prefers-reduced-motion: reduce` the skeleton is a static surface, not a slower
shimmer.

### 4.3 Presence and enter animation — WO-INV-08

Enter, exit, reflow and shared-element transitions go through the layout
animation kernel (`runtime/motion/layout`) and nowhere else. Animated properties
are `transform`, `opacity` and `clip-path`; size changes go through the kernel
rather than through `transition: height`. Every animation respects
`prefers-reduced-motion` and the tenant's motion dial.

A family that adds its own animation library, or its own FLIP, has not adopted
the kernel — it has forked it.

> **§4.2 has no owning work order.** WO-INV-07 and WO-INV-08 create the kernels
> §4.1 and §4.3 measure against. Nothing in the roadmap creates the shared
> anatomy-derived skeleton renderer: WO-CRA-02 owns the async-state timing law
> and `BrandMotion.skeletonStyle`, and `components/primitives/feedback/skeleton`
> ships nine hand-made compounds (`avatar`, `button`, `card`, `form-skeleton`,
> `list-item`, `paragraph`, `table`, `text`, `transition`) that are exactly the
> per-component skeletons this clause forbids. WO-FAM-00 states the requirement because its own step 2 requires it;
> assigning the owner is a coordinator decision.

---

## 5. The gate

`packages/core/scripts/check/family-cut/index.mjs`. Every arm is declared as
exactly one of three things. There is no fourth, silent state.

**BLOCKING** — an invariant the calibration family already satisfies. It fails
the moment a family breaks it.

| Arm | Fails when |
|---|---|
| `inlineStyleViolations` | a `style` object sets anything that is not a `--ds-*` custom property |
| `visualLiterals` | a colour literal appears in the family's source |
| `antReads` | `--ant-*` appears anywhere in the family's Modern scope |
| `owners` | the family name resolves to no component owner, or to more than one |
| `stampsAnatomy` / `skinReadsAnatomy` | the family stamps no `data-part`, or its skin selects none |
| `variantContract` | `data-variant` is stamped without a rule, or painted without a stamp |
| `stateContract` | `data-state` is on exactly one side of the contract |
| `stateGoverned` | the skin decides state through `[data-state]` and the source never calls `partAttributes` |
| `a11yProbes` | the family owns no executable accessibility assertion |

**RATCHET** — today's measured debt, pinned per family in
`baseline/index.json`. Growth is red. Shrinkage is *also* red, with the
instruction to lower the pin: that is how a pin follows the tree down and never
up. Each family also pins its denominators, so a counter cannot go green by
measuring less.

| Ratchet | Counts |
|---|---|
| `readWithoutProducer` | names the Modern skin reads that nobody writes |
| `classVocabularies` | distinct class vocabularies for one family |
| `legacyNamespaceClasses` | family classes outside `ds-` |
| `partsStampedNotConsumed` | `data-part` values stamped with no rule |
| `partsConsumedNotStamped` | `data-part` values painted and never stamped |
| `statesConsumedNotStamped` | `data-state` values painted and never stamped |
| `unpairedStatePseudoSelectors` | state pseudo-classes with no `data-state` twin |
| `colorLiteralsInSkin` | colour literals in the family skin |
| `fanOutUnreached` | catalog controls that declare this family and reach none of its channels |

**OWED** — an arm the gate cannot yet measure because the kernel it would
measure against does not exist (§4). Each one names its owning work order — or
says plainly that it has none — and is printed on every run. An arm nobody can
measure is not an arm that passes.

The gate takes its numbers from the modules that already own them — the skin
corpus from `libraries/engine/skins/files`, the producer set from
`libraries/tokens/producers`, the read-without-producer classifier from
`check/engine/read-without-producer`, the fan-out from
`libraries/theme-catalog`. A second measurement of any of them would be a second
truth about the same tree.

### 5.1 The roster

`baseline/index.json` is the roster. A family enters it when its cut work order
opens, pinned at its measured debt with the work order named in `cut`; it leaves
the debt columns at 0 when the cut closes. A family that is not pinned is
**refused**, not skipped — being absent from the roster is not a way to pass.

### 5.2 Its teeth

`index.test.mjs` mirrors the calibration family into a tmpdir sandbox, plants a
real defect in the copy, and asserts the gate turns red — an inline
`style={{ color }}`, a `--ds-button-x` read nobody writes, a second class
vocabulary, an `--ant-*` read, a `data-part` with no rule, a bare `:hover`, a
removed `partAttributes`, a deleted a11y suite. Each destructive drill has a
control that proves the red came from the defect and not from the plant: the
same `--ds-button-x` *with* a producer stays green, and the same `:hover`
*paired* with `[data-state~='hovered']` stays green.

---

## 6. Calibration: `button`

`button` is the calibration family, named by WO-FAM-00 step 3. In the audit's
family × decision matrix (`audit/50-matrices/cascade/index.md` §2) it is the row
with the most channels wired to a decision — 146 across nine of the eleven
decision columns (geometry 9, palette 70, typography 6, density 4, elevation 18,
motion 4, materials 1, expressive 33, states 1); `card` reaches one more column
with 113 channels. And it is the family whose Modern skin is furthest along:
zero colour literals, zero inline paint, `data-part` / `data-state` /
`data-variant` all stamped and all read, `partAttributes` adopted, and both of
its `:focus-visible` rules already paired with `[data-state~='focus-visible']`.

Everything it does *not* yet satisfy is pinned, and every pin is a line item for
WO-FAM-01:

| Ratchet | `button` at WO-FAM-00 | Target |
|---|---|---|
| `readWithoutProducer` | 34 | 0 |
| `classVocabularies` | 2 | 1 |
| `legacyNamespaceClasses` | 13 | 0 |
| `partsStampedNotConsumed` | 2 (`accessible-label`, `trigger`) | 0 |
| `partsConsumedNotStamped` | 0 | 0 |
| `statesConsumedNotStamped` | 1 (`selected`) | 0 |
| `unpairedStatePseudoSelectors` | 1 (`button-group` `:hover`) | 0 |
| `colorLiteralsInSkin` | 0 | 0 |
| `fanOutUnreached` | 1 (`recipe-profile`) | 0 |

Read the table as the shape of every cut: the 34 shadow channels are the
deriver's work, the 13 `rottay-` classes are the namespace's, the two orphan
parts and the orphan `selected` state are the anatomy contract's, and
`recipe-profile` reaching none of button's channels is the fan-out claim the
cut has to make true.

---

## 7. Applying the template

1. Read the family's scorecard in `audit/50-matrices/families/**` and the
   closure criterion of each `F-nn` the work order cites.
2. Add the family to `baseline/index.json` pinned at its measured debt, with
   `cut` naming the work order. Run the gate; it should be green on the pins and
   green on every blocking arm, or the family is not ready to cut.
3. Write the deriver, declare its `consumes` / `produces`, register it, and
   generate its contract test from `tests/support/family-contract`.
4. Migrate the skin: roles, material arms, `radius-full`, the z-index scale,
   `[data-state]`, one namespace. Drain the literals.
5. Adopt the shared runtime kernels. Delete what the family had re-implemented.
6. Write causality probes for each decision the family declares, the a11y
   assertion, and the RTL/i18n cases. Delete the text-of-CSS tests.
7. Drive every pin to 0 and lower them in `baseline/index.json` as they fall.
   The gate is red while a pin is above the tree; that is the point.
8. A cut is done when its work order's acceptance gate passes AND every ratchet
   for that family is 0 AND no other family's numbers moved.
