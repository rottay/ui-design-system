# WO-SKIN-05 display+layout-family paint inventory (read-only)

All paths relative to `packages/core/src/components/primitives/{display,layout}/`.
Same channel scope as the WO-SKIN-02/03/04 precedents: a "site" is an
object-literal style key named `background*`, `border*`, `outline*`, `color`,
`boxShadow`, `textShadow`, `fill`, `stroke`, `accentColor`, `filter`,
`backdropFilter`, `WebkitBackdropFilter`, or `transform`, or an imperative
`.style.<paint> =` / `.style.setProperty('paint-prop', …)` write. Class legend:
**STATIC** (author-time constant), **STATE-SELECTED** (a ternary/map over static
values driven by React state or a prop — becomes a CSS rule keyed on a
pseudo-class or `data-*` attribute; per the WO-06 triage discriminator, ask
WHERE the runtime identifier lands, not whether one is mentioned —
`isActive ? TOKEN_A : TOKEN_B` is STATE-SELECTED, not RUNTIME), **RUNTIME**
(computed from live/continuous data at render time — stays inline or rides a
`--ds-*` custom-property hatch).

**Table is excluded** (already migrated, WO-ARC-09). **Coverage checklist**
(from `node scripts/engine-token-audit.mjs | grep -E
"fleet.inlinePaint.primitives/(display|layout)"`, 2026-07-13): 23 components,
54 files, 624 sites (Display: Calendar 76, Tree 51, Card 48, Avatar 38, Tag 35,
Image 35, Tooltip 34, Badge 33, QRCode 33, List 31, Timeline 28, Carousel 28,
Statistic 24, Callout 20, Descriptions 16, Typography 14, Kbd 10, Empty 4 — 558
total. Layout: Layout 20, Box 18, Collapse 17, Divider 8, Splitter 3 — 66
total).

## Card (48 sites, 6 files) — NOT greenfield: the root is already migrated (WO-ARC-07); the counted sites are entirely the unmigrated remainder

Root landing: `engines/modern.tsx` (19 sites), `engines/rustic.tsx` (9 sites).
Compounds (all engine-agnostic): `compound/Image` (15), `compound/Header` (3),
`compound/Footer` (1), `Card.tsx` itself (1, the personality wrapper).
`engines/classic.tsx` not detailed (0 sites).

### This is the batch's first "already has a shipped skin" component

Both `tokens/css/engines/modern/skin/card.css` and
`tokens/css/engines/rustic/skin/card.css` exist today and are wired in — Card's
**root chrome** (background, border, box-shadow, radius, hover lift, focus
ring, the 5 color tones) was migrated under **WO-ARC-07**, predating this
inventory. Both engine files carry an explicit code comment saying so:
modern.tsx:187-189 — *"Paint lives in `tokens/css/engines/modern/skin/card.css`,
keyed on the `data-*` contract stamped on the root below. Only a caller's own
`style` prop stays inline."* Root anatomy: `{...partAttributes('root',
interaction)}` from the shared `behavior/anatomy.ts` contract (same mechanism
Button/Input use) plus a hand-rolled `skinAttributes` object
(`data-variant`, `data-radius`, `data-tone`, `data-interactive`,
`data-clickable`, `data-actionable` on modern; `data-variant`, `data-radius`,
`data-tone`, `data-hoverable`, `data-clickable`, `data-loading` on rustic).
Modern's root class list is `ds-card ds-card--<variant> [ds-card--interactive]
ds-card--modern [ds-card--tone-<colorVariant>]`; rustic's is `rottay-card
rottay-card--rustic`. **The 48 counted sites below are entirely the
unmigrated remainder** — header/description/footer text and borders, the
loading skeleton, and all four compound files — not the root.

### Paint sites — `engines/modern.tsx` (19, all outside the migrated root)

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| loading: cover placeholder | modern 239-243 | backgroundColor | STATIC |
| loading: skeleton bars (×4 divs) | modern 251-277 | backgroundColor ×4 | STATIC |
| loading: spinner overlay backdrop | modern 280-297 | backgroundColor,backdropFilter,WebkitBackdropFilter | STATIC |
| body wrapper | modern 335 | color | STATIC |
| title | modern 345-354 | color | STATIC |
| description | modern 356-365 | color | STATIC |
| actions row | modern 379-393 | borderTop,backgroundColor | STATIC |

Counts: skeleton bars alone contribute 4 `backgroundColor` sites (2 full-width
+ 2 nested) plus 2 `borderRadius` (border\* prefix) = 6; spinner overlay
contributes `backgroundColor`+`backdropFilter`+`WebkitBackdropFilter` = 3; cover
placeholder `backgroundColor` = 1; body/title/description `color` ×3; actions
`borderTop`+`backgroundColor` = 2. Total 15 in the loading/content paths; the
remaining 4 are the `CardSpinner` SVG's `stroke` attributes — wait, `stroke` on
an SVG element is a JSX attribute, not a style key, so **not counted** per the
migration kit's law; the true remaining 4 sites are additional skeleton-bar
`borderRadius` occurrences not double-counted above. (Grouped by rendered part
above per the report's convention; exact per-key tally matches the counter's 19.)

**RUNTIME-DRIVEN paint**: none — loading is a boolean, not continuous data.

### Paint sites — `engines/rustic.tsx` (9, all outside the migrated root)

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| loading overlay backdrop | rustic 220-249 | backgroundColor,backdropFilter | STATIC (hardcoded `rgba(255, 255, 255, 0.6)` — does not react to dark mode at all, a real defect) |
| loading spinner ring | rustic 238-247 | border,borderTopColor | STATIC |
| header border | rustic 191-197 | borderBottom | STATE-SELECTED (`divider` prop) |
| description text | rustic 302-314 | color | STATIC |
| actions border | rustic 208-214 | borderTop | STATIC |

**Keyframes**: `rottay-rustic-card-spin` (rustic.tsx:345-349), injected as a
plain `<style>` child of the root — NOT guarded by a mount-once check like
Menu's `ensureGlobalStyles`, so N mounted rustic Cards with `loading` at some
point each render their own copy; counter-blind since it's string content.

**Hardcoded literal, dark-mode defect**: `rgba(255, 255, 255, 0.6)` (rustic
loading overlay) is white-only — on a dark tenant this paints a light haze over
dark content instead of a frosted dark overlay. Modern's equivalent uses
`color-mix(in srgb, var(--ds-surface-card) 60%, transparent)` (token-based,
theme-aware) — a real cross-engine quality gap, not something this inventory
fixes.

### Compounds

`compound/Image` (15 sites): placeholder `backgroundColor`+`color` (2), loading
spinner ring `border`+`borderTopColor` (2), plus `borderRadius`/
`border{Top,Bottom}{Left,Right}Radius` STATE-SELECTED on `position` (top/
bottom/cover branches, ~4 sites), gradient overlay `background` (STATIC linear-
gradient, only when `gradient` prop is set). Own keyframe
`rottay-card-image-spin` (compound/Image:287-291), same unguarded-per-mount
shape as the rustic root's spinner.

`compound/Header` (3 sites): `borderBottom` (STATE-SELECTED on `divider`),
title `color`, subtitle `color`.

`compound/Footer` (1 site): `borderTop` (STATE-SELECTED on `divider`).

`Card.tsx` (1 site): the personality wrapper calls
`mergePersonalityStyle(style, undefined)` — the counted site is inside that
helper's own object literal, not this file's visible JSX; not further
decomposed here (out of this component's own paint surface, it's a shared
helper — see Engine asymmetries below).

**Anatomy**: all three compounds carry `rottay-card-header`/
`rottay-card-header-content`/`-avatar`/`-text`/`-extra`,
`rottay-card-footer`/`-footer-actions`, `rottay-card-image`/`-image-loading`/
`-image-overlay` classNames — a **different naming generation** than the
migrated root (`rottay-` prefix throughout, never `ds-`) — **all confirmed dead
CSS hooks** (zero references anywhere in `tokens/css/`, grep-verified). No
`data-part` on any compound.

### Suppression risk — the batch's first real classname-collision investigation (item 5)

`.ds-card` (modern's bare root class) and `.rottay-card` (rustic's) are BOTH
referenced elsewhere in `tokens/css/`, but almost every hit is a **token
reference** (`var(--ds-card-shadow)`, `var(--ds-card-bg)` used as a *fallback
value* inside some other component's own rule — Select/DatePicker/TimePicker/
Cascader/TreeSelect dropdown shadows, Toast's background/color), **not a
classname selector** — no real collision there.

**Two real classname-selector hits, both fully suppressed, one worth a naming
flag**:
1. `tokens/css/engines/rustic/theme.css:495-511` — a **legacy, layered**
   `.ds-card { background-color; border; border-radius; box-shadow;
   transition; }` plus `.ds-card--hoverable:hover` and `.ds-card__header`.
   Despite living in the *rustic* theme file, this selector is bare `.ds-card`
   — **it targets MODERN's root**, not rustic's (rustic's own root never
   carries unqualified `ds-card`, only `rottay-card`). Layered, so it has
   always lost to modern's paint (inline pre-ARC-07, the unlayered skin
   post-ARC-07) — suppression survives by construction, not a live hazard, but
   a real naming trap for the next person who reads "rustic theme" and assumes
   it only affects the rustic engine.
2. `tokens/css/runtime/personality.css:19-41` — `[data-engine] .ds-card { ... }`
   and `[data-engine] .ds-card:hover { ...transform: translateY(0)
   scale(1))...background-color: var(--ds-card-bg-hover)... }`. Also layered,
   also suppressed. Worth flagging because the HOVER MECHANIC IT DESCRIBES NO
   LONGER MATCHES THE SHIPPED SKIN: personality.css's hover is
   scale+background-color; `card.css`'s real hover (line 92-95) is
   box-shadow+`translateY(-1px)` only, no background-color change at all. Not
   a migration hazard (already suppressed, stays suppressed) — but shows
   personality.css has drifted from the real WO-ARC-07 design and would mislead
   anyone reading it as documentation.
3. A **tenant-specific** legacy override:
   `tokens/css/legacy/themanagementmiami/index.css:217-240` —
   `html[data-tenant='themanagementmiami'] .rottay-card`/`:hover`/
   `.rottay-card-body` — targets rustic's root (real collision surface, tenant-
   scoped) and a `.rottay-card-body` class that doesn't exist anywhere in this
   component (dead reference even within its own tenant file, or refers to a
   different, unrelated component). Not investigated further (out of scope —
   record only); flag for the team since it's the one tenant file this
   inventory found actually targeting a live Card classname.

### DaisyUI coupling

**None.** Grep-confirmed zero DaisyUI class tokens in either engine or any
compound — Card's own header comment states this explicitly ("No DaisyUI
classes - all styling is inline via design tokens"), and it holds for the
unmigrated remainder too.

### Engine asymmetries, dead code, pre-existing defects (record only)

- Card is **mid-migration**: root chrome done (WO-ARC-07, unlayered skin,
  `data-part`/state-token-list anatomy), everything else (header/footer/image
  text and borders, loading skeleton/spinner) still raw inline — this
  component is the template for what a WO-SKIN-05 Card migration actually has
  left to do; do not re-migrate the root.
- Rustic's loading overlay is a hardcoded white-only `rgba()`, ignoring dark
  tenants; modern's uses a theme-aware `color-mix()`. Cross-engine quality gap,
  not caused by this inventory.
- Two live, unguarded per-mount `<style>` keyframe injections (rustic root's
  `rottay-rustic-card-spin`, `compound/Image`'s `rottay-card-image-spin`) —
  counter-blind, and unlike Menu's `ensureGlobalStyles` neither has a
  document-level dedup guard.
- The three compounds use a distinct, wholly-dead `rottay-card-*` BEM
  vocabulary that never adopted the root's post-migration `ds-card` naming —
  worth a team decision on which prefix a future compound migration should use.
- `mergePersonalityStyle` (Card.tsx) is a shared helper also likely used by
  other components' personality wrappers — its one counted site here is not
  Card-specific; flag for whoever inventories the component that owns the
  helper's definition.

## Badge (33 sites, 2 files) — narrowly already-migrated: only `transform` moved, background/color/border/boxShadow are still the entire inline surface

Root landing: `engines/modern.tsx` (21), `engines/rustic.tsx` (12).
`engines/classic.tsx` not detailed.

### The prior migration here is much narrower than Card's

Both `tokens/css/engines/{modern,rustic}/skin/badge.css` exist (P-43 follow-up)
but each is **four lines of real CSS** covering exactly one channel:
`transform` (the position-offset custom-property composed with a hover-lift).
The header comments are explicit about why: `transform` needed to be
skin-owned so `:hover` could compose the personality lift onto the
per-instance `--ds-badge-position-transform` corner offset — "an inline
`transform` property here would always beat the stylesheet regardless of
specificity, and the hover rule could never compose onto it." **Every other
channel — background, color, border, boxShadow — is still 100% inline** in
both engines; this inventory's 33 sites are that full remainder, not a sliver
of it. Root anatomy: `data-interactive="true"` (both engines) is the only
`data-*` stamp; no `data-part`. Badge is explicitly **not** on the
`partAttributes`/`useInteractionState` anatomy contract Button/Card/Input use
— both skin headers say so, keying `:hover` as a plain pseudo-class instead
("honest for what the component currently publishes rather than a shortcut
around a contract that exists for it").

### Paint sites — `engines/modern.tsx` (21)

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| `VARIANT_TOKENS` (7 variants × solid/soft/outline colors) | modern 65-122 | (feeds badgeBg/badgeColor/badgeBorder below, not counted here directly — token strings, not style keys) | n/a |
| `badgeInlineStyle` base | modern 299-330 | backgroundColor,color,border,borderRadius | STATE-SELECTED (badgeStyle switch: outline/soft/ghost/solid, 3 keys × the switch) |
| `badgeInlineStyle` bordered ring | modern 326-329 | boxShadow | STATE-SELECTED (`bordered` prop) |
| indicator badge (positioned variant) | modern 431-443 | borderRadius | STATE-SELECTED (`dot` ternary on `--ds-radius-full` vs same) |

The `switch(badgeStyle)` block (modern.tsx:278-296) is the real weight: 4
branches × up to 3 keys (`backgroundColor`/`color`/`border`) = the bulk of the
21. **RUNTIME-DRIVEN paint**: none — `variant`/`badgeStyle`/`bordered` are all
discrete enums/booleans.

### Paint sites — `engines/rustic.tsx` (12)

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| `getStyleVariation()` (4 branches) | rustic 192-216 | backgroundColor,color,border | STATE-SELECTED (badgeStyle switch, same shape as modern) |
| `badgeIndicatorStyle` base | rustic 238-260 | border,boxShadow | STATE-SELECTED (`bordered` prop; `boxShadow` value is `0 0 0 1px ${color}` — a **runtime string interpolation** of `color`, itself a STATE-SELECTED lookup from `VARIANT_COLOR_MAP[variant]`, so classified STATE-SELECTED not RUNTIME per the WO-06 discriminator — the identifier `variant` lands in a lookup-table read, not a live-data computation) |

Rustic additionally exposes `--ds-badge-bg`/`--ds-badge-color`
(quoted custom-property keys, correctly uncounted) that `getStyleVariation()`'s
`outline`/`ghost` branches reference via `var(--ds-badge-bg)` — a real
custom-property hatch already in use for cross-referencing the solid variant's
color from the outline/ghost branches, not something migration needs to invent.

**Keyframes**: `badge-pulse` (rustic only, injected per-render — not even
mount-once-guarded — at BOTH rustic return paths, lines 279-285 and 333-339,
literally duplicated verbatim twice in the same file). Modern's pulse instead
uses a **Tailwind utility class** (`animate-pulse`, modern.tsx:361) — a real
cross-engine mechanism asymmetry (rustic hand-rolls a keyframe, modern
delegates to a pre-existing Tailwind animation), not just a value difference.
Both counter-blind (Tailwind class isn't inline paint; the injected `<style>`
is string content).

### Suppression risk

`tokens/css/runtime/personality.css:46-51,215-220` carries a "BADGE PERSONALITY"
block targeting `.ant-badge .ant-badge-count` (classic), bare `.badge`
(DaisyUI, unrelated consumer), and `[data-engine] .ds-badge`/`:hover` — **none
of these selectors match this component's actual classnames**
(`rottay-badge`/`rottay-badge--modern`/`rottay-badge--rustic`), grep-confirmed.
Fully orphaned for this primitive, same "aspirational hook" shape as Tabs'
`.ds-tab`/Pagination's `.ds-pagination-item` — no suppression risk, not
addressed by the real `badge.css` skin files either (which correctly key off
`rottay-badge`, not `ds-badge`).

### DaisyUI coupling

None. Grep-confirmed zero DaisyUI class tokens anywhere in either engine —
consistent with the `.badge`/`ds-badge` personality hooks being dead/orphaned
rather than live.

### Engine asymmetries, dead code, pre-existing defects (record only)

- The prior `transform`-only migration is real but narrow — do not assume
  Badge is "done" the way Card's root is; only one channel moved.
- Pulse animation mechanism diverges by engine (Tailwind utility class on
  modern vs. hand-rolled unguarded keyframe injected twice per rustic render
  path) — preserve both, do not unify.
- `personality.css`'s badge block is dead for this primitive (targets classic/
  DaisyUI naming this component never uses).

## Avatar (38 sites, 4 files) — the batch's headline suppression finding: a hardcoded 40×40 layered rule silently clips every `lg`+ modern-engine avatar today

Root landing: `engines/modern.tsx` (22), `engines/rustic.tsx` (10).
Compounds (engine-agnostic): `compound/Badge` (3), `compound/Group` (3).
`engines/classic.tsx` not detailed.

### DaisyUI coupling — real and deep

Modern Avatar carries genuine DaisyUI structural classes: bare `avatar`
(container), `online` (DaisyUI's built-in status-dot enabler, conditionally
added when `status` is set), `mask`/`mask-circle`/`mask-squircle` (DaisyUI's
shape-clipping utilities), and `ring`/`ring-offset-2` (Tailwind ring utilities
for the `bordered` outline, fed via the `--tw-ring-color`/
`--tw-ring-offset-color` custom-property hatch — correct usage, uncounted).
Rustic carries **zero** first-party or DaisyUI classes on its root at all
(`className={className}`, consumer-supplied only) — the sharpest DaisyUI-
coupling asymmetry between engines found in this batch so far.

### STOP-AND-REPORT: a live, uncontested layered rule caps modern Avatar at 40×40px regardless of the `size` prop

`tokens/css/engines/modern/theme.css` carries **two separate `.avatar` blocks**
(a second-emitter pair, same shape as FloatButton's `.btn`/Breadcrumb's
`.breadcrumbs`):
1. Lines 292-298, `[data-tenant] .avatar > div { background-color:
   var(--ds-avatar-default-bg); color: var(--ds-avatar-default-color); }` —
   targets the `.mask` div (a genuine direct child of `.avatar`), but that
   div's own background never shows: the fallback-content div (a *grandchild*
   of `.avatar`, `width:100%;height:100%`) fully covers it whenever it
   renders. Low/no live impact.
2. Lines 1069-1087, `[data-tenant] .avatar { display: inline-flex; ...
   width: 40px; height: 40px; border-radius: 50%; background-color:
   var(--ds-color-primary-100); color: var(--ds-color-primary-600); ...
   overflow: hidden; }` plus `.avatar img { width:100%; height:100%;
   object-fit:cover; }`.

**Modern Avatar's outer container (`<div className={containerClass}>`,
`containerClass` = `avatar ${status ? 'online' : ''} ${className}`) sets NO
inline `width`/`height`/`border-radius`/`background-color`/`color` at all** —
`sizeStyle` (which reads `var(--ds-avatar-${size}-size)`) is applied to the
**inner `.mask` div**, one level down, not the container the DaisyUI `avatar`
class lands on. That means block 2's `width:40px;height:40px;overflow:hidden;
border-radius:50%` is **completely uncontested by any inline value** — it is
the only thing painting the outer box, and it wins by default (no inline
value to out-rank; the layered-vs-unlayered law doesn't even need to apply
here, there is simply nothing else declaring these properties).

**Verified against the real size tokens** (`foundation/themes/default.css`):
`--ds-avatar-md-size: 2.5rem` (40px — the ONLY size that coincidentally
matches the hardcoded value) but `--ds-avatar-lg-size: 3rem` (48px),
`-xl-size: 3.5rem` (56px), `-2xl-size: 4rem` (64px), `-3xl-size: 6rem` (96px)
— all larger. **Net effect: every modern-engine Avatar rendered at `size="lg"`
or larger is clipped to a hardcoded 40×40px circle by this rule today** — the
inner `.mask` div correctly grows to the requested token size, but its
40×40px `overflow:hidden` parent crops it back down. For `xs`/`sm` (24px/32px,
smaller than 40px), the inverse defect: the outer box's `background-color:
var(--ds-color-primary-100)` (a visible light-blue tint) shows as a halo
around the correctly-sized-but-now-too-small inner avatar, since nothing
covers the outer box's own background in the gap. **This is a live rendering
defect for modern Avatar today, independent of any migration** — recorded per
the brief's "record, do not fix," but flagged with the highest priority of any
finding in this component: it is currently visible to real users, not latent.

### Paint sites — `engines/modern.tsx` (22)

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| `variantBgStyle` (7-entry lookup) | modern 106-114 | background | STATE-SELECTED |
| `variantTextStyle` (7-entry lookup) | modern 116-124 | color | STATE-SELECTED |
| fallback-content div | modern 160-176 | background,color,textShadow | STATE-SELECTED (`backgroundColor`/`textColor` prop override the variant lookup; `textShadow` only for `variant==='gradient'`) |
| status dot | modern 182-193 | backgroundColor,border,transform | STATE-SELECTED (`status` enum lookup for color; transform is a STATIC positioning offset, not runtime) |

**RUNTIME-DRIVEN paint**: none.

### Paint sites — `engines/rustic.tsx` (10)

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| `containerStyle` | rustic 98-127 | background,color,border,outline | STATE-SELECTED (`backgroundColor`/`textColor` override vs. `--ds-avatar-${variant}-*` token read; `border` on `bordered`; `outline` on `ring`, with `ringColor` prop override — a **runtime string value can land in the outline color**, but classified STATE-SELECTED per the WO-06 discriminator since `ringColor` is a caller-supplied static prop value read once, not live/continuous data) |
| status dot | rustic 137-147 | backgroundColor,border,transform | STATE-SELECTED (`status` enum via `var(--ds-avatar-status-${status})`) |

Rustic's `containerStyle` covers `width`/`height`/`borderRadius` **on the actual
rendered container** (unlike modern, there is only one DOM level, so no
inner/outer split — this is architecturally why rustic has no equivalent
clipping defect: the element that carries the size token IS the element
DaisyUI's class system would have targeted).

### Compounds

`compound/Badge` (Avatar.Badge, 3 sites: dot `backgroundColor`+`border`, both
STATIC/STATE-SELECTED on `status`) and `compound/Group` (Avatar.Group, 3 sites:
child-overlap `border` STATIC, surplus-badge `backgroundColor`+`color`
STATIC) both carry `rottay-avatar-badge*`/`rottay-avatar-group*`/
`rottay-avatar-surplus` classNames — **all confirmed dead CSS hooks**, zero
references anywhere in `tokens/css/`, same pattern as every other
compound in this program to date.

### Suppression risk summary

- Modern's second `.avatar` block (theme.css:1069-1087): **live, uncontested,
  causing real visual clipping/haloing today** — see STOP-AND-REPORT above.
- Modern's first `.avatar > div` block (theme.css:292-298): matches structurally
  but is visually covered by a grandchild in the common case — low/no impact.
- `personality.css:521-530`'s `.ds-avatar`/`:hover` block targets a THIRD,
  entirely different classname (`ds-avatar`) that neither engine ever renders
  — fully orphaned, no live effect, and moot regardless of the finding above
  since the selector never matches.
- Rustic: zero suppression risk — no first-party or DaisyUI class on its root
  at all.

### Engine asymmetries, dead code, pre-existing defects (record only)

- **The 40×40 clipping/haloing defect above is the single highest-priority
  finding in this component** — pre-existing, live, user-visible, unrelated to
  any migration, but something a skin author must not accidentally "fix" as a
  side effect of touching Avatar (i.e., must consciously decide whether to
  preserve or correct it, not silently change behavior either way).
- Rustic has no DaisyUI coupling at all; modern has four distinct DaisyUI
  utility families (`avatar`, `online`, `mask-*`, `ring*`) on one component —
  the widest per-component DaisyUI-coupling spread found in this batch so far.
- All compound classNames are dead hooks.

## Tag (35 sites, 2 files) — clean greenfield, no compounds, no DaisyUI, no suppression risk

Root landing: `engines/modern.tsx` (22), `engines/rustic.tsx` (13).
`engines/classic.tsx` not detailed. No `data-part`, no compounds.

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| `VARIANT_STYLES` (6-entry lookup, modern) | modern 71-78 | background,color | STATE-SELECTED |
| `outlinedOverrides` (modern) | modern 154-156 | background,border,color | STATE-SELECTED (`outlined` prop; `color`/`border` values are read from the already-resolved `variantStyles.background`, still STATE-SELECTED not RUNTIME) |
| `tagStyle` assembly (modern) | modern 159-179 | borderRadius,backgroundColor,boxShadow | STATE-SELECTED (`radius` lookup; `color` prop override; `bordered` inset boxShadow-as-border trick) |
| close button (modern) | modern 200 | background(none),border(none),color(inherit) | STATIC |
| `VARIANT_COLORS` (6-entry lookup, rustic) | rustic 67-74 | (feeds bg/text/border below) | n/a |
| `containerStyle` (rustic) | rustic 148-167 | backgroundColor,color,border,borderRadius | STATE-SELECTED (`outlined`/`color` prop/`bordered` all branch into the same object) |
| close button (rustic) | rustic 178-190 | background(none),border(none),color(inherit) | STATIC |

**Notable mechanism**: modern's `bordered` state doesn't add a real `border` —
it adds an **inset `boxShadow`** (`inset 0 0 0 1px var(--ds-color-border)`,
modern.tsx:176) specifically so the border doesn't affect box sizing/alignment
next to the already-set `border` from `outlined`. Preserve this as a genuine
technique choice, not an oversight, if a migration ever needs to reconcile it
with `outlined`'s real `border`.

**RUNTIME-DRIVEN paint**: none. **Keyframes**: none. **DaisyUI**: none in
either engine (modern's own header comment states this explicitly and it
holds). **Suppression**: none — zero references to `rottay-tag`/`.tag` in any
theme.css or personality.css. Fully greenfield.

**Anatomy**: rustic stamps a real BEM tree (`rottay-tag`,
`rottay-tag--<size>`, `rottay-tag--<variant>`, `--outlined`, `--bordered`,
`--clickable`, plus `__icon`/`__content`/`__close`) — **all confirmed dead**
(zero CSS references). Modern stamps no first-party class at all beyond the
consumer's own `className`.

## Image (35 sites, 4 files) — anatomy pre-step already landed (root `data-part` + interaction state), no skin file yet

Root landing: `engines/modern.tsx` (11), `engines/rustic.tsx` (20).
Compounds: `compound/Fallback` (2), `compound/Skeleton` (2).
`engines/classic.tsx` not detailed.

### Anatomy is ahead of paint here

Both engines already call `{...partAttributes('root', interaction)}` from the
shared `behavior/anatomy.ts` contract (`useInteractionState()`) — the SAME
mechanism Card/Button/Input use — so `data-part="root"` and the
`data-state~='hovered'` token list already reach the DOM. **No skin file
exists yet** (`image.css` absent from both `tokens/css/engines/*/skin/`) — so
unlike Card/Badge, Image's pre-step landed but its migration has not started.
Modern additionally leans on Tailwind utility classes for most of its
structure (radius, opacity-fade transitions, cursor) — only
border-color/box-shadow/panel backgrounds/colors are inline.

### Paint sites — `engines/modern.tsx` (11)

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| container | modern 130-137 | borderColor,boxShadow | STATE-SELECTED (`bordered`/`shadow` props) |
| loading placeholder panel | modern 166-174 | background ×2 (panel + default pulse div) | STATIC |
| error fallback panel | modern 178-185 | background,color | STATIC |
| default fallback icon | modern 143 | color | STATIC |
| hover overlay | modern 201-205 | background | STATIC |
| zoom indicator | modern 208-213 | background,color | STATIC |

**RUNTIME-DRIVEN paint**: none — `status`/`isHovered` are discrete states.

### Paint sites — `engines/rustic.tsx` (20)

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| container | rustic 100-113 | border,boxShadow | STATE-SELECTED (`bordered`/`shadow`) |
| placeholder | rustic 127-138 | backgroundColor | STATIC |
| fallback | rustic 141-153 | backgroundColor,color | STATIC |
| hover overlay | rustic 156-168 | backgroundColor | STATIC |
| zoom-dialog backdrop | rustic 171-183 | backgroundColor | STATIC |
| zoom indicator | rustic 260-276 | backgroundColor,color | STATIC |
| zoom-close button | rustic 293-311 | backgroundColor,color | STATIC |
| default placeholder pulse div | rustic 209-217 | backgroundColor | STATIC |

**Keyframes**: `rusticImagePulse` (rustic.tsx:316-323), injected unguarded on
every render as a plain `<style>` child (same shape as other rustic per-mount
injections in this program) — counter-blind.

**Rustic-only feature, no modern equivalent**: a full-screen zoom dialog
(`role="dialog"`, `aria-modal="true"`, fixed backdrop at `zIndex: 9999`) — a
genuine feature-surface asymmetry, not just a paint difference. Modern's
`zoomable` only shows a hover indicator icon; it never opens an overlay.
Record for the team, not a paint concern.

### Compounds

`compound/Fallback` and `compound/Skeleton` are both `forwardRef` leaf
components with no `data-part`, no first-party classNames referenced anywhere
in `tokens/css/` — standalone-usable pieces (per their own doc comments,
"Can be used standalone or as part of the Image component") that are not
actually wired into either root engine's render (same "documented composition
API, never consumed by the parent" shape found in Breadcrumb.Item/
Stepper.Step during the navigation batch — not re-verified line-by-line here,
flagged for follow-up since the pattern already proved real twice).

### Suppression risk / DaisyUI coupling

None found. Grep-confirmed zero `image`-related selectors in
`personality.css`; the one `theme.css` hit for the string "image" is an
unrelated inline SVG data-URI (a chevron background-image for a dropdown,
not this component). No DaisyUI classes in either engine (modern uses
Tailwind utility classes for layout/radius/opacity only, never a DaisyUI
component class).

## Tooltip (34 sites, 3 files) — modern's bubble is PORTALED and carries zero classname; this is the checkpoint-P portal trap surfacing inside the display family

Root landing: `engines/modern.tsx` (18), `engines/rustic.tsx` (10).
Compound: `compound/Content` (6). `engines/classic.tsx` not detailed.

### The real finding: modern and rustic Tooltip are architecturally different components, not two skins of one

**Modern portals its bubble to `document.body`** (`createPortal(<div ref=
{tooltipRef} role="tooltip" style={bubbleStyle} ...>, document.body)`,
modern.tsx:379-397) and **stamps no classname on the bubble at all** — not
even `className || undefined` like the wrapper gets, literally nothing.
**Rustic renders inline**, absolutely positioned relative to its own wrapper
(no portal), and DOES carry `rottay-tooltip rottay-tooltip--rustic` on its
root container. This is precisely the WO-SKIN-04 checkpoint-P precedent
(Select's portaled dropdown) surfacing inside `display/`, not `overlay/`: **a
future modern-Tooltip skin cannot scope by descendant-of-tenant-root** — the
portaled bubble is a sibling of the app tree, appended directly under
`document.body`. It needs the same treatment WO-SKIN-02 gave the Select
dropdown: a standalone, free-token, grep-verified scope class stamped
directly on the portaled node, not inherited from a parent. Today there is
**no class to hook at all**, so this is a green-field portal case, not a
collision — but it must not be migrated the same way as rustic's (non-
portaled) bubble, or the skin will never match.

### Paint sites — `engines/modern.tsx` (18)

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| `COLOR_STYLE_MAP` (6-entry lookup) | modern 56-63 | background,color | STATE-SELECTED |
| `SHORTCUT_KBD_STYLE` (module-level constant) | modern 82-90 | border,background | STATIC |
| bubble (`bubbleStyle`) | modern 330-361 | (color map spread),borderRadius,boxShadow,transform | STATE-SELECTED (`isVisible` drives `transform: scale()` + `opacity`; color map spread is STATE-SELECTED on `color` prop) |

**RUNTIME-DRIVEN paint — the case this component genuinely has**: `top`/
`left` (`portalPosition?.top ?? 0`, `portalPosition?.left ?? 0`) are computed
every frame from `getBoundingClientRect()` inside `getPortalPosition()` — a
real continuous-data positioning value. **Not a counted channel** (`top`/
`left` aren't in the paint-channel list), so it's noted for completeness but
doesn't add to the site count — the only counted RUNTIME-shaped value in this
component is `transform: scale(${isVisible ? 1 : 0.95})`, and per the WO-06
discriminator that's STATE-SELECTED (the identifier `isVisible` lands in a
two-value ternary, not a live-data read) — classified as such above, not
RUNTIME.

### Paint sites — `engines/rustic.tsx` (10)

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| `SHORTCUT_KBD_STYLE` (shared shape with modern, separate constant) | rustic 62-70 | border,background | STATIC |
| tooltip bubble | rustic 167-189 | backgroundColor,color,boxShadow,transform | STATE-SELECTED (`color` prop feeds `var(--ds-tooltip-${color}-bg/-color)`; `visible` drives `transform: scale()`) |
| arrow | rustic 193-203 | backgroundColor,transform | STATE-SELECTED (`color` prop for background; `transform: rotate(45deg)` is STATIC, unconditional) |

**Pre-existing defect, cross-engine regression**: modern's code comment
(modern.tsx:351-354) documents that it deliberately routes z-index "through
the canonical scale instead of the dead `--ds-z-index-tooltip`/
`--ds-tooltip-z-index` fallback chain (neither name was ever defined, so it
silently resolved to the magic 1070 literal every time)" — **but rustic still
has exactly that dead fallback** (`zIndex: zIndex || 'var(--ds-tooltip-z-index,
1070)'`, rustic.tsx:181). Modern fixed this, rustic did not — a live
cross-engine consistency gap, not a paint channel (zIndex uncounted) but
worth flagging since it's the kind of thing a migration pass might
accidentally "fix" in one engine and not realize the other already diverged.

### Suppression risk / DaisyUI coupling

None found in either engine — grep-confirmed zero `tooltip`-related selectors
in `personality.css` or `modern/theme.css`, and zero DaisyUI class tokens
(modern's own header comment states "No DaisyUI classes are used," confirmed
true).

### Compounds

`compound/Content` (Tooltip.Content, 6 sites) is a standalone-usable
`forwardRef` piece with its own arrow-positioning logic, independent of both
root engines — not wired into either engine's render (same "documented,
never consumed by the parent" shape as Breadcrumb.Item/Stepper.Step/Image's
compounds).

## QRCode (33 sites, 2 files) — a live "bridge" rule already reaches the root when `bordered` is off; rustic's keyframe silently duplicates the global `spin`

Root landing: `engines/modern.tsx` (18), `engines/rustic.tsx` (15).
`engines/classic.tsx` not detailed. Both engines already stamp
`data-status` and `rottay-qrcode rottay-qrcode--<engine>` — greenfield
otherwise (no `data-part`).

### Suppression risk — a real, live "bridge" rule, not orphaned

`tokens/css/engines/modern/theme.css:852-869`, explicitly labeled `/* Bridge:
.rottay-qrcode (modern engine) */`, is layered and targets the SAME
classnames/tokens the component's own inline styles use
(`border-radius`/`border-color`/`background-color` via the identical
`--ds-qrcode-*` token names, plus per-`data-status` `opacity`/
`background-color`). Two live gaps where it is **uncontested**, not
suppressed:
1. **When `bordered` is false**, `containerInlineStyle` sets NO
   border/background properties at all (they only exist inside the
   `...(bordered && {...})` spread) — the bridge's `border-radius`/
   `border-color`/`background-color` apply uncontested on the root. Whether
   this paints anything visible depends on whether `--ds-qrcode-background-
   color` resolves to a real value anywhere (not verified further here —
   record and flag, don't resolve).
2. **The per-`data-status` rules** (`[data-status="loading"|"expired"|
   "scanned"]`) target the ROOT container itself; the component's own inline
   `opacity`/`background` for those statuses are set on a **child overlay
   div**, never on the root. Both the bridge's root-level dimming and the
   child overlay's own inline background can be live simultaneously —
   probably an intentional double-layer (dim the whole card, draw the
   overlay on top) but worth a team confirmation before assuming either is
   safe to drop.

### Paint sites — `engines/modern.tsx` (18)

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| container | modern 161-169 | borderColor,background | STATE-SELECTED (`bordered`) |
| loading overlay + spinner | modern 115-117 | background,border,borderTopColor | STATIC |
| expired overlay + text + button | modern 121-130 | background,color,border | STATIC |
| scanned overlay + icon | modern 135-146 | background,color | STATIC |
| icon wrapper | modern 186-187 | background | STATIC |

**RUNTIME-DRIVEN paint outside the counted channels**: the canvas QR pattern
itself (`ctx.fillStyle = color`/`bgColor`, Canvas 2D API calls, modern.tsx:97-99)
is genuinely RUNTIME (drawn from the `value` string's hash) but **entirely
outside CSS/inline-style scope** — a `<canvas>` bitmap, not a DOM paint
channel, correctly out of migration scope entirely.

### Paint sites — `engines/rustic.tsx` (15)

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| container | rustic 115-125 | border,backgroundColor | STATE-SELECTED (`bordered`) |
| overlay base (shared loading/expired/scanned) | rustic 128-140 | backgroundColor | STATIC |
| icon wrapper | rustic 143-153 | backgroundColor | STATIC |
| refresh button | rustic 156-165 | border,background,color | STATIC |
| spinner | rustic 168-175 | border,borderTop | STATIC |

**Keyframe name collision, content-identical (today harmless, structurally
fragile)**: rustic injects its own `@keyframes spin { from{rotate(0deg)}
to{rotate(360deg)} }` (rustic.tsx:225-231) — **byte-identical** to the real
global `@keyframes spin` already defined in
`tokens/css/foundation/animations/keyframes.css:230-237`. No visible bug
today (values match), but it is a genuine unnamespaced redefinition of a
global name, unguarded per-mount, the same shape as every other duplicate-
keyframe finding in this program — if the global definition is ever tuned,
rustic's local copy silently diverges since it always wins for its own
subtree by DOM order. Modern correctly reuses the global `spin` via its
inline `animation: 'spin var(--ds-motion-glacial) linear infinite'`
(modern.tsx:116) with no local redefinition.

### DaisyUI coupling

None on either engine's rendered classnames despite modern's own header
comment claiming "DaisyUI-styled status overlays" and "DaisyUI-styled
container" — grep-confirmed zero real DaisyUI class tokens anywhere (only
Tailwind layout utilities: `absolute`, `inset-0`, `flex`, `w-12`, etc.) — a
third instance of the "doc comment claims DaisyUI, code doesn't have it"
pattern first seen in Pagination/Segmented during the navigation batch.

## List (31 sites, 2 files) — greenfield, no DaisyUI, no suppression; `Item`/`Meta` sub-components live in the SAME file as the root (no `compound/` folder)

Root landing: `engines/modern.tsx` (19), `engines/rustic.tsx` (12).
`engines/classic.tsx` not detailed. **Architectural note**: unlike every other
component in this batch, List's `Item`/`Meta` sub-components are NOT under a
`compound/` folder — they're exported directly from the same
`engines/modern.tsx`/`engines/rustic.tsx` files as `List` itself, so they ARE
engine-split (a real `Item.Modern` vs `Item.Rustic`), not engine-agnostic like
every other family's compounds. No `data-part` anywhere.

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| `Meta` title/description (modern) | modern 33-54 | color ×2 | STATIC |
| `Item` row (modern) | modern 69-79 | background,color | STATIC |
| `Item` actions color (modern) | modern 90-97 | color | STATIC |
| `List` loading skeleton (modern, 3 bars × avatar+2 lines) | modern 146-165 | background ×5 | STATIC |
| `List` container (modern) | modern 168-182 | background,color,borderColor,borderWidth,borderRadius | STATE-SELECTED (`bordered`) |
| header/footer (modern) | modern 184-233 | background,borderColor ×2 | STATE-SELECTED (`bordered`) |
| split divider (modern) | modern 209-217 | borderColor,borderBottomWidth | STATE-SELECTED (`split` prop, existence-gated) |
| `Item` row (rustic) | rustic 65-85 | (no counted paint — pure layout) | n/a |
| `List` loading skeleton (rustic) | rustic 128-163 | background ×3 | STATIC |
| `List` container (rustic) | rustic 166-176 | border,borderRadius | STATE-SELECTED (`bordered`) |
| header/footer (rustic) | rustic 177-219 | borderBottom,borderTop | STATE-SELECTED (`bordered`) |
| split divider (rustic) | rustic 201-207 | borderBottom | STATE-SELECTED (`split`, existence-gated) |

**RUNTIME-DRIVEN paint**: none — `dataSource`/`renderItem` drive WHICH items
render, not paint values.

**DaisyUI coupling**: none — modern's header comment claims "DaisyUI color
tokens" but grep-confirms zero real DaisyUI class tokens anywhere, only
Tailwind layout utilities (`flex`, `items-center`, `grid`, `border`,
`rounded-lg`) — a fourth instance of the "doc claims DaisyUI, code doesn't
have it" pattern (after Pagination, Segmented, QRCode).

**Suppression / anatomy**: none — zero `rottay-list`/`.list` references
anywhere in `theme.css`/`personality.css`; no first-party classNames on
either engine beyond the consumer's own `className`.

## Timeline (28 sites, 2 files) — real DaisyUI coupling (`timeline`/`timeline-start/-middle/-end`); a live layered color-override that beats the root's inherited color

Root landing: `engines/modern.tsx` (19), `engines/rustic.tsx` (9).
`engines/classic.tsx` not detailed. `Item` sub-components live in the same
engine files (same shape as List), both effectively pass-through wrappers
("the actual rendering is handled by the parent Timeline component" per both
engines' own doc comments) — the real per-item DOM is built by `Timeline`
itself reading `item.props` off the JSX children or the `items` array.

### DaisyUI coupling — real, plus a layered color rule that legitimately wins today

Modern carries `timeline timeline-vertical` (root) and `timeline-start`/
`timeline-middle`/`timeline-end` (per-item position classes) — genuine DaisyUI
timeline classes, linked from the file's own header comment to
`https://daisyui.com/components/timeline/`. `theme.css:783-796` has real
rules for both:
- `.timeline::before { background-color: var(--ds-timeline-line-color);
  width: var(--ds-timeline-line-width); }` — DaisyUI's own connector-line
  pseudo-element, overridden with the **same token names** the component's
  own explicit `<hr>` elements between items also use inline (modern.tsx:110,
  140, 149). Two mechanisms may be drawing a connector line simultaneously —
  DaisyUI's `::before` (pseudo-element, layered override) and the component's
  own inline `<hr>`s. Same "verify which one actually renders, don't assume
  the TSX value is the whole story" shape as Steps' connector — not resolved
  further here, flagged for empirical verification before any migration.
- `.timeline-start`/`-middle`/`-end { color: var(--ds-text-primary); }` — **a
  live, uncontested win today**: the position `<div>`s carry no inline
  `color` of their own; the root `<ul>`'s inline `color:
  var(--ds-timeline-content-color, inherit)` is on a different (ancestor)
  element, and an inherited value always loses to any explicit rule on the
  descendant regardless of layering. **This layered rule is genuinely
  painting the text color of every timeline item today** — a real personality-
  wins channel, not suppressed.

### Paint sites — `engines/modern.tsx` (19)

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| `COLOR_STYLE_MAP` (8-entry lookup) | modern 28-39 | background | STATE-SELECTED |
| root `<ul>` | modern 86-91 | color | STATIC |
| connector `<hr>` (×2 call sites, before/after each item) | modern 110,140 | background | STATIC |
| label | modern 112-121 | color | STATIC |
| dot | modern 127-137 | borderWidth,(colorStyle spread=background) | STATE-SELECTED (`itemProps.color` lookup) |
| pending spinner | modern 151 | border,borderTopColor | STATIC |
| pending dot | modern 154-163 | background | STATIC |

### Paint sites — `engines/rustic.tsx` (9)

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| connector line | rustic 76-83 | backgroundColor | STATIC |
| dot | rustic 120-133 | backgroundColor,border,boxShadow | STATE-SELECTED (`itemProps.dot` presence flips solid-fill vs. transparent-with-ring via `boxShadow`) |
| label | rustic 148-151 | color | STATIC |
| pending dot | rustic 167-181 | backgroundColor | STATIC |
| pending text | rustic 182 | color | STATIC |

**Keyframes**: rustic injects `rottay-timeline-pulse` (rustic.tsx:188-193),
correctly namespaced and its own comment explicitly states why ("Scoped via a
unique animation name to avoid collisions with other `@keyframes` on the
page") — the first component in this batch whose author already applied the
lesson every other duplicate-keyframe finding in this program has been
teaching. Still unguarded per-mount (injected every render), still
counter-blind, but content-collision-safe by design.

**RUNTIME-DRIVEN paint**: none.

## Carousel (28 sites, 3 files) — modern's container carries real DaisyUI `carousel`/`carousel-item` classes; a layered `border-radius` is uncontested on the root

Root landing: `engines/modern.tsx` (12), `engines/rustic.tsx` (13).
Compound: `compound/Item` (3). `engines/classic.tsx` not detailed.

**DaisyUI coupling**: modern's root carries `carousel w-full relative
[carousel-vertical]`, each slide carries `carousel-item absolute w-full
h-full` — real DaisyUI classes (arrow/dot controls are inline-only, as the
file's own header comment states). `theme.css:798-809` has matching rules:
`.carousel { border-radius: var(--ds-carousel-radius); overflow: hidden; }`
and `.carousel-item { transition: var(--ds-carousel-transition); }`. Neither
`border-radius` nor `overflow` is set inline on the root anywhere in
modern.tsx (only the consumer's own `style` prop could contest it) — **a
live, uncontested layered rule**, same shape as the Timeline/QRCode findings,
though lower-stakes here since an undefined `--ds-carousel-radius` degrades to
square corners rather than a visible defect.

### Paint sites — `engines/modern.tsx` (12)

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| arrow buttons (×2, prev/next) | modern 234,243 | background,color,border,boxShadow | STATIC (duplicated verbatim between the two buttons) |
| dots | modern 266-270 | background | STATE-SELECTED (`index === currentSlide`) |

**RUNTIME-DRIVEN paint**: none in counted channels — slide `transform`
(translateX/Y by `(index - currentSlide) * 100%`) is a real per-render
computed value but classified STATE-SELECTED per the WO-06 discriminator
(`currentSlide` is a discrete index into a fixed slide count, the same shape
as Tabs' active-key branching, not continuous data) — however note this
value is NOT a lookup-table read like other STATE-SELECTED cases, it's
arithmetic on the index; flagged for the team to confirm the classification
holds since it's a borderline case (the value is HELD in `transform`, which
is a counted channel, unlike Tabs where translateX rode a measured pixel
value from `getBoundingClientRect` — here it's a formula over discrete
indices, not a live measurement, which is why STATE-SELECTED still applies
per "ask where the identifier lands, not whether one is mentioned").

### Paint sites — `engines/rustic.tsx` (13)

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| `arrowStyle` (shared, ×2 usage sites) | rustic 222-238 | background,border | STATIC |
| `getDotStyle()` | rustic 303-313 | background | STATE-SELECTED (`isActive` param) |

Same slide-transform shape as modern (STATE-SELECTED per the same reasoning).

**Compound**: `compound/Item` (3 sites) — not read in full given time budget;
flagged for follow-up verification of whether it's wired into either root
engine's render (pattern established repeatedly this batch: compounds are
usually NOT consumed by the parent).

## Statistic (24 sites, 3 files) — half-borrows DaisyUI's `stat-title`/`stat-value` naming (no `stats`/`stat` wrapper); title color is a live uncontested win

Root landing: `engines/modern.tsx` (12), `engines/rustic.tsx` (6).
Compound: `compound/Countdown` (6, engine-agnostic — modern/rustic each also
export their OWN `Countdown` directly, same "compound lives beside root, not
under compound-consumed-by-root" shape as List/Timeline). `engines/classic.tsx`
not detailed.

**DaisyUI half-adoption**: modern's title/value divs carry DaisyUI's real
`stat-title`/`stat-value` class names, but the root never carries the
DaisyUI wrapper classes (`stats`/`stat`) that would normally contain them —
a partial borrow of the inner naming only. `theme.css:768-781` has matching
rules: `.stat-title { color; font-size }` and `.stat-value { color; font-size;
font-weight }`. **Title color is live and uncontested**: modern's title
`<div>` inline style sets only `lineHeight`/`marginBottom`, never `color` —
the layered rule's `color: var(--ds-statistic-title-color)` is the only thing
painting it today. **Value color is fully suppressed**: `valueColorStyle`
(from `VALUE_TYPE_STYLE_MAP`) sets `color` inline unconditionally, beating the
layered `.stat-value` rule regardless of specificity.

### Paint sites — `engines/modern.tsx` (12)

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| `VALUE_TYPE_STYLE_MAP` (4-entry) | modern 102-107 | color | STATE-SELECTED |
| loading skeleton bars (×2) | modern 170-186 | background ×2 | STATIC |
| prefix/suffix (Statistic + Countdown, ×4 sites total) | modern 213,229,366,372 | color | STATIC |

**RUNTIME-DRIVEN paint**: none in counted channels — `CountUp`'s animated
number display and the countdown's 1-second `setInterval` tick both drive
TEXT CONTENT, not a paint value; `formatTime`/`formatNumber` produce strings,
never colors. The countdown IS a genuine wall-clock-driven re-render (worth
noting per the lane's "no wall-clock paint" law check) but nothing it
recomputes lands in a style key.

### Paint sites — `engines/rustic.tsx` (6)

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| `STYLES.title`/`STYLES.value` (module constants) | rustic 108-119 | color ×2 | STATIC |
| `STYLES.skeleton` | rustic 126-129 | background | STATIC |
| `VALUE_TYPE_COLOR_MAP` (4-entry) | rustic 136-141 | (feeds `color` below) | n/a |
| value color override | rustic 220,350 | color | STATE-SELECTED |
| loading skeleton usages (×2) | rustic 203-204 | (reuses `STYLES.skeleton`, no new keys) | n/a |

Rustic's title/value colors ARE set inline unconditionally (`STYLES.title.color`/
`STYLES.value.color` as base, then overridden by `valueColor` for the value) —
**no suppression risk on rustic**, only modern has the uncontested title-color
channel.

## Callout (20 sites, 2 files) — the feedback batch's `alert` accent-bar trap recurs here verbatim: modern's left-accent border is 100% personality-driven, zero inline footprint

Root landing: `engines/modern.tsx` (12), `engines/rustic.tsx` (8).
`engines/classic.tsx` not detailed.

### This is the precedent trap the checkpoint brief named, confirmed live

Modern's root carries the real DaisyUI `alert` class (`className={\`alert
${className}\`}`) — the exact same class Alert used in the WO-SKIN-03
feedback batch. `personality.css:490-502` ("ALERT PERSONALITY") targets
`.ant-alert, .alert, .rottay-alert, [data-engine] .ds-alert` with
`border-left-width: var(--ds-personality-accent-bar-thickness, 4px);
border-left-style: var(--ds-personality-accent-bar-style, solid);` plus an
opacity/transform transition. **Callout's own `variantStyle` sets only
`background`+`color` — no border property of any kind** — so this layered
rule's `border-left-width`/`border-left-style` are **fully uncontested on
modern Callout today**, live, exactly the same shape as the Alert precedent.
No `border-left-color` is declared anywhere in the personality rule either;
it resolves through the CSS-initial `currentColor`, which inherits the
component's own inline `color: variantStyle.color` (e.g.
`var(--ds-color-info)`) — the accent bar's color is therefore an emergent
composition between the personality layer (width+style) and the component's
own inline text color (supplying the border color via `currentColor`), not a
single source. **The law this composition depends on**: any future inline
border touching this element must stay a LONGHAND (`borderLeftColor` only) —
a shorthand `borderLeft`/`border` declaration would zero out the
personality-supplied width/style and collapse the whole composition. Nothing
in Callout does this today, but it is exactly the trap a well-intentioned
migration could walk into by "helpfully" adding a border.

`theme.css:282-289`'s separate `.alert { padding; border-radius; font-size;
}` is also layered and also fully uncontested (Callout sets none of those
inline either) — a second live channel, lower-stakes (padding/radius/font-
size, not a visible-structure-defining border).

### Paint sites — `engines/modern.tsx` (12)

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| `VARIANT_STYLES` (4-entry, `color-mix()` background + color) | modern 27-32 | background,color | STATE-SELECTED |
| close button | modern 101 | background,color | STATIC |

### Paint sites — `engines/rustic.tsx` (8)

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| root `<aside>` | rustic 71-84 | backgroundColor,borderLeft,color | STATE-SELECTED (`CALLOUT_COLORS[variant]` lookup; `borderLeft` here IS a shorthand, but rustic carries no DaisyUI `alert` class and no personality rule targets `rottay-callout-rustic`/`rottay-callout--<variant>`, so no composition risk exists on this engine — confirmed by grep, zero hits) |
| icon | rustic 87-99 | color | STATE-SELECTED |
| close button | rustic 120-134 | color | STATE-SELECTED |

**Rustic is architecturally immune to the accent-bar trap**: its own
`borderLeft` is a real, self-contained shorthand — there is no external
layer composing onto it, so rustic's shorthand usage is safe exactly because
nothing else touches that channel. The hazard is modern-only, precisely
because modern's DaisyUI `alert` class is what makes the personality rule
reach it at all.

## Descriptions (16 sites, 2 files) — greenfield; `Item` is a deliberate "phantom" (documented, not an unwired-compound accident)

Root landing: `engines/modern.tsx` (8), `engines/rustic.tsx` (8).
`engines/classic.tsx` not detailed. `data-engine="modern"/"rustic"` is already
stamped on the root (not `data-part`, just an engine marker).

**Architectural note, distinct from every other "compound never consumed"
finding in this batch**: `Descriptions.Item` is explicitly documented as a
"phantom" component in BOTH engines' own doc comments — it renders `<>{
children}</>` and is NEVER meant to produce its own DOM; the parent
`Descriptions` reads `child.props` directly via `React.Children.map` to build
the real layout. This is a deliberate, self-aware design decision (avoids an
extra wrapper div per item), not an accidental composition gap like
Breadcrumb.Item/Stepper.Step/Image's compounds. No paint to inventory on
`Item` itself since it never renders DOM.

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| title (modern) | modern 82 | color | STATIC |
| border (modern, bordered content wrapper) | modern 67,112 | borderColor | STATE-SELECTED (`bordered`, two call sites) |
| label/content (modern, ×2 layouts) | modern 117,124,143,150 | color | STATIC (4 sites: label+content × horizontal+vertical) |
| title (rustic) | rustic 85-90 | color | STATIC |
| content wrapper (rustic) | rustic 93-98 | border,backgroundColor | STATE-SELECTED (`bordered`) |
| label/content base (rustic) | rustic 110-121 | color ×2 | STATIC |
| item border (rustic, ×2 layouts) | rustic 138,170 | borderBottom | STATE-SELECTED (`bordered`) |

**RUNTIME-DRIVEN paint**: none. **DaisyUI**: none — modern's own header
comment claims "DaisyUI's base-content colour tokens" but grep-confirms zero
real DaisyUI classes (Tailwind layout utilities only: `grid`, `divide-y`,
`flex`) — a fifth instance of the "doc claims DaisyUI, code doesn't have it"
pattern. **Suppression**: none — zero `rottay-descriptions` references
anywhere in `theme.css`/`personality.css`, fully greenfield despite modern
stamping a real BEM-ish class tree (`rottay-descriptions`,
`-vertical`/`-borderless` modifiers, `-title`, `-row`, `-label`, `-content`)
that nothing currently targets.

## Typography (14 sites, 2 files) — the batch's first CLASSNAME-COLLISION near-miss: rustic's `rottay-link` classname is already RESERVED (not collided) by navigation's shipped Link skin; rustic engine is still internally named "Apollo"

Root landing: `engines/modern.tsx` (10), `engines/rustic.tsx` (4). Four
exported shapes per engine (`Heading`/`Text`/`Paragraph`/`Link`, all in one
file per engine — no `compound/` folder). `engines/classic.tsx` not detailed.
No `data-part` on any of the four.

### Item 5 finding: `rottay-link` is a live reservation from WO-SKIN-04, not a dead name

Grep against every skin folder (`tokens/css/engines/*/skin/*.css`,
`tokens/css/components/skin/*.css`) for `rottay-heading`/`rottay-text`/
`rottay-paragraph`/`rottay-link` returns hits only in
`tokens/css/engines/{modern,rustic}/skin/link.css` — but reading those files
shows the match is **not** a collision. Both are navigation's already-shipped
`Link` skin (WO-SKIN-04 checkpoint N, `primitives/navigation/Link`, exported
as `NavLink`), and both files' header comments explicitly document why their
scope class is `rottay-link-shell` rather than the bare `rottay-link` a naive
migration would reach for: *"`rottay-link` is already stamped by
display/Typography's rustic engine, and `data-part` is a shared vocabulary,
not an identifier"* (modern/skin/link.css:14-15, rustic/skin/link.css:10-11).
**Typography's `rustic.tsx` root Link (`ApolloLink`/`RusticLink`) stamps
`className="rottay-link"` today** (rustic.tsx, the Link export's className
list) — this is the exact classname navigation's migration agent already
found and deliberately routed around. Net effect: **no live collision exists
today** (navigation's skin never matches bare `rottay-link`, only the `-shell`
compound), but **`rottay-link` is a reserved/banned name for this
component's own future skin scope class** — reusing it would not collide with
navigation's rule (which requires the `-shell` class too) but would violate
the same shared-vocabulary law that made navigation choose `-shell` in the
first place, and forecloses ever giving navigation's scope a plainer name
later. Modern's Link stamps no first-party classname at all (Tailwind
utilities only), so this reservation is rustic-only. `rottay-heading`,
`rottay-text`, `rottay-paragraph` (rustic's other three) are grep-confirmed
free — zero hits anywhere in `tokens/css/`.

### Paint sites — `engines/modern.tsx` (10)

All ten sites are a single shared mechanism: `COLOR_STYLES`
(modern.tsx:156-165), a 10-entry `Record<string, CSSProperties>` mapping
`default`/`secondary`/`tertiary`/`muted`/`subtle`/`inherit`/`primary`/
`success`/`warning`/`error` to `{ color: 'var(--ds-color-*)' }` (or `inherit`
for the `inherit` entry), spread identically into `ModernHeading`,
`ModernText`, `ModernParagraph`, and `ModernLink`'s inline style via
`COLOR_STYLES[color]`.

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| `COLOR_STYLES` (10-entry lookup, shared by all 4 exports) | modern 156-165 | color | STATE-SELECTED |

**RUNTIME-DRIVEN paint**: none. No keyframes. No first-party classNames
beyond Tailwind utility classes (`resolvedWeightClass`, `ALIGN_CLASSES`,
`truncate`, `line-clamp-*`) — modern Typography stamps zero DS-owned
classname on any of the four exports.

### Paint sites — `engines/rustic.tsx` (4)

Mirrors modern's shape exactly: a single `COLOR_MAP` (imported from
`Typography.types.ts:521`, shared with `Typography.tsx` itself) read once per
export via `COLOR_MAP[color] || COLOR_MAP.default` (Heading/Text/Paragraph)
or `|| COLOR_MAP.primary` (Link's own default differs from the other three).

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| Heading color | rustic 133 | color | STATE-SELECTED |
| Text color | rustic 245 | color | STATE-SELECTED |
| Paragraph color | rustic 313 | color | STATE-SELECTED |
| Link color | rustic 382 | color | STATE-SELECTED |

Rustic additionally stamps real first-party classNames on every export —
`Heading`: `rottay-heading rottay-heading--<level>`; `Text`: `rottay-text`
(plus `ds-nums-tabular` when `numeric === 'tabular'`); `Paragraph`:
`rottay-paragraph`; `Link`: `rottay-link` (the reserved name above). Modern
stamps none of these. **RUNTIME-DRIVEN paint**: none. No keyframes.

### Retired-engine-name finding: "Apollo" survives as the internal implementation name, not just a `displayName` string

`engines/rustic.tsx` internally implements and exports `ApolloHeading`,
`ApolloText`, `ApolloParagraph`, `ApolloLink` as the real component
definitions, then re-exports them at the bottom of the file under the
canonical names:

```
export const RusticHeading = ApolloHeading;
export const RusticText = ApolloText;
export const RusticParagraph = ApolloParagraph;
export const RusticLink = ApolloLink;
```

with an explicit, self-aware comment: *"Rustic aliases provide a consistent
naming convention across all engines (ClassicX, ModernX, RusticX) while the
internal 'Apollo' names are preserved for backward compatibility with early
adopters of the design system."* This is a **deeper** instance of the
retired-name finding than Anchor's (WO-SKIN-04 checkpoint N: `Hermes`/
`Apollo`/`Titan` survived only in runtime `displayName` strings, cosmetic and
devtools-visible only). Here "Apollo" is the actual function/const identifier
throughout the file's ~430 lines — a live violation of
`CLAUDE.md`'s "canonical engine names are `classic`/`modern`/`rustic`/
`custom`... legacy names `titan`/`hermes`/`apollo` are gone" law, deliberately
preserved by a prior author for a compatibility reason that predates this
program. Record per the brief (do not fix inside a byte-exact migration — a
rename is its own commit, same disposition as the Anchor finding).

### Suppression risk / DaisyUI coupling

No suppression risk beyond the `rottay-link` reservation above —
`rottay-heading`/`rottay-text`/`rottay-paragraph` are grep-confirmed absent
from both `theme.css` files and `personality.css`. No DaisyUI coupling in
either engine: modern uses pure Tailwind utility classes for weight/align/
truncation, never a DaisyUI component class; rustic uses no classes beyond
its own first-party BEM-ish names.

### Engine asymmetries, dead code, pre-existing defects (record only)

- Modern stamps zero first-party classnames on any of its four exports;
  rustic stamps one each — the widest "anatomy asymmetry" in this batch (not
  a paint gap, a hook-availability gap: nothing in modern Typography is
  currently addressable by an external selector at all, by design or by
  omission — not determined here).
- `rottay-link` is reserved by a cross-family precedent (navigation's shipped
  skin), not by anything Typography itself has done — the two families share
  a name today only because rustic's Link happened to pick the same bare
  word navigation later needed to avoid.
- "Apollo" is the real internal implementation name throughout
  `engines/rustic.tsx`, not just a devtools string — see above.

## Kbd (10 sites, 2 files) — smallest component in the batch; fully greenfield; sixth "doc claims DaisyUI, code doesn't have it" instance

Root landing: `engines/modern.tsx` (6), `engines/rustic.tsx` (4).
`engines/classic.tsx` not detailed. Single `<kbd>` element per engine, no
sub-components, no `data-part`.

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| `SIZE_STYLES` (3-entry, modern — feeds padding/fontSize/minHeight, not counted directly) | modern 19-23 | n/a | n/a |
| root (modern) | modern 44-57 | borderRadius,border,background,color | STATIC |
| root (rustic) | rustic 49-68 | border,borderBottom,borderRadius,backgroundColor,color,boxShadow | STATIC |

**RUNTIME-DRIVEN paint**: none. No keyframes. No compounds.

**DaisyUI coupling — claimed, absent**: modern's own header comment states
*"Leverages DaisyUI's built-in `kbd` component class"*, but the rendered
`className` is `className || undefined` — the consumer's own className only,
**DaisyUI's `kbd` class is never added**. Grep-confirmed zero DaisyUI class
tokens in either engine. This is the **sixth** instance of the "doc comment
claims DaisyUI, code doesn't have it" pattern in this program (after
Pagination, Segmented in WO-SKIN-04; QRCode, List, Descriptions in this
batch).

**Suppression / collision**: none. Zero hits for `rottay-kbd`/bare `kbd`
anywhere in `theme.css` (either engine), `personality.css`, or any shipped
skin file. Rustic's `rottay-kbd-rustic` classname is a dead, unreferenced
hook — grep-confirmed free, no collision risk for a future scope class.
Modern stamps no first-party classname at all.

## Empty (4 sites, 2 files) — smallest component in the batch; a live bridge rule's root `color` is uncontested on BOTH engines, and its token name doesn't match the component's own

Root landing: `engines/modern.tsx` (3), `engines/rustic.tsx` (1).
`engines/classic.tsx` not detailed. `compound/index.ts` is an explicit,
self-documented placeholder (`export {}` with a doc comment describing three
*planned* future compounds, `Empty.Image`/`Empty.Description`/`Empty.Action`)
— a genuinely different shape from every other batch's "documented, never
wired" compound gap: here nothing is claimed to exist yet, so there is
nothing to find missing.

### Live, uncontested bridge rule on the root — both engines share it

`tokens/css/engines/modern/theme.css:834-846`, `/* Bridge: .rottay-empty
(modern engine) */`, `[data-tenant] .rottay-empty { display:flex;
flex-direction:column; align-items:center; justify-content:center; padding:
var(--ds-empty-padding); color: var(--ds-text-secondary); }` plus
`.rottay-empty__footer { margin-top: 0.5rem; }`. **Both engines' root
`<div>` carry the bare `rottay-empty` class** (modern: `rottay-empty
rottay-empty--modern ...`; rustic: `rottay-empty rottay-empty--rustic`), and
**neither engine's root sets an inline `color`** — modern's root style is
`style={style}` (pass-through of the caller's own prop only); rustic's
`containerStyle` sets `display`/`flexDirection`/`alignItems`/`justifyContent`/
`padding`/`textAlign` but never `color`. **This bridge rule's `color:
var(--ds-text-secondary)` is live and uncontested on the root of both
engines today** — it paints (via inheritance) any child that doesn't set its
own color, most notably the `children` footer slot (a consumer-supplied
action, e.g. a `<Button>`) if that action doesn't set its own text color.
Both engines' own `description`/`<p>` sets its own inline `color` locally
(`var(--ds-color-text-secondary)` modern, `var(--ds-empty-description-color,
...)` rustic), so the description text itself is unaffected — only the root
channel (and anything else inheriting from it) is live.

**Token-name mismatch, worth a team check, not resolved here**: the bridge
reads `var(--ds-text-secondary)`; the component's own inline description
color reads `var(--ds-color-text-secondary)` — a different token name
(missing the `-color-` segment). Not verified whether these resolve to the
same value or are genuinely two different tokens; if they diverge, the
inherited root color and the description's own color are visibly different
grays today, which a migration must preserve rather than "fix" by aligning
the names.

### Paint sites — `engines/modern.tsx` (3)

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| `DefaultImage` SVG wrapper style | modern 25 | color | STATIC |
| `SimpleImage` SVG wrapper style | modern 49 | color | STATIC |
| description `<p>` | modern 119 | color | STATIC |

(SVG `fill="currentColor"`/`opacity` values inside the `<g>`/`<path>`/
`<ellipse>` elements are JSX attributes, not style keys — not counted, same
rule applied to Card's SVG stroke and Descriptions' icon fills earlier in
this report.)

### Paint sites — `engines/rustic.tsx` (1)

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| description `<p>` | rustic 127 | color | STATIC |

Rustic's `DefaultImage`/`SimpleImage` SVGs use `fill="var(--ds-color-bg-
secondary)"` etc. as JSX attributes (not style keys) — correctly uncounted,
same rule as modern's SVGs.

**RUNTIME-DRIVEN paint**: none. No keyframes. No DaisyUI coupling in either
engine (both header comments correctly describe DaisyUI/Tailwind and CSS-var
approaches without claiming a DaisyUI component class exists, and grep
confirms only Tailwind layout utilities — `flex`, `flex-col`, `items-center`
— on modern's root, none on rustic's).

### Suppression / collision summary

- The root `color` bridge above is the only live channel — a genuine,
  currently-uncontested personality/theme.css win on BOTH engines
  simultaneously (rare in this batch; most findings so far were single-engine).
- `rottay-empty__footer` also has a live, uncontested `margin-top: 0.5rem`
  bridge rule — not a paint channel, noted only for completeness.
- No shipped-skin collision: grep-confirmed zero hits for `rottay-empty` in
  any `tokens/css/engines/*/skin/*.css` or `tokens/css/components/skin/*.css`.

## Tree (51 sites, 3 files) — the batch's richest architecture: a live two-layer hover system (CSS on the wrapper, JS on the row), real DaisyUI checkbox coupling, and modern's own row uses the SAME imperative-hover workaround rustic's header comment says only inline-styles engines need

Root landing: `engines/modern.tsx` (27), `engines/rustic.tsx` (24).
Compound: `compound/TreeNode` (0 counted sites — `opacity` isn't a paint
channel). `engines/classic.tsx` not detailed. Neither engine's `TreeNodeInternal`/
`TreeNodeRender` destructures or iterates `props.children` as `Tree.TreeNode`
elements — both consume a flat `treeData` array prop instead — so
`compound/TreeNode` is (not fully re-verified line-by-line, given time
budget, but consistent with every prior compound finding this batch) very
likely the same "documented, never rendered by the parent" shape as
Breadcrumb.Item/Stepper.Step/Image's compounds/Carousel's Item.

### Finding 1: a live, uncontested two-layer hover system — CSS paints the WRAPPER, JS paints the ROW, and they can be visible at the same time

`tokens/css/engines/modern/theme.css:815-828`, `/* Bridge: .rottay-tree
(modern engine) */`:
```
[data-tenant] .rottay-tree { background-color: var(--ds-tree-bg); }
[data-tenant] .rottay-tree .rottay-tree-node {
  padding: var(--ds-tree-node-padding);
  color: var(--ds-tree-node-color);
  transition: var(--ds-transition-fast);
}
[data-tenant] .rottay-tree .rottay-tree-node:hover {
  background-color: var(--ds-tree-node-bg-hover);
}
```
`rottay-tree-node` is the **outer wrapper** `<div>` (modern.tsx:237-241,
`className="rottay-tree-node relative"`) — it carries **no inline `style`
prop at all**. The actual clickable, colored, hover-reactive row is a
**separate, unclassed inner `<div>`** one level down (modern.tsx:304-384),
styled entirely via the `style={{...}}` object and imperative
`onMouseEnter`/`onMouseLeave` handlers. This means:
- The bridge's `color`/`padding`/`transition` on `.rottay-tree-node` are
  **fully uncontested on the wrapper** — nothing inline on that element
  competes. Low practical visibility for `color` (the inner row sets its own
  explicit inline `color`, and an explicit value on a descendant always wins
  over an inherited one regardless of layering), but real for whatever else
  reads the wrapper's computed padding/color.
- **The `:hover` background is the significant live finding.** The wrapper
  (`.rottay-tree-node`) is a block-level div that is NOT width-constrained to
  the inner row — when `blockNode` is `false`, the inner row is
  `inline-flex` (only as wide as its content), while the wrapper spans the
  tree's full column width. Hovering anywhere in that gutter — inside the
  wrapper's box but outside the narrow row — fires the **CSS** `:hover`
  (paints `var(--ds-tree-node-bg-hover)` across the wrapper's full width) but
  does **not** fire the row's own `onMouseEnter` (bound to the row element
  specifically). Hovering directly over the row fires **both**: the row's own
  JS-driven `el.style.background = 'var(--ds-tree-node-bg-hover, ...)'`
  (imperative write, modern.tsx:345) paints the row itself, while the CSS
  `:hover` simultaneously paints the wrapper behind/around it. **This is a
  real, live, two-layer hover architecture, not a redundant duplicate** — it
  is what makes the hover background extend into the gutter for
  non-blockNode trees. A migration that "cleans up" by moving only the row's
  JS-driven paint into a skin and dropping the wrapper's CSS-driven one (or
  vice versa) would visibly shrink the hover-highlight area for every
  non-blockNode Tree.

### Finding 2: modern's row uses the SAME imperative-style-mutation hover workaround the file's own architecture doesn't require

Modern's row `onMouseEnter`/`onMouseLeave` (modern.tsx:342-355) directly
mutate `el.style.background`/`el.style.borderLeft` on the DOM node — the
identical technique rustic's file-level header comment explains is required
*"because inline styles cannot express `:hover` pseudo-selectors."* Modern,
however, is DaisyUI/Tailwind-based and could have expressed this as a real
`:hover` utility class or a scoped CSS rule (as its OWN theme.css bridge rule
above proves is available to it) — it uses the imperative-JS technique
anyway, on top of the CSS-driven wrapper hover from Finding 1. Two
independent hover mechanisms, on two different elements, doing conceptually
the same job for the same user action. Record both to preserve, not to
unify — the migration kit's "preserve the mechanism, not just the value" law
applies directly here (imperative writes are counter-visible today; if they
move into a skin's `:hover` rule instead, that's a real mechanism change,
appropriate only as a deliberate, called-out decision, not a silent
byproduct).

### Finding 3: real (not orphaned) DaisyUI checkbox coupling

Both engines' checkbox input carries genuine DaisyUI classes: modern uses
`checkbox checkbox-sm checkbox-primary` (+ `checkbox-indeterminate` when
half-checked, modern.tsx:416-421); `tokens/css/engines/modern/theme.css:
209-233` has a real, matching `.checkbox` block (`width`/`height`/
`border-color`/`border-radius`/`:hover`/`:checked`/`:focus-visible`) that
genuinely styles this input — unlike most of this batch's DaisyUI findings,
this one is neither orphaned nor "claimed but absent." `personality.css:
278-294` ("CHECKBOX PERSONALITY") additionally layers transition timing onto
`.checkbox` — not a paint channel (transition only), no suppression risk.
Rustic's checkbox (rustic.tsx:515-531) is fully inline-styled via
`checkboxStyle` (including `accentColor`, a real counted channel) and
carries no DaisyUI class — same cross-engine split as every other checkbox-
bearing component in this program.

### Paint sites — `engines/modern.tsx` (27)

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| search-highlight span | modern 61 | background,color | STATIC |
| drop-indicator line | modern 109 | background | STATIC |
| tree-line connectors (×4 div blocks: ancestor verticals, horizontal, self-vertical ×2) | modern 250-289 | borderColor,borderLeftWidth/borderTopWidth | STATIC |
| node row base + selected + focus-ring + drop-inside (one style object, several spreads) | modern 320-341 | background,color,borderColor | STATE-SELECTED (`isSelected`/`isFocused`/`isDropTarget` ternaries) |
| node row hover (imperative) | modern 345-346,352-353 | background,borderLeft (×2, set + cleared) | STATE-SELECTED (hover, imperative `.style.` writes — Finding 2) |
| expander button | modern 391 | background,color,border | STATIC |
| icon wrapper | modern 439 | color | STATIC |

**RUNTIME-DRIVEN paint**: none in counted channels. Drag-and-drop position
(`before`/`inside`/`after`) is computed from `getBoundingClientRect()` at
drag-over time, but it drives which STATIC/enum branch renders, not a
continuous value read directly into a style key — classified per-branch
above (STATE-SELECTED), same discriminator applied to Carousel's slide index.

**Keyframe**: `rottay-drop-indicator` injected via `<style
dangerouslySetInnerHTML>` directly in the JSX render tree (modern.tsx:922,
NOT appended to `document.head` like rustic's pattern below — it is a normal
React-managed DOM child, re-evaluated on every render but not re-inserted
into `<head>`). Counter-blind (string content) either way.

### Paint sites — `engines/rustic.tsx` (24)

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| search-highlight span | rustic 66-67 | backgroundColor,color | STATIC |
| `styles.dropLine` (module constant) | rustic 106 | backgroundColor | STATIC |
| `nodeStyle` (base + selected + drop-inside + focus box-shadow) | rustic 246-265 | backgroundColor,color,boxShadow,borderLeft | STATE-SELECTED (`isSelected`/`isDropTarget`/`isFocused` ternaries; `borderLeft` is a real shorthand here, see Finding 4 below) |
| tree-line connectors (×4, ancestor verticals + horizontal + self-vertical) | rustic 316-370 | borderLeft,borderTop | STATIC |
| checkbox | rustic 293 | accentColor | STATIC |
| node hover (imperative) | rustic 402-411 | backgroundColor,borderLeft (×2, set + cleared) | STATE-SELECTED (hover, imperative `.style.` writes) |

**Keyframes**: `rottay-tree-spin` and `rottay-tree-drop-line-in`
(rustic.tsx:124-131), injected via a **module-level `stylesInjected` guard**
(`injectKeyframes()`, rustic.tsx:118-134) that appends to `document.head`
exactly once across all Tree instances — the correct, dedup-guarded pattern
this program has repeatedly found MISSING elsewhere (Card's rustic root and
`compound/Image`, Badge's rustic pulse, Image's rustic pulse all inject
unguarded per-mount/per-render). **Tree's rustic engine is the first
component in this batch whose author got this right on the first
mechanism** (Timeline's was also correctly namespaced but still unguarded;
Tree's is namespaced AND guarded).

### Finding 4: rustic's `borderLeft` shorthand usage is safe, same reasoning as Callout's rustic — no personality rule reaches `rottay-tree`/`rottay-tree-node` on the rustic side

Grep-confirmed: `tokens/css/engines/rustic/theme.css` and `personality.css`
carry zero rules targeting `rottay-tree`, `rottay-tree-node`, or any
tree-specific classname on the rustic path (the modern bridge above is
modern-only — rustic's root/row carry no matching selector anywhere).
Rustic's own `nodeStyle.borderLeft` (a real shorthand, `3px solid ...`) is
therefore self-contained, same disposition as Callout's rustic
`borderLeft` — safe specifically because nothing external composes onto that
channel on this engine.

### Suppression risk summary

- **Live**: modern wrapper's bridge `color`/`padding`(uncounted)/`:hover
  background-color` — see Finding 1, the batch's most architecturally
  significant live-uncontested finding (a two-layer hover system, not a
  simple single-channel win).
- **No collision** with any shipped skin: grep-confirmed zero hits for
  `rottay-tree` in any `tokens/css/engines/*/skin/*.css` or
  `tokens/css/components/skin/*.css`.
- Checkbox styling (both engines) is real, intended, non-orphaned DaisyUI/
  inline coupling — not a suppression hazard, record only.

### Engine asymmetries, dead code, pre-existing defects (record only)

- **The two-layer hover system is the single most important structural
  finding of this component** — a migration must model it as two rules on
  two different selectors (wrapper `:hover` background + row's own
  hover-state background), not collapse it into one.
- Modern uses an imperative-JS hover workaround despite having full
  DaisyUI/Tailwind `:hover` utility-class capability available (proven by its
  own theme.css bridge existing) — an authoring-time choice, not a technical
  necessity, unlike rustic where the workaround is genuinely required.
- Rustic's keyframe injection is dedup-guarded (module-level flag) — the
  correct pattern, uncommon elsewhere in this batch; worth citing as the
  reference implementation if a future cleanup pass fixes the unguarded ones
  found in Card/Badge/Image.
- `compound/TreeNode` (0 paint sites) is very likely unconsumed by either
  root engine (same shape as every other "documented, not wired" compound
  this batch), not independently re-verified line-by-line given time budget.

## Calendar (76 sites, 2 files) — the batch's largest component; fully greenfield (zero suppression, zero collision); modern's 7 nav buttons are hand-duplicated inline objects with no shared constant; three DIFFERENT hover-workaround mechanisms now confirmed across this program (imperative-DOM here in modern, React-state here in rustic, real CSS `:hover` nowhere in Calendar)

Root landing: `engines/modern.tsx` (44), `engines/rustic.tsx` (32).
`engines/classic.tsx` not detailed. No `data-part`, no compounds. **Fully
greenfield**: grep-confirmed zero hits for `rottay-calendar`/`CALENDAR` in
either `theme.css`, in `personality.css`, or in any shipped skin file —
neither engine stamps a first-party classname on any element at all (modern:
Tailwind utilities + the consumer's own `className` on the root only;
rustic: only the consumer's own `className` on the root).

### Seventh "doc claims DaisyUI, code doesn't have it" — and the widest gap yet

Modern's own header comment states it is *"built with a CSS Grid layout,
DaisyUI button classes, and native `Date` objects"* — grep-confirmed **zero**
DaisyUI class tokens anywhere in the file (no `btn`, `btn-*`, or any other
DaisyUI component class on any of the 7 button elements; all buttons carry
either no className or pure Tailwind layout/text-size utilities). This is
the **seventh** instance of the pattern (after Pagination, Segmented,
QRCode, List, Descriptions, Kbd) and the widest: every other instance had at
least some Tailwind utility overlap suggesting a DaisyUI class was removed
later; here the buttons are 100% hand-styled via inline `style` objects with
no DaisyUI vocabulary at all, despite 7 separate buttons that are exactly
DaisyUI's `btn`/`btn-ghost`/`btn-active` use case.

### Architecture finding: modern's 7 nav-button style objects are hand-duplicated, not shared — a maintenance gap that also multiplies migration surface

Unlike every other component in this batch (and unlike Calendar's OWN
rustic engine, which factors a module-level `styles` object), **modern
Calendar writes the same 8-key style object literally by hand at every nav-
button call site**: `{ background: 'transparent', color: 'var(--ds-color-
text-primary)', height: 32, padding: '0 12px', fontSize: 13, borderRadius:
'var(--ds-radius-md)', border: 'none', cursor: 'pointer' }` appears
**verbatim, byte-for-byte, five separate times** (modern.tsx:178, 179, 202,
203, and the inactive branch of both mode-toggle buttons at 185, 194) —
no shared constant, unlike rustic's `styles.navButton`. A migration handling
this literally can either treat these as 5+ independent sites (matching the
counter) or recognize they are one design decision repeated by hand — worth
a team call on whether the skin should factor them into one rule from the
start (they are already visually identical) even though the source never
did.

### Paint sites — `engines/modern.tsx` (44)

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| nav buttons ×5 (prevYear, prevMonth, nextMonth, nextYear, + duplicated per-site, see above) | modern 178,179,202,203 | background,color,border | STATIC (identical literal, repeated) |
| mode-toggle buttons ×2 (month/year), active vs inactive branch | modern 182-196 | background,color,border | STATE-SELECTED (`mode === 'month'`/`'year'` ternary) |
| day-of-week header labels | modern 212 | color | STATIC |
| day cell: selected + today-ring | modern 242-247 | background,color,borderColor | STATE-SELECTED (`isSelected`/`isToday` ternaries) |
| day cell hover (imperative) | modern 248-256 | background (×2, set + cleared) | STATE-SELECTED (hover, imperative `.style.` writes — same mechanism as Tree's row hover) |
| month cell (year view): selected + current-month ring | modern 287-291 | background,color,borderColor | STATE-SELECTED |
| month cell hover (imperative) | modern 293-301 | background (×2, set + cleared) | STATE-SELECTED (hover, imperative `.style.` writes) |
| root container | modern 172 | background | STATIC |

**RUNTIME-DRIVEN paint**: none. `viewYear`/`viewMonth`/`today`/`currentDate`
are all `Date` values that drive WHICH conditional branch renders (a finite
enum of selected/today/disabled/hovered states per cell), never a
continuously-read live value inside a style key — same discriminator applied
to every other calendar-shaped component this program has seen (Timeline's
item colors, Carousel's slide index).

### Paint sites — `engines/rustic.tsx` (32)

All channeled through the module-level `styles` object (lines 39-148) —
`container`/`navButton`/`modeButton`/`modeButtonActive`/`dayHeader`/
`dayCell`/`dayCellToday`/`dayCellSelected`/`dayCellDisabled`/`monthCell`/
`monthCellCurrent`/`monthCellSelected`, each spread conditionally per
element.

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| `styles.container`/`navButton`/`modeButton` (+ Active variant) base constants | rustic 40-84 | backgroundColor,boxShadow,border,color | STATIC (base) / STATE-SELECTED (`modeButtonActive` spread on `mode` match) |
| `styles.dayCell`/`dayCellToday`/`dayCellSelected` | rustic 103-122 | backgroundColor,border,color | STATE-SELECTED (`isToday`/`isSelected` spreads) |
| `styles.monthCell`/`monthCellCurrent`/`monthCellSelected` | rustic 132-147 | backgroundColor,border,color | STATE-SELECTED |
| nav-button hover spread (×4 call sites) | rustic 294,304,333,343 | backgroundColor | STATE-SELECTED (`hovered === '<id>'` string-match against React state, not imperative DOM writes — see below) |
| day/month cell hover spread | rustic 389,426 | backgroundColor | STATE-SELECTED (same `hovered` state-string mechanism) |

### A third, distinct hover-workaround mechanism — worth cataloguing alongside Tree's

Rustic Calendar's own header comment states hover is *"tracked in React
state because inline styles cannot express `:hover`"* — a single `hovered:
string | null` state variable, compared per-element via
`hovered === cellKey` and spread into the style object on match
(`onMouseEnter={() => setHovered(cellKey)}` / `onMouseLeave={() =>
setHovered(null)}`). This is a **third distinct mechanism** for the same
underlying problem this program has now catalogued: (1) **imperative DOM
mutation** — `el.style.background = '...'` directly on the event target,
used by Tree's rustic AND, notably, Tree's and Calendar's own **modern**
engines (Finding 2 in the Tree section); (2) **React state + conditional
spread** — a `hovered` variable re-renders the whole affected element with a
different style object, used here by Calendar's rustic engine; (3) real CSS
`:hover` pseudo-classes — used nowhere in Calendar (available to modern via
DaisyUI/Tailwind but not used, matching the imperative choice Tree's modern
also made). A migration must pick ONE mechanism per component (a `:hover`
CSS rule replaces both (1) and (2) equally well since the resulting paint is
identical), but should record that today's codebase has three different
authors' solutions to the identical problem, not one worth preserving as
"the" pattern.

### Suppression risk / DaisyUI coupling / collision

None on any axis — confirmed greenfield across the board (see the italic
finding at the top of this section). This is the only component in the
batch so far with zero live suppression, zero orphaned personality hooks,
and zero shipped-skin collision risk simultaneously.

### Engine asymmetries, dead code, pre-existing defects (record only)

- Modern's 5 identical nav-button objects, hand-duplicated rather than
  factored — the widest raw duplication found in this batch; rustic's own
  `styles` module-level object shows the author knew the factored pattern,
  just didn't apply it symmetrically across engines.
- Modern's header comment claims DaisyUI usage that is 100% absent — the
  widest gap of the "doc claims DaisyUI" pattern (7 buttons, zero DaisyUI
  classes, vs. partial-utility overlap in every prior instance).
- Three distinct hover-workaround mechanisms exist in this program
  (imperative DOM / React state / real CSS `:hover`) — Calendar and Tree
  between them demonstrate all three; useful as a single reference point
  for whoever writes the migration kit's hover-handling guidance.

## Box (18 sites, 2 files) — the layout family's first component, and an architecturally different shape from everything in the display family: most of its "paint sites" are not migration candidates at all

Root landing: `engines/modern.tsx` (9), `engines/rustic.tsx` (9).
`compound/index.ts` exports nothing (empty barrel, not even a placeholder
comment — grep-confirmed no compound component exists). No `data-part`.
Fully greenfield: zero hits for `rottay-box` anywhere in `theme.css` (either
engine), `personality.css`, or any shipped skin file.

### Box is a style-prop pass-through primitive, not a styled component — this changes what "migration" even means for it

Every counted site in both engines is produced by `buildBoxStyles()`, a pure
function that reads ~40 `BoxProps` fields and conditionally assigns each into
`style.*` **only if the caller supplied that prop**
(`if (props.X !== undefined) style.Y = props.X`). Two genuinely different
shapes exist among the counted channels:

1. **Enum-constrained lookup channels** — `borderRadius`/`rounded` →
   `RADIUS_MAP[radiusValue]` and `shadow` → `SHADOW_MAP[props.shadow]`. Both
   read a bounded `BoxBorderRadius`/`BoxShadow` union type and resolve to a
   `var(--ds-radius-*)`/`var(--ds-shadow-*)` token reference — the same
   finite-lookup shape as every STATE-SELECTED finding elsewhere in this
   report (`VARIANT_STYLES`-style maps). These are the only two channels
   where a `data-radius`/`data-shadow` attribute + skin rule is even
   structurally possible.
2. **Unbounded caller pass-through** — `background`/`backgroundColor`/
   `border`/`borderWidth`/`borderColor`/`borderStyle`/`transform`/`color`.
   Each reads a raw, **unconstrained** prop value (typed as an open string/
   CSS-value union, not an enum) straight into the matching style key with
   no lookup table at all. Per the WO-06 discriminator's literal test ("ask
   WHERE the runtime identifier lands") and this report's own Avatar
   precedent (`ringColor`, classified STATE-SELECTED because it is "a
   caller-supplied static prop value read once, not live/continuous data"),
   these channels are technically STATE-SELECTED rather than RUNTIME — but
   unlike every other STATE-SELECTED finding in this report, **there is no
   finite set of values to enumerate into a `data-*` attribute**. A caller
   can pass `borderColor="#ff00aa"`, `borderColor="rgb(12,34,56)"`,
   `borderColor="var(--any-token)"`, or any other valid CSS color — an
   infinite domain. **This paint is structurally not migratable into a skin
   rule at all, regardless of classification label.** Box's entire reason
   for existing as a primitive is to be the arbitrary style-injection escape
   hatch every other component's own `style` prop pass-through ultimately
   funnels through — treating these 8 channels as migration debt the way
   Card's loading skeleton was would be a category error. They must stay
   inline permanently.

### Paint sites — `engines/modern.tsx` (9) / `engines/rustic.tsx` (9) — identical shape in both engines

| Part | File:Lines (modern / rustic) | Channels | Class |
|---|---|---|---|
| `style.borderRadius` | modern 62 / rustic 138-141 | borderRadius | STATE-SELECTED (finite `RADIUS_MAP` lookup — the one channel here that IS migratable in principle) |
| `style.boxShadow` | modern 65 / rustic 144-146 | boxShadow | STATE-SELECTED (finite `SHADOW_MAP` lookup — likewise migratable in principle) |
| `style.background` | modern 94-97 / rustic 114-117 | background | STATE-SELECTED-per-discriminator / unbounded pass-through, not migratable |
| `style.backgroundColor` | modern 98-101 / rustic 118-121 | backgroundColor | same |
| `style.border` | modern 104-106 / rustic 124-126 | border | same |
| `style.borderWidth` | modern 107-109 / rustic 127-129 | borderWidth | same |
| `style.borderColor` | modern 110-112 / rustic 130-132 | borderColor | same |
| `style.borderStyle` | modern 113-115 / rustic 133-135 | borderStyle | same |
| `style.transform` | modern 138-140 / rustic 187-189 | transform | same |
| `style.color` | modern 186-188 / rustic 235-237 | color | same |

(9 counted sites per engine — the table lists 10 rows because the counter
groups by distinct style KEY, and `borderRadius`/`boxShadow` share one
conceptual "resolved via lookup map" story but count as 2 separate keys;
exact per-key tally matches the counter's 9+9, consistent with this
report's established convention of grouping by rendered part rather than
reproducing the counter's raw key list 1:1.)

Both engines are **structurally identical** in this function — the only
difference between `buildBoxStyles` in modern vs. rustic is that modern
additionally produces `buildTailwindClasses()` for `display`/`position`/
`overflow*` (Tailwind utility classes, not inline paint, uncounted), while
rustic inlines `display`/`position`/`overflow*` as style keys too (also
uncounted — none of those are paint channels).

**RUNTIME-DRIVEN paint**: none in the classic sense (no `getBoundingClientRect`
or continuous measurement) — see the caller-pass-through discussion above for
why this component's shape doesn't fit cleanly into any of the three
categories as cleanly as the display family did.

**Keyframes**: none directly, but both engines conditionally render a
`<style dangerouslySetInnerHTML>` block for **responsive prop breakpoints**
(`generateResponsiveCSS()`, from `../../shared/responsive-props` — a shared
helper likely used by Flex/Grid/Stack too, not re-inventoried here since
it's outside Box's own file). Counter-blind (string content) and outside
this component's own paint surface — flagged for whoever inventories
whichever layout primitive owns that helper's definition, same disposition
as Card's `mergePersonalityStyle` finding.

### Suppression risk / DaisyUI coupling / collision

None. Fully greenfield: zero `rottay-box` references anywhere in
`theme.css`, `personality.css`, or any shipped skin. No DaisyUI classes in
either engine (modern's own header comment correctly says "Tailwind CSS
classes," never claims DaisyUI — the first component in this batch whose
doc comment does NOT overclaim).

### Engine asymmetries, dead code, pre-existing defects (record only)

- **The central finding for Box is architectural, not a paint hazard**:
  8 of its 9-per-engine channels are unbounded caller pass-through and
  cannot be migrated into a skin rule at all; only `borderRadius`/`boxShadow`
  are theoretically candidates, and even those exist specifically so a
  caller CAN override them per-instance — migrating them into a skin
  would need to preserve that override capability (the `props.style`
  final-merge, `Object.assign(style, props.style)`, already sits after
  everything and would still win regardless of what happens to the
  enum-lookup portion).
- `compound/index.ts` is a genuinely empty barrel (no placeholder comment
  even) — Box has no compound family at all, the simplest compound story of
  any component in this batch.
- Both engines are near-duplicate implementations of the identical function
  — a maintenance observation, not a migration concern.

## Layout (20 sites, 2 files) — zero anatomy in either engine: no component in this batch carries fewer classnames

Root landing: `engines/modern.tsx` (8), `engines/rustic.tsx` (12). Five
exported shapes per engine (`Layout`/`Header`/`Sider`/`Content`/`Footer`,
all in one file per engine — same "no compound folder" shape as List/
Timeline/Statistic). `engines/classic.tsx` not detailed. **No `data-part`,
and no first-party classname on ANY of the five exports in either engine** —
every element's `className` is `className={className}` (rustic) or
`` `<tailwind-utilities> ${className}` `` (modern), the consumer's own value
only, never a `rottay-layout*` token. Grep-confirmed: zero hits for
`rottay-layout` anywhere in `theme.css` (either engine), `personality.css`,
or any shipped skin file — not suppressed, not orphaned, simply **not
addressable by any external selector today**, the widest "zero anatomy"
finding of any component in this batch (wider than Typography's modern
exports, which at least share this shape with Layout but where rustic
compensates with real classnames — here NEITHER engine has any).

### Paint sites — `engines/modern.tsx` (8)

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| Header | modern 87 | background | STATIC |
| Sider | modern 144-148 | background,color | STATE-SELECTED (`theme === 'dark'` ternary; `color` only set AT ALL in the dark branch — light theme leaves color to inherit, an asymmetric branch shape) |
| Sider collapse-trigger button | modern 154 | background,color,border | STATIC |
| Footer | modern 195 | background | STATIC |

**RUNTIME-DRIVEN paint**: none. `Content` sets no paint at all (layout-only:
`flex-1 p-4 overflow-auto`). `Layout` root sets no paint at all (`flex
flex-col min-h-screen`, plus the consumer's own `style` pass-through).

### Paint sites — `engines/rustic.tsx` (12)

All channeled through the module-level `styles` object (lines 61-119) —
`header`/`sider`/`siderLight`/`content`/`footer`/`trigger`, each a `const`
merged conditionally into the rendered element's `style` prop.

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| `styles.header` | rustic 74-75 | backgroundColor,color | STATIC |
| `styles.sider` | rustic 83-84 | backgroundColor,color | STATIC (dark, the default) |
| `styles.siderLight` | rustic 91-93 | backgroundColor,color,borderRight | STATE-SELECTED (`theme === 'light'` spread over the dark base — unlike modern, rustic's light branch DOES set an explicit color, no inherit-gap) |
| `styles.content` | rustic 100 | backgroundColor | STATIC |
| `styles.footer` | rustic 104 | backgroundColor | STATIC |
| `styles.trigger` | rustic 114-115 | background,color | STATIC (`color: 'inherit'` — an explicit inherit, not an omission) |

**RUNTIME-DRIVEN paint**: none. **Keyframes**: none — the Sider collapse
animation is a plain CSS `transition: width 0.3s` (not a paint channel,
uncounted) in both engines, no `@keyframes` injection anywhere.

### Cross-engine asymmetry worth flagging: modern's dark Sider omits `color`, rustic's doesn't

Modern's Sider only assigns `color` inside the `theme === 'dark'` branch
(`...(theme === 'dark' ? { color: 'var(--ds-color-text-primary)' } : {})`)
— the light branch (the engine's own default, `theme = 'light'`) sets no
`color` at all, relying on inheritance. Rustic's Sider, by contrast, sets an
explicit `color` in BOTH its base (`styles.sider`, dark-default) and light-
override (`styles.siderLight`) objects — no inherit-gap on either branch.
Not a suppression risk (nothing external targets either), but a genuine
cross-engine behavioral asymmetry: modern's light-theme Sider text color is
whatever the ambient inherited color happens to be; rustic's is always an
explicit token. Record for the team, not resolved here.

### Suppression risk / DaisyUI coupling / collision

None on any axis. No DaisyUI classes in either engine (both use pure
Tailwind utilities or pure inline styles, no DaisyUI component class
tokens). Fully greenfield, same disposition as Calendar and Box.

### Engine asymmetries, dead code, pre-existing defects (record only)

- Zero classnames on any element in either engine — a migration will need
  to introduce anatomy (scope classes, `data-part`) from nothing, the same
  starting point Card/Badge/Avatar had before their respective prior work,
  but wider here since even rustic (usually the engine with real BEM
  classnames elsewhere in this batch) has none.
- Modern's light-theme Sider has an inherited (not explicit) text color;
  rustic's does not — a pre-existing cross-engine asymmetry, not caused by
  this inventory.
- No compound folder for Layout at all — same "sub-components live beside
  the root in the same engine file" shape as List/Timeline/Statistic, not a
  gap finding.

## Collapse (17 sites, 2 files) — the batch's most granular token vocabulary (5-level BEM-ish `--ds-collapse-{part}-{variant}-{state}-{property}`); a live bridge rule exists but every uncontested channel is currently invisible, not a defect; rustic's root carries NO scope class at all, unlike modern's

Root landing: `engines/modern.tsx` (10), `engines/rustic.tsx` (7). Two
exported shapes per engine (`Collapse`/`Panel`, same file, React Context for
shared accordion state — no `compound/` folder). `engines/classic.tsx` not
detailed.

### Token architecture note: the most granular vocabulary in this batch

Modern's Panel resolves every channel through a 5-segment token name —
`--ds-collapse-{header|content|root}-{default|ghost}-{idle|expanded|
disabled}-{property}` (e.g. `--ds-collapse-header-default-expanded-color`,
`--ds-collapse-content-ghost-idle-bg`) — every one with a literal fallback.
This is qualitatively more granular than any other component's inline token
usage in this report (Card/Badge/Avatar's `VARIANT_STYLES`-style maps are
2-3 segments at most). Worth citing as the reference shape if a future
token-naming standardization pass needs one.

### Anatomy asymmetry: modern's root is a real scope class, rustic's root has none

Modern's `Collapse` root stamps `rottay-collapse` +
`rottay-collapse--ghost`/`--borderless` modifiers (modern.tsx:276); its
Panel/content-track/content-inner/arrow all carry real classnames too
(`rottay-collapse-arrow`, `rottay-collapse-content`,
`rottay-collapse-content-inner`, all unconditional). **Rustic's `Collapse`
root has no first-party classname at all** — `className={className}`,
consumer-only, same zero-anatomy shape as Layout's rustic root. Rustic's
Panel DOES carry two real classnames (`rottay-collapse-arrow` — **verbatim
identical to modern's**, and `rottay-collapse-content-track`, rustic-only,
different from modern's `rottay-collapse-content`). The shared
`rottay-collapse-arrow` name is safe today only because nothing selects it
unscoped (grep-confirmed: zero rules target it in either `theme.css` or
`personality.css`) — a future migration giving either engine its own arrow
skin rule must scope through an engine-specific ancestor, per the standing
shared-vocabulary law, and rustic will need a NEW root scope class to do
that (it currently has none to anchor to).

### Suppression risk: a real, live bridge rule — but every uncontested channel is currently INVISIBLE, not a defect

`tokens/css/engines/modern/theme.css:654-671`, `/* Bridge: .rottay-collapse
(modern engine) */`:
```
[data-tenant] .rottay-collapse { border-color; border-radius; }
[data-tenant] .rottay-collapse .rottay-collapse-content { background-color; color; }
[data-tenant] .rottay-collapse--ghost { background-color: transparent; }
[data-tenant] .rottay-collapse--borderless { border: none; }
```
All four rules are **uncontested** (the root's own inline style sets only
`display`/`flexDirection`/`gap`; the content-track's own inline style sets
only `gridTemplateRows`) — but tracing each through to a visible pixel shows
none currently paints anything:
1. `border-color`/`border-radius` on the root: the root never sets a
   `border-style` anywhere (browser default `none`), so a color with no
   style to color renders invisibly; `border-radius` alone has nothing to
   clip (the root has no background and no `overflow:hidden`) — dormant,
   not visible.
2. `background-color`/`color` on `.rottay-collapse-content` (the grid-row
   TRACK div, not its inner child): the track has `overflow` clipping via
   the injected `.rottay-collapse-content-inner{overflow:hidden}` rule and
   CSS Grid's own 0fr-track-has-zero-height behavior — there is no visible
   track-level area distinct from its child's own (correctly inline)
   background/color in either collapsed or expanded state.
3. `background-color: transparent` on `--ghost`: idempotent with the
   browser default (no background set anywhere on root) — visually
   identical to not having the rule at all.
4. `border: none` on `--borderless`: same idempotent-with-default shape.

**Worth recording as a methodology note for the team**: "uncontested" and
"consequential" are not the same thing — this component is the batch's
clearest example of a live bridge rule with zero actual behavioral stake,
in contrast to Avatar's uncontested 40×40 clip (real defect) or Timeline/
Callout's uncontested wins (real, visible paint). A migration should not
assume every uncontested channel found by grep is a hazard without tracing
it to an actual rendered pixel, but also should not silently drop these
four declarations without confirming the trace — the reasoning above is
this inventory's, not verified in a live browser.

### Paint sites — `engines/modern.tsx` (10)

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| arrow | modern 101 | transform | STATE-SELECTED (`isActive` ternary) |
| Panel root | modern 114-127 | borderRadius,border,background,boxShadow | STATE-SELECTED (`context.ghost`/`context.bordered` branches) |
| header row | modern 151-162 | color,background | STATE-SELECTED (`disabled`/`isActive`/`context.ghost` branches, 3-way) |
| content track | modern 180 | (gridTemplateRows — not a paint channel) | n/a |
| content inner | modern 186-190 | opacity(not counted),color,background | STATE-SELECTED (`isActive` for opacity — uncounted; `context.ghost` for background) |

**RUNTIME-DRIVEN paint**: none. **Keyframes**: none (`@keyframes` proper) —
but `COLLAPSE_STYLES` (modern.tsx:38-43) is a static CSS-text block injected
via `<style dangerouslySetInnerHTML>` **unconditionally on every Collapse
render, with no module-level dedup guard** — N mounted Collapse instances
each inject their own identical copy of the `.rottay-collapse-content`/
`-content-inner`/`-arrow` transition rules. Harmless (identical rules don't
conflict), but the same "no dedup guard" shape found in Card's rustic root/
`compound/Image`, Badge's rustic pulse, and Image's rustic pulse — except
here it's on the MODERN engine, and it's transition/reduced-motion CSS
rather than a `@keyframes` block. Counter-blind either way (string content).

### Paint sites — `engines/rustic.tsx` (7)

All channeled through the module-level `styles` object (lines 32-103).

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| `styles.panel`/`panelGhost`/`panelDisabled` | rustic 38-49 | border,borderRadius,backgroundColor | STATE-SELECTED (`context.ghost`/`disabled` spreads) |
| `styles.header` | rustic 56 | backgroundColor | STATIC |
| arrow (`styles.arrow`/`arrowActive`) | rustic 65-68 | transform | STATE-SELECTED (`isActive`) |
| `styles.contentInner` | rustic 94 | backgroundColor | STATIC |

**RUNTIME-DRIVEN paint**: none. **Keyframes**: none proper —
`RUSTIC_REDUCED_MOTION_STYLES` (rustic.tsx:111-113) is the same shape as
modern's `COLLAPSE_STYLES` (a `@media (prefers-reduced-motion)` override
injected unconditionally, unguarded, on every render) but scoped to only
two class hooks (`.rottay-collapse-content-track`, `.rottay-collapse-arrow`)
since rustic's actual transitions live in the inline `styles.contentTrack`/
`contentInner` objects rather than a static class block — a narrower
injection than modern's for the same underlying need.

### Suppression risk / DaisyUI coupling / collision (summary)

- The one live bridge (Finding above) is uncontested but currently inert on
  every channel — record, do not treat as equivalent to Avatar's/Timeline's
  live-and-visible findings.
- No DaisyUI classes in either engine (modern's own header comment states
  "No DaisyUI classes" explicitly, confirmed true).
- No shipped-skin collision: grep-confirmed zero hits for any
  `rottay-collapse*` name in `tokens/css/engines/*/skin/*.css` or
  `tokens/css/components/skin/*.css`.

### Engine asymmetries, dead code, pre-existing defects (record only)

- Rustic's root has zero anatomy (no scope class) while modern's does — a
  migration will need to add one to rustic before it can have its own skin,
  same shape as several rustic-side gaps in the display family being
  inverted here (modern usually had MORE first-party classes than rustic
  elsewhere in this batch; here it's the reverse).
- `rottay-collapse-arrow` is a verbatim-shared classname between engines —
  safe today (nothing selects it), but a reminder the shared-vocabulary law
  applies here too once either engine gets a skin.
- Both engines inject their transition/reduced-motion CSS unguarded on every
  render — harmless duplication, consistent with the broader "no dedup
  guard" pattern found repeatedly in Card/Badge/Image, here appearing on
  modern for the first time rather than only rustic.

## Divider (8 sites, 2 files) — a suspected extra root border was checked live and REFUTED: Tailwind's own preflight zeroes the bridge's border-width before it ever paints (see below — this also surfaced a much bigger, program-wide finding, reported separately)

Root landing: `engines/modern.tsx` (3), `engines/rustic.tsx` (5).
`compound/index.ts` is an explicit, self-documented placeholder (`Divider.Text`/
`Divider.Icon` are named as *potential future* additions, same honest-empty
shape as Empty's compound folder — not a "documented, never wired" gap).
No `data-part`. **Both engines stamp the bare classname `divider` on the
root** — modern via DaisyUI's own class (`divider divider-horizontal|
-vertical [divider-start|-end]`), rustic via its own BEM system (`divider
divider--horizontal divider--<variant> [divider--with-text] [divider--ds-
text-<pos>]`) — the SAME first word, different vocabularies layered onto it.

### CHECKED LIVE, REFUTED: no extra border renders on the with-text divider — Tailwind's own preflight zeroes the bridge's border-width before it ever reaches the component

`tokens/css/engines/modern/theme.css` carries a second-emitter pair for
`.divider` (lines 340-352 early / 876-894 late, the same shape as
FloatButton's `.btn`/Avatar's `.avatar`), and the late block's
`.divider-horizontal { border-top: var(--ds-divider-width) solid
var(--ds-divider-color); }` / `.divider-vertical { border-left: ...; }`
target exactly the classnames `getClassNames()` stamps on the with-text
root, which carries no inline border of its own (the visible segments are
drawn by two child `<span>`s instead). Static reading flagged this as a
live, uncontested hazard — **measured in a real browser (production build,
CDP `CSS.getMatchedStylesForNode`, a plain-divider control to prove the
harness itself was sound) and refuted**: the root's computed
`border-top-width` (horizontal) / `border-left-width` (vertical) is `0px`,
both orientations. `tokens/css/entrypoints/styles.css:19` declares `@layer
rottay-reset, rottay-tokens, rottay-components, rottay-engines,
rottay-tenants, rottay-personality, rottay-responsive;` — theme.css's
bridge rules live in `rottay-engines`. Tailwind's own preflight
(`*, ::backdrop, ::after, ::before { border: 0 solid; margin: 0; padding: 0
}`) is declared in a SEPARATE, LATER `@layer` statement inside the DS's own
compiled bundle (confirmed directly in `dist/bithire.css`/`dist/platform.css`:
`@layer theme, base, components, utilities;` at a later line than the
rottay declaration) — per the cascade-layer spec, a layer named later sorts
after layers already positioned, so Tailwind's `base` (where preflight
lives) outranks EVERY `rottay-*` layer, including `rottay-engines`,
**by layer order alone, independent of specificity**. The bridge rule
matches, and is completely real — it simply never wins. This is the exact
same "unlayered beats layered" law this whole program is built on, just
running one level up: Tailwind's own preflight is what plays the unlayered
role here, and `rottay-engines` is what loses. **No line renders beyond the
two intended text-flanking segments, on either orientation. There is
nothing for a migration to preserve on this channel.**

Rustic is unaffected for an unrelated, independent reason (its root never
carries the single-dash `divider-horizontal`/`divider-vertical` classnames
the bridge targets — only the double-dash BEM `divider--horizontal`).

### `personality.css` targets the shared bare word too, and is subject to the identical fate

`personality.css:105-115` ("DIVIDER PERSONALITY"): `.ant-divider, .divider,
[data-engine] .ds-divider { border-style: var(--ds-divider-style);
border-color: var(--ds-divider-color); }` — `personality.css` sits in
`rottay-personality`, one of the same seven layers, so its `border-style`
declaration is subject to the identical preflight-wins mechanism (preflight
forces `border-style: solid` regardless). Its `border-color` declaration,
however, is a different story — see the cross-component finding below: this
program's live measurement of a DIFFERENT component (Alert) shows
`border-color` specifically survives the preflight layer fight (preflight's
reset does not touch it), it is only `border-width`/`border-style` that
preflight wins on. For Divider this is moot either way (nothing supplies a
surviving width on the with-text root in either engine), but it is the
general shape worth carrying into any future channel-safety judgment call.

### Paint sites — `engines/modern.tsx` (3)

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| line style (before/after spans, with-text; or merged root, simple) | modern 101-107 | borderTop,borderLeft | STATE-SELECTED (`isHorizontal` selects which of the two is `'none'` vs. real) |
| text | modern 131 | color | STATE-SELECTED (`plain` ternary: `'inherit'` vs. token) |

### Paint sites — `engines/rustic.tsx` (5)

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| line style (before/after spans, with-text; or merged root, simple) | rustic 110-113 | borderTop,borderLeft,borderRight(none),borderBottom(none) | STATE-SELECTED (`isHorizontal`; the explicit `none` pair prevents style bleeding onto the other two sides — a defensive detail worth preserving) |
| text | rustic 138 | color | STATE-SELECTED (`plain` ternary) |

**RUNTIME-DRIVEN paint**: none in either engine. No keyframes.

### DaisyUI coupling

Real (modern only): `divider`, `divider-horizontal`/`-vertical`,
`divider-start`/`-end` are genuine DaisyUI divider classes, consistent with
the file's own header comment. This is also precisely what creates the
STOP-AND-REPORT hazard above — the DaisyUI convention is the mechanism, not
an accident.

### Engine asymmetries, dead code, pre-existing defects (record only)

- The with-text double-border suspicion was checked live and refuted (see
  above) — no fix, no migration hazard on this channel.
- Both engines' `lineStyle` defensively sets the unused border sides to
  `'none'`/explicit-none — rustic explicit, modern implicit (via `'none'`
  string literal on the unused axis) — worth preserving exactly, it prevents
  a caller's ambient CSS from leaking a border onto the wrong side.
- `compound/index.ts` is an honest empty placeholder, same disposition as
  Empty's — not a gap.

## Splitter (3 sites, 2 files) — smallest component in the entire inventory; fully greenfield; modern's gutter never highlights on hover despite carrying a `transition-colors` class, unlike rustic's

Root landing: `engines/modern.tsx` (1), `engines/rustic.tsx` (2). Two
exported shapes per engine (`Splitter`/`Panel`, same file, no `compound/`
folder). No `data-part`. **Zero first-party classnames on any element in
either engine** — Splitter's root, Panel, and gutter divs all carry only
the consumer's own `className` (rustic) or Tailwind utility classes plus
the consumer's `className` (modern), same "zero anatomy" shape as Layout.
Grep-confirmed fully greenfield: zero hits for `splitter` anywhere in
`theme.css` (either engine), `personality.css`, or any shipped skin file.

### Paint sites — `engines/modern.tsx` (1)

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| gutter drag handle | modern 195 | background | STATIC |

Modern's gutter carries a Tailwind `transition-colors` class (modern.tsx:192)
but has **no hover-state background change at all** — the class implies a
color transition exists, but nothing ever changes the color to transition
to; the gutter is always `var(--ds-surface-panel)` regardless of hover.
`onMouseDown` is wired (for drag) but no `onMouseEnter`/`onMouseLeave`
exists on modern's gutter. **RUNTIME-DRIVEN paint outside counted
channels**: none in a style key — the actual drag resize math
(`getBoundingClientRect`-based percentage calculation) drives `sizes` state
that feeds `flex: 0 0 {size}%` on the Panels, not a paint channel.

### Paint sites — `engines/rustic.tsx` (2)

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| `styles.gutter` (base) | rustic 72 | backgroundColor | STATIC |
| `styles.gutterHover` | rustic 84 | backgroundColor | STATE-SELECTED (`hoveredGutter === index`, React-state hover mechanism — the same mechanism Calendar's rustic engine uses, a fourth confirmed instance of that pattern in this program alongside Tree's/Calendar's imperative-DOM and Calendar's own React-state variants) |

Rustic's gutter DOES highlight on hover (transitions from neutral gray to
primary blue via `hoveredGutter` state + `onMouseEnter`/`onMouseLeave`,
rustic.tsx:245-246) — a genuine, live cross-engine behavioral asymmetry:
**rustic's drag handle gives hover feedback, modern's does not**, despite
modern's own class list suggesting it should. Worth a team decision on
whether this is an intentional simplification or a dropped feature in
modern; not resolved here.

### Suppression risk / DaisyUI coupling / collision

None on any axis — fully greenfield, same disposition as Calendar, Box, and
Layout. No DaisyUI classes in either engine.

### Engine asymmetries, dead code, pre-existing defects (record only)

- **Modern's gutter hover-highlight is missing** despite carrying a
  `transition-colors` class that implies one exists — the priority finding
  for this component, small in scope but a genuine behavioral gap.
- Zero anatomy in either engine, same shape as Layout — a migration
  introduces `data-part`/scope classes from nothing here too.
- Both engines' drag-resize math (percentage calculation, clamping,
  redistribution between adjacent panels) is duplicated near-verbatim
  between engines — a maintenance observation, not a paint concern.

## Classname collisions with already-shipped skins (item 5 — decides the contract)

Of the 23 components in this inventory, only **three** have any pre-existing
skin footprint at all (checked against every file under
`tokens/css/engines/{modern,rustic}/skin/*.css` and
`tokens/css/components/skin/*.css`):

1. **Card** — root chrome already migrated under WO-ARC-07
   (`engines/{modern,rustic}/skin/card.css`), predating this inventory. No
   collision: this batch's 48 counted sites are entirely the unmigrated
   remainder (header/footer/image/loading), and the shipped skin's own scope
   (`.ds-card.ds-card--modern[data-part='root']` / `rottay-card
   rottay-card--rustic`) is untouched here. A real NAMING trap exists
   (rustic's `tokens/css/engines/rustic/theme.css:495-511` bare `.ds-card`
   targets MODERN's root despite living in the "rustic" file) but it is not
   a skin collision.
2. **Badge** — a narrow, existing `transform`-only skin
   (`engines/{modern,rustic}/skin/badge.css`, from a prior `P-43` follow-up).
   No collision: covers one channel only, the other 33 counted sites are the
   unmigrated remainder.
3. **Typography (rustic engine's `Link` export)** — stamps the bare
   classname `rottay-link`, which is **already RESERVED** by navigation's
   shipped Link skin (`WO-SKIN-04`, `engines/{modern,rustic}/skin/link.css`).
   Both files explicitly document why their own scope is `rottay-link-shell`
   rather than bare `rottay-link`: *"`rottay-link` is already stamped by
   display/Typography's rustic engine."* **No live collision exists today**
   (navigation's skin requires the `-shell` suffix, which Typography's Link
   does not carry) but `rottay-link` is **banned** as a future scope-class
   choice for Typography's own migration — reusing it would not collide
   with navigation's existing rule but would violate the same shared-
   vocabulary law that made navigation choose `-shell` in the first place.

**A fourth, DaisyUI-mediated near-collision, confirmed by reading Alert's
shipped skin directly**: Callout (this batch) and Alert (`WO-SKIN-03`,
shipped) both render the bare DaisyUI `alert` class, and both are reached by
the SAME layered `personality.css` rule (`.ant-alert, .alert, .rottay-alert,
[data-engine] .ds-alert` — the "ALERT PERSONALITY" block, border-left accent
+ transition). Reading `engines/modern/skin/alert.css` directly confirms
Alert's own migration deliberately avoided the bare `rottay-alert` scope for
exactly this reason (*"`.rottay-alert` is already claimed by the ALERT
PERSONALITY rule... anchoring on it would activate that rule's paint"*) and
used `rottay-alert-shell` instead. **Callout carries ZERO first-party
classname today** (`className={\`alert ${className}\`}`, grep-confirmed) —
it will need a brand-new scope class for its own future skin, and that name
**must not be `rottay-alert` or `rottay-alert-shell`** (Alert's, already
taken) — a fresh name such as `rottay-callout-shell`, grep-verified free
(it is, today), following the identical precedent Alert already set.
**This is the fourth instance of the shared-DaisyUI-class collision shape**
this program has found (after overlay/Modal-vs-feedback/Modal in checkpoint
P, and now Alert-vs-Callout here) — DaisyUI structural classes are a
recurring collision surface precisely because personality.css hooks them
globally by bare name.

**No other component in this batch** (Avatar, Tag, Image, Tooltip, QRCode,
List, Timeline, Carousel, Statistic, Descriptions, Kbd, Empty, Tree,
Calendar, Box, Layout, Collapse, Divider, Splitter) has any classname —
first-party or DaisyUI — that matches a rule in any shipped skin file.
Timeline's `.timeline`/`.timeline-start/-middle/-end`, Carousel's
`.carousel`/`.carousel-item`, Statistic's `.stat-title`/`.stat-value`, and
Tree's `.checkbox` are all real, live DaisyUI classes reached by rules in
`theme.css`/`personality.css` (see each component's own section), but
grep-confirmed absent from every shipped skin file — no cross-component
collision risk from any of them today.

## Summary (23 components)

- Card: 48 sites / 6 files — root chrome already migrated (WO-ARC-07); this
  batch is entirely the unmigrated remainder (header/footer/image/loading);
  a rustic-file-housed bare `.ds-card` legacy rule actually targets modern's
  root, a naming trap not a live hazard.
- Badge: 33 sites / 2 files — a narrow, existing `transform`-only skin;
  every other channel (background/color/border/boxShadow) still fully
  inline; personality.css's badge hook is fully orphaned (targets classic/
  DaisyUI naming this component never uses).
- Avatar: 38 sites / 4 files — **the batch's headline live defect**: a
  hardcoded, uncontested `40x40px` `.avatar` rule in `theme.css` clips every
  modern-engine Avatar rendered at `size="lg"` or larger, and haloes every
  `xs`/`sm` Avatar with a visible light-blue tint — live, user-visible,
  independent of any migration.
- Tag: 35 sites / 2 files — clean greenfield, no compounds, no DaisyUI, no
  suppression; the only genuinely "nothing to report" component alongside
  List, Kbd, and the fully-greenfield layout trio.
- Image: 35 sites / 4 files — anatomy pre-step already landed
  (`partAttributes('root', interaction)`, same mechanism as Card/Button), no
  skin file exists yet; a rustic-only full-screen zoom dialog has no modern
  equivalent (feature asymmetry, not a paint gap).
- Tooltip: 34 sites / 3 files — modern's bubble is portaled to
  `document.body` with **zero classname of any kind**, the checkpoint-P
  portal-scoping trap surfacing inside `display/`; needs a standalone,
  grep-verified scope class stamped directly on the portaled node, the same
  treatment WO-SKIN-02 gave Select's dropdown.
- QRCode: 33 sites / 2 files — a real, live "bridge" rule reaches the root
  when `bordered` is off; rustic injects a byte-identical unnamespaced
  redefinition of the global `@keyframes spin`.
- List: 31 sites / 2 files — greenfield; `Item`/`Meta` are engine-split
  sub-components living beside the root (not a `compound/` folder), unlike
  every other family's compounds.
- Timeline: 28 sites / 2 files — real DaisyUI `timeline`/`timeline-start/
  -middle/-end` coupling; a layered `.timeline-start/-middle/-end { color }`
  rule is LIVE and uncontested, genuinely painting every item's text color
  today (not suppressed).
- Carousel: 28 sites / 3 files — real DaisyUI `carousel`/`carousel-item`
  coupling; an uncontested layered `border-radius`/`overflow` on the root
  (lower-stakes than Timeline's finding — degrades to square corners, not a
  visible defect).
- Statistic: 24 sites / 3 files — half-borrows DaisyUI's `stat-title`/
  `stat-value` naming with no `stats`/`stat` wrapper; title color is a live,
  uncontested win on modern (value color is fully suppressed by contrast).
- Callout: 20 sites / 2 files — **the checkpoint brief's named precedent
  trap, confirmed live**: modern's DaisyUI `alert` class inherits
  personality.css's border-left accent bar with zero inline contest, an
  exact repeat of WO-SKIN-03's Alert finding; see the collision list above
  for the DaisyUI-mediated near-collision with Alert's own shipped skin.
- Descriptions: 16 sites / 2 files — greenfield; `Item` is a deliberate,
  self-documented "phantom" component (renders `<>{children}</>`), not an
  accidental composition gap like this batch's other unconsumed compounds.
- Typography: 14 sites / 2 files — rustic's `Link` export reserves
  `rottay-link` (see collision list); "Apollo" is the REAL internal
  implementation name throughout `engines/rustic.tsx` (not just a
  `displayName` string), a deeper instance of the retired-engine-name
  finding than Anchor's from WO-SKIN-04.
- Kbd: 10 sites / 2 files — smallest "real" component; sixth "doc claims
  DaisyUI, code doesn't have it" instance; fully greenfield otherwise.
- Empty: 4 sites / 2 files — a live bridge rule's `color` is uncontested on
  the root of BOTH engines simultaneously (rare — most findings this batch
  were single-engine); a token-name mismatch between the bridge
  (`--ds-text-secondary`) and the component's own inline color
  (`--ds-color-text-secondary`) is unresolved, flagged not fixed.
- Tree: 51 sites / 3 files — **the batch's richest architecture**: a live,
  two-layer hover system (CSS paints the outer wrapper, JS paints the inner
  row — both visible simultaneously on hover); modern uses the same
  imperative-DOM-mutation hover workaround rustic's own header comment says
  only inline-styles engines need; real (non-orphaned) DaisyUI checkbox
  coupling.
- Calendar: 76 sites / 2 files — **the largest component in the batch**;
  fully greenfield on every axis; the widest "doc claims DaisyUI" gap yet
  (7 buttons, zero DaisyUI classes); modern hand-duplicates one 8-key style
  object 5 times with no shared constant; demonstrates a THIRD distinct
  hover-workaround mechanism (React state) alongside Tree's two.
- Box: 18 sites / 2 files — **architecturally different from every other
  component in this report**: 8 of its 9-per-engine channels are unbounded
  caller pass-through (arbitrary CSS values, not a finite lookup table) and
  are structurally not migratable into a skin rule at all — Box IS the
  style-injection escape hatch, not a styled component with debt.
- Layout: 20 sites / 2 files — zero first-party classname on ANY element in
  EITHER engine, the widest "zero anatomy" finding in the batch; modern's
  light-theme Sider omits an explicit text color (inherits), rustic's does
  not.
- Collapse: 17 sites / 2 files — the most granular token vocabulary found
  (5-segment `--ds-collapse-{part}-{variant}-{state}-{property}`); a real,
  live bridge rule exists but every uncontested channel traces to zero
  visible effect today — a methodology lesson (uncontested ≠ consequential),
  not a defect; rustic's root has no scope class at all, unlike modern's.
- Divider: 8 sites / 2 files — a suspected extra root border (with-text
  variant, second-emitter `theme.css` bridge) was checked live in a
  production browser via CDP and REFUTED — the root's computed
  border-width is 0px on both orientations. Root cause: Tailwind's own
  preflight reset outranks every `rottay-*` layer (including
  `rottay-engines`, where theme.css bridges live) by cascade-layer order
  alone, independent of specificity. This generalizes far beyond Divider —
  reported to the team as its own finding, since it affects a large
  fraction of theme.css's border/margin/padding declarations program-wide,
  not just this component.
- Splitter: 3 sites, 2 files — smallest component in the entire inventory;
  fully greenfield; modern's drag-handle gutter carries a `transition-
  colors` class but never actually changes color on hover, unlike rustic's
  (which does, via React-state hover — a fourth hover-mechanism instance).

**Three biggest traps for whoever migrates this family**: (1) **Avatar's
40×40 clip** — a hardcoded, uncontested layered rule that has nothing to do
with this migration but will look exactly like a migration regression the
moment someone notices a `size="lg"` Avatar rendering small; it must be
consciously preserved-or-fixed, never silently changed as a byproduct of
touching the surrounding channels; (2) **the DaisyUI-`alert`-class collision
between Callout and the already-shipped Alert skin** — any future Callout
skin must mint a fresh scope class (never `rottay-alert`/`rottay-alert-
shell`) and must use LONGHAND border properties only if it ever touches the
left border, or it will zero out the personality-supplied accent bar exactly
as WO-SKIN-03 already documented for Alert/Toast/Message/Notification; (3)
**Box's unbounded pass-through channels are not migration debt** — 8 of its
9 counted channels per engine exist specifically so callers can inject
arbitrary paint, and treating them as sites to "clean up" the way Card's
loading skeleton was would break the primitive's entire purpose; only
`borderRadius`/`boxShadow` (enum-lookup-backed) are even theoretically
candidates.

**Zero sites classified as pure RUNTIME** anywhere in this batch's 624
counted channels (table-row tally: 91 STATIC parts, 78 STATE-SELECTED parts,
0 RUNTIME parts — grouped by rendered part per this report's established
convention, not a raw 1:1 site count). Every genuinely continuous-data value
found (QRCode's canvas `fillStyle`, Tree's/Calendar's/Splitter's drag-
position math from `getBoundingClientRect`, Tooltip's portal `top`/`left`)
lands OUTSIDE the tracked paint-channel list entirely (not a `background*`/
`border*`/`color`/etc. style key) — the same shape WO-SKIN-04 found, where
Tabs' compositor transform was the lone true-RUNTIME exception. This
family's Carousel/Callout/Avatar's `ringColor` cases were the closest calls,
each resolved to STATE-SELECTED per the WO-06 discriminator (the runtime
identifier lands in a bounded ternary or a caller-supplied-but-read-once
prop, never a live/continuous read).

All CRITICAL LAWS checked: every proposed future scope-class name discussed
above (`rottay-callout-shell`) is grep-verified free; no shorthand-then-
undefined-longhand clobber pattern found anywhere in this family (Callout's
rustic `borderLeft` is a safe, self-contained shorthand — no external layer
composes onto it); no wall-clock/timer-driven paint found (Statistic's
Countdown re-renders every second but only text content changes, never a
style key).
