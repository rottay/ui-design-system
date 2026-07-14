# WO-SKIN-02 fields migration — shared KIT (read fully before editing)

You are moving counted inline paint out of specific input-component TSX files into
new **unlayered** skin CSS files, **byte-exact**, with **zero visual change** at rest
or in any interaction state (RULE ZERO). The components were already stamped with
`data-part`/`data-*` anatomy in a committed pre-step — you READ each file to see the
exact stamped classes/parts and key your CSS on those; you do NOT invent or rename
anatomy.

## Ground truth: what the counter counts (drive each listed file to 0)

`node scripts/engine-token-audit.mjs` emits `fleet.inlinePaint.<path>: N` per file. A
"site" is:
- an **object-literal key** (innermost bracket is `{`) named `background*`, `border*`,
  `outline*`, `color`, `boxShadow`, `textShadow`, `fill`, `stroke`, `accentColor`,
  `filter`, `backdropFilter`, `WebkitBackdropFilter`, or **`transform`** — with a `:` after it;
- an **imperative** `el.style.<paint> = …` write or `.style.setProperty('paint-prop', …)`.

Exempt (never counted): `borderCollapse`, `borderSpacing`.
NOT counted (safe, leave or use): **quoted custom-property keys** like `'--ds-x': value`
(strings), CSS **string values**, comments, JSX SVG attributes (`stroke="..."` is an
attribute, not a style key), function-parameter type annotations, and non-paint keys
(`opacity`, `transition`, `animation`, `width`, layout, `cursor`, `zIndex`, etc.).

`transform` IS counted. For a **runtime-computed** transform/paint (e.g. a % or px derived
from props/state), do NOT try to enumerate it in CSS — emit a **quoted custom-property key**
inline (uncounted) and consume it from a static CSS rule:
```
// inline (uncounted): style={{ '--ds-<comp>-travel': isChecked ? `${px}px` : '0px' }}
// skin: [data-part='thumb'] { transform: translateX(var(--ds-<comp>-travel)); }
```

## Skin home + import wiring

- **Engine-split** component (has `engines/modern.tsx` AND `engines/rustic.tsx`):
  two files — `src/tokens/css/engines/modern/skin/<kebab>.css` and
  `src/tokens/css/engines/rustic/skin/<kebab>.css`.
- **Engine-agnostic** file (single render tree — a `compound/*`, or a component with no
  engine split): one file — `src/tokens/css/components/skin/<kebab>.css`.

**Scope-class prefix convention (a pre-step chose the wrong one on CK-G, 2026-07-14).** The DS uses
TWO scope-class prefixes by TIER, and a skin must anchor on its tier's:
- **primitives** → `rottay-<comp>` (rottay-button, rottay-divider, rottay-tag).
- **patterns / structures** → `ds-pattern-<comp>` / `ds-<comp>` (ds-pattern-detail-panel,
  ds-pattern-filter-panel, ds-pattern-cockpit-header, ds-pattern-page-shell). A component under
  `patterns/` or `structures/` that anchors on `rottay-*` is the one family a tenant CSS author can't
  find where its siblings live. **Check for an EXISTING scope class first** — several pattern roots
  already carry `ds-pattern-<comp>`; reuse it, do not mint a redundant parallel class on top of it.
  Grep-verify any class you mint is FREE across CSS **and** CSS-in-JS.
- DO **NOT** edit `foundation/base.css` or `entrypoints/styles.css` — the orchestrator
  wires every `@import`. DO **NOT** write or touch ANY test file. Your skin does not need
  to be imported for your verification (the counter reads TSX; existing vitest checks DOM,
  not the cascade).

## The specificity law (P-47 unlayered / P-48 the (0,4,0) border floor)

Skins are **unlayered** (NO `@layer`). Reason (state it in a header comment, don't
re-derive): every `@layer rottay-*` sorts before Tailwind's base layer, so a layered rule
can't paint these elements at all; and each tenant ships an unlayered
`html[data-tenant]:not([data-theme]):not(.light) *` border-color floor at specificity
(0,3,1). Therefore:
- **Any rule that paints a border COLOR** (`border`, `border-<side>`, `border-color` with a
  real color — `none`/`0`/`unset`/`inherit` resets are exempt) MUST reach specificity
  **b-column ≥ 4** (classes+attrs+pseudos). Buy it from: the two root classes
  `.ds-<comp>.ds-<comp>--<engine>` (=2) + the target's own `data-part` **repeated**
  `[data-part='x'][data-part='x']` (=2), OR a contract attribute already on the element
  (`[data-variant]`, `[data-checked]`, `[data-invalid]`, `[data-state~='focused']`, …).
- Never buy the 4th unit from an incidental attribute (`role`, `aria-*`, `placeholder`).
- **Non-border paint** (background, box-shadow, outline, border-radius, fill,
  stroke, accent-color, filter — AND `color` on a RAW element that has no `rottay-typography`
  class: a `<div>`/`<span>`/`<Box>`, or an icon/SVG) wins unlayered at (0,3,0): two root
  classes + one attribute is enough; you do not need to repeat the data-part for these.
- **`color` on a composed `<Text>`/`Typography.Text` is the ONE exception — it needs (0,5,0),
  a tier ABOVE the border floor.** Every `<Text>` UNCONDITIONALLY carries
  `rottay-typography rottay-typography--<engine>` + `data-color` (default `'default'`), and the
  Typography ENGINE skin paints it at
  `.rottay-typography.rottay-typography--<engine>.rottay-typography--<engine>[data-color='…']`
  = **(0,4,0)**. Today an inline `color` wins only because inline beats any non-`!important` CSS;
  the moment you STRIP the inline color, a (0,3,0) or even (0,4,0) skin rule LOSES to that
  Typography (0,4,0) and the text silently renders `text-primary`/`text-secondary` (the
  `data-color` default) instead of your migrated color — a byte-exact break the counter never
  sees. Reach **(0,5,0)**: two engine-split root classes + the descendant `data-part` **×3**,
  OR one single-class root + `data-part` **×4** (or class + one contract attr + part ×3). Check
  the SOURCE at each `color` site — `<Text …>` vs a raw element — and apply this only to the
  Text ones. (Shipped precedent: `tokens/css/components/skin/data-terminal-card.css` header;
  `tokens/css/engines/<engine>/skin/typography.css`.)
- A rule keyed via a **descendant** (`[root] [data-part='track']`) already carries the root
  classes; add the descendant `data-part` (and repeat it for borders) to reach the floor.
- **COUNT THE ACTUAL ROOT CLASSES (a single-class scope needs one MORE data-part repeat).** The
  (0,4,0) recipe above assumes a TWO-class engine-split root `.ds-comp.ds-comp--engine` (=2) + data-part
  ×2 (=2). But some engine-AGNOSTIC components were stamped with a SINGLE scope class
  (`.ds-data-terminal-card`, no `ds-structure` prefix) — there, class(=1) + data-part×2(=2) is only
  **(0,3,0)**, which the tenant border floor **(0,3,1)** WINS (equal b-column, the floor's `html`
  element breaks the tie). Repeat the data-part a THIRD time (`[data-part='x'][data-part='x'][data-part='x']`
  = (0,4,0)) to clear it. This bit an orchestrator ruling on CK-A; the migration agent caught it by
  reading the specificity instead of the ruling. Non-border paint is unaffected (it wins at (0,3,0))
  — EXCEPT `color` on a composed `<Text>`, which needs a further repeat still to reach (0,5,0) and
  beat the Typography engine skin (see the color-on-Text bullet above). A single-class root therefore
  needs data-part ×4 for Text color, ×3 for border color, ×2 for other paint.

## State / handler mapping (delete the paint-only mechanism, transcribe to CSS)

- **React-state hover/focus** (a `useState` `isHovered`/`isFocusVisible`/`isFocused` that
  drives a paint value in the style object): DELETE the paint from the object and, if the
  state now drives nothing else, delete the state + its `onMouseEnter/Leave`/`onFocus/Blur`
  setters. Transcribe to CSS `:hover` / `:focus-visible` / the stamped `[data-state]`/focus
  attribute. If a hidden native `<input>` owns focus and the painted element is a sibling,
  use `input:focus-visible ~ [data-part='...']`. Gate hover on `:not([data-disabled='true'])`
  (or `:not(:disabled)`) exactly where the JS gated `!isDisabled`.
- **Imperative** `.style.x =` in a handler: delete the paint write (keep any non-paint work
  the handler does); transcribe to CSS `:hover`/`:focus`.
- **PRESERVE ASYMMETRY**: if rustic has no hover rule and modern does, do NOT invent a
  rustic hover. Transcribe only what exists. Same for any modern/rustic divergence.

## Per-mount `<style>@keyframes>` blocks

Move each `@keyframes name { … }` from the injected JSX `<style>` into the skin, RENAMED
`ds-<comp>-<name>`; update the inline `animation`/`animationName` reference to the new
name; delete the `<style>` tag. Do NOT redefine a globally-loaded keyframe (`spin`,
`pulse`) under its global name — rename your local copy (precedent: `ds-detail-panel-pulse`).

## Byte-exact + comments

- Transcribe values VERBATIM (tokens, `color-mix(...)`, hex, px). Preserve every guard the
  JS mutation order implied (later-write-wins → the winning rule must be the most specific
  or last). Where a JS `if` chain resolved one property, make AT MOST ONE CSS rule win per
  state combination (use `:not(...)` guards like the input.css precedent).
- Keep NON-counted inline props (opacity/transition/layout/cursor/animation-name) exactly
  where they are — do not move them (minimizes risk). Only move counted paint.
- **List every hardcoded literal** you transcribe (hex/rgb/px that is not a token) for the
  proposal.
- **No change-narration comments** (never "moved from", "was inline", "removed handler").
  Comments state runtime constraints only (why unlayered, why (0,4,0), which JS guard a
  `:not()` reproduces). If you find a stale/false comment in the TSX, correct it.

## Precedents to read

- `src/tokens/css/engines/modern/skin/detail-panel.css` — fresh per-part engine skin: header
  idiom, (0,4,0) borders via repeated data-part, `:hover`/`:focus` from deleted state,
  renamed keyframe residual.
- `src/tokens/css/components/skin/field-filters-panel.css` — engine-agnostic single-file
  home + repeated-data-part border idiom.

## Hard limits

- Touch ONLY your listed component TSX files + your new skin CSS files. NOTHING else.
- NEVER `base.css` / `styles.css` / any test. NEVER the dropdown files (Select, TreeSelect,
  Cascader, AutoComplete, Mentions) or the torture/showroom page — another agent owns those.
- Never `git checkout`/`restore`/`reset`. Never build/record/commit.
- STOP and report (do not guess) if: a counted paint key would need a data-part the pre-step
  did not stamp; a value looks like a foreign engine's inline value bleeding in; or a JS guard
  is ambiguous.

## Your verification (your files only) + report

1. `cd packages/core && node scripts/engine-token-audit.mjs | grep -E "<your file paths>"`
   → every listed file shows `: 0`. Paste the tail.
2. `cd packages/core && pnpm vitest run <your component dirs>` → existing tests green. Paste tail.
Report: per-component one line (sites→0, skin file(s), states converted); the two tails;
hardcoded-literal list; any deviation or contradiction with the inventory.

## The pre-step's test grep has a FOURTH shape (2026-07-13)

Every pre-step greps its family's unit tests for assertions that pin inline paint, so the
orchestrator can adjudicate them while the migration runs. The pattern has always been three shapes:

```
toHaveStyle          .style.          getAttribute('style')
```

**A fourth exists and none of those three match it:**

```
querySelector('style')      querySelectorAll('style')      getElementsByTagName('style')
```

A test can pin a component's per-instance `<style>` tag — the keyframe/paint injection this program
exists to delete — **by asserting the tag's mere existence**. Found when CK-D/F moved step-wizard's
`@keyframes pulse` into the rustic skin and deleted the tag:

```js
// StepWizard.engine-advanced.test.tsx:55 — the rustic branch
expect(container.querySelector('style')).toBeTruthy();   // the ONLY evidence the skeleton rendered
```

It was a **true positive**: the test pinned the scaffolding, not the thing it claimed to cover. Fixed
to assert `[data-part="skeleton-progress"]`, which is what "covers the loading branch" actually means.
The modern branch had always keyed on a className and was unaffected — the rustic branch simply had no
class to key on, so the author reached for the nearest available artifact.

**Add all three forms to the pre-step's grep.** And note the distractor: most `querySelector('style')`
hits in this repo belong to the RESPONSIVE `<style>` injection in Box/Flex/Grid/Stack/Typography/
Button/etc. (media queries, not paint). Those are a different mechanism and are not exposed. **Only a
component that injects a `<style>` carrying paint or keyframes is at risk.**

**Two live forward exposures, already located** — a future batch will break these the moment it moves
their keyframes into a skin, and the contract should say so before the migration starts:

| test | component | why it will break |
| --- | --- | --- |
| `patterns/communication/live-feed/tests/PatternLiveFeed.engine-advanced.test.tsx:52` | live-feed (rustic) | `expect(container.querySelector('style')).toBeTruthy()`; rustic injects a `<style>` with a LOCAL `pulse` keyframe (0.4) that deliberately differs from the global (0.5) — do not "de-duplicate" it |
| `patterns/data/stats-grid/tests/PatternStatsGrid.engine-advanced.test.tsx:75` | stats-grid (both engines) | `expect(container.querySelector('style')).not.toBeNull()`; both engines inject a `<style>` |

## Never write `*/` inside a skin comment (caught twice, both by parseErrors)

Migration agents keep writing token globs in skin header comments —
`--ds-surface-*/--ds-elevation-*`, `background*/filter` — and the `*/` **closes the CSS comment
early**, turning the rest of the line into CSS that postcss chokes on. It silently voids the ENTIRE
skin (zero rules load) if `skins.parseErrors` doesn't catch it. It bit collection-header (CK-B) and
command-palette (CK-G). In a comment, write `--ds-surface, --ds-elevation` or `background and filter`
— never a `*` immediately followed by `/`.
