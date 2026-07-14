# WO-SKIN-06 CK-G navigation-pattern paint inventory (read-only)

All paths relative to `packages/core/src/components/patterns/navigation/`. Same
channel scope and classification legend as the WO-SKIN-04/wo-skin-06-triage
precedents: a "site" is an object-literal style key named `background*`,
`border*`, `outline*`, `color`, `boxShadow`, `textShadow`, `fill`, `stroke`,
`accentColor`, `filter`, `backdropFilter`, `WebkitBackdropFilter`, or
`transform`, or an imperative `.style.<paint> =` / `.style.setProperty(...)`
write (`packages/core/scripts/lib/inline-paint-counter.mjs`, the single source
of truth). **STATIC** (author-time constant), **STATE-SELECTED** (a
ternary/switch over static leaves, keyed by React state or a prop — becomes a
CSS rule on a pseudo-class or `data-*`), **RUNTIME** (computed at render time,
must stay inline), **HATCH** (a runtime value that reaches the paint channel
but can be handed to CSS via a `--ds-*` custom property, rule stays in the
skin). Site counts below are machine-verified against
`node scripts/engine-token-audit.mjs | grep fleet.inlinePaint.patterns/navigation`,
which reproduces the checkpoint's total exactly: **279 sites, 10 files** (the 5
`classic.tsx` engines wrap Ant Design directly — `Modal`, `Dropdown`,
`Popover`, `Avatar`/`Badge` — and carry 0 counted sites each; not detailed
further, same disposition as every classic engine in this program).

```
environment-toggle   modern 45  rustic 50   = 95
workspace-switcher   modern 29  rustic 35   = 64
command-palette       modern 28  rustic 29   = 57
shortcuts-overlay     modern 19  rustic 24   = 43
locale-switcher        modern  6  rustic 14   = 20
                                              -----
                                                279
```

**Zero `data-part` anywhere in this family** (grep-confirmed) and **no skin CSS
file exists yet for any of these 5 components** (grep-confirmed across
`tokens/css/components/skin/`, `tokens/css/engines/{modern,rustic}/skin/`, and
every `theme.css`/`personality.css`) — every component below is greenfield,
same starting state as WO-SKIN-03/04's precedent components.

---

## 0. Headline answer to the brief's central question: ONE SKIN OR FIVE?

**Five.** The triage's §6 grouping ("Menu/palette/switcher vocabulary") is the
*same falsified premise* as CK-C and CK-D, for the same root cause: SIMILARITY
was read as SHARING, and nobody grepped importers. Concretely:

- **Zero cross-component imports.** No file in `workspace-switcher/`,
  `command-palette/`, `shortcuts-overlay/`, or `locale-switcher/` imports
  anything from `environment-toggle/`, or from each other. Each component's
  dropdown/dialog/menu chrome is independently authored.
- **The one REAL shared vocabulary is DS-wide infrastructure, not a CK-G
  concept**: `patterns/_internal/engines/modern/styles.ts`
  (`popupPanelStyle`, `pillBadgeSmStyle`, `menuSectionTitleStyle`,
  `menuItemStyle`, …) — genuinely shared, byte-identical where imported. But
  adoption is **partial and inconsistent**, modern-only, and every rustic
  engine in the family hand-rolls its own module-level style constants from
  scratch (zero sharing between rustic files):

  | component (modern engine) | imports from `_internal/engines/modern/styles` |
  |---|---|
  | environment-toggle | `popupPanelStyle`, `pillBadgeSmStyle`, `inlineActionGroupStyle` (**last one imported, never used — dead import**, see §1) |
  | workspace-switcher | `popupPanelStyle`, `pillBadgeSmStyle`, `menuSectionTitleStyle` |
  | command-palette | `menuSectionTitleStyle` only |
  | shortcuts-overlay | **none** — hand-rolls a `rounded-xl`/`shadow`/bordered dialog chrome that is visually near-identical to command-palette's dialog, without importing `popupPanelStyle` |
  | locale-switcher | `popupPanelStyle`, `menuItemStyle` |

- **Two components have a real per-component `--ds-*` token namespace
  declared for tenant theming, and even that is not adopted by both engines
  of the SAME component** — see §5 (Token-namespace landscape) below. This is
  a sharper version of the CK-C finding: it is not just cross-component
  sharing that is false, **intra-component cross-engine sharing is also
  false** in 2 of 5 components.

**Consequence for the contract**: CK-G must be scheduled and skinned as five
independent, sequential migrations (matching CK-D's precedent), each
preserving its own hand-rolled recipe verbatim. The shared `_internal` helper
imports should be left as-is (they already work, they are outside CK-G's
scope to touch), but a migration must not assume "shared vocabulary" licenses
consolidating any of the five components' recipes onto one another — that
would move pixels.

---

## 1. environment-toggle (95 sites, 2 files) — the only HATCH source in CK-G, exactly 20 sites, split 12 modern / 8 rustic

### Anatomy today

Modern's root `<div>` carries `ds-pattern-environment-toggle ds-engine-modern`
(engines/modern.tsx:200) — real first-party anatomy a skin can scope to
directly. **Rustic's root carries nothing but the consumer's own
`className`** (engines/rustic.tsx:337) — no first-party hook at all, an
asymmetry that recurs across this family (see §6). No element in either
engine carries `data-part`; the closest thing to a stable hook is
`data-testid` (`env-toggle-trigger`, `env-option-${id}`, `env-banner`,
`env-confirm-production`), which is test-only and not styled today, but is a
usable seam for a future `data-part` stamp.

**Dead import**: `engines/modern.tsx:21` imports `inlineActionGroupStyle` from
`_internal/engines/modern/styles` and never uses it anywhere in the 262-line
file (grep-confirmed single hit — the import line itself). Not a migration
concern, but worth a team flag; harmless today.

### The HATCH — verified exactly, both engines, line-by-line

Per the triage's discriminator (§2 of `wo-skin-06-triage.md`): `env.color` /
`activeEnv.color` is a per-instance value supplied by the caller
(`EnvironmentDef.color`) that reaches the paint value directly — HATCH, not
RUNTIME-that-must-stay-inline, because the *rule* is static (`background:
var(--ds-envtoggle-accent)`) and only the *value* is per-instance
(`style={{'--ds-envtoggle-accent': env.color}}`). `--ds-envtoggle-accent` is
grep-confirmed **free** (zero hits anywhere in `tokens/css/` or the
component tree) — safe to claim as the hatch property name.

**modern.tsx — 12 hatch sites**:

| Part | Line | Channel(s) | Value |
|---|---|---|---|
| dropdown-trigger status dot | 103 | background | `activeEnv?.color ?? 'var(--ds-color-neutral-400)'` |
| dropdown-trigger badge | 108 | background | `activeEnv.color` |
| dropdown-option dot | 130 | background | `env.color` |
| dropdown-option badge | 133 | background | `env.color` |
| pills-variant active button | 156 | background, border | `env.color`, `` `1px solid ${env.color}` `` |
| segmented-variant active button | 180 | background, border | `env.color`, `` `1px solid ${env.color}` `` |
| banner strip | 207 | background | `` activeEnv.color + '15' `` |
| banner strip | 208 | borderBottom | `` `2px solid ${activeEnv.color}` `` |
| banner strip | 209 | color | `activeEnv.color` |
| banner pulsing dot | 216 | background | `activeEnv.color` |

**rustic.tsx — 8 hatch sites** (function *definitions*, each called at
multiple DOM render sites — the counter counts the textual key once per
definition, not per call):

| Part | Line | Channel | Value |
|---|---|---|---|
| `dotStyle(color, animate)` — used by trigger dot, dropdown-option dot, banner pulsing dot | 38 | background | `color` param |
| `btnStyle(active, color)` — segmented/toggle-variant buttons | 100 | background | `active ? color : 'transparent'` |
| `pillBtnStyle(active, color)` — pills-variant buttons | 115 | background | `active ? color : 'transparent'` |
| dropdown-trigger active badge | 241 | background | `activeEnv.color` |
| dropdown-option badge | 280 | background | `env.color` |
| banner strip | 343 | background | `` activeEnv.color + '15' `` |
| banner strip | 344 | borderBottom | `` `2px solid ${activeEnv.color}` `` |
| banner strip | 345 | color | `activeEnv.color` |

12 + 8 = **20**, confirming the triage's headline figure exactly (not merely
citing it — independently re-derived from source).

### All non-hatch sites are STATIC or STATE-SELECTED (no plain RUNTIME)

Everything else in both engines resolves to author-time-constant leaves
selected by `env.id === activeEnvironment` / `idx===0` / `idx===last`
booleans — STATE-SELECTED — or is unconditional — STATIC. Representative
STATE-SELECTED shapes: the segmented/pills buttons' *inactive* branch
(`background: 'transparent'`, fully static, the ternary's other leaf is the
HATCH branch above); `borderRadius` on the segmented control keyed by
`idx === 0` / `idx === last` (STATE-SELECTED, not hatch — the values are
static corner-radius strings, position drives selection, not color).

### Two byte-exactness traps specific to this component

1. **The `'15'` hex-alpha suffix is NOT 15% opacity — it is ~8.2%.**
   `activeEnv.color + '15'` (modern.tsx:207, rustic.tsx:343) appends a
   2-digit *hex* alpha channel, and `0x15 = 21/255 ≈ 8.24%`. The component's
   own comment (modern.tsx:202) already flags this: `"Color suffix '15' gives
   ~9% hex opacity"`. A migration that "cleans this up" into
   `color-mix(in srgb, var(--ds-envtoggle-accent) 15%, transparent)` reading
   "15" as a *percentage* would silently push the banner background from
   ~8.2% to 15% opacity — visibly darker, a byte-exactness violation hiding
   inside what looks like a mechanical hatch conversion. The correct
   translation is `color-mix(in srgb, var(--ds-envtoggle-accent) 8.24%,
   transparent)` or, safer, keep the literal hex-suffix concat inside the
   inline `style` (`background: activeEnv.color + '15'` can stay as a
   RUNTIME/HATCH-adjacent inline value rather than being pushed fully into
   CSS) — flag for whoever writes the contract to decide explicitly, don't
   let a migration agent silently pick 15%.
2. **Rustic's banner dot never pulses — `ds-pulse` is not defined anywhere.**
   `dotStyle`'s `animation: animate ? 'ds-pulse 2s infinite' : undefined`
   (rustic.tsx:41) is invoked with `animate=true` only for the banner dot
   (rustic.tsx:349). `@keyframes ds-pulse` does not exist anywhere in the
   repo (grep-confirmed; the only similar name is the unrelated
   `ds-pulse-changed-flash` in `tokens/css/foundation/animations/transitions.css`).
   The browser silently drops the invalid `animation-name` — **the rustic
   banner dot is static, never pulses**, a pre-existing defect. Compare
   modern's banner dot (modern.tsx:214-217), which uses Tailwind's real
   `animate-pulse` utility class and DOES pulse — a genuine, currently-live
   cross-engine behavioral asymmetry, not just a paint difference. `animation`
   itself is not a counted paint channel, so this is invisible to the
   ratchet and to a migration's diff — **but if a migration "fixes" this by
   actually defining `@keyframes ds-pulse` in the new skin, that changes
   rustic's rendered behavior (dot starts pulsing) and is a visual change
   forbidden inside a byte-exact migration.** Record only; do not fix.

### Counter blind spot — a NEW class, not previously documented in this program

`btnStyle`/`pillBtnStyle` (rustic.tsx:96-124) both use `background: active ?
color : 'transparent'`, where the local parameter is literally named
`color`. The lexer's paint-key regex matches `color\s*:`, and the ternary's
own separator colon (`active ? color :`) sits immediately after the
identifier `color` — so the lexer misreads the ternary's TRUE-branch value as
a second object key named `color` on the same line. **This inflates
`environment-toggle/engines/rustic.tsx`'s reported count by exactly 2** (line
100 and line 115): the file reports 50, but only **48 are real paint keys**.
Verified by direct line-level replay of the counter's exact algorithm
(`scripts/lib/inline-paint-counter.mjs`), not by inspection alone. This
specific shape — a local variable/parameter named exactly `color`,
`background`, `border`, etc., used as a ternary's static-leaf VALUE — is a
new blind-spot class distinct from the seven already catalogued in the
triage's §7 (interface members, keyframe strings, `<style>` tag content).
Grep-checked: this exact shape (duplicate key-name match on one line where
one occurrence is the ternary's own colon) occurs **only** in these two
lines across all 279 CK-G sites — not present in the other 8 files (their
duplicate-per-line matches are all genuine multi-key single-line objects,
verified by reading each one). Worth flagging to whoever owns the counter,
not fixing here.

### Suppression risk, DaisyUI coupling, keyframes

**None.** `tokens/css/engines/{modern,rustic}/theme.css` and
`tokens/css/runtime/personality.css` have zero hits for
`environment-toggle`/`envtoggle`/`env-toggle` (grep-confirmed). Zero bare
DaisyUI structural classNames in either engine. The only keyframe reference
(`ds-pulse`) is dead per the trap above, not a real animation to preserve or
namespace.

---

## 2. workspace-switcher (64 sites, 2 files) — 100% A, no hatch, no imperative writes, clean greenfield

### Anatomy today

Same asymmetry shape as environment-toggle: modern's root carries
`ds-pattern-workspace-switcher ds-engine-modern` (engines/modern.tsx:120);
rustic's root carries only the consumer `className` (engines/rustic.tsx:174)
— no first-party hook. `data-testid` hooks exist (`workspace-trigger`,
`workspace-item-${id}`, `workspace-settings-${id}`, `workspace-create`,
`workspace-current-user`) but are unstyled today.

### Paint sites — no HATCH, confirmed by type inspection

`WorkspaceSwitcher.types.ts` has **no `color` field on `Workspace`** (grep
confirmed) — nothing in this component can reach a per-instance runtime
paint value. All 64 sites are STATIC or STATE-SELECTED.

**modern.tsx (29 sites)** — representative STATE-SELECTED shapes: the
dropdown row's background is a 3-way selection
(`isFocused ? surface-inset : isActive ? color-mix(10% primary) : {}`,
modern.tsx:185) plus a matched `borderColor` (`isActive ? primary : {}`,
modern.tsx:186) — both leaves static, selection keyed on two independent
booleans layered via spread (`...(cond ? {...} : {})`), the same "packed
conditional spread" shape WO-SKIN-04 found in Menu. The settings-gear button
(modern.tsx:239) reveals on `isFocused` via `opacity`, not a counted channel,
so its `background`/`color`/`border`/`borderRadius` are all STATIC
(unconditional transparent/text-primary/none/50%) even though the element's
*visibility* is state-driven — the paint itself does not change with hover.

**rustic.tsx (35 sites)** — same shape, own recipe: row background
(rustic.tsx:256-260) is a 3-way ternary (`isFocused` → muted bg, `isActive` →
primary-50, else `undefined`) — a genuinely different token pair than
modern's (`var(--ds-color-bg-muted, ...)` / `var(--ds-color-primary-50, ...)`
vs. modern's `var(--ds-surface-inset)` / `color-mix(in srgb, var(--ds-color-primary)
10%, transparent)`) — **preserve as two distinct recipes, do not
consolidate them onto one token pair**, exactly the CK-C/CK-D lesson applied
here. `borderLeft` (rustic.tsx:261-263) is STATE-SELECTED on `isActive`
(3px primary vs. 3px transparent, reserving layout space either way).

### Interaction mechanism — 100% React state, zero imperative writes, zero CSS pseudo-classes

Neither engine has a single `.style.x =` write or `:hover`/`:focus-visible`
CSS rule anywhere in this component. `focusIndex` (set via `onMouseEnter`)
drives every state-selected paint site through plain object-literal
ternaries. This is the cleanest interaction mechanism found in CK-G — a
direct `[data-focused]`/`[data-active]` attribute translation with no dead
code to reconcile.

### Suppression risk, DaisyUI coupling, keyframes

**None.** Zero hits for `workspace-switcher`/`workspaceswitcher` in
`theme.css`/`personality.css`. Zero DaisyUI classNames in either engine (the
`--ds-workspace-switcher-*` namespace exists but is consumed **only** by
`engines/classic.tsx` — the Ant Design wrapper, out of migration scope; grep
confirms 13 hits there and 0 in modern/rustic, so this checkpoint's two
migratable engines use generic `--ds-color-*`/`--ds-surface-*` tokens
throughout, not a per-component namespace). No `<style>` tags, no
`@keyframes`.

---

## 3. command-palette (57 sites, 2 files) — the checkpoint's real imperative-write concentration, an intra-component token-vocabulary split, and the only real keyframe block in CK-G

### NOT portaled — falsifies the brief's premise

**`createPortal` appears nowhere in this file, in `shortcuts-overlay`, or
anywhere in this family** (grep-confirmed: zero hits for
`createPortal`/`react-dom` across all 15 files in
`patterns/navigation/`). Both dialogs use `position: fixed` and render
in-place in the normal React tree, escaping visual clipping via CSS alone,
not via a portal. **A standalone portal scope class is not needed for CK-G —
the existing tenant-scoped container's descendant selectors reach every
element in both dialogs**, because they are still DOM descendants of wherever
the app mounts `<CommandPalette>`/`<ShortcutsOverlay>` (normally inside the
tenant-scoped root), not reparented to `document.body`. This directly
contradicts the brief's instruction #7; verify before writing the CK-G
contract, do not carry the portal assumption forward.

### Anatomy today

**Zero first-party className anywhere, either engine.** Modern's root is
`"fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"` (pure
Tailwind layout utilities); rustic's root `<div style={overlay}>` carries no
`className` at all. Neither stamps `ds-pattern-command-palette`. This is the
weakest anatomy in the checkpoint — a future skin has no existing hook to
scope to on either engine and must add one fresh.

### Token-vocabulary split within ONE component — the sharpest version of the "existence is not adoption" lesson found in CK-G

`--ds-command-palette-*` **is** a real, declared, tenant-themeable namespace
(`tokens/css/foundation/themes/default.css:1944-1951`, with real per-tenant
overrides in `tokens/css/artifacts/rottay/_source/extension.css` for both
light and dark). **Rustic honors it fully** — 18 `var(--ds-command-palette-*,
fallback)` reads across the file (backdrop, bg, shadow, border,
group-color, empty-color, shortcut-border/bg/shadow, item-active-bg/border,
item-hover-bg/border, focus-line). **Modern uses it zero times** — grep
confirms 0 hits in `engines/modern.tsx`; modern reads generic
`--ds-color-*`/`--ds-surface-*`/`--ds-elevation-*` tokens throughout instead
(`var(--ds-surface-card)`, `var(--ds-color-bg-overlay)`, `var(--ds-elevation-2)`,
etc.). **This means a tenant who overrides `--ds-command-palette-bg` today
changes rustic's palette and has zero visible effect on modern's** — a
real, currently-live, pre-existing cross-engine theming inconsistency, not
something a migration creates. A skin author must preserve this split
exactly: writing one skin rule that maps BOTH engines onto
`--ds-command-palette-*` would be a behavior change (modern would newly
become tenant-themeable through a channel it never honored), and collapsing
both onto modern's generic tokens would be the same mistake in the other
direction. **Two independent token vocabularies, one per engine, both must
survive.**

### Paint sites

**modern.tsx (28 sites)** — backdrop glass treatment (modern.tsx:162-165,
`backgroundColor`+`backgroundImage`+`backdropFilter`+`WebkitBackdropFilter`,
all STATIC, the sanctioned glass-on-overlay-backdrop pattern per the file's
own comment) → dialog card (STATIC bg+boxShadow) → search input (STATIC,
border:none/background:transparent/color:inherit) → **two duplicated result
rows** ("Recent" section and grouped-results section render the identical
row markup twice, lines 199-221 and 248-270 — same STATE-SELECTED
`background` keyed on `activeIndex === idx`, same kbd shortcut badge
recipe) → footer/empty-state (STATIC `color`).

**rustic.tsx (29 sites)** — backdrop (STATIC, `--ds-command-palette-backdrop`
+ hardcoded `blur(8px)`, not token-driven unlike modern's
`--ds-glass-backdrop-filter`) → dialog (STATIC) → item row
(`renderItem`, STATE-SELECTED `background`+`borderLeft` keyed on
`isSelected`, one shared function unlike modern's two duplicated inline
blocks) → shortcut badge (STATIC) → group label/empty/footer (STATIC).

### Imperative writes — 6 total, both engines LIVE (verified: no CSS hook exists to contest them)

**modern.tsx — 4 writes**, both result sections repeat the same pattern:
`onMouseEnter`/`onMouseLeave` on each row directly write/clear
`.style.background` (lines 208-209, 257-258) as the hover mechanism, guarded
by `activeIndex !== idx` so it doesn't fight the keyboard-selection state.
**rustic.tsx — 6 writes**: item-row hover (`onMouseEnter`/`onMouseLeave`,
lines 211-212 and 218-219) writes `.style.borderLeftColor` +
`.style.background` — 4 writes; input focus/blur (lines 279-283) writes
`.style.boxShadow` on the parent element to fake an inset focus line — 2
writes. **All 6+4=10 writes are LIVE**: since neither engine's rows/input
carry any first-party className, there is no CSS selector anywhere that
could contest these writes today — unlike the WO-SKIN-04 Menu precedent
(where an injected `!important` CSS rule made an equivalent imperative write
dead), nothing here races against these writes. A migration must delete
every one and transcribe to `:hover`/`:focus-within` (or `[data-hovered]` if
pointer-hover needs to coexist with keyboard `activeIndex` the way rustic's
guard implies) — none can simply be dropped as dead code.

### Keyframes / per-instance `<style>` tag — the only real one in CK-G

`engines/rustic.tsx:264` injects, on every render while open:
```
@keyframes ds-cmd-backdrop-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes ds-cmd-panel-in { from { opacity: 0; transform: scale(0.96) translateY(-10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
```
Counter-invisible (string content). Not scoped per-instance (no dedup guard,
no unique suffix) — collision risk is real but low-probability in practice
(`if (!open) return null` means only genuinely-simultaneously-open instances
would duplicate). A migration must rename both to the `ds-` prefix's
already-satisfied convention is fine as-is, but must move them into the
rustic skin file **once** (not per-instance) per the lane's keyframe law —
same shape as WO-SKIN-04's Tabs `rottay-tabs-fade-in` finding. Modern has no
keyframes at all (its entrance is presumably instant/CSS-transition-free —
confirmed no `animation`/`transition` on the dialog itself, only on the
hidden settings-gear opacity elsewhere in the family).

### Suppression risk, DaisyUI coupling

**None.** Zero hits for `command-palette`/`commandpalette` in
`theme.css`/`personality.css`. Zero bare DaisyUI classNames in either
engine (the file's docstring does not claim DaisyUI usage, unlike
shortcuts-overlay below).

---

## 4. shortcuts-overlay (43 sites, 2 files) — the simplest component in CK-G: 100% STATIC, zero interaction paint, a stale DaisyUI doc-comment, and one genuine `<kbd>` mislabel

### NOT portaled (same finding as command-palette, re-verified independently)

Zero `createPortal` in either engine file. Both use `position: fixed;
inset: 0` in-tree, same mechanism as command-palette.

### Anatomy today

Same as command-palette: **zero first-party className anywhere, either
engine.** No `ds-pattern-shortcuts-overlay` stamp on either root.

### Paint sites — no STATE-SELECTED at all, the simplest interaction surface in the checkpoint

Every one of the 43 sites (19 modern + 24 rustic) resolves to an
unconditional STATIC value — there is no `isActive`/`isFocused`/`isHovered`
branch anywhere in either engine (grep/read-confirmed: neither file
declares a hover/focus state variable, and no `onMouseEnter` exists in
either file). Shortcut rows render with zero visual differentiation for
hover or keyboard focus in both engines — a real, pre-existing UX gap
(noted, not fixed) that also means this component is the cheapest
migration in CK-G: every site is a direct verbatim copy into the skin, no
selectors to invent.

**modern.tsx (19 sites)**: backdrop (STATIC `background`) → dialog card
(STATIC bg+boxShadow) → header (`borderColor` only, NOT a full `border`
shorthand — width comes from the Tailwind utility class `border-b` already
in the JSX, so this component correctly keeps border-width out of inline
paint entirely; only the color channel is a DS token) → close button
(STATIC) → search input (STATIC) → category label (STATIC `color`) → `<kbd>`
badge (STATIC, `border`+`background`+`borderRadius`) → empty state / footer
(STATIC).

**rustic.tsx (24 sites)**: same shape, own recipe throughout — module-level
`const` style objects (`headerStyle`, `titleStyle`, `closeButtonStyle`,
`searchWrapperStyle`, `inputStyle`, `categoryLabelStyle`, `itemStyle`,
`descriptionStyle`, `kbdStyle`, `keysContainerStyle`) — no function is
parameterized (unlike environment-toggle's `dotStyle`/`btnStyle`), because
nothing here varies by state. Uses its own `--ds-shortcuts-overlay-*`
namespace on 3 of the module consts (`backdrop`, `dialog` via
`--ds-shortcuts-overlay-bg`/`-shadow`, `kbdStyle` via
`-kbd-bg`) — see §5, this namespace is **never declared anywhere**, purely
aspirational plumbing whose fallback always wins today.

### Stale-documentation defect — the same class WO-SKIN-04 found in Pagination

`engines/modern.tsx`'s header comment (lines 4-8) says: `"Key combinations
use DaisyUI's kbd component."` **The actual `<kbd>` elements
(modern.tsx:150) carry no className at all** — 100% inline-painted, zero
DaisyUI class, grep-confirmed across the whole file (no bare `kbd`/`btn`/
`menu`/`modal` token anywhere). Same defect shape as WO-SKIN-04's Pagination
finding (stale doc claiming a mechanism the code doesn't use) — a skin
author must not assume any DaisyUI structural class needs preserving here.

### Suppression risk, DaisyUI coupling, keyframes, imperative writes

**None of any of these.** Zero hits in `theme.css`/`personality.css`. Zero
real DaisyUI classNames (only the stale comment above). No `<style>` tags,
no `@keyframes`. No imperative `.style.x=` writes — confirmed zero `onMouse*`
handlers exist in either engine at all.

---

## 5. locale-switcher (20 sites, 2 files) — smallest component, the only one where BOTH engines stamp first-party anatomy, otherwise a clean STATE-SELECTED-only migration

### Anatomy today

**The one component in CK-G where both engines carry a real first-party
scope class**: modern root `ds-pattern-locale-switcher ds-engine-modern`
(modern.tsx:232), rustic root `ds-pattern-locale-switcher ds-engine-rustic`
(rustic.tsx:216) — do not generalize this to the rest of the family (see §6,
this is the only one of the five where the asymmetry does NOT hold). Also
carries a real non-paint anatomy attribute, `data-locale-option` on every
menu-item `<button>`, used by both engines' `querySelectorAll` to
scroll-into-view the keyboard-focused option — a genuine functional hook,
not a styling one; do not repurpose it as a `data-part` substitute without
checking the scroll-into-view code path still resolves.

### Paint sites — all STATE-SELECTED or STATIC, no hatch (confirmed: `LocaleDef` has no `color` field)

**modern.tsx (6 sites)**: `CheckIcon`'s `color` (STATIC, module-level
component, module-scope so counted once) → `triggerBaseStyle`
(`background`/`color`/`border`/`borderRadius`, all STATIC, shared by the
sm/md size variants via spread) → menu-item `background`
(STATE-SELECTED, 3-way: `isFocused ? hoverBg : isActive ? insetBg :
'transparent'`, line 295-299).

**rustic.tsx (14 sites)**: `triggerBaseStyle` (4 STATIC keys, same shape as
modern but rustic's own literal token strings, e.g.
`var(--ds-color-text-primary, #1a1a1a)` — rustic here carries raw hex
fallbacks nested three levels deep, `var(--ds-color-border-subtle,
var(--ds-color-border, #d9d9d9))`, deeper fallback-chain than any other rustic
engine in this family) → `dropdownStyle` (4 STATIC) → `menuItemBaseStyle`
(3 STATIC: color/background/border) → menu-item `background`
(STATE-SELECTED, 3-way, same shape as modern but **not the same values**:
rustic's `isFocused` and `isActive` branches both resolve to the identical
token (`var(--ds-surface-inset, ...)`) — i.e. rustic does not visually
distinguish hover-focus from selected-active, while **modern's two branches
use genuinely different values** (`menuItemHoverBg` constant vs.
`var(--ds-surface-inset)` inline) — a real, if subtle, cross-engine
divergence in how many visual states are distinguishable; preserve both
as-is, do not "fix" rustic to differentiate or simplify modern to match) →
active-item checkmark `color` (STATIC) → trigger flag/label icon (no paint
channel, `fontSize` only).

### Interaction mechanism, suppression, DaisyUI, keyframes

100% React state (`focusIndex` via `onMouseEnter`/`onMouseLeave`), zero
imperative writes, zero CSS pseudo-classes — same clean shape as
workspace-switcher. Zero hits in `theme.css`/`personality.css`. Zero DaisyUI
classNames. No keyframes, no `<style>` tags. This is the cheapest, cleanest
migration in the checkpoint alongside shortcuts-overlay.

---

## 6. Anatomy landscape across the checkpoint (the portal map's companion — where a scope class can actually attach today)

| component | modern root stamp | rustic root stamp |
|---|---|---|
| environment-toggle | `ds-pattern-environment-toggle ds-engine-modern` | none (consumer className only) |
| workspace-switcher | `ds-pattern-workspace-switcher ds-engine-modern` | none |
| command-palette | none | none |
| shortcuts-overlay | none | none |
| locale-switcher | `ds-pattern-locale-switcher ds-engine-modern` | `ds-pattern-locale-switcher ds-engine-rustic` |

Do not generalize "modern always stamps, rustic never does" from the first
two rows — locale-switcher falsifies it (both stamp), and command-palette/
shortcuts-overlay falsify the opposite generalization (neither stamps).
**Each of the 5 components needs its own anatomy decision**; only
locale-switcher already has a free ride on both engines. `data-part` is
zero everywhere (grep-confirmed, whole family) — a skin author is stamping
fresh vocabulary in all 5 cases, this table only tells you which *root*
class, if any, already exists to hang a skin's top-level selector from.

**Portal map** (per the brief's ask #7): all 5 components × both migratable
engines = **zero portals**. `createPortal` does not appear anywhere in
`patterns/navigation/`. No standalone portal scope class is needed for this
checkpoint.

---

## 7. Token-namespace landscape (per-component `--ds-*` declared vocabulary)

| component | namespace | declared in `default.css`? | consumed by |
|---|---|---|---|
| environment-toggle | `--ds-envtoggle-*` | no (doesn't exist) | nobody yet — free to claim for the hatch, see §1 |
| workspace-switcher | `--ds-workspace-switcher-*` | no | `engines/classic.tsx` only (13 hits) — **not** modern/rustic |
| command-palette | `--ds-command-palette-*` | **yes** (9 vars, light+dark tenant overrides in `artifacts/rottay/`) | `engines/rustic.tsx` (18 hits) + `engines/classic.tsx` (1 hit) — **not** modern (0 hits) |
| shortcuts-overlay | `--ds-shortcuts-overlay-*` | no (declared nowhere, fallback always wins) | `engines/rustic.tsx` only (6 hits) — **not** modern |
| locale-switcher | `--ds-locale-switcher-*` | no | nobody — both engines use only generic `--ds-color-*`/`--ds-radius-*` |

Three distinct situations, not one: (a) a real, tenant-themeable, partially
adopted namespace (command-palette — rustic only); (b) a consumed-but-never-
declared phantom namespace whose fallback is the only thing that has ever
rendered (shortcuts-overlay — rustic only, and note the "declared token
assumed live" trap runs in reverse here: this is a *consumed* token nobody
*declared*, the mirror image of the CK-C `--ds-steps-line-color` finding);
(c) no namespace at all, generic tokens throughout (environment-toggle,
workspace-switcher's migratable engines, locale-switcher). A migration
contract should decide, once, whether to keep inventing per-component
namespaces that only one engine will ever read, or accept that 3 of 5
components will ship with zero per-component tenant-theming surface.

---

## 8. Totals and final classification

```
                    STATIC+STATE-SELECTED (A)   HATCH (C)   total
environment-toggle              75                  20        95
workspace-switcher               64                   0        64
command-palette                  57                   0        57
shortcuts-overlay                43                   0        43
locale-switcher                  20                   0        20
                                ---                 ---       ---
                                259                  20       279
```

(environment-toggle's A total of 75 = 95 counted sites − 20 hatch; it is
*not* reduced further for the 2 lexer-phantom sites in §1, since those are a
counter-accuracy footnote, not a reclassification — the phantoms are not
real paint at all, A or otherwise, and should be net-zero in any migration
diff.) Zero category-B (exempt-runtime-value) sites anywhere in CK-G — every
non-A site is a genuine C-hatch case, confirmed by type-level inspection
(only `EnvironmentDef` has a `color` field among the five components' prop
types).

---

## 9. The three biggest traps

1. **The `activeEnv.color + '15'` hex-alpha suffix is ~8.24% opacity, not
   15%.** A hatch migration that "cleans up" this idiom into
   `color-mix(..., 15%, ...)` reading the literal `'15'` as a CSS percentage
   moves the banner's background darker in both engines — a silent
   byte-exactness violation that no naive value-substitution check would
   catch, because the string `'15'` really does appear in the source right
   next to a plausible-looking percent sign in the target syntax. (§1)

2. **`command-palette`'s two engines read two independent, non-overlapping
   token vocabularies for what is conceptually the same slot** — rustic
   fully honors the real, tenant-themeable `--ds-command-palette-*`
   namespace; modern ignores it entirely and reads generic
   `--ds-color-*`/`--ds-surface-*` tokens. This is *already* a live,
   pre-existing cross-engine theming inconsistency (a tenant override
   changes rustic only). A migration must preserve two separate token sets
   for the two engines' skins — consolidating onto one (either direction)
   silently changes which channels a tenant's brand theme actually reaches. (§3)

3. **Ten imperative `.style.x =` writes in command-palette (4 modern + 6
   rustic) are all LIVE**, not superseded by any CSS rule (unlike WO-SKIN-04's
   Menu precedent, where an equivalent imperative write was dead against an
   injected `!important` rule) — because neither engine's interactive rows
   carry any first-party className for a stylesheet to target. Every one of
   the 10 writes must be transcribed to `:hover`/`:focus-within` /
   `[data-*]`, none can be treated as removable dead code the way Menu's
   were. (§3)

Runner-up, worth carrying into the contract even though it didn't make the
top three: the checkpoint-wide anatomy fragmentation in §6 means 3 of 5
components (command-palette, shortcuts-overlay, and rustic-only for
environment-toggle/workspace-switcher) need a **fresh** scope-class stamp
added to the JSX before a skin selector has anything reliable to attach to
— that JSX-touching work is not visible in the 279-site paint count at all,
the same "A-state is the real cost driver, not the site count" lesson the
triage's §8.3 already flagged at the program level.
