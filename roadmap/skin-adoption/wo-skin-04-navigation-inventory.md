# WO-SKIN-04 navigation-family paint inventory (read-only)

All paths relative to `packages/core/src/ui/primitives/navigation/`. Same
channel scope as the WO-SKIN-02/03 precedents (`skin02-fields-inventory.md`,
`wo-skin-03-status-inventory.md`): a "site" is an object-literal style key named
`background*`, `border*`, `outline*`, `color`, `boxShadow`, `textShadow`, `fill`,
`stroke`, `accentColor`, `filter`, `backdropFilter`, `WebkitBackdropFilter`, or
`transform`, or an imperative `.style.<paint> =` / `.style.setProperty('paint-prop', …)`
write. Class legend follows the brief's ask: **STATIC** (author-time constant, moves
to the skin verbatim), **STATE-SELECTED** (a ternary/map over static values driven by
React state or a prop — becomes a CSS rule keyed on a pseudo-class or `data-*`
attribute), **RUNTIME** (computed from data at render time — stays inline or rides a
`--ds-*` custom-property hatch). Where the mechanism is an **imperative** `.style.x =`
write in a handler (as opposed to a value baked into a style object), that is called
out explicitly in prose since it is a distinct migration mechanism (delete-the-write,
transcribe-to-CSS), matching the migration kit's "imperative" category.

**Zero `data-part`/anatomy anywhere in this family** (grep-confirmed across all 15
components) and **no skin CSS file exists yet for any of them** — every component
below is greenfield, same starting state as WO-SKIN-03's five status components. All
proposed scope classes below are grep-confirmed FREE unless flagged otherwise.

**Coverage checklist** (from `node scripts/engine-token-audit.mjs | grep
"fleet.inlinePaint.foundation/primitives/navigation"`, 2026-07-13): 34 files, 281 sites by the
counter's count (the counter is blind to string-embedded `<style>` tag content and
`.style.x as any =` writes — see per-component notes below for where that blind spot
hides real paint). `EXAMPLES.tsx` (1 site) is a docs/demo file, not a shipped
component — excluded from the family total; noted once here and not sectioned below.

---

## Menu (59 sites, 6 files) — root + 4 compounds, one injected global `:focus-visible` stylesheet the counter cannot see

Root landing: `engines/modern.tsx` (31 sites), `engines/rustic.tsx` (16 sites).
Compounds (all engine-agnostic, JSX-composition API, never touch the engine system):
`compound/Divider` (4), `compound/SubMenu` (4), `compound/Item` (3), `compound/Group`
(1). `engines/classic.tsx` wraps Ant Design's `Menu` directly and carries no inline
paint (0 sites, not in the counter's list) — not detailed further below.

### Anatomy today

No element anywhere in Menu (root or compounds) carries `data-part`. The root `<ul>`
carries `rottay-menu rottay-menu--<engine>`; item `<a>`/`<div>` rows carry **no
className at all** in the engine-split root files — every state (hover, selected,
disabled, danger) is expressed purely via the composed inline `style` object, never a
modifier class. The 4 compounds DO carry BEM-style classNames
(`rottay-menu-item`, `rottay-menu-item--disabled`, `rottay-menu-item--danger`,
`rottay-menu-submenu`, `rottay-menu-submenu--open`, `rottay-menu-submenu--disabled`,
`rottay-menu-submenu__title`, `rottay-menu-group`, `rottay-menu-group__title`,
`rottay-menu-divider`, `rottay-menu-divider--dashed`) but **none of those classes are
referenced anywhere in `foundation/tokens/css/`** (grep-confirmed zero hits) — the compounds are
100% inline-painted today with dead-but-harmless BEM hooks nobody targets. A future
skin can either stamp `data-part` fresh or key off these existing classes; either way
nothing currently paints from them.

### Paint sites — `engines/modern.tsx`

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| item base (`getItemBaseStyle`) | modern 95-128 | border(none),background(transparent),color | STATIC |
| item hover overlay | modern 281-288 | background | STATE-SELECTED (`isHovered && !disabled && !isSelected`, danger vs primary tint branch) |
| item active/selected (`getActiveStyle`) | modern 133-147 | background,color | STATE-SELECTED (level 0 vs child branch, both color-mix tints) |
| item danger (`getDangerStyle`) | modern 170-174 | color | STATE-SELECTED (`item.danger && !isSelected`) |
| accent bar (`getAccentBarStyle`) | modern 152-165 | background,transform | STATE-SELECTED (rendered only when `isSelected && !isChild`); `transform: translateY(-50%)` is layout-centering, not a runtime value |
| focus-visible outline (imperative) | modern 326-329, 331-333 | outline | **IMPERATIVE** `.style.outline =` in `onFocus`/`onBlur` — see "dead mechanism" note below |
| submenu summary base (`getSummaryStyle`) | modern 190-218 | color | STATIC |
| submenu summary disabled overlay | modern 427 | (opacity/cursor only, no paint channel) | n/a |
| submenu summary hover overlay | modern 428-430 | background | STATE-SELECTED (`isHovered && !item.disabled`) |
| submenu summary focus-visible outline (imperative) | modern 446-449, 451-453 | outline | **IMPERATIVE**, same shape as item row |
| group title (`getGroupTitleStyle`) | modern 224-235 | color | STATIC |
| divider (`getDividerStyle`) | modern 240-248 | background(linear-gradient),border(none) | STATIC |
| root `<ul>` background | modern 791-803 | background | STATE-SELECTED (`theme === 'dark'` ternary) |

That is 13 distinct *sites-as-listed*, but the counter's per-key count (31) is higher
because several of the objects above pack multiple counted keys per call (e.g.
`getItemBaseStyle` alone contributes `border` + `background` + `color` = 3 keys from
one function) — the table above groups by rendered part, not by raw key, to match the
WO-SKIN-03 report's shape.

**RUNTIME-DRIVEN paint**: none in the counted-channel sense — Menu has no
value/percent prop. `getLevelStyleVars` writes three **quoted custom-property keys**
(`--rottay-menu-level`, `--rottay-menu-inline-indent`, `--rottay-menu-item-padding-left`)
which are the correct uncounted hatch pattern already in use for the per-level
indent — nothing to fix there, but note it as the existing precedent for any new
RUNTIME channel this migration needs.

**The counter's blind spot, made concrete**: `modern.tsx:613-637` (`ensureGlobalStyles`)
injects a **global, singleton, per-document** `<style id="rottay-menu-modern-styles">`
via `document.head.appendChild` on first mount (not per-instance — a module-level
guard by DOM `id` prevents double-injection). Its `textContent` is a plain JS string,
so the counter sees zero sites here even though it contains two counted-channel rules:
```
.rottay-menu--modern a:focus-visible,
.rottay-menu--modern summary:focus-visible {
  outline: 2px solid var(--ds-color-primary) !important;
  outline-offset: -2px !important;
}
```
plus a non-paint `transform: rotate(90deg)` chevron rule and a `summary::marker { display:none }` reset.

**Dead-mechanism finding**: the `!important` CSS rule above and the imperative
`onFocus`/`onBlur` `.style.outline =` writes (modern.tsx:326-333, :446-453) are TWO
independent mechanisms racing for the same `outline` channel on the same elements.
Per CSS cascade rules, an `!important` declaration in a stylesheet always beats a
plain (non-`!important`) inline style. Since the JS handlers never set `!important`
(inline styles cannot carry `!important` via the `style` object), **the injected
`:focus-visible` CSS rule always wins and the imperative handlers are functionally
dead** — they still run (setting `e.currentTarget.style.outline`), but the visible
result is entirely determined by the CSS rule regardless. This is not a visual bug
today (both target the same `2px solid var(--ds-color-primary)` value, so the dead
handler is invisible), but a migration must transcribe the **CSS rule's** value as
the source of truth, not the JS handler's, and should flag the handler as removable
dead code (out of scope to actually remove it here, per "record, don't fix").

**Global-style migration note**: this per-mount-injected stylesheet is exactly the
per-instance `<style>` pattern flagged in the brief and the WO-SKIN-03 Spinner/Skeleton
precedent for keyframes — except here it is not a keyframe, it is static rules with a
document-global (not per-instance) injection guard. It must be deleted and its rules
folded into the modern skin file verbatim (already engine-namespaced via
`.rottay-menu--modern`, no rename needed), including the `!important` — dropping it
would let the imperative handler (still present, still running) repaint the outline on
blur/focus in a way the skin no longer controls.

### Paint sites — `engines/rustic.tsx`

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| divider | rustic 139-144 | background(via `backgroundColor`) | STATIC |
| group title | rustic 152-164 | color | STATIC |
| submenu title bar | rustic 203-218 | color,background,outline | STATE-SELECTED (`isFocused` drives background+outline; color is STATIC) |
| leaf item | rustic 288-311 | color,background,outline | STATE-SELECTED (3-way priority: `item.danger` → `isSelected` → `isFocused` → default, matching the WO-SKIN-03 Rate "priority chain" shape) |

**Interaction mechanism — 100% REACT-STATE, zero CSS pseudo-classes, zero imperative
writes**: rustic Menu has no `onMouseEnter`/`onMouseLeave` at all. What WO-SKIN-03
called "hover" here is actually **keyboard roving focus** (`focusedKey` state, set by
arrow-key navigation and by the menu's own `onFocus`/`onBlur`, see rustic.tsx
408-425) — there is no pointer-hover treatment in rustic Menu at all, an asymmetry
against modern (which has real pointer-hover via `isHovered`). Both engines converge
on `outline` for the focus ring, but modern's is `:focus-visible`-driven (pointer
clicks don't show it) while rustic's `isFocused` state shows the ring on ANY focus
including pointer clicks — a genuine cross-engine behavioral asymmetry, not just a
paint difference; preserve as-is per "preserve asymmetry."

**RUNTIME-DRIVEN paint**: none. **Keyframes**: none. **Imperative `.style.x=`
writes**: none — rustic Menu's entire interaction surface is object-literal ternaries
inside the render function, the simplest mechanism in this family so far.

### Compounds

| Compound | File:Lines | Channels | Class |
|---|---|---|---|
| `Divider` root | compound/Divider 94-102 | background,border(dashed variant) | STATE-SELECTED (`dashed` prop) |
| `SubMenu` title bar | compound/SubMenu 179-192 | color,background | STATE-SELECTED (`isOpen` ternary on background only; color is STATIC) |
| `SubMenu` expand icon | compound/SubMenu 197-203 | transform | STATE-SELECTED (`isOpen` ternary, rotate 0/180deg) — no color/opacity channel, unlike the root engines' chevrons |
| `Item` root | compound/Item 119-135 | color,background(transparent) | STATE-SELECTED (`danger` ternary on color; background is STATIC transparent) |
| `Group` title | compound/Group 100-108 | color | STATIC |

No hover/focus paint anywhere in the compounds — `Item`'s hover/focus is handled
entirely by `onClick`/`onKeyDown` triggering the parent callback, no visual feedback
state at all (a real gap vs. the root engines, not a migration concern to fix).

### Suppression risk — `foundation/tokens/css/runtime/engines/modern/theme.css:386-597` (layered `rottay-engines`)

This file carries a **large pre-existing `.rottay-menu` rule block** (lines 468-597)
structurally targeting `.rottay-menu li > a`, `.rottay-menu li > button`,
`.rottay-menu details > summary`, `.rottay-menu .divider`, plus hover/active/disabled/
`.text-error` modifier-class variants — a complete, fairly elaborate design (padding,
min-height, border-radius, hover/active `color-mix()` tints) for a component whose
actual root/rustic engines paint 100% inline. Verified via
`grep -n "modern/theme.css" foundation/base.css` → imported as
`@import '../engines/index.css' layer(rottay-engines);` — **layered**, so per the
lane's law it already loses to modern.tsx's inline styles today and will continue to
lose after migration (suppression survives by construction, not a hazard).

**Two things worth flagging to the team, not fixing**:
1. **Partially dead, not fully suppressed**: `.text-error` / `.active` / `.disabled`
   modifier-class rules in this block can **never match** anything modern.tsx
   renders — modern's `<a>`/`<summary>` never carry those classNames (all state is
   inline-only). This isn't suppression (inline beats CSS regardless); it's a rule
   written for a className-based API the component never adopted. A skin author must
   not assume these lines describe real behavior.
2. **The one channel where nothing inline contests theme.css, and the result is
   still invisible**: `.rottay-menu details[open] > summary { color: var(--ds-text-primary); font-weight: 600; }`
   (theme.css:558-561) — intended to bold+darken an OPEN submenu's title. But
   `SubmenuRow`'s `summaryStyle` (modern.tsx:425-431) sets `color`/`fontWeight`
   unconditionally from `getSummaryStyle()` with **no `isOpen` branch at all** — so
   the inline style *does* still apply on every render (it just never changes with
   `isOpen`), meaning theme.css's open-state rule is layered-and-therefore-suppressed
   the same as everything else, not a true "nothing contests it" case. Net effect:
   **open submenus in the live modern engine never visually bold/darken their title**
   — a pre-existing defect (record only, item 7 below), and confirmation that this
   channel is *not* a "personality wins today" case a migration could break.
3. `.rottay-menu .divider` never matches: the actual divider `<li>` in
   `renderModernMenuItems` (modern.tsx:560) carries **no className**, so this
   selector is orphaned regardless of layering — its `linear-gradient` value happens
   to closely match `getDividerStyle()`'s inline value, suggesting the two were once
   meant to be the same rule and drifted; the inline value is what's live.

`foundation/tokens/css/runtime/engines/rustic/theme.css` has **zero** `menu`-related selectors (grep
confirmed) — rustic Menu is a clean greenfield migration with no legacy layer to
reconcile against.

**Naming-collision hazard for the skin author (not a live coupling today)**:
theme.css also carries an EARLIER, unrelated block (lines 386-461) styling the raw
DaisyUI `.menu`/`ul.menu` class for **dropdown-content menus elsewhere in the DS**
(e.g. Select/Dropdown option lists), completely independent of this `Menu` primitive.
Menu's own root never carries a bare `.menu` class (only `rottay-menu`/
`rottay-menu--<engine>`), so there is no live coupling — but a future skin author
choosing a bare `.menu` selector for anything would collide with that unrelated block.
Scope every Menu skin selector under `.rottay-menu`/`.rottay-menu--<engine>`, never a
bare `.menu`.

### DaisyUI coupling

**None found** on the Menu primitive itself — no `className` in `engines/modern.tsx`
or `engines/rustic.tsx` includes a bare DaisyUI structural token (`menu`, `btn`,
`tab`, etc.); every className is a `rottay-menu*`-prefixed first-party name. (The
unrelated `.menu` block in modern/theme.css above styles *other* components that do
carry DaisyUI's class, not this one.)

### Keyframes / per-instance `<style>` tags

One: `modern.tsx`'s `ensureGlobalStyles()` (documented above, under Paint sites).
No `@keyframes` anywhere in Menu (root, rustic, or compounds) — the family's first
component has none of the animation-mechanism sprawl WO-SKIN-03 found in Skeleton/
Spinner.

### Engine asymmetries, dead code, pre-existing defects (record only)

- Modern has real pointer-hover (`isHovered` state); rustic has none — rustic's
  "interaction" is keyboard-roving-focus only. Not a defect, a genuine design
  difference; preserve both as-is.
- Modern's `details[open] > summary` never receives the bold/primary-color treatment
  `theme.css` describes — `SubmenuRow` doesn't branch on `isOpen` for color/weight.
  Pre-existing, not migration-caused.
- `.rottay-menu .divider` (theme.css) and all four compounds' BEM classNames
  (`rottay-menu-item`, `rottay-menu-submenu*`, `rottay-menu-group*`,
  `rottay-menu-divider*`) are dead CSS hooks — zero stylesheet references anywhere in
  `foundation/tokens/css/`. Harmless today (inline styles cover everything), but they are not a
  precedent to copy: a future skin should stamp `data-part`, not rely on these names.
- The imperative `onFocus`/`onBlur` `.style.outline=` writes in both `MenuItemRow` and
  `SubmenuRow` (modern.tsx) are functionally dead, superseded by the injected
  `!important` `:focus-visible` CSS rule (see "Dead-mechanism finding" above) — still
  executes, never visibly wins.
- `engines/classic.tsx` (341 lines, 0 counted sites) wraps Ant Design's `Menu`
  directly; not detailed further — out of scope for a skin (Ant Design owns its own
  paint).

## FloatButton (44 sites, 2 files) — the batch's clearest DaisyUI structural-class coupling; a hover-scale interaction with zero inline contest

Root landing: `engines/modern.tsx` (29 sites, three render sites: `FloatButton`,
`Group`, `BackTop`), `engines/rustic.tsx` (15 sites, same three render sites via a
shared `styles` object). `engines/classic.tsx` not detailed (Ant Design wrapper, 0
sites).

### Anatomy today

No `data-part` anywhere. Modern's three render sites carry real structural
classNames built by `getFloatButtonClassName()`; rustic's three render sites carry
only the consumer-supplied `className` (no first-party class at all — 100%
inline-painted, same shape as Menu's rustic engine).

### Paint sites — `engines/modern.tsx`

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| root `FloatButton` base (`baseStyle`) | modern 103-116 | border(none) | STATIC |
| root `FloatButton` shape/type composition | modern 110-116 | background,color | STATE-SELECTED (`shape==='circle'` and `type==='primary'` ternaries, two independent branches merged) |
| badge dot | modern 126-128 | background | STATIC (redundant with the Tailwind `bg-error` utility class already on the same span — inline wins, the class is dead) |
| badge count | modern 129-133 | background,color | STATIC |
| `floatStyle` (root, non-primary bg + shadow) | modern 139-143 | background,boxShadow | STATE-SELECTED (`type !== 'primary'` background branch; boxShadow is STATIC) |
| `Group` trigger button | modern 261-275 | border(none),background,color,boxShadow | STATE-SELECTED (shape/type ternaries, same shape as root but duplicated inline rather than reusing `baseStyle`) |
| `BackTop` button | modern 372-386 | border(none),background,color,boxShadow | STATE-SELECTED (same duplicated shape/type pattern a third time) |

**RUNTIME-DRIVEN paint**: none — no value/percent prop anywhere in FloatButton.
**Imperative `.style.x=` writes**: none. **Keyframes / injected `<style>`**: none.

**Triplication, not a defect but worth flagging**: the shape/type → background/color/
border composition (`shape === 'circle' ? {...} : {...}`, `type === 'primary' ? {...}
: {...}`) is written out fresh, by value, in all three render sites (`FloatButton`,
`Group`'s trigger, `BackTop`) instead of calling `baseStyle`-building logic once. A
skin file can de-duplicate this into one set of CSS rules keyed on `data-shape`/
`data-variant` even though the source never de-duplicated the inline JS.

### Paint sites — `engines/rustic.tsx`

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| `styles.button` base | rustic 58-67 | border(none),boxShadow | STATIC |
| `styles.buttonDefault` / `styles.buttonPrimary` | rustic 84-93 | background,color | STATE-SELECTED (`type` ternary) |
| `styles.buttonHover` | rustic 96-99 | boxShadow,transform | STATE-SELECTED (`isHovered` ternary, all 3 render sites) |
| `styles.badge` | rustic 134-147 | background,color | STATIC |
| `styles.description` | rustic 158-162 | color | STATIC |

Applied identically across `FloatButton` (buttonStyle composition, line 208-214),
`Group`'s trigger (line 358-364), and `BackTop` (line 466-473) — all three genuinely
reuse the shared `styles` object (unlike modern, which duplicates the literal
objects). `isHovered` is 100% REACT-STATE (`onMouseEnter`/`onMouseLeave`) in all
three sites, with an explicit code comment acknowledging the trade-off ("Hover state
managed in JS because inline styles cannot use `:hover`" — rustic.tsx:421-422) —
this is the correct target shape after migration: delete the state, transcribe to a
real `:hover` rule.

### DaisyUI coupling (this is the flag the brief asked for)

**Modern FloatButton's three render sites all build real DaisyUI/Button-primitive
structural classes**, via `getFloatButtonClassName()` (modern.tsx:47-62):
```
['btn', shapeClassName, typeClassName, 'shadow-lg', className]
```
where `shapeClassName` is `btn-circle` / `rounded-lg` and `typeClassName` is
`btn-primary` / `btn-ghost bg-base-100`. These are the **same** `.btn`/`.btn-primary`/
`.btn-ghost` classes the real `Button` primitive consumes from
`foundation/tokens/css/runtime/engines/modern/theme.css` — confirmed by the audit script itself, which
documents `FloatButton`'s `getFloatButtonClassName()` by name as the reason its
DaisyUI-class scanner needs a `.join(' ')`-aware pass (`engine-token-audit.mjs:877`).
`daisy.classConsumers: 16` in the current fleet output; FloatButton is one of the
sixteen (CLAUDE.md's decrease-only ratchet).

**The suppression check found a real "personality wins today, nothing inline
contests it" channel** — the same hazard shape the lane's law warns about, here for
the first time in this batch:
- `foundation/tokens/css/runtime/engines/modern/theme.css` carries **two independent `.btn` rule
  blocks** in the same file (lines 103-168 and 999-1049 — a second-emitter pair, pre-
  existing, not caused by FloatButton). Only the **first** block defines
  `[data-tenant] .btn:hover:not(:disabled) { transform: var(--ds-button-hover-transform, translateY(0) scale(1)); }`
  and the matching `:active` scale-down rule; the second block never redeclares that
  selector, so the first block's hover/active transform stands uncontested by the
  second emitter.
- **None of the three modern FloatButton render sites set `transform` inline,
  anywhere, for any state.** Unlike Menu (which fully covers `background`/`color` on
  every element it paints), FloatButton's hover-press "lift" interaction is
  **entirely delivered by this layered `.btn:hover`/`.btn:active` rule** — there is
  no inline value at any specificity contesting it.
- Net effect: **modern FloatButton's hover-scale and active-scale-down animation is
  a live personality-layer win today**, not a suppressed rule. A migration that
  writes a new unlayered FloatButton skin must **explicitly re-declare this
  transform on `:hover`/`:active`** (scoped to FloatButton's own class, not
  `.btn`) — simply leaving it to "the existing layer" is not safe if a future step
  ever stops loading `engines/modern/theme.css`'s `.btn` block for other reasons, and
  more immediately: if a new unlayered FloatButton skin adds ANY unconditional
  `transform` declaration for layout purposes (there is none today, but this is the
  live trap for whoever migrates this component next), it would permanently pin the
  transform and silently kill the hover/active scale.
- The root `FloatButton`'s `boxShadow` (`var(--ds-elevation-2)`, STATIC, set
  unconditionally in `floatStyle`) **does** fully suppress
  `.btn:focus-visible { box-shadow: ... }` (present in both `.btn` emitter blocks) —
  that channel is genuinely dead today (suppressed, not a hazard): modern
  FloatButton has no visible focus-ring box-shadow change despite theme.css
  defining one.

**Rustic has no DaisyUI coupling** — no bare `btn`/`btn-*` class anywhere in
`engines/rustic.tsx`; `foundation/tokens/css/runtime/engines/rustic/theme.css` and
`foundation/tokens/css/runtime/personality.css` have zero `floatbutton`/`FloatButton` hits
(grep-confirmed) — a clean greenfield migration on the rustic side, same as Menu's
rustic engine, but for a different reason (rustic never referenced the shared `.btn`
class family at all).

### Keyframes / per-instance `<style>` tags

None in either engine.

### Interaction paint summary

- **Modern**: hover/active SCALE comes from the layered DaisyUI `.btn` class (no
  inline contest, see above); hover/active BACKGROUND/COLOR is inline-STATE-SELECTED
  only in the sense that `type` determines the base value — there is no separate
  modern `:hover` background/color treatment at all (`.btn-primary:hover` /
  `.btn-ghost:hover` background-color changes in theme.css ARE contested and
  suppressed, since `floatStyle`/`baseStyle` set `background` unconditionally).
- **Rustic**: 100% REACT-STATE (`isHovered`), zero CSS pseudo-classes, explicit
  code-comment acknowledging the trade-off. Direct migration target: delete state,
  write `:hover`.

### Engine asymmetries, dead code, pre-existing defects (record only)

- Modern's hover/press interaction is genuinely two different mechanisms depending
  on channel: scale-transform via legacy layered CSS (uncontested), background/color
  via inline STATIC value with no hover variant at all. Rustic's is one mechanism
  (React state) covering both scale and background/color uniformly. Preserve both
  asymmetric shapes; do not "fix" modern to match rustic or vice versa.
- Modern triplicates the shape/type→paint composition logic across its three render
  sites instead of sharing one function (`getFloatButtonClassName` is shared, but the
  inline style object is not). Rustic shares one `styles` object across all three.
- Badge-dot's Tailwind `bg-error` utility class (modern.tsx:127) is dead — same
  element also carries an inline `background` set to the same concept via a DS
  token; the inline wins unconditionally, the utility class contributes nothing.

## Tabs (28 sites, 2 files) — real compositor-only sliding indicator + a per-instance, non-namespaced `@keyframes` the counter cannot see

Root landing: `engines/modern.tsx` (22 sites), `engines/rustic.tsx` (6 sites).
`engines/classic.tsx` wraps Ant Design's `Tabs` (0 sites). Self-documenting header
comment on modern.tsx: "No DaisyUI classes — all styling is inline via design
tokens" — verified true by grep (no bare DaisyUI class anywhere in either engine
file).

### Anatomy today

No `data-part` anywhere. Neither engine's tab button/panel carries any first-party
className beyond the consumer-supplied top-level `className` on the outer `<div>` —
100% `role`/`aria-*`/`data-tabs-id` attribute-addressed, zero class-addressed
elements. `data-tabs-id={tabsId}` (a per-instance `useId()`-derived string, colons
stripped) is the only first-party attribute stamped anywhere, and it already exists
purely to scope the injected `<style>` block below — a real precedent for a future
`data-part="root"` stamp to key off instead.

### Paint sites — `engines/modern.tsx`

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| tab item, `line` type | modern 107-120 | color | STATE-SELECTED (4-way priority: disabled → active → hovered → default) |
| tab item, `card` type | modern 124-145 | background,boxShadow,color | STATE-SELECTED (same 4-way priority, background+boxShadow+color all keyed together) |
| tab item, `pills` type | modern 149-167 | background,color | STATE-SELECTED (same 4-way priority) |
| badge (`TabBadge`) | modern 182-197 | background,color | STATIC |
| sliding indicator | modern 416-430 | background,transform | RUNTIME (`indicatorPos.left`/`.width`, measured via `getBoundingClientRect()` in a `useLayoutEffect`) for `transform`; background is STATIC |

**RUNTIME-DRIVEN paint — the compositor-only case the brief asks to enumerate**: the
sliding indicator's `transform: translateX(${left}px) scaleX(${width})` is computed
fresh every time the active tab changes (`useLayoutEffect`, modern.tsx:352-372). The
component's own code comment (modern.tsx:411-415) explains WHY it is `scaleX` on a
fixed 1px-wide box rather than an animated `width`: **"the engine-token-audit.mjs
compositor-only counter flags [width/layout-property animation]"** — confirming this
codebase runs a *second*, separate ratchet (beyond `fleet.inlinePaint` and
`daisy.classConsumers`) that penalizes non-compositor CSS animation. This value is
the correct target for a `--ds-*` custom-property hatch per the migration kit
(`'--ds-tabs-indicator-x'` / `'--ds-tabs-indicator-scale'`), consumed by a static
`transform: translateX(var(...)) scaleX(var(...))` skin rule — do not try to
enumerate it as CSS states.

**Interaction mechanism — 100% REACT-STATE for color/background, zero CSS
`:hover`**: `hoveredKey` (modern.tsx:284) drives the `isHovered` branch inside
`getTabItemStyle` for all three `type` variants; there is no `:hover` pseudo-class
anywhere in this file for background/color. The *only* real CSS pseudo-class in
modern Tabs is `:focus-visible` for the outline (see injected style below) — same
split-mechanism shape WO-SKIN-03 found in Rate (CSS for one channel, React-state for
another), except here BOTH channels that matter (color, background) are
React-state, and only the accessibility outline is CSS.

**The counter's blind spot — TWO per-render injected `<style
dangerouslySetInnerHTML>` blocks, both invisible to `fleet.inlinePaint` and both
NOT scoped by a per-instance-unique keyframe name**:
1. **Responsive-size block** (modern.tsx:438-440, mirrored in rustic.tsx:268-270):
   only present when `size` is a responsive value; emits scoped `padding`/`font-size`
   media-query rules via `generateResponsiveCSS`. Layout only (no counted paint
   channel) — noted for completeness, not a migration concern.
2. **Scrollbar/keyframe/focus-visible block** (modern.tsx:443-454, modern-only):
   ```
   [data-tabs-id="${tabsId}"]::-webkit-scrollbar { display: none; }
   @keyframes rottay-tabs-fade-in {
     from { opacity: 0; transform: translateY(2px); }
     to { opacity: 1; transform: translateY(0); }
   }
   [data-tabs-id="${tabsId}"] [role="tab"]:focus-visible {
     outline: var(--ds-focus-ring-width, 2px) solid var(--ds-focus-ring-color) !important;
     outline-offset: calc(-1 * var(--ds-focus-ring-offset, 2px)) !important;
     border-radius: var(--ds-radius-sm);
   }
   ```
   The `:focus-visible` outline rule **is** correctly instance-scoped (via the
   `[data-tabs-id="..."]` attribute selector), so multiple Tabs on one page do not
   collide there. The `@keyframes rottay-tabs-fade-in` block is **not** — it is
   declared under the same, single, global name on every render of every Tabs
   instance (unlike Menu's guard-by-DOM-id single injection, this component has no
   dedup guard at all: it is a plain React `<style>` child, re-rendered — and
   re-parsed by the browser — on every instance and every re-render). With N Tabs
   instances mounted simultaneously, N identical `@keyframes rottay-tabs-fade-in`
   blocks exist in the DOM; harmless today only because every instance's content is
   byte-identical. A migration must rename this keyframe `ds-tabs-fade-in` (per the
   lane's keyframe-renaming law) and move it to the skin file **once**, not
   per-instance — collapsing N duplicate declarations into the correct single
   static one.
3. The tab panel's `animation: 'rottay-tabs-fade-in var(--ds-motion-fast) var(--ds-motion-ease-out)'`
   (modern.tsx:522) is the consumer of keyframe #2 above — `animation` itself is not
   a counted channel, but the keyframe it references is invisible to the counter for
   the reason above.

### Paint sites — `engines/rustic.tsx`

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| tab list container | rustic 225-230 | border(bottom, `line` type only) | STATE-SELECTED (`type === 'line'` ternary; value is STATIC when present) |
| tab button (`getTabStyle`) | rustic 245-260 | background,color,border(none),border-bottom | STATE-SELECTED (`isActive` ternary throughout; `type` ternary only affects `borderRadius`/`marginBottom`, not a counted channel) |

**No hover state at all in rustic** — no `onMouseEnter`/`onMouseLeave`, no
`isHovered` anywhere; rustic Tabs' only interactive paint dimension is
`isActive`. This is a genuine asymmetry against modern (which has real hover);
preserve as-is, do not invent a rustic hover.

**No keyframes, no imperative `.style.x=` writes, no injected focus-visible
block** — rustic Tabs relies on the browser's native default focus ring (no custom
`:focus-visible` treatment at all), unlike modern's explicit `!important` override.

### Suppression risk

**None found.** `foundation/tokens/css/runtime/engines/modern/theme.css` and
`foundation/tokens/css/runtime/engines/rustic/theme.css` have zero `.tab`/`.tabs`/`[role="tab"]`
selectors (grep-confirmed). `foundation/tokens/css/runtime/personality.css:411-426` carries a
"TABS PERSONALITY" block, but it targets `.ant-tabs-ink-bar`/`.ant-tabs-tab`
(classic engine's real Ant Design classnames) and `[data-engine] .ds-tabs-indicator`/
`[data-engine] .ds-tab` — two hook classnames that **neither modern nor rustic Tabs
ever renders** (grep-confirmed zero `ds-tab`/`ds-tabs-indicator` class stamps
anywhere in either engine file). That personality block is either exclusively for
the classic engine or an aspirational hook nobody has wired up yet; either way it is
orphaned for this batch's two engines, not suppressed-by-inline (there is no
selector match to suppress in the first place). Tabs is a clean greenfield migration
with zero legacy-layer entanglement.

### DaisyUI coupling

None. Confirmed by both the file's own header comment and a grep for any bare
DaisyUI class token in either engine file.

### Keyframes / per-instance `<style>` tags

One real keyframe (`rottay-tabs-fade-in`, modern-only, documented above) plus one
non-keyframe per-instance focus-visible/scrollbar block, plus the shared
(non-Tabs-specific) responsive-size injector used by both engines. All three are
counter-invisible.

### Engine asymmetries, dead code, pre-existing defects (record only)

- Modern has hover-state color/background treatment and a compositor-only sliding
  indicator; rustic has neither (no hover, no indicator — rustic's active tab is
  marked by a static `border-bottom`, a completely different visual language for the
  same `type='line'` concept). This is the widest visual-design gap between engines
  found so far in this family; preserve both, do not reconcile.
- The responsive-size CSS injector duplicates the same per-instance-`<style>` pattern
  used for the fade-in keyframe, but is layout-only (out of paint scope).
- `personality.css`'s `.ds-tab`/`.ds-tabs-indicator` hooks appear to be dead/orphaned
  across the whole DS, not just this component family — worth a team flag, not a fix
  here.

## Steps (26 sites, 2 files) — the deepest DaisyUI coupling in the batch: paint that was never inline in the first place, plus a likely-dead redundant mechanism

Root landing: `engines/modern.tsx` (5 sites), `engines/rustic.tsx` (21 sites).
`engines/classic.tsx` not detailed (0 sites).

### Anatomy today

No `data-part`. Modern's `<li>` items carry real DaisyUI structural classNames
(`steps`, `steps-vertical`/`steps-horizontal`, `step`, `step-primary`, `step-error`).
Rustic's `<ol>`/`<li>` carry only the consumer's `className` — 100% inline, same
greenfield shape as every other rustic engine in this family so far.

### Paint sites — `engines/modern.tsx`

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| step circle (`getStepTokenStyle`, custom-property hatch) | modern 72-95 | accentColor | STATE-SELECTED (3-way switch: finish/process → primary, error → error, wait → base-only, no accentColor set) |
| step title | modern 232 | color | STATIC |
| step subtitle | modern 235 | color | STATIC |
| step description | modern 238 | color | STATIC |

That is 4 rendered parts but the counter reports 5 sites because the `accentColor`
key appears in two of the switch's three branches (finish/process and error), each a
separate object-literal occurrence.

**This is the deepest DaisyUI structural coupling found in this batch, and it is
architecturally different from FloatButton's**: `daisyui` is a real npm dependency
(`^5.5.19`, confirmed in `package.json`), and modern Steps' circle fill/border and
the connector line between steps are **not rendered by any inline style at all** —
they come from DaisyUI's own compiled CSS for `.steps .step`, which paints its
`::before` (connector) and `::after` (numbered circle) **pseudo-elements** using CSS
`counter()`/`content: attr(data-content)` for the digit/dot and reads DaisyUI's own
`--step-color`/`--step-neutral` custom properties for color. **A pseudo-element
cannot be targeted by a React `style` prop at all** — so `getStepTokenStyle()`
redirects color by *setting those two custom properties* as quoted (uncounted) keys,
the correct hatch pattern, plus setting `accentColor` (a real, counted style
property, presumably for the native browser progress-adjacent chrome DaisyUI also
reads) as the one channel that genuinely is inline.

**A second, independent, possibly-redundant mechanism exists in the SAME theme.css
file this component's classes activate** (`foundation/tokens/css/runtime/engines/modern/theme.css:641-648`,
layered `rottay-engines`):
```
[data-tenant] .steps .step::before { background-color: var(--ds-steps-line-color); }
[data-tenant] .steps .step::after  { background-color: var(--ds-steps-item-bg); color: var(--ds-steps-item-color); }
```
This directly overrides the SAME two pseudo-elements' `background-color`/`color`
with a **completely different token vocabulary** (`--ds-steps-line-color`,
`--ds-steps-item-bg`, `--ds-steps-item-color`) than the component's own
`--step-color`/`--step-neutral` redirection. **STOP-AND-REPORT, not a fix**: which
of these two mechanisms actually wins the rendered circle/connector color depends on
DaisyUI's own internal CSS specificity and rule order for how `.step::after`
consumes `--step-color` — that internal stylesheet is not part of `foundation/tokens/css/` and
was not read for this inventory. It is entirely possible the component's
`accentColor`/`--step-color` redirection is **live but visually irrelevant**,
fully superseded by this direct `::before`/`::after` override, which would make
`getStepTokenStyle()`'s custom-property half dead code. A migration must verify
empirically (computed-style / visual diff) which mechanism actually paints the
circle before deciding what a skin file needs to own — this is not something
"transcribe the inline value" can resolve on its own, because the true source of
truth may be the CSS-only mechanism, not the TSX.

**Not counted, not paint, but load-bearing**: `data-content={progressDot ? '●' : undefined}`
(modern.tsx:224) feeds DaisyUI's own `content: attr(data-content)` fallback inside
`.step::after` — this is the mechanism that swaps the numbered digit for a filled
dot in progress-dot mode. Confirm this still resolves correctly if a future skin
ever needs to touch `.step::after`'s `content` property (out of scope here — DaisyUI
owns it, not `foundation/tokens/css/`).

### Paint sites — `engines/rustic.tsx`

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| icon circle, custom icon variant (`renderIcon`) | rustic 259-282 | background,border,color | STATIC (values come from `getStatusColors(status)`, but the ternary that PICKS the status happened earlier in `getEffectiveStatus`, so at this call site the values read as STATIC per-status) |
| icon circle, default numbered/check/cross variant | rustic 293-313 | background,border,color | STATE-SELECTED (same `getStatusColors` values; classified STATE-SELECTED here because `displayNumber` ALSO branches on `effectiveStatus` in the same block, and the two are visually coupled — glyph and color change together) |
| progress-dot (boolean variant) | rustic 244-256 | background | STATIC |
| title text | rustic 340-347 | color | STATE-SELECTED (`effectiveStatus === 'error'` ternary; only status that gets a dedicated title color, all others fall to one default) |
| connecting line | rustic 369-383 | background | STATE-SELECTED (`index < current` ternary — finished vs. not-yet-reached) |

`getStatusColors(status)` (rustic.tsx:53-80) is the single 4-way switch
(finish/process/error/wait) feeding bg/border/text for every icon variant — the
richest of the four-way priority chains in this batch so far in terms of token
depth (每 up to 3 fallback layers per value, e.g.
`var(--ds-steps-finish-bg, var(--ds-color-primary-500, var(--ds-color-primary)))`).

**RUNTIME-DRIVEN paint**: none — no value/percent prop, only discrete status enum
and boolean/functional `progressDot`.

**Custom `progressDot` render-prop variant** (rustic.tsx:229-241): when `progressDot`
is a function, the caller's returned node is wrapped in a fixed 8×8 circle span with
NO background color set by this component at all (the caller's returned content
supplies its own paint) — correctly out of scope for a skin (it's consumer content,
not component paint).

**No hover/focus paint in either engine** — Steps has `onClick`/`cursor` but no
visual hover feedback at all in either engine, a real gap (not unique to Steps;
worth noting once here since it recurs).

### Suppression risk

`foundation/tokens/css/runtime/engines/modern/theme.css:641-648` (documented above) is the one real
suppression-adjacent finding: it doesn't suppress anything inline (nothing inline
CAN reach a pseudo-element), it potentially **competes with** the component's own
custom-property redirection for the same visual result. `foundation/tokens/css/runtime/personality.css`
and `foundation/tokens/css/runtime/engines/rustic/theme.css` have zero `steps`/`step`/`step-primary`
hits (grep-confirmed) — rustic Steps is a clean greenfield migration.

### DaisyUI coupling

**Full structural coupling on modern**: `steps`, `steps-vertical`,
`steps-horizontal`, `step`, `step-primary`, `step-error` are all real, live DaisyUI
classes (not first-party lookalikes) — this is the component the CLAUDE.md "residual
DaisyUI class layer... sixteen engine files" note is most directly about among this
batch's findings so far. Unlike FloatButton (which merely borrows `.btn`'s
first-party-token-backed styling), Steps genuinely depends on DaisyUI's own compiled
stylesheet for structural rendering (counters, pseudo-element connector lines) that
this repo does not own or fully override.

### Keyframes / per-instance `<style>` tags

None in either engine.

### Engine asymmetries, dead code, pre-existing defects (record only)

- Modern's circle/connector color has two competing delivery mechanisms (see above)
  — flag for the team, verify empirically before any skin work touches Steps.
  Possibly the single highest-value item in this whole inventory to resolve before
  migrating Steps, since "which value is byte-exact" cannot be answered by reading
  the TSX alone.
- Rustic implements custom connecting-lines, three icon-glyph variants (check/cross/
  number), and a function-form `progressDot` render prop that modern does not have
  at all (modern's only non-default icon path is `step.icon` OR the DaisyUI dot,
  no function-form `progressDot`) — a real feature-surface asymmetry, not just paint.
- Neither engine has hover paint.

## Stepper (43 sites, 4 files) — near-duplicate of Steps' DaisyUI pattern on modern; a genuinely rich rustic implementation plus a hand-rolled JS animation state machine in `compound/Content`

Root landing: `engines/rustic.tsx` (19 sites), `engines/modern.tsx` (4 sites).
Compounds (engine-agnostic): `compound/Step` (17 sites), `compound/Content` (3
sites). `engines/classic.tsx` not detailed (0 sites).

### Anatomy today

No `data-part` anywhere. Root `engines/modern.tsx`/`engines/rustic.tsx` render
class-light (modern carries DaisyUI structural classes only; rustic carries only
`rottay-stepper rottay-stepper--rustic rottay-stepper--<direction> rottay-stepper--<size>
rottay-stepper--<variant>`, structural, unaddressed by any stylesheet). `compound/Step`
carries a **full BEM tree** (`rottay-stepper-step`, `--<status>`, `--active`,
`--disabled`, `__icon`, `__content`, `__title`, `__subtitle`, `__description`, plus
a sibling `rottay-stepper-connector`) and `compound/Content` carries
`rottay-stepper-content`/`--active`. **All of these are dead CSS hooks** — zero
references anywhere in `foundation/tokens/css/` (grep-confirmed), the same shape as Menu's
compound BEM classes.

### `engines/modern.tsx` — same DaisyUI pattern as Steps, not re-derived in full

`getStepClass`/`getStepTokenStyle` (modern.tsx:64-115) are **near-duplicates** of
Steps' identically-named functions — same `step-primary`/`step-error` DaisyUI class
mapping, same `--step-color`/`--step-neutral` custom-property redirection, same
`accentColor` channel. Two components in this DS independently reimplement the same
DaisyUI-steps-token-bridge; worth a team flag as duplication, not a migration fix.

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| step circle (`getStepTokenStyle`) | modern 87-115 | accentColor | STATE-SELECTED (3-way: finish/process → primary, error → error, wait → none) |
| step title | modern 176 | color | STATIC |
| step description | modern 178 | color | STATIC |

**The same "STOP-AND-REPORT" finding from Steps applies identically here, not
re-derived**: `foundation/tokens/css/runtime/engines/modern/theme.css:641-648`'s
`[data-tenant] .steps .step::before/::after` rules are **generic** (`.steps .step`,
not scoped to either component) and paint the SAME connector/circle pseudo-elements
for Stepper's modern engine too, via a possibly-competing mechanism against this
file's own `--step-color`/accentColor redirection. See the Steps section above for
the full finding; it is not repeated here.

### `engines/rustic.tsx` (19 sites) — the richest single-file implementation in the family so far

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| `getStatusColors` 4-way switch (color, border only — `bg` is an unprefixed key name, not counted) | rustic 115-147 | color,border | STATE-SELECTED (finish/process/error/wait, 2 counted keys × 4 branches = 8 sites) |
| step container (`stepStyle`) | rustic 194-205 | outline,outlineOffset,borderRadius | STATE-SELECTED (`isFocused` drives outline; outlineOffset/borderRadius are STATIC) |
| icon circle (`iconStyle`) | rustic 208-222 | borderRadius,backgroundColor,color,border | STATIC (values are `colors.*`, already resolved) |
| title (`titleStyle`) | rustic 233-240 | color | STATIC |
| description (`descStyle`) | rustic 243-246 | color | STATIC |
| connector (`connectorStyle`) | rustic 251-261 | backgroundColor | STATE-SELECTED (`status === 'finish'` ternary) |
| subtitle (inline span) | rustic 292-301 | color | STATIC |

**Focus-ring outline is REACT-STATE, not CSS** (`isFocused` from `focusedIndex ===
index`, set via full roving-tabindex keyboard navigation — Arrow/Home/End/Enter,
rustic.tsx:420-475 — the most complete keyboard-nav implementation in this family
alongside Menu's rustic engine). No `onMouseEnter`/`onMouseLeave` anywhere — like
Steps, Stepper has no pointer-hover paint in either engine.

**RUNTIME-DRIVEN paint**: none — status is a discrete enum, not continuous data.

### `compound/Step` (17 sites) — a second, near-duplicate rustic status-color implementation

`compound/Step`'s own `getStatusColors` (index.tsx:205-233) is **structurally
identical** to `engines/rustic.tsx`'s function of the same name — same 4-way switch,
same `bg`/`color`/`border` shape, slightly different fallback-chain depth per token.
This is the SECOND independent copy of the same status→color mapping within this
one component family (root `engines/rustic.tsx` and `compound/Step` both define
it separately; they are never shared). A skin author migrating one must not assume
migrating the other is redundant — verify both independently, they may drift.

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| `getStatusColors` 4-way switch (color, border) | compound/Step 205-233 | color,border | STATE-SELECTED (8 sites, same shape as the root rustic engine) |
| icon container | compound/Step 275-289 | borderRadius,backgroundColor,color,border | STATE-SELECTED (`borderRadius` branches on `variant === 'circles' \| 'default'` vs. a token fallback — the one channel here that is genuinely variant-conditional, not just STATIC-per-resolved-status; the other three are STATIC) |
| title | compound/Step 299-311 | color | STATE-SELECTED (3-way: error → dedicated color, process → dedicated color, default → shared fallback — richer than the root engine's title, which has no `process`-specific branch) |
| subtitle | compound/Step 313-317 | color | STATIC |
| description | compound/Step 319-322 | color | STATIC |
| connector, horizontal variant | compound/Step 325-334 | backgroundColor | STATE-SELECTED (`status === 'finish'` ternary) |
| connector, vertical variant | compound/Step 335-345 | backgroundColor | STATE-SELECTED (same ternary, a **second, separate object literal** — `direction === 'horizontal' ? {...} : {...}` produces two independent `backgroundColor` sites, both counted) |

**Asymmetry vs. the root rustic engine**: `compound/Step`'s title has a genuine
3-way color branch (error / process / default); the root engine's `titleStyle`
(rustic.tsx:233-240) only reads `colors.title` from `getStatusColors`, which itself
only special-cases `error` (not `process`) — so **root-engine Stepper and
`Stepper.Step` compound render a `process`-status title in different colors today**,
a real pre-existing visual inconsistency between the two APIs for the same
component, not something migration should silently reconcile without a team
decision.

### `compound/Content` (3 sites) — a hand-rolled 4-state JS animation machine with a hardcoded-duration trap

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| slide animation, `entering` state | index.tsx:213-218 | transform | STATE-SELECTED (`translateX(${direction === 'forward' ? '20px' : '-20px'})`) |
| slide animation, `visible` state | index.tsx:219-224 | transform | STATIC (`translateX(0)`) |
| slide animation, `exiting` state | index.tsx:225-231 | transform | STATE-SELECTED (mirror of `entering`, opposite sign) |

**Not RUNTIME in the continuous-data sense** (unlike Tabs' indicator) — `direction`
is a binary `'forward' | 'backward'` enum and `animationState` is a 4-value enum
(`entering | visible | exiting | hidden`); every transform value is one of exactly
4 fixed strings. This is fully expressible as static CSS keyed on
`data-animation-state`/`data-direction` attributes — a clean STATE-SELECTED
migration target, not a custom-property hatch case.

**Hand-rolled animation state machine, not CSS-driven at all**: `animationState`
(`entering → visible`, `exiting → hidden`) is advanced entirely by
`requestAnimationFrame` + two `setTimeout(..., 200)` calls (index.tsx:127-150) —
there is no CSS `transitionend`/`animationend` listener anywhere; the JS just
*assumes* the transition finishes in 200ms. **The transition duration is
hardcoded in two independent places that must stay numerically in sync**: the CSS
string `'opacity 0.2s ease, transform 0.2s ease'` (index.tsx:176) and the literal
`200` passed to both `setTimeout` calls (index.tsx:135, 143). Neither reads a
`--ds-motion-*` token. **This is a pre-existing defect worth flagging, and a real
migration hazard**: if a skin file changes this component's transition duration
(e.g. to align with `--ds-motion-fast`/`--ds-motion-normal` the rest of the DS
uses), the JS timeouts will desync from the visual transition — either unmounting
the content before the fade-out finishes, or leaving a visible gap after it
finishes. A migration must either leave the duration untouched, or update all
three numeric occurrences (2 CSS strings + 2 setTimeout literals, 4 total sites)
together.

**Opacity is not a counted channel** — the `fade` animation variant (index.tsx:179-204)
sets only `opacity`/`display`/`pointerEvents`, none of which the counter tracks;
only the `slide` variant's `transform` registers as paint.

### Suppression risk

Identical to Steps: `theme.css:641-648`'s `.steps .step::before/::after` rules apply
to modern Stepper too (same DaisyUI classes, generic selector) — see Steps' section
for the full "STOP-AND-REPORT" finding, not repeated. `rottay-stepper*` and
`rottay-stepper-step*`/`rottay-stepper-content*` classNames (root + both compounds)
have zero stylesheet references anywhere (grep-confirmed) — no suppression risk for
any of them, all fully dead CSS hooks today.

### DaisyUI coupling

Modern engine only, identical to Steps (`steps`, `steps-vertical`/`steps-horizontal`,
`step`, `step-primary`, `step-error`) — not re-derived. Rustic and both compounds
carry zero DaisyUI classes.

### Keyframes / per-instance `<style>` tags

None (`compound/Content`'s animation is transition-based, not keyframe-based — no
`@keyframes` anywhere in this component family's four files).

### Engine asymmetries, dead code, pre-existing defects (record only)

- Two independent DaisyUI-token-bridge implementations across Steps and Stepper
  (`getStepClass`/`getStepTokenStyle`, near-identical).
- Two independent `getStatusColors` implementations within Stepper itself (root
  `engines/rustic.tsx` vs. `compound/Step`), with a real visual divergence on
  `process`-status title color between them (see above).
- `compound/Content`'s transition duration is hardcoded in 4 places (2 CSS strings,
  2 `setTimeout` literals) instead of reading a `--ds-motion-*` token — a
  synchronization hazard for any future change, migration or otherwise.
- Neither engine nor either compound has pointer-hover paint.

## Pagination (16 sites, 2 files) — a stale doc comment claiming DaisyUI that the code doesn't use; otherwise the simplest component in the batch

Root landing: `engines/modern.tsx` (11 sites), `engines/rustic.tsx` (5 sites).
`engines/classic.tsx` not detailed (0 sites).

### Anatomy today

No `data-part`, no first-party className anywhere in either engine beyond the
consumer-supplied `className` — 100% inline in both, no compounds.

**Documentation defect worth flagging**: `engines/modern.tsx`'s header comment
(lines 3-14) and `SIZE_STYLES` comment (lines 54-61) describe "DaisyUI's join
pattern," "join-item pattern with btn size modifiers" — **the actual code renders
zero DaisyUI classes** (grep-confirmed: only the consumer's own `className` appears
anywhere in the file). This is stale documentation, not a stale implementation —
either an earlier DaisyUI-based version was replaced with the current hand-rolled
inline-style version and the comments were never updated, or the comments were
aspirational and never implemented. Either way, a skin author must not assume this
component has any DaisyUI structural class to preserve; treat it as inline-only.

### Paint sites — `engines/modern.tsx`

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| `baseBtnStyle` (shared by all buttons) | modern 192-202 | border,borderRadius(0),background,color | STATIC |
| prev button override | modern 219 | borderRadius,borderRight(none) | STATIC |
| page number button override | modern 231-235 | borderRight(none),background,color | STATE-SELECTED (`page === current` ternary on background/color; borderRight is unconditional) |
| ellipsis button override | modern 242 | borderRight(none) | STATIC |
| next button override | modern 250 | borderRadius | STATIC |

11 counted sites total (grep-verified against the counter). No hover/focus paint at
all in modern — buttons rely entirely on native browser `:disabled`/default focus
styling; no custom interaction treatment.

### Paint sites — `engines/rustic.tsx`

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| `getButtonStyle(isActive, isDisabled)` | rustic 224-232 | border,borderRadius,background,color | STATE-SELECTED (`isActive` drives background/color; border/borderRadius are STATIC) |
| "total items" label | rustic 242 | color | STATIC |

5 counted sites (grep-verified). Same shape as modern: no hover/focus paint, native
browser defaults only. The code comment at rustic.tsx:220-223 documents the
three-level token-fallback convention (`--ds-pagination-*` → `--ds-color-*` →
hardcoded) explicitly and accurately — a good precedent comment, unlike modern's
stale DaisyUI claim.

**RUNTIME-DRIVEN paint**: none in either engine — `current`/`total`/`pageSize` drive
which page NUMBERS render (a data concern), not which paint values apply; the paint
itself is a small closed STATE-SELECTED set (active vs. not, disabled vs. not).

### Suppression risk

`foundation/tokens/css/runtime/personality.css:587-598` carries a "PAGINATION PERSONALITY"
block targeting `.ant-pagination-item` (classic), `.join .btn` (a DaisyUI pattern
this component does not use, per the doc-comment finding above), and
`[data-engine] .ds-pagination-item` (an aspirational hook nobody stamps) — **all
three selectors are orphaned for modern/rustic Pagination** (grep-confirmed zero
`ds-pagination-item`/`join`/`btn` class stamps in either engine file). The block is
transition-timing only (`background-color`/`border-color`/`color` transitions, no
static paint value) and would be a no-op even if it did match. No suppression risk,
same "aspirational hook" shape already seen in Tabs.
`foundation/tokens/css/runtime/engines/modern/theme.css` and `.../rustic/theme.css` have zero
`pagination`-related selectors at all.

### DaisyUI coupling

**None, despite the header comment** — see the documentation-defect note above.
Grep-confirmed zero DaisyUI class tokens anywhere in either engine file.

### Keyframes / per-instance `<style>` tags

None.

### Engine asymmetries, dead code, pre-existing defects (record only)

- Modern's header/size-map comments describe a DaisyUI join/btn implementation that
  does not exist in the code — stale documentation, flag for correction whenever
  this file is next touched (not urgent enough to justify touching it now, per the
  read-only scope of this inventory).
- Both engines are structurally near-identical (shared `getPageNumbers()` algorithm,
  independently duplicated verbatim in both files rather than shared) — a
  duplication note, not a paint concern.
- Neither engine has hover/focus paint; both rely on native `:disabled` styling.

## Segmented (16 sites, 2 files) — the SAME stale "DaisyUI join" doc-comment defect as Pagination, confirming a pattern

Root landing: `engines/modern.tsx` (8 sites), `engines/rustic.tsx` (8 sites).
`engines/classic.tsx` not detailed (0 sites).

### Anatomy today

No `data-part`. Modern's root `<div>` carries only the consumer `className`; each
option `<button>` carries only `opt.className` (a consumer-supplied per-option
class, never a first-party one). Rustic is the same shape. No compounds.

**Second occurrence of the "stale DaisyUI doc comment" defect found in
Pagination**: `engines/modern.tsx`'s header comment explicitly says "Uses DaisyUI's
`join` component for button grouping" and links to
`https://daisyui.com/components/join`, and the component-level remark repeats "Uses
DaisyUI classes and Tailwind utilities... the 'join' component pattern for grouped
buttons." **The actual render has zero DaisyUI classes** (grep-confirmed: only
`className`/`opt.className`, both consumer-supplied, appear anywhere in the file) —
100% inline styles, same as Pagination. This is now a **pattern across two
components sharing near-identical doc-comment phrasing** ("DaisyUI's join
pattern"/"join-item"), suggesting both were migrated off DaisyUI's `join` class at
the same time and neither's comments were updated. Flag for correction; treat both
as fully inline, no DaisyUI class to preserve.

### Paint sites — `engines/modern.tsx`

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| root container | modern 192 | border,borderRadius | STATIC |
| option button base | modern 203-216 | border(none),borderRadius(0) | STATIC |
| option button active/inactive | modern 212-214 | background,color | STATE-SELECTED (`isActive` ternary) |

That's the full 8-site count once each object-literal key inside the ternary
branches is tallied individually (border/borderRadius on the root = 2, border/
borderRadius unconditional on the button = 2, background/color × 2 branches
(active/inactive) = 4).

### Paint sites — `engines/rustic.tsx`

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| `styles.container` | rustic 107-112 | background(via `backgroundColor`),borderRadius | STATIC |
| `styles.button` base | rustic 121-132 | border(none),background(transparent),borderRadius | STATIC |
| `styles.buttonActive` | rustic 144-149 | background(via `backgroundColor`),boxShadow,color | STATE-SELECTED (`isActive` ternary applies the whole object) |

8 sites total (grep-verified against the counter after excluding two JSDoc example
blocks in the header comment that contain lookalike `backgroundColor`/`borderRadius`
strings — those are documentation prose, not runtime code, and the counter's
comment-stripping pass correctly excludes them; a naive line-count grep does not).

**Hardcoded literals to list (per the migration kit's ask)**: rustic's fallback
chains bottom out in raw hex/rgba more than once in this one `styles` object —
`var(--ds-segmented-bg, var(--ds-color-neutral-100, #f5f5f5))`,
`var(--ds-segmented-active-bg, #fff)`,
`var(--ds-segmented-active-shadow, 0 2px 8px rgba(0,0,0,0.08))`, and
`var(--ds-segmented-active-color, var(--ds-color-primary-500, #1677ff))`. All four
are documented explicitly in the file's own JSDoc "Multi-Tenant Theming" section
(rustic.tsx:26-31) as the literal fallback values — an unusually well-documented
component for this batch.

**Interaction mechanism — both engines 100% STATE-SELECTED via `isActive`/
`isDisabled`, zero CSS pseudo-classes, zero imperative writes, zero hover paint**:
neither engine has `onMouseEnter`/`onMouseLeave` — like Steps/Stepper/Pagination,
Segmented has no pointer-hover visual feedback in either engine, only active/
disabled. `styles.button.transition: 'all 0.3s'` (rustic) exists but has nothing to
transition INTO on hover, since there is no hover state — likely present for the
active-state transition (clicking a different option) rather than pointer hover.

**RUNTIME-DRIVEN paint**: none — `value` is a discrete option match, not continuous
data.

### Suppression risk

None found. `foundation/tokens/css/runtime/engines/modern/theme.css` has zero `.join`/`.segmented`
selectors (grep-confirmed — the `.btn`/`.btn-primary` blocks documented under
FloatButton do not apply here since Segmented's buttons carry no `btn` class).
`foundation/tokens/css/runtime/personality.css` and `foundation/tokens/css/runtime/engines/rustic/theme.css` have
zero `segmented` hits. Clean greenfield migration, no legacy-layer entanglement.

### DaisyUI coupling

**None in the rendered output**, despite the header comment — see the
documentation-defect note above. This is the family's second confirmed instance of
a component whose comments describe DaisyUI usage it does not actually have
(Pagination was the first); worth flagging to the team as a pair, not two isolated
findings.

### Keyframes / per-instance `<style>` tags

None.

### Engine asymmetries, dead code, pre-existing defects (record only)

- Both engines share the identical `isActive`/`isDisabled` STATE-SELECTED shape and
  near-identical option-normalization logic, duplicated rather than shared (same
  pattern as Pagination's duplicated `getPageNumbers()`).
- Neither engine has hover paint.
- The stale "DaisyUI join" doc comments (both here and in Pagination) should be
  corrected together whenever either file is next touched for a non-inventory
  reason.

## BackTop (12 sites, 2 files) — a standalone near-duplicate of `FloatButton.BackTop`

Root landing: `engines/modern.tsx` (5 sites), `engines/rustic.tsx` (7 sites).
`engines/classic.tsx` not detailed (0 sites). No compounds, no `data-part`, no
first-party className beyond consumer-supplied.

**Architectural duplication worth flagging**: this is a **separate, standalone
primitive** (`primitives/navigation/BackTop/`) implementing the exact same
"scroll-to-top button" concept as `FloatButton.BackTop` (documented earlier in this
report) — same scroll-listener logic, same `scrollTo({ top: 0, behavior: 'smooth'
})` handler, near-identical prop shape (`visibilityHeight`, `target`), independently
reimplemented rather than shared. Two primitives, same behavior, two codebases.

### Paint sites — `engines/modern.tsx`

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| button | modern 162-175 | borderRadius(50%),border(none),background,color,boxShadow | STATIC |

Modern **unmounts** the button when not visible (`if (!visible) return null`,
modern.tsx:155) rather than animating — no visibility-state paint at all, matching
the same "conditional render vs. CSS transition" asymmetry `FloatButton.BackTop`
does not have (that one always uses CSS opacity/transform via `styles.hidden`/
`.visible` on both root and this-file's rustic engine).

### Paint sites — `engines/rustic.tsx`

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| `styles.button` base | rustic 60-79 | borderRadius(50%),backgroundColor,color,border(none),boxShadow | STATIC |
| `styles.hidden` | rustic 82-86 | transform(`scale(0)`) | STATE-SELECTED (`visible` ternary) |
| `styles.visible` | rustic 88-91 | transform(`scale(1)`) | STATE-SELECTED (`visible` ternary) |

Rustic keeps the button mounted always and animates `opacity`+`transform` via CSS
`transition` (rustic.tsx:78, `'opacity 0.3s, transform 0.3s'`) — the inverse
mechanism from modern. No hover paint in either engine.

### Suppression risk / DaisyUI coupling / keyframes

None. `grep -n "backtop" theme.css/personality.css` returns zero hits in either
engine's stylesheet layer — fully greenfield, no legacy entanglement, no DaisyUI
class anywhere.

---

## Breadcrumb (9 sites, 3 files) — a genuine, accurate DaisyUI dependency; a second-emitter theme.css pair whose specificity tie-break is not obvious from reading top to bottom

Root landing: `engines/modern.tsx` (5 sites), `engines/rustic.tsx` (3 sites),
`compound/Item` (1 site, engine-agnostic). `engines/classic.tsx` not detailed.

### Anatomy today

No `data-part`. Modern's root carries the real DaisyUI `breadcrumbs` class (this
component's header comment is **accurate**, unlike Pagination/Segmented — a useful
contrast confirming the stale-comment defect is not universal in this batch).
Rustic's root is a semantic `<nav aria-label="breadcrumb">` with no first-party
class. `compound/Item` stamps `rottay-breadcrumb-item` — grep-confirmed **dead**,
same shape as every other compound BEM class in this family.

### Paint sites — `engines/modern.tsx`

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| root container | modern 166-177 | color,background,border | STATIC (values are tenant-token-driven but each key is a fixed formula, not a runtime branch) |
| root, `--bc-color` custom-property redirection | modern 176 | (uncounted quoted key) | n/a — the correct hatch pattern, redirecting DaisyUI's own separator-color variable |
| link `<a>` | modern 184-190 | color | STATIC |
| active `<span>` (current page) | modern 194 | color | STATIC |

5 sites (the counted 5 are: root's `color`+`background`+`border` = 3, link's
`color` = 1, active span's `color` = 1; `--bc-color` is a quoted custom-property
key, correctly uncounted).

**This is the second occurrence of a real, load-bearing DaisyUI dependency that a
migration cannot fully resolve by moving inline values** (Steps was the first).
Modern Breadcrumb's separators are rendered via DaisyUI's own `::before`
pseudo-elements — unreachable by any inline style — and the component redirects
color via `--bc-color`, DaisyUI's own internal custom property, exactly the Steps
pattern.

**A second-emitter theme.css pair exists for `.breadcrumbs`, and unlike every
prior second-emitter pair found in this batch (FloatButton's `.btn`, both purely
suppressed by inline), this one has a LIVE, non-obvious internal tie-break that
determines what a real user sees today**:
- **Block 1** (`foundation/tokens/css/runtime/engines/modern/theme.css:612-635`, "BREADCRUMBS -
  .breadcrumbs"): `--ds-breadcrumb-*` vocabulary — matches this component's own
  token names. Separator rule: `[data-tenant] .breadcrumbs li + li::before { color:
  var(--ds-breadcrumb-separator-color); }` (adjacent-sibling combinator).
- **Block 2** (`theme.css:896-944`, "BREADCRUMB - .breadcrumbs (DaisyUI)", **later
  in the same file**): a *different* token vocabulary (`--ds-text-tertiary`,
  `--ds-text-secondary`, `--ds-color-primary-600`, `--ds-text-primary`) and is the
  **only** block that defines the separator's actual `content: '/'`, `margin: 0
  8px`, and the `li:first-child::before { display: none }` rule that hides it on
  the first crumb. Separator rule: `[data-tenant] .breadcrumbs li::before { content:
  '/'; margin: 0 8px; color: var(--ds-text-tertiary); }` (no sibling combinator).
- **The tie-break is not "later wins"**: block 1's selector (`li + li::before`, two
  type selectors + one pseudo-element) is **more specific** than block 2's
  (`li::before`, one type selector + one pseudo-element) — so for the separator's
  `color` property specifically, **block 1 wins despite appearing earlier in the
  file** (`--ds-breadcrumb-separator-color`, not `--ds-text-tertiary`), while
  `content`/`margin`/the first-child hide rule apply from block 2 unopposed (block 1
  never sets them). The final rendered separator is a **merge across both blocks**,
  and the winning color token is the one that is easy to miss on a top-to-bottom
  read.
- **STOP-AND-REPORT, same shape as Steps**: whether the component's own `--bc-color`
  redirection (which neither theme.css block references at all — both set `color`
  directly, not via `--bc-color`) has ANY live effect depends on whether DaisyUI's
  own compiled stylesheet's `::before` rule (not part of `foundation/tokens/css/`, not read for
  this inventory) uses `--bc-color` in a way these two first-party overrides don't
  already out-specificity. Verify empirically before assuming `--bc-color` matters.
- The `li a` / `li a:hover` declarations in both blocks (620-627, 931-938) are fully
  **suppressed** either way — modern.tsx's inline `color` on the `<a>` is set
  unconditionally with no hover branch, so neither block's link color, nor either
  block's hover color, is ever visible today. Standard suppression, not a hazard.

### Paint sites — `engines/rustic.tsx`

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| `linkStyle` | rustic 181-188 | color | STATIC |
| `itemStyle` (non-link/current) | rustic 191-196 | color | STATIC |
| `separatorStyle` | rustic 199-201 | color | STATIC |

3 sites. No hover, no DaisyUI, no pseudo-element separator — rustic renders the
separator as a real `<span>{separator}</span>` sibling (fully inline-addressable,
no pseudo-element trap). `separator` itself may be a string or a full React element
(custom separator support modern explicitly lacks, per its own doc comment's
"Limitations" section) — a genuine feature asymmetry, not just paint.

### `compound/Item` (1 site)

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| link/text color | compound/Item 192-196 | color | STATE-SELECTED (`href` presence ternary: primary color when linked, `inherit` otherwise) |

Renders `rottay-breadcrumb-item` on its outer `<span>` — dead CSS hook, zero
stylesheet references. No hover paint; `cursor` changes with `href`/`onClick`
presence but that's not a counted channel.

### DaisyUI coupling

**Real and accurate for modern** — `breadcrumbs` is a live DaisyUI class, correctly
documented. Rustic and `compound/Item` carry none.

### Keyframes / per-instance `<style>` tags

None in any of the three files.

### Engine asymmetries, dead code, pre-existing defects (record only)

- Modern ignores the `separator` prop entirely (destructured and discarded,
  documented as an intentional DaisyUI limitation); rustic and `compound/Item` both
  honor custom separators (rustic via the `separator` prop, `compound/Item` doesn't
  render a separator at all — that's the parent `Breadcrumb`'s job when composing
  children, out of this file's scope).
- The `.breadcrumbs` second-emitter pair (theme.css) is the first one found in this
  batch where the tie-break is genuinely load-bearing rather than moot — flag for
  the team regardless of migration timing, since it affects what colors this
  component actually shows today.
- `rottay-breadcrumb-item` is a dead CSS hook, same as every other compound BEM
  class in this family.

## BottomTabBar (7 sites, 1 file) — engine-agnostic, composes DS primitives directly

`BottomTabBar/BottomTabBar.tsx`, single file, no `engines/` split at all — it
composes `Box`/`Flex`/`Text` (which resolve through the engine system on their own)
rather than branching per engine itself. No `data-part`; only `data-testid` hooks
(`bottom-tab-bar`, `tab-item-${key}`, `tab-badge-${key}`) — test-only, not a skin
surface.

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| tab item (`tabStyle`) | BottomTabBar.tsx 66-83 | background(none),border(none),color | STATE-SELECTED (`isActive` drives `color`, computed once as a local variable and reused three times — see below) |
| icon container | BottomTabBar.tsx 100-112 | color | STATE-SELECTED (same `color` variable) |
| badge container | BottomTabBar.tsx 116-131 | background | STATIC |
| badge text | BottomTabBar.tsx 133-142 | color | STATIC (hardcoded `#fff`, not a `--ds-*` token — the only literal color in this file) |
| label text | BottomTabBar.tsx 148-156 | color | STATE-SELECTED (same `color` variable a third time) |

**One computed value, three sites**: `TabItemRenderer` computes `color` once
(`isActive ? 'var(--ds-color-primary)' : 'var(--ds-color-text-muted)'`,
BottomTabBar.tsx:57-59) and reuses the same JS variable on the tab button, the icon
wrapper, and the label text — a single STATE-SELECTED decision fanning out to 3
counted sites. A skin rule can express this as one `color` declaration on the root
`[data-part='tab']` if `color` is allowed to inherit into the icon/label, or as
three coordinated rules if it is not — check whether the icon/label currently rely
on inheritance or redundantly re-declare (they redundantly re-declare today, all
three are independent `color:` keys, not `inherit`).

**Hardcoded literal**: badge text color is a bare `'#fff'`, the only non-token
color value in this file — flag for the migration's literal list.

**No hover paint, no keyframes, no DaisyUI classes.** `env(safe-area-inset-bottom,
0px)` (containerStyle) is a real, load-bearing non-paint value for notched-device
support — not a counted channel, leave untouched.

### Suppression risk

None — `foundation/tokens/css/` has zero `bottomtabbar`/`bottom-tab-bar` hits in any layer.

---

## Anchor (7 sites, 2 files) — the batch's only confirmed instance of the retired `Hermes`/`Apollo`/`Titan` engine names surviving in runtime code

Root landing: `engines/modern.tsx` (2 sites), `engines/rustic.tsx` (5 sites).
`engines/classic.tsx` not detailed.

**Retired-engine-name defect, not a paint finding but worth flagging clearly**:
CLAUDE.md states "The canonical engine names are `classic` / `modern` / `rustic` /
`custom`. The legacy names `titan` / `hermes` / `apollo` are gone — do not
reintroduce them." **Anchor's two engine files still use these retired names
throughout** — not just in doc comments (`@fileoverview Anchor Hermes Engine`,
`@fileoverview Anchor Apollo Engine`, `@see {@link TitanAnchor}`,
`@see {@link HermesAnchor}`, `@see {@link ApolloAnchor}`, module tags
`@module Anchor/Engines/Hermes` / `.../Apollo`) but **baked into runtime
`displayName` strings**: `Anchor.displayName = 'Anchor.Hermes'` (modern.tsx:363),
`Link.displayName = 'Anchor.Link.Hermes'` (modern.tsx:200),
`Anchor.displayName = 'Anchor.Apollo'` (rustic.tsx:448),
`Link.displayName = 'Anchor.Link.Apollo'` (rustic.tsx:274). This is the only
component found in this inventory where the retired naming law is violated in
actual shipped code, not just prose — out of scope to fix in a read-only inventory,
but a real, concrete finding the team should act on independent of the skin
migration.

### Paint sites — `engines/modern.tsx`

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| `Anchor.Link` `<a>` | modern 183-187 | color,borderColor | STATE-SELECTED (`isActive` ternary; `borderColor` only present in the active branch, absent — not `transparent` — when inactive) |

Root `Anchor` container has zero counted paint (only Tailwind layout utilities and
a `top` value). Active-state border relies on the Tailwind class
`border-l-2`/`border-transparent` (inactive) pairing with the conditionally-present
inline `borderColor` (active) — a STATIC class handles the "no border" case, the
inline STATE-SELECTED value handles the "colored border" case; classic mixed
mechanism worth noting for the migration (part of the border comes from a class,
part from inline — a skin must reproduce both halves).

**No hover state in modern** — despite the header comment claiming "Hover state
styling" as a feature, modern `Anchor.Link` has **no** `onMouseEnter`/`onMouseLeave`,
no `:hover` class, nothing — a third instance in this batch of a doc comment
describing behavior the code does not have (after Pagination and Segmented's
DaisyUI claims). Only rustic actually implements hover (see below).

### Paint sites — `engines/rustic.tsx`

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| `styles.link` base | rustic 114-122 | color,borderLeft(transparent) | STATIC |
| `styles.linkActive` | rustic 125-129 | color,borderLeftColor | STATE-SELECTED (`isActive`) |
| `styles.linkHover` | rustic 132-134 | color | STATE-SELECTED (`isHovered && !isActive` — hover is explicitly suppressed once a link is active) |

**Real hover here, and it uses the shared behavior-core hook**, not a local
`useState`: `useInteractionState()` from `../../../../../behavior` (rustic.tsx:219)
— the first component in this family to source its hover/focus state from a shared
primitive rather than a bespoke `useState`. The code comment (rustic.tsx:214-218)
explicitly documents why: "inline styles cannot use `:hover` pseudo-selectors...
The triad is decided once, in the behavior core." This is a cleaner precedent than
every other REACT-STATE hover mechanism found so far in this batch — worth citing
as the preferred shape if the team ever wants to consolidate.

### Suppression risk / DaisyUI coupling / keyframes

None of any kind — `foundation/tokens/css/` has zero `anchor` hits across all three layers
(theme.css ×2, personality.css). Fully greenfield. No DaisyUI classes in either
engine (modern uses Tailwind utility classes only — `sticky`, `top-0`, `flex`,
`gap-2`, `block`, `py-1`, `px-3`, `text-sm`, `border-l-2` — these are Tailwind
utilities, not DaisyUI component classes, and are not the coupling risk the brief
asks about).

## MobileHeader (6 sites, 1 file) — engine-agnostic, same shape as BottomTabBar

`MobileHeader/MobileHeader.tsx`, single file, no `engines/` split — composes `Box`/
`Flex`/`Text`. No `data-part`; only `data-testid` hooks (`mobile-header`,
`mobile-header-back`, `mobile-header-left`, `mobile-header-title`,
`mobile-header-right`) — test-only.

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| back button | MobileHeader.tsx 86-97 | background(none),border(none),color | STATIC |
| container | MobileHeader.tsx 106-121 | background,borderBottom | STATIC (`sticky` prop only affects `position`/`zIndex`, not paint) |
| title text | MobileHeader.tsx 164-173 | color | STATIC |

6 sites (3+2+1). No hover, no keyframes, no DaisyUI classes, no suppression
(`foundation/tokens/css/` has zero `mobile-header`/`mobileheader` hits in any layer). The left/
center/right slot wrapper `Box`es carry only layout properties, no counted paint.
`env(safe-area-inset-top, 0px)` is load-bearing non-paint, same shape as
BottomTabBar's bottom-inset — leave untouched.

---

## ActionDock (3 sites, 1 file) — engine-agnostic, two hardcoded shadow literals that differ only by sign

`ActionDock/ActionDock.tsx`, single file, no `engines/` split — composes `Box`/
`Flex`. No `data-part`; only `data-testid="action-dock"`.

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| container, bottom position | ActionDock.tsx 60-66 | background,boxShadow | STATE-SELECTED (`isBottom` ternary picks one of two branches; `background` is unconditional/STATIC, `boxShadow` differs per branch) |
| container, top position | ActionDock.tsx 67-72 | boxShadow | STATE-SELECTED (the `else` branch of the same ternary) |

3 sites (1 unconditional `background` + 2 mutually-exclusive `boxShadow` branches).

**Hardcoded literals**: `'0 -2px 8px rgba(0, 0, 0, 0.08)'` (bottom) and
`'0 2px 8px rgba(0, 0, 0, 0.08)'` (top) — neither rides a `--ds-*` token at all,
unlike every other shadow value found elsewhere in this batch
(`var(--ds-elevation-*)`, `var(--ds-*-shadow, ...)`). These are the two values to
carry forward verbatim into a skin rule keyed on `data-position='bottom' \|
'top'`. `max(12px, env(safe-area-inset-bottom, 12px))` /
`max(12px, env(safe-area-inset-top, 12px))` are load-bearing non-paint padding
values, same notched-device pattern as BottomTabBar/MobileHeader.

No hover, no keyframes, no DaisyUI classes, no suppression (zero `action-dock`/
`actiondock` hits anywhere in `foundation/tokens/css/`).

---

## Affix (2 sites, 2 files) — the smallest component in the batch; paint exists only in the affixed state

Root landing: `engines/modern.tsx` (1 site), `engines/rustic.tsx` (1 site).
`engines/classic.tsx` not detailed.

| Engine | Part | File:Lines | Channels | Class |
|---|---|---|---|---|
| modern | affixed-state shadow | modern.tsx:335 | boxShadow | STATE-SELECTED (`state.affixed` ternary — the un-affixed branch has zero counted paint) |
| rustic | affixed-state shadow | rustic.tsx:335 | boxShadow | STATE-SELECTED (same shape; hardcoded fallback `0 2px 8px rgba(0, 0, 0, 0.15)` inside the `var(--ds-affix-shadow, ...)` chain) |

Both engines share the identical `measure()`/scroll-listener/placeholder-div
architecture (near-verbatim duplicated between the two files, including comments) —
the ONLY divergence is presentation: rustic stamps real classNames
(`rottay-affix`, `rottay-affix--rustic`, `rottay-affix--affixed`) and exposes four
`--ds-affix-*` custom properties (`z-index`, `offset-top`, `offset-bottom`,
`transition`) as a tenant-theming surface; modern stamps no first-party class and
exposes no custom properties, relying on Tailwind's `z-{10,20,30,40,50}` utility
classes for z-index instead of a token. **`rottay-affix*` classes are dead CSS
hooks** — grep-confirmed zero references anywhere in `foundation/tokens/css/`, same shape as
every other unreferenced first-party class in this family.

No hover, no keyframes, no DaisyUI classes, no suppression risk (zero `affix` hits
anywhere in `theme.css`/`personality.css`).

---

## Link (2 sites, 2 files) — a second genuine, accurate DaisyUI dependency

Root landing: `engines/modern.tsx` (1 site), `engines/rustic.tsx` (1 site).
`engines/classic.tsx` not detailed.

### `engines/modern.tsx`

Carries **real, accurately-documented DaisyUI classes** — `link`, `link-primary`/
`link-secondary`/`link-success`/`link-warning`/`link-error`/`link-info` (the
`typeClassMap`, modern.tsx:70-77) — the second confirmed-accurate DaisyUI
dependency in this batch (after Breadcrumb; contrast with Pagination/Segmented's
stale claims). The doc comment even documents the one naming bridge needed
(`danger` → DaisyUI's `link-error`, not `link-danger`) — accurate and useful.

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| `<a>` | modern.tsx:196 | color | STATE-SELECTED (`typeColorMap[type]` lookup, 6-way) |

The doc comment explains the intent precisely: "These inline styles ensure
tenant-aware theming takes precedence over DaisyUI's built-in color classes"
(modern.tsx:79-82) — i.e., the inline `color` is **deliberately** always-present
specifically to out-rank DaisyUI's own `link-primary` etc. color, by design, not an
accident of authoring order. This is the cleanest, most self-aware instance of the
"inline suppresses DaisyUI class" pattern found anywhere in this batch — worth
citing as the reference precedent for how a migration should reason about the
other, less self-documented cases (Steps, Breadcrumb) in this same report.

**No hover paint in modern** — despite DaisyUI's own `.link` class typically
carrying hover/underline behavior, this component sets `textDecoration` inline,
unconditionally, with no hover branch — the same "doc claims interaction, code has
none" gap noted for Anchor's modern engine does NOT reproduce here (Link's comment
doesn't claim hover, so no defect to flag).

### `engines/rustic.tsx`

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| `<a>` | rustic.tsx:169 | color | STATE-SELECTED (`disabled` ternary → hardcoded `rgba` when disabled, else a 6-way `getColorVar()` switch) |

**Hardcoded literals**: the disabled-state color `rgba(0, 0, 0, 0.25)` (no
`--ds-*` token at all, unlike every other disabled-state value in this file) plus
five hex fallbacks buried inside `getColorVar()`'s three-level `var()` chains
(`#1677ff`, `#595959`, `#52c41a`, `#faad14`, `#ff4d4f`) — all documented in the
file's own header comment (rustic.tsx:37-44) as "Inline Styles Applied," another
well-self-documented file in this batch.

`transition: 'color 0.2s ease-in-out'` exists in rustic but there is **no hover
state at all** to transition into (no `onMouseEnter`/`onMouseLeave`, no
`:hover`) — the transition is dead weight for pointer interaction today, present
only for the `disabled` prop toggling live (a real, if unusual, use of `transition`
that a skin must preserve since it's not purely vestigial).

### Suppression risk / keyframes

None found for either engine — `foundation/tokens/css/runtime/engines/modern/theme.css` has zero
`.link`/`.link-*` selectors (grep-confirmed), so nothing competes with or is
suppressed by this component's own inline override in the first place; the design
intent documented in the code (inline wins on purpose) is honored trivially because
there is no competing rule at all today, not because of the unlayered-skin law.
`personality.css` and `rustic/theme.css` have zero `link` hits.

## Cross-batch notes

- **Zero `data-part`/skin CSS anywhere in this batch** — all 15 components are
  greenfield, same starting state as WO-SKIN-03's five status components. Every
  proposed scope class checked in this report (`.rottay-menu*`, `.rottay-stepper*`,
  `.rottay-affix*`, etc.) is grep-confirmed FREE.
- **Almost every first-party BEM/utility className this family already stamps is a
  dead CSS hook** — Menu's four compounds, Stepper's `compound/Step`/
  `compound/Content`, Breadcrumb's `compound/Item`, and Affix's rustic engine all
  carry real classNames with zero references anywhere in `foundation/tokens/css/`. A future
  skin can either adopt `data-part` fresh or repurpose these existing names; either
  way, nothing currently paints from them, so there is no suppression risk in
  reusing them.
- **RUNTIME (continuous-data-driven) paint is almost nonexistent in this family** —
  the sole example is Tabs' sliding indicator `transform` (measured via
  `getBoundingClientRect()` every active-tab change). Everything else that looks
  "dynamic" resolves to a finite STATE-SELECTED enum (status, active/hover/disabled
  booleans, a handful of fixed animation-state values in `Stepper.Content`) — the
  overwhelming majority of this batch's 280 sites split between STATIC (author-time
  constants) and STATE-SELECTED (small enum/boolean branches), not RUNTIME.
- **Three components have real, load-bearing DaisyUI structural coupling**
  (Steps/Stepper's `.steps .step`, FloatButton's `.btn`/`.btn-primary`/`.btn-ghost`,
  Link's `.link`/`.link-*`) and **two have accurately-documented but non-coupling
  Tailwind-only usage** (Anchor's utility classes) or a correctly-scoped DaisyUI
  dependency with no competing first-party override (Breadcrumb, partially — see
  its own second-emitter finding). **Three components have stale doc comments
  claiming DaisyUI usage the code does not have** (Pagination, Segmented, and
  Anchor's claimed-but-missing hover) — a documentation-drift pattern, not a paint
  defect, but worth a team pass independent of this migration.
- **No shorthand-then-undefined-longhand clobber pattern found anywhere** in this
  batch (checked every conditional `undefined`/ternary-absent border/background
  branch).
- **No `<Text>`-primitive color-prop mapping surface to check** in most files —
  BottomTabBar/MobileHeader/ActionDock use the DS `Text` primitive but only via its
  raw `style` prop, not a semantic color prop.
- **Retired engine names (`Hermes`/`Apollo`/`Titan`) survive in shipped runtime code
  only in Anchor** (`displayName` strings, not just comments) — a standing
  violation of the canonical-engine-names law in CLAUDE.md, unrelated to paint,
  flagged for the team to fix independent of any skin work.

## Summary (16 lines)

- Menu: 59 sites / 6 files (modern 31, rustic 16, compound/Divider 4,
  compound/SubMenu 4, compound/Item 3, compound/Group 1) — a document-global,
  singleton-injected `:focus-visible` stylesheet the counter cannot see, racing a
  now-dead imperative `.style.outline=` handler; a large layered `.rottay-menu`
  theme.css block fully suppressed by inline paint on every real element.
- FloatButton: 44 sites / 2 files (modern 29, rustic 15) — the clearest DaisyUI
  structural-class coupling in the batch (`getFloatButtonClassName()`, one of 16
  files in the `daisy.classConsumers` ratchet); modern's hover/active scale
  transform is delivered ENTIRELY by a layered `.btn:hover`/`.btn:active` rule with
  zero inline contest — a real "personality wins today" channel, not suppressed.
- Tabs: 28 sites / 2 files (modern 22, rustic 6) — the batch's only true
  RUNTIME/continuous paint (compositor-only sliding-indicator `transform`, explicitly
  engineered to satisfy a *second*, separate compositor-only ratchet the codebase
  runs); a non-namespaced, non-deduplicated `@keyframes` re-injected per instance
  and per render.
- Steps: 26 sites / 2 files (rustic 21, modern 5) — the deepest DaisyUI coupling
  found: circle/connector paint is a pseudo-element DaisyUI itself renders, with a
  first-party theme.css override competing against the component's own
  custom-property redirection for the same visual result (verify empirically before
  migrating).
- Stepper: 43 sites / 4 files (rustic 19, compound/Step 17, modern 4,
  compound/Content 3) — near-duplicates Steps' DaisyUI pattern on modern and its own
  rustic status-color logic between root and `compound/Step` (with a real color
  divergence on `process`-status titles between the two); `compound/Content`'s
  4-state slide/fade animation is a hand-rolled JS timer machine with the transition
  duration hardcoded in 4 unsynced places.
- Pagination: 16 sites / 2 files (modern 11, rustic 5) — stale "DaisyUI join"
  doc-comment claim with zero actual DaisyUI classes in the code; otherwise the
  simplest, cleanest component in the batch.
- Segmented: 16 sites / 2 files (modern 8, rustic 8) — the SAME stale "DaisyUI
  join" doc-comment defect as Pagination, confirming a shared authoring-era pattern
  rather than two isolated mistakes.
- BackTop: 12 sites / 2 files (rustic 7, modern 5) — a fully independent,
  standalone reimplementation of `FloatButton.BackTop`'s exact concept; fully
  greenfield, no legacy layer.
- Breadcrumb: 9 sites / 3 files (modern 5, rustic 3, compound/Item 1) — a genuine,
  accurately-documented DaisyUI dependency with a second-emitter theme.css pair
  whose specificity tie-break (not "later wins") determines the live separator
  color today, the most subtle suppression finding in the batch.
- BottomTabBar: 7 sites / 1 file, engine-agnostic — one computed `color` value
  fanned out to 3 independent (non-inheriting) sites; the only hardcoded literal
  color (`#fff`) outside a fallback chain found in this family.
- Anchor: 7 sites / 2 files (rustic 5, modern 2) — the only component in this
  inventory where the retired `Hermes`/`Apollo`/`Titan` engine names survive in
  shipped `displayName` runtime strings, not just comments; modern's doc comment
  claims hover behavior the code does not implement, while rustic's real hover uses
  the shared `useInteractionState()` behavior-core hook, the cleanest hover
  mechanism found in this batch.
- MobileHeader: 6 sites / 1 file, engine-agnostic — fully static, no findings
  beyond the standard notched-device `env()` padding pattern.
- ActionDock: 3 sites / 1 file, engine-agnostic — two hardcoded `rgba()` shadow
  literals (top/bottom variants) with no `--ds-*` token backing at all, unlike every
  other shadow value in this batch.
- Affix: 2 sites / 2 files (1 each) — the smallest component; paint exists only in
  the affixed state (a single `boxShadow` per engine); rustic's `rottay-affix*`
  classes are dead CSS hooks.
- Link: 2 sites / 2 files (1 each) — a second genuine, accurately-documented
  DaisyUI dependency, and the cleanest, most self-aware "inline deliberately
  suppresses the DaisyUI class" precedent in the whole report (the code comment
  states the intent explicitly).
- **Three biggest traps for whoever migrates this family**: (1) Steps/Stepper's
  competing DaisyUI-pseudo-element color mechanisms (`--step-color` redirection vs.
  a direct `theme.css` `::before`/`::after` override) — verify empirically which one
  actually paints before writing a skin rule, do not assume the inline TSX value is
  the source of truth; (2) FloatButton's hover/active scale transform, which has NO
  inline representation at all today and is delivered purely by a layered `.btn`
  rule — a migration that doesn't explicitly carry this forward will silently lose
  the interaction, and it will not show up in any inline-paint diff because there
  was never anything inline to diff; (3) Breadcrumb's second-emitter `.breadcrumbs`
  pair, where the live separator color is decided by a specificity tie-break that
  runs opposite to file order — reading theme.css top-to-bottom gives the wrong
  answer for which token is actually live.

All CRITICAL LAWS checked: no shorthand-then-undefined-longhand clobber; every
proposed scope-class namespace grep-confirmed free; no wall-clock/timer-driven
paint found anywhere in this family (the one JS-timer mechanism,
`Stepper.Content`'s animation state machine, drives `transform`/`opacity` off a
`setTimeout`, not off elapsed wall-clock time, and its hazard is duration
desynchronization, not paint-per-tick).
