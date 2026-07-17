# WO-SKIN-06 CK-F (communication family) paint inventory (read-only)

All paths relative to `packages/core/src/ui/patterns/communication/`. Same
channel scope and classification legend as the WO-SKIN-02/03/04 precedents
(`skin02-fields-inventory.md`, `wo-skin-03-status-inventory.md`,
`wo-skin-04-navigation-inventory.md`): a "site" is an object-literal style key
named `background*`, `border*`, `outline*`, `color`, `boxShadow`, `textShadow`,
`fill`, `stroke`, `accentColor`, `filter`, `backdropFilter`,
`WebkitBackdropFilter`, or `transform`, or an imperative `.style.<paint> =` /
`.style.setProperty('paint-prop', …)` write — reproduced exactly from
`scripts/lib/inline-paint-counter.mjs`'s lexer for this report (bracket-stack
scan, string/comment-safe, same `ARC09_PAINT_KEY_RE`). **STATIC** = author-time
constant, moves to the skin verbatim. **STATE-SELECTED** = a ternary/map/switch
over static values, keyed by React state or a prop (per the triage's §2
discriminator: the runtime identifier *selects*, it does not *land in*, the
paint value) — becomes a `:hover`/`[data-x]`/`[data-variant]` rule. **RUNTIME**
= the paint value itself is computed from caller-supplied data (a per-user hex,
not a bounded enum) — stays inline or rides a `--ds-*` custom-property hatch.
Elements that are only *conditionally rendered* but carry one single static
value regardless of which branch rendered them are classified **STATIC**, not
STATE-SELECTED — React continues to own the conditional render post-migration,
so no CSS selector logic is needed for that channel (this report applies that
rule consistently; see the note under Menu's accent bar precedent in
WO-SKIN-04 for the boundary case this diverges from, by design, for internal
consistency).

**Coverage checklist** (`node scripts/engine-token-audit.mjs | grep
"fleet.inlinePaint.runtime/patterns/communication"`, 2026-07-13): 10 files, **272**
sites by the counter's count. `EXAMPLES`/`.stories.tsx`/`tests/` files are
excluded from the family total (docs/test files, not shipped components).
`engines/classic.tsx` wraps Ant Design directly in all four engine-split
components (comment-thread, notification-center, activity-log, live-feed) and
carries **0** counted sites in every case (grep-verified against the counter's
own file list) — not detailed site-by-site below, per the WO-SKIN-04
precedent, except where its className/token choices bear on the anatomy or
vocabulary questions.

---

## 0. The premise you must not inherit — answered first

The triage (§3, §6) grouped this checkpoint as "feed/thread/bubble
vocabulary" and rated it 98% A. The **98% A part holds** (confirmed below,
site by site). The **"vocabulary" part does not.** Applying the same
methodology that falsified CK-C and CK-D (grep for importers, compare values
side by side, do not infer sharing from surface similarity):

- **Zero cross-component imports of any styling helper exist within this
  family.** `comment-thread`, `notification-center`, `activity-log` each
  define their own local `avatarStyle`/`btnStyle`/color-map functions,
  independently, in both their modern and rustic engines. `live-feed`'s
  modern engine is the **one exception** — it imports
  `panelCardStyle`/`cardBodyStyle`/`pillBadgeSmStyle`/`spinnerStyle` from
  `patterns/_internal/engines/modern/styles.ts`, a DaisyUI-replacement helper
  shared by 11 files DS-wide — but that file is not communication-specific
  and no other file in this family imports it.
- **`assistant` and `presence` are not engine-split components at all.** They
  have no `engines/{modern,rustic,classic}` split, no DaisyUI dependency to
  replace, and are built by composing DS primitives (`Box`, `Card`, `Stack`,
  `Text`, `Tag`, `Button` for assistant; `Box`, `Text` for presence) rather
  than hand-rolling raw style objects. `assistant` is not one component but
  **eight** independently-exported sub-components
  (`AssistantStatusBadge`, `StreamingText`, `TypingIndicator`, `ToolCallCard`,
  `AssistantStatusIndicator`, `PreviewDiffCard`, `ConfirmActionCard`,
  `MessageBubble`); `presence` is **three**
  (`PresenceBar`, `PresenceTypingIndicator`, `LiveCursor`). Neither has a
  single "root" a scope class could anchor to in the sense the other four
  components do. These two are structurally incomparable to the other four,
  not just differently-themed — a shared-vocabulary question does not even
  apply to them.
- **Where two engines of the *same* component solve the *same* visual
  problem, they independently reinvented it with different values** — see
  §2 below for the full side-by-side. This is the CK-C/CK-D shape recurring a
  third time, at the sub-component (per-engine) level rather than the
  per-file level.

**Answer to the spine question: six skins, not one.** There is no shared
token file, no shared color-map function, and (`live-feed` modern's DaisyUI
helper aside) no import relationship anywhere in this family. Six components
means six independent token sets, and in three of those six components the
modern and rustic engines *also* disagree with each other on the exact value
for the same concept — so in practice this checkpoint is closer to **eight to
ten** independently-authored recipes wearing one folder name. Nothing here
should be flattened onto a shared name; every divergence catalogued in §2 is
a value a migration must PRESERVE per-engine, per-component.

---

## 1. Per-component paint sites

### comment-thread (81 sites, 2 files: modern 56, rustic 25)

**Anatomy today**: root carries `ds-pattern-comment-thread ds-engine-modern`
(modern.tsx:257) and `ds-pattern-comment-thread ds-engine-classic`
(classic.tsx:288) — a real, correctly-shaped `ds-pattern-<name>
ds-engine-<engine>` scope-class convention, but **rustic has none at all**
(no first-party class anywhere in rustic.tsx, only the consumer's
`className`). Grep-confirmed **zero** references to
`ds-pattern-comment-thread` anywhere in `foundation/tokens/css/` — the existing classes
are inert today, a head start for a future skin on 2 of 3 engines, not a
live coupling. No `data-part` anywhere.

**Paint sites — `engines/modern.tsx`** (56 sites — avatar wrapper, edit/reply
textareas, Save/Cancel/Reply/Edit/Delete action buttons, reply-input
controls, nested-reply border line, loading spinner, new-comment composer —
all hand-rolled per call site, no shared factory):

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| avatar wrapper (used 2x: reply avatar, composer avatar) | modern 92, 263 | background, color | STATIC |
| edit textarea | modern 113 | border, borderRadius, background, color | STATIC |
| Save / Cancel buttons (editing) | modern 119, 120 | background, color, borderRadius, border | STATIC |
| reaction pill | modern 134-137 | background, color | STATE-SELECTED (`r.active` ternary on background/color); borderRadius/border STATIC |
| Reply / Edit / Delete action links | modern 151, 156, 161 | background, color, borderRadius, border | STATIC (Delete's `color: var(--ds-color-error)` is a fixed value, not state-driven — it is always red, never toggled) |
| reply textarea | modern 172 | borderRadius, border, background, color | STATIC |
| Reply-submit / Cancel buttons | modern 179, 182 | background, color, borderRadius, border | STATIC |
| nested-reply left border | modern 192 | borderColor | STATIC |
| loading spinner | modern 250 | border, borderTopColor, borderRadius | STATIC (consumes the global `ds-spin` keyframe — see §4) |
| composer textarea | modern 274 | borderRadius, border, background, color | STATIC |
| "Comment" submit button | modern 280 | background, color, borderRadius, border | STATIC |

**STATE-SELECTED**: 2 of 56 (the reaction pill's `background`/`color`, keyed
on `r.active`). Everything else is STATIC — modern comment-thread has **no
hover treatment anywhere** (no `onMouseEnter`/`onMouseLeave`, no `:hover`
target) despite rendering half a dozen buttons; every button's paint is a
single fixed value regardless of interaction state. **RUNTIME**: none.
**Imperative writes**: none. **Keyframes**: none local (see §4 for the
cross-file `ds-spin` finding).

**Paint sites — `engines/rustic.tsx`** (25 sites — five module-level style
factories: `avatarStyle(size)`, `textareaStyle`, `btnStyle`,
`primaryBtnStyle` (spreads `btnStyle`), `linkBtnStyle`, reused across both
the composer and the recursive `CommentNode`):

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| `avatarStyle` | rustic 49-56 | borderRadius, background, color | STATIC |
| `textareaStyle` | rustic 66-69 | borderRadius, border, background, color | STATIC |
| `btnStyle` | rustic 78-81 | borderRadius, border, background, color | STATIC |
| `primaryBtnStyle` (spreads btnStyle) | rustic 89-91 | background, color, borderColor | STATIC |
| `linkBtnStyle` | rustic 96-97 | background, border | STATIC |
| timestamp / edited label | rustic 165, 169 | color | STATIC |
| reaction pill override | rustic 204-205 | background, borderColor | STATE-SELECTED (`r.active` ternary; spreads `btnStyle`, overrides only these two channels) |
| Delete link override | rustic 225 | color | STATIC (fixed error red) |
| nested-reply left border | rustic 257 | borderLeft | STATIC |
| loading text | rustic 314 | color | STATIC |
| empty state | rustic 353 | color | STATIC |

**STATE-SELECTED**: 2 of 25 (same reaction-pill shape as modern). **RUNTIME**:
none. **Imperative writes**: none. **Keyframes**: none. Rustic comment-thread
also has **zero hover treatment** — same asymmetry-free-of-asymmetry as
modern (both engines simply never implemented hover for this component,
unlike most of the rest of the fleet).

**Cross-engine divergence within comment-thread itself** (see §2 for the
full table): modern's primary-button text color is
`var(--ds-color-text-on-primary)`; rustic's is
`var(--ds-color-primary-foreground, #fff)` — two different token names for
the identical semantic slot ("text color on a primary-filled button"), both
real, independently-declared tokens (`default.css:205`/`:2048` and
`default.css:154` respectively), not aliases of each other. Preserve both
names; do not consolidate onto one during migration.

---

### notification-center (62 sites, 2 files: modern 38, rustic 24)

**Anatomy today**: root carries `ds-pattern-notification-center
ds-engine-modern` (modern.tsx:116) and `ds-pattern-notification-center
ds-engine-classic` (classic.tsx:225) — same partial convention as
comment-thread. **Rustic has no scope class.** Zero `foundation/tokens/css/` references
to either class (inert). No `data-part` anywhere.

**Paint sites — `engines/modern.tsx`** (38 sites):

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| `typeColorStyles` (info/success/warning/error icon color map) | modern 22-27 | color | STATE-SELECTED — **static map index** (§2 discriminator, "enum-switch" shape), keyed by `item.type` |
| `typeBgStyles` (icon container tint, `color-mix(...10%...)`) | modern 30-36 | background | STATE-SELECTED, same map, one `color-mix` per branch |
| trigger button | modern 124 | background, color, borderRadius, border | STATIC |
| unread-count badge | modern 135 | borderRadius, background, color | STATIC (conditionally rendered, single value) |
| dropdown panel | modern 143 | background, borderRadius, boxShadow | STATIC |
| header bottom border | modern 146 | borderColor | STATIC |
| "Mark all read" / "Clear all" buttons | modern 150, 155 | background, color, borderRadius, border | STATIC |
| row bottom border | modern 177 | borderColor | STATIC |
| unread row tint | modern 178 | background | STATE-SELECTED (`!item.read` ternary spread — `color-mix(in srgb, var(--ds-color-primary) 10%, transparent)` vs nothing) |
| unread title dot | modern 196 | background | STATIC (conditionally rendered, single value) |
| item action button | modern 205 | background, color, borderRadius, border | STATIC |
| dismiss button (base) | modern 216 | background, color, borderRadius, border | STATIC |

**STATE-SELECTED**: 9 of 38 (4 `typeColorStyles` + 4 `typeBgStyles` + 1
unread-row tint). **RUNTIME**: none. **Non-counted imperative interaction**:
the dismiss button's hover brighten is `onMouseEnter`/`onMouseLeave` writing
`e.currentTarget.style.opacity` directly (modern.tsx:217-218) — **not** a
counted channel (`opacity` is outside `ARC09_PAINT_KEY_RE`), so it is invisible
to both the counter and this report's site table, but it is a real hover
mechanism a migration should still convert to a `:hover { opacity: 1 }` rule
when this file is migrated. Flagged here so it is not silently dropped.

**Paint sites — `engines/rustic.tsx`** (24 sites — five module-level style
constants: `triggerBtnStyle`, `badgeStyle`, `dropdownStyle`, `headerStyle`,
`linkBtnStyle`):

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| `triggerBtnStyle` | rustic 56-62 | background, border, color, borderRadius | STATIC |
| `badgeStyle` | rustic 71-73 | borderRadius, background, color | STATIC |
| `dropdownStyle` | rustic 89-92 | background, border, borderRadius, boxShadow | STATIC |
| `headerStyle` | rustic 104 | borderBottom | STATIC |
| `linkBtnStyle` | rustic 108-112 | background, border, color | STATIC |
| empty state | rustic 216 | color | STATIC |
| row bottom border | rustic 227 | borderBottom | STATIC |
| unread row tint | rustic 228 | background | STATE-SELECTED (`item.read ? undefined : 'var(--ds-color-primary-50, var(--ds-color-bg-muted))'`) |
| type icon color (`typeColors[item.type]`) | rustic 236 | color | STATE-SELECTED — same map shape as modern, but only the **usage** site is counted (the map's own definition at rustic.tsx:25-30 uses `Record<string,string>` values, not `color:`-keyed object literals, so the counter never sees the 4-branch definition — only this 1 consuming site). Modern's equivalent counts 4 sites at the definition; rustic counts 1 at the call site — a counting artifact of how the two engines structure the identical logic, not a real difference in paint volume. |
| unread title dot | rustic 252 | borderRadius, background | STATIC (conditionally rendered, single value) |
| message / timestamp color | rustic 255, 260 | color | STATIC |
| dismiss button override | rustic 277 | color | STATIC |

**STATE-SELECTED**: 2 of 24 (unread-row tint, type-icon color).
**RUNTIME**: none. **Imperative writes**: none. Rustic's dismiss button has
**no hover treatment at all** — a static `opacity: 0.5` with no
`onMouseEnter`/`onMouseLeave` pair, unlike modern's imperative brighten-on-hover.
This is a real, if minor, engine asymmetry: modern's dismiss control responds
to hover, rustic's does not.

**Cross-engine divergence within notification-center (see §2 for the full
table)**: the `info` type resolves to **`--ds-color-info`** in modern but
**`--ds-color-primary`** in rustic — the one type in the 4-branch map where
the two engines genuinely disagree on which semantic token applies, not just
on mechanism. The unread-row tint mechanism also differs:
`color-mix(in srgb, var(--ds-color-primary) 10%, transparent)` (modern, no
named token) vs `var(--ds-color-primary-50, var(--ds-color-bg-muted))`
(rustic, a named DS scale token). **Classic invents a third, currently-dead
vocabulary**: `classic.tsx` references `--ds-notification-center-unread-bg`,
`--ds-notification-center-unread-dot`, `--ds-notification-center-message-color`,
`--ds-notification-center-timestamp-color` (4 uses, classic.tsx) — none of
these four custom properties are declared **anywhere** in `foundation/tokens/css/`
(grep-confirmed zero hits). Same shape as P-73 (`--ds-steps-line-color`): a
component-scoped theming hatch that looks real, is referenced with a
fallback, and always resolves to its fallback because nothing ever sets it.
Classic is out of this checkpoint's migration scope (0 counted sites,
Ant-wrapped), but this is worth a team flag: if classic is ever revisited,
these four tokens are phantom, not a real theming surface today.

---

### activity-log (53 sites, 2 files: modern 32, rustic 21)

**Anatomy today**: `ds-pattern-activity-log ds-engine-classic` exists on
`classic.tsx:153`, but **neither modern nor rustic carries any scope class**
— the one place in this family where classic has the convention and modern
does not (comment-thread and notification-center both had it on modern too).
No `data-part` anywhere.

**Paint sites — `engines/modern.tsx`** (32 counted + **1 blind**, see below):

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| `getActionBadgeStyle` (5-way `classifyAction`→`getDotColor` switch: create/update/delete/view/system) | modern 73 | background (`color-mix(...${color}...)`) | STATE-SELECTED — enum-switch fn, same shape as the triage's `getToneShell` example |
| `getActionBadgeStyle`, cont. | modern 74 | **color** (bare `color,` shorthand — see blind-spot note) | STATE-SELECTED, **counter-invisible** |
| `getActionBadgeStyle`, cont. | modern 76 | borderRadius | STATIC |
| DiffView container / rows / field labels | modern 131, 132, 144, 147, 150, 153, 154 | background, borderRadius, color ×5 | STATIC (all 7 sites — before/after/field-label colors are fixed regardless of which field or value is shown) |
| Avatar (img + fallback span) | modern 177, 193, 194, 195 | borderRadius, background, color | STATIC |
| `LoadingSkeleton` shimmer gradient | modern 221, 222, 224, 239 | background, backgroundSize, borderRadius | STATIC (fixed 3-stop gradient, reused for dot and both text-line skeletons) |
| EmptyState message | modern 269 | color | STATIC |
| timeline dot | modern 337 | borderRadius | STATIC |
| timeline dot fill / ring / glyph color | modern 338, 339, 345 | background, border, color | STATE-SELECTED (`dotColor` = `getDotColor(category)`, same 5-way switch as the badge) |
| connecting line | modern 360 | background | STATIC (conditionally rendered, single value) |
| user name / entity label / timestamp | modern 399, 411, 425 | color | STATIC |
| loading-state wrapper | modern 478-480 | background, boxShadow, borderRadius | STATIC |
| main wrapper | modern 494-496 | background, boxShadow, borderRadius | STATIC |

**STATE-SELECTED**: 4 counted (73, 338, 339, 345) **+ 1 counter-blind** (74) =
**5 real STATE-SELECTED sites**, not 4. **The blind spot**: `getActionBadgeStyle`
(modern.tsx:70-84) returns `{ background: `color-mix(...${color}...)`,
color, padding: ..., borderRadius: ..., ... }` — line 74 is bare `color,`,
JS object-shorthand for `color: color`. The counter's regex requires a
literal `key:` — a shorthand property with no colon is structurally invisible
to it, exactly the blind spot the brief names ("JS object shorthand, no
colon"). This is real, live, STATE-SELECTED paint (the action-category badge
text color) that the fleet counter will never report — a component can reach
`fleet.inlinePaint: 0` after migration while this exact site is still sitting
unmigrated if an agent trusts the counter's line list instead of reading the
function. **A repo-wide grep for this exact shorthand pattern across the rest
of WO-06 is worth doing once, centrally — this is the only occurrence found in
CK-F, but the mechanism is generic and could recur anywhere.**

**RUNTIME**: none. **Imperative writes**: none.

**Real per-instance keyframe, invisible to the counter**: `LoadingSkeleton()`
(modern.tsx:212-254) declares `shimmerKeyframes` as a module-level string
(`@keyframes ds-activity-shimmer { ... }`) and renders it via
`<style>{shimmerKeyframes}</style>` (line 229) **on every render, with no
mount-guard** — the same "no dedup" shape WO-SKIN-04 found in Tabs'
`rottay-tabs-fade-in` (N simultaneously-loading ActivityLog instances inject N
identical `<style>` blocks). Unlike Tabs, this keyframe is **already**
correctly `ds-`-namespaced (`ds-activity-shimmer`) and, per the grep in §4,
its name is unique fleet-wide — no rename needed, only the guard/move-to-skin
work.

**Paint sites — `engines/rustic.tsx`** (21 sites — `containerStyle`,
`selectStyle` module constants; `dotStyle(color)`, `lineStyle`,
`avatarStyle(size)`, `tagStyle(color)` closures defined inside the component
body, all consuming `getActionColor(action)`):

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| `containerStyle` | rustic 57-59 | border, borderRadius, background | STATIC |
| `selectStyle` | rustic 66-69 | borderRadius, border, background, color | STATIC |
| loading text | rustic 98 | color | STATIC |
| `dotStyle(color)` | rustic 108-109 | borderRadius, background | borderRadius STATIC, **background STATE-SELECTED** (`getActionColor(activity.action)`) |
| `lineStyle` | rustic 118 | background | STATIC |
| `avatarStyle(size)` | rustic 127, 128, 134 | borderRadius, background, color | STATIC |
| `tagStyle(color)` | rustic 143, 146, 147 | borderRadius, background, color | borderRadius/color STATIC, **background STATE-SELECTED** (same `getActionColor` value) |
| empty state | rustic 185 | color | STATIC |
| entity label / timestamp / diff wrapper | rustic 224, 230, 234 | color | STATIC |

**STATE-SELECTED**: 2 of 21 (`dotStyle`'s background, `tagStyle`'s
background — both `getActionColor(activity.action)`). **RUNTIME**: none.
**Imperative writes**: none. **Keyframes**: none.

**Real, cross-engine functional divergence, not just a paint-value
difference** (elaborated in §2): modern's `classifyAction` is a 5-category
switch (create/update/delete/view/**system**) matching `created|added`,
`updated|edited|changed`, `deleted|removed|archived`, `viewed|read|accessed`,
default→system(warning). Rustic's `getActionColor` is a 4-branch if-chain
with **no `system`/default-warning category at all** — unmatched actions
fall through to `text-secondary`, not `warning` — and matches a narrower verb
set (`updated|edited` only, missing `changed`; `deleted|removed`, missing
`archived`; `viewed` only, missing `read`/`accessed`). The SAME activity
string can be classified into different buckets by the two engines. This is
not migratable by moving values into a skin — the classification LOGIC
itself differs, which is a product decision, not a paint decision. Record,
do not reconcile.

---

### live-feed (44 sites, 2 files: modern 22, rustic 22)

**Anatomy today**: no scope class, no `data-part`, in any of the three
engines — the only component in this family where **classic also lacks the
convention** (comment-thread/notification-center/activity-log's classic
engines all carry it; live-feed's does not). Fully greenfield anatomy.

**Paint sites — `engines/modern.tsx`** (22 sites — imports
`panelCardStyle`/`cardBodyStyle`/`pillBadgeSmStyle`/`spinnerStyle` from the
shared `patterns/_internal/engines/modern/styles.ts` DaisyUI-replacement
helper, the **only** cross-file style import anywhere in this family):

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| loading-skeleton wrapper | modern 73 | boxShadow | STATIC |
| skeleton title bar / row blocks | modern 75, 77 | borderRadius, background | STATIC |
| main wrapper | modern 85 | boxShadow | STATIC |
| refresh button | modern 92 | background, color, borderRadius, border | STATIC |
| new-items banner button | modern 111 | background, color, borderRadius, border, boxShadow | STATIC — comment at modern.tsx:109-110 explicitly names this a "Signal-glow (spec section 5, role 3)" reserved-for-live-moments treatment, but the value itself is a fixed token, not data-driven |
| banner count badge | modern 114 | background, color | STATIC |
| empty state | modern 123 | color | STATIC |
| "Load more" button | modern 143 | background, color, borderRadius, border | STATIC |

**STATE-SELECTED**: 0. **RUNTIME**: 0. Every one of live-feed modern's 22
sites is STATIC — no ternary, no map, no per-item variation of any kind
(items receive a utility **className**, `ds-pulse-changed`, not inline
paint — see §4). **Imperative writes**: none. **Keyframes**: none local
(consumes two separate shared global mechanisms — see §4).

**Paint sites — `engines/rustic.tsx`** (22 sites — a `s = { ... }` object of
9 named style constants plus a `skeleton(w,h)` factory, **all consuming
the component-scoped `--ds-live-feed-*` custom-property family** with
`--ds-color-*` fallbacks):

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| `s.container` | rustic 33-36 | color, background, border, borderRadius | STATIC |
| `s.refreshBtn` | rustic 46-47, 50, 52 | background, border, color, borderRadius | STATIC |
| `s.newBar` | rustic 58-59, 62, 64 | background, borderRadius, color, border | STATIC |
| `s.newBadge` | rustic 69, 72-73 | borderRadius, background, color | STATIC |
| `s.empty` | rustic 79 | color | STATIC |
| `s.loadMore` | rustic 90-91, 93, 97 | background, border, color, borderRadius | STATIC |
| `s.skeleton(w, h)` factory | rustic 104-105 | borderRadius, background | STATIC (varies width/height per call, never the paint channels) |

**STATE-SELECTED**: 0. **RUNTIME**: 0. All 22 STATIC — the richest,
most consistently-STATIC file in this family alongside its own modern
engine. **Imperative writes**: none. **Keyframes**: **2 real, local,
counter-invisible `<style>` blocks** — see §4, this is the family's single
highest-value keyframe finding.

**Real vocabulary finding — `--ds-live-feed-*` is a genuinely-declared,
genuinely-consumed component-scoped token family, but only rustic uses it.**
`foundation/themes/default.css:1954-1966` declares 11 tokens
(`--ds-live-feed-bg`, `-border`, `-refresh-color`, `-new-bg`, `-new-border`,
`-new-color`, `-badge-bg`, `-badge-color`, `-empty-color`,
`-load-more-color`, `-skeleton-bg`), each with a sensible `--ds-color-*`
default, and both first-party tenant artifacts
(`foundation/tokens/css/facade/artifacts/rottay/index.css` and its `_source/extension.css`)
override all 11 with concrete hex values for light and dark. This is a real,
adopted, per-tenant-overridable theming surface — unlike the
`--ds-notification-center-*` phantom tokens above. **But only
`engines/rustic.tsx` references any of them** (11 for 11, one-for-one with
the declared set). Modern uses the shared, live-feed-agnostic
`_internal/engines/modern/styles.ts` helper instead (generic
`--ds-surface-card`/`--ds-color-*` tokens, nothing live-feed-specific), and
classic references none of the 11 either. So the one real, working,
tenant-overridable theming hatch this family has is reachable through
exactly one of live-feed's three engines today — a genuine, pre-existing
engine asymmetry worth a team flag (not a migration blocker: rustic's skin
should keep consuming these tokens; modern's skin has no equivalent hatch to
preserve because it never had one).

---

### assistant (16 sites − 1 false-positive = 15 real, 1 file, engine-agnostic)

Composed from DS primitives (`Box`, `Button`, `Card`, `Stack`, `Text`,
`Tag`), not raw engine-split style objects. Eight named exports, no single
root, no `data-part`, no scope class, no DaisyUI class (there is nothing to
replace — it never had one).

| Export | Paint (File:Lines) | Channels | Class |
|---|---|---|---|
| `agentStatusVisual` (5-way status switch feeding `AssistantStatusIndicator`'s dot) | 163, 165, 167, 169, 171 | color (object-literal `color:` field inside each branch's returned object) | STATE-SELECTED |
| `StreamingText` caret | 238 | color | STATIC |
| `TypingIndicator` dots (×3, only animation-delay varies) | 279-280 | borderRadius, background | STATIC |
| `ToolCallCard` duration text (`toneToColorVar(tone)`, tone from `toolStatusToTone(status)`) | 342 | color | STATE-SELECTED |
| `AssistantStatusIndicator` dot | 408-409 | borderRadius, background (`visual.color`) | borderRadius STATIC, background STATE-SELECTED |
| `PreviewDiffCard` row divider | 469 | borderTop | STATIC |
| `PreviewDiffCard` before/after cell color | 479, 503 | color | STATE-SELECTED (3-way `change` ternary: added/updated→success, removed→muted/error, unchanged→inherit) |
| `MessageBubble` timestamp | 695 | color | STATIC |

**Counter false positive — not real paint, must be excluded from any
migration count.** Line 157: `function agentStatusVisual(status:
AssistantAgentStatus): { color: string; live: boolean; defaultLabel: string
} {` — an **inline anonymous return-type annotation**, not a named
`interface`/`type X =` alias. The counter's type-body exemption (triage §7.5)
only recognizes `interface X {` and `type X = {` as openers of a
non-paint bracket; an inline object type directly in a function signature is
a **third, previously-undocumented shape of the same blind spot** — its
innermost bracket is `{`, immediately preceded by a `):`, which the lexer's
`typeBodyDepths` tracking never opens for. The counter therefore reports 16
sites for this file; only 15 are real, migratable paint. Worth teaching the
lexer (or exempting by name) alongside the 7 named-interface sites already
catalogued in the triage — this is an 8th, and it is a different code shape
than those 7, so the same fix (skip `interface`/`type` bodies) will not
automatically catch it; the fix needs to also recognize `): { ... } {` as a
return-type annotation.

**STATE-SELECTED**: 9 (163,165,167,169,171,342,409,479,503). **STATIC**: 6
(238,279,280,408,469,695). **RUNTIME**: 0. **False positive**: 1 (157).

**Architectural note on why assistant's "state-selection" mostly does not
touch a skin at all**: `toneToVariant`, `deliveryStatusToTone`, `roleLabel`,
`toolStatusToTone` map assistant-domain concepts (tone/status/role) to a
**Tag `variant` prop** or plain label strings — not to a style object. That
mapping feeds `<Tag variant={...}>`, and Tag's own engine skin owns the
actual paint for each variant. Only `agentStatusVisual`,
`toneToColorVar`+duration-text, the diff before/after colors, and the two
animated dots are assistant's *own* inline paint; the majority of its visual
vocabulary is inherited through DS primitive composition, not owned inline
style. This is a structurally different migration shape from the other five
components (which own 100% of their paint inline) and should be scoped as
its own, much smaller, unit of work.

---

### presence (16 counted + 2 blind, 1 file, engine-agnostic)

Three named exports (`PresenceBar`, `PresenceTypingIndicator`,
`LiveCursor`), composed from `Box`/`Text`. No `data-part`, no scope class,
no DaisyUI class.

| Export | Paint (File:Lines) | Channels | Class |
|---|---|---|---|
| `PresenceBar` avatar ring | 147-149 | borderRadius, border, background | border **RUNTIME**, rest STATIC |
| `PresenceBar` avatar initials | 171, 181 | borderRadius, color | borderRadius STATIC, color **RUNTIME** |
| `PresenceBar` overflow badge | 201-203, 220 | borderRadius, border, background, color | STATIC (fixed neutral tokens, does not use per-user color) |
| `PresenceTypingIndicator` dots (×3) | 282-283 | borderRadius, background | STATIC |
| `PresenceTypingIndicator` label | 292 | color | STATIC |
| `LiveCursor` name badge | 373-374, 379, 382 | background, color, borderRadius, boxShadow | background **RUNTIME**, rest STATIC (color/boxShadow are HARDCODED, see below) |

**RUNTIME**: 3 counted (148 border, 181 color, 373 background) — all three
resolve `ringColor`/`cursorColor = user.color || DEFAULT_COLOR` where
`user.color` is caller-supplied, per-user, arbitrary data (the triage's
"presence's 3 sites" B-category call, confirmed exactly). `DEFAULT_COLOR =
'var(--ds-color-primary)'` is the STATIC fallback when no per-user color is
supplied — the RUNTIME-ness is conditional on the caller actually passing a
color, matching the triage §2 `tenant-preview` precedent shape.

**The triage undercounts presence by (at least) one RUNTIME site — a real,
novel counter blind spot.** `LiveCursor`'s SVG arrow
(`<path ... fill={cursorColor} />` at line 358,
`<path ... stroke="var(--ds-color-surface, #fff)" />` at line 362) sets
**`fill` and `stroke` as raw JSX attributes on an SVG element**, not as
`style` object keys. The counter's lexer only fires inside an object-literal
context (`topIs("{") && ...`); a bare `fill={cursorColor}` JSX attribute
never opens that context the way `style={{ fill: cursorColor }}` would, so
it is entirely invisible — no site, no false negative flag, nothing. **This
is a fourth, previously-undocumented shape of the counter's blind spot**
(distinct from string-embedded `<style>` tags, JS shorthand, and inline
type annotations): SVG presentation attributes passed as direct JSX props.
`fill={cursorColor}` is genuinely RUNTIME (same `cursorColor` variable as the
counted background site at line 373); `stroke="var(--ds-color-surface,
#fff)"` is STATIC. **Presence's real RUNTIME count is 4, not 3** — the
triage's B-category tally for this family should be corrected from 6 to 7
once this SVG pair is included (comment-thread/notification-center/
activity-log/live-feed contribute 0 RUNTIME between them, confirmed above).

**Two pre-existing "no hardcoded colors" defects, record only**:
`LiveCursor`'s name-badge `color: '#fff'` (line 374) and `boxShadow: '0 1px
3px rgba(0,0,0,0.15)'` (line 382) are literal hardcoded values, not `--ds-*`
tokens — a direct violation of the DS's own hardcoded-color rule, sitting
right next to `cursorColor`'s and `DEFAULT_COLOR`'s properly-tokenized
values in the same component. Not a migration blocker (the values are
STATIC either way, they just should have been tokens) but worth a team flag
since it is the kind of thing a byte-exact migration would otherwise
silently preserve forever without ever being asked whether it should.

**Keyframes**: 1 local, counter-invisible `<style>` block (`ds-presence-dot`,
line 274) — see §4.

---

## 2. The vocabulary map — the values, side by side

No file in this family imports a styling helper from any other file in this
family (live-feed modern's import of the DS-wide `_internal/engines/modern/
styles.ts` is the sole exception, and that file is not communication-scoped).
Six components, six independent recipes. Within three of those six, the
modern and rustic engines *also* disagree with each other:

| concept | modern | rustic | verdict |
|---|---|---|---|
| comment-thread: text-on-primary-button color | `var(--ds-color-text-on-primary)` | `var(--ds-color-primary-foreground, #fff)` | **DIVERGED** — two different token names for the same slot, both real/declared, not aliases |
| notification-center: "info" type color | `var(--ds-color-info)` (`typeColorStyles`) | `var(--ds-color-primary)` (`typeColors`) | **DIVERGED** — the one type where the two engines disagree on which semantic token applies, not just on mechanism |
| notification-center: unread-row tint | `color-mix(in srgb, var(--ds-color-primary) 10%, transparent)` | `var(--ds-color-primary-50, var(--ds-color-bg-muted))` | **DIVERGED** mechanism (ad hoc mix vs. named scale token), same intent |
| notification-center: icon background tint | `color-mix(...10%...)` container behind the icon glyph | **no container tint at all** — bare colored glyph, no background | **DIVERGED structurally**, not just by value — rustic never implemented this treatment |
| activity-log: action→color classification | 5-category switch (create/update/delete/view/**system**), verb sets include `changed`/`archived`/`read`/`accessed` | 4-branch if-chain, **no system/default-warning category**, narrower verb sets | **DIVERGED in LOGIC, not just value** — the same activity string can land in different categories per engine; not resolvable by a skin alone |
| live-feed: component-scoped theming hatch (`--ds-live-feed-*`, 11 tokens, real & tenant-overridden) | not referenced (uses the generic DS-wide DaisyUI-replacement helper instead) | fully adopted, 11 of 11 | **ASYMMETRIC ADOPTION** — the one real theming surface in this family is reachable through 1 of 3 engines |
| assistant / notification / presence: semantic tone naming | assistant: `{success, warning, danger, info}` → matching `--ds-color-*` | notification modern: `{info,success,warning,error}`; notification rustic: `info`→primary (odd one out) | **Coincidental convergence on 3 of 4, not shared code** — no import relationship; each vocabulary was authored independently and happens to reach for the same obvious token names |
| notification-center: classic's own vocabulary | `--ds-notification-center-{unread-bg,unread-dot,message-color,timestamp-color}` | n/a | **Orphaned** — 4 tokens referenced, 0 declared anywhere in `foundation/tokens/css/`, always resolve to fallback (same shape as P-73) |

**None of these are safe to unify inside this migration.** Each divergent
pair must land as two separate values in two separate skin selectors
(`.rottay-comment-thread--modern` / `.rottay-comment-thread--rustic`, or
whatever the eventual scope-class convention resolves to) — pointing both
engines at one flattened value moves pixels in at least one of them, which
CK-D's correction already established is forbidden inside a byte-exact
migration regardless of how obviously "the same idea" the two recipes are.

---

## 3. Bridge rules (theme.css / personality.css) — DEAD/LIVE disposition per P-76

**No `theme.css` or `personality.css` rule targets any of this family's
component classes.** Grep across `foundation/tokens/css/runtime/engines/{modern,rustic,classic}/
theme.css` and `foundation/tokens/css/runtime/personality.css` for
`comment-thread`/`notification-center`/`activity-log`/`live-feed`/`presence`/
`assistant` (and the bare nouns `comment`/`notification`/`activity`/`feed`)
returns exactly two families of hits, both **unrelated** to this checkpoint's
components:

- **`.ant-notification-notice*` / `[data-engine] .ds-notification`**
  (`classic/theme.css:1190-1233`, `personality.css:533-544`) — this is Ant
  Design's **global toast/message API** (`notification.open()`), a
  completely separate first-party feedback primitive. Confirmed by reading
  `notification-center/engines/classic/index.tsx`: it imports AntD's `Popover` +
  `List`, never an AntD `Notification`/toast component, and never renders
  `.ant-notification-notice` or `.ds-notification` anywhere. **No coupling,
  not suppression, not dead-but-relevant — just a same-sounding name for a
  different component.** Per P-76, these rules themselves sit in
  `rottay-engines`/`rottay-personality`, both of which lose to Tailwind
  preflight on border/margin/padding regardless — moot here since they don't
  even target this family.
- **`.ds-command-home-message--assistant` / `.ds-ai-chat-message--assistant`**
  (`components/patterns.css:1438`) — the word "assistant" here is an OpenAI-
  style **chat-role modifier** (`assistant`/`user` message alignment), for a
  `command-home`/`ai-chat` message-bubble component. Grep-confirmed **zero**
  files in `src/ui/` render `ds-command-home-message` or
  `ds-ai-chat-message` — this selector is orphaned DS-wide, not just
  unrelated to our `patterns/communication/assistant`. No collision risk for
  a future `assistant` skin (the class names don't overlap: `ds-assistant-*`
  vs `ds-command-home-message--assistant`), but worth noting the word
  "assistant" is already in use elsewhere in the DS for an unrelated concept.

**Disposition: N/A for this checkpoint — there is no suppression risk to
inherit and nothing dead to preserve, because nothing in `theme.css`/
`personality.css` ever targeted these six components in the first place.**
This is the cleanest suppression-risk finding of any WO-06 checkpoint
inventoried so far (CK-D was suppression-risk-free too; CK-F is the same
shape). The `--ds-notification-center-*` and `--ds-live-feed-*` findings in
§1/§2 are about component-scoped **custom-property tokens** (declared in
`foundation/themes/default.css`, a token file, not a bridge/suppression
file) — a different P-76 category, not addressed by the border/margin/
padding dead-channel finding at all (none of this family's paint sites are
on the border-WIDTH/margin/padding channels P-76 kills; the channels in use
throughout are `background`/`color`/`border-color`/`border-radius`/
`box-shadow`, all channels P-76 confirms are LIVE).

---

## 4. Keyframes and per-instance `<style>` tags — the counter-blind work item

**7 real `<style>` render sites across 5 of the 10 files**, none counted by
`fleet.inlinePaint`, all invisible to the ratchet exactly per triage §7.3:

| File | Keyframe(s) | Guard? | Naming | Notes |
|---|---|---|---|---|
| comment-thread/modern.tsx | consumes global `ds-spin` (declared in `engines/rustic/theme.css:1052`) | n/a (no local injection) | cross-engine reference, harmless — all engine `theme.css` files load into one bundle regardless of active engine | See below: a second, functionally-identical `spin` keyframe exists too |
| live-feed/modern.tsx | consumes global `spin` (via `_internal/engines/modern/styles.ts`'s `spinnerStyle()`) + global `.ds-pulse-changed` utility (`foundation/animations/transitions.css`) | n/a | both real, both already shared, both correctly reused | — |
| live-feed/rustic.tsx | **local** `@keyframes pulse` (×2 render sites: loading-skeleton-only and main) + **local** `@keyframes feedPulse` | **NO** — unguarded `<style>` in JSX, re-injected every render/mount | **bare, non-namespaced** `pulse`/`feedPulse` | **See "the biggest trap" below** |
| activity-log/modern.tsx | **local** `@keyframes ds-activity-shimmer` | **NO** — unguarded, in `LoadingSkeleton()`, same shape as WO-SKIN-04's Tabs finding | already correctly `ds-`-namespaced, fleet-unique (grep-confirmed) | Rename not needed, only the guard/move-to-skin work |
| assistant/index.tsx | `ds-assistant-caret` (1 site), `ds-assistant-dot` (2 sites) | **NO**, but **deliberately and documented**: "Identical duplicate definitions are idempotent at the CSS cascade level" (index.tsx:56-58) | already correctly `ds-`-namespaced, fleet-unique | The one component in this family that reasoned about the duplication explicitly rather than leaving it as an oversight |
| presence/index.tsx | `ds-presence-dot` (1 site) | **NO** — unguarded, in `PresenceTypingIndicator` | already correctly `ds-`-namespaced, fleet-unique | Same un-acknowledged shape as live-feed/activity-log, not documented like assistant's |

**The biggest trap in this checkpoint: live-feed rustic's local `pulse`
keyframe is not a redundant duplicate of the global one — it is a genuinely
different, deliberately-different value, and a migration that treats it as
"obviously the same, just delete it" will move pixels.**

- The global `@keyframes pulse` (`foundation/tokens/css/foundation/animations/
  keyframes.css:352-357`) animates opacity **1 → 0.5 → 1**.
- live-feed/rustic's local `@keyframes pulse` (rustic.tsx:160, 175) animates
  opacity **1 → 0.4 → 1** — a different minimum.
- This is **not unique to live-feed**: the identical `1 → 0.4 → 1` local
  `pulse` (verbatim byte-for-byte string) is independently re-declared, via
  the exact same unguarded-inline-`<style>`-tag mechanism, in at least 5
  other DS files outside this family: `patterns/visualization/tree-view/
  engines/rustic.tsx`, `patterns/forms/step-wizard/engines/rustic/index.tsx`,
  `patterns/workflow/approval-workflow/engines/rustic/index.tsx` (×2 sites), and
  `patterns/data/stats-grid/engines/rustic/index.tsx`. `step-wizard`'s **modern**
  engine, by contrast, redeclares `pulse` at `1 → 0.5 → 1` — matching the
  global value exactly, a harmless duplicate.
- Because `@keyframes` are not subject to cascade-layer precedence — the
  last-parsed same-named declaration wins outright — and the local
  `<style>` tag is inserted into the DOM at component-render time (after the
  global bundle has already loaded), **live-feed's skeleton and new-item
  flash today almost certainly render at the LOCAL 0.4 value, not the global
  0.5 value**, though this needs the same live-browser confirmation the
  Steps STOP-AND-REPORT finding in WO-SKIN-04 required — it cannot be
  settled by reading the CSS alone.
- **There is already a fleet precedent for the correct fix**, found in this
  family's own test suite: `patterns/data/detail-panel/tests/
  PatternDetailPanel.real-engines.test.tsx:196-203` asserts that
  `detail-panel` "renames its local pulse to `ds-detail-panel-pulse` and does
  not redefine the global `@keyframes pulse`" — i.e. `detail-panel` already
  went through exactly this migration. Live-feed's rustic skin should follow
  the same pattern: rename to `ds-live-feed-pulse` (and `ds-live-feed-
  feed-pulse` for the second one, which has no global equivalent at all and
  is unique to this component), not delete-and-rely-on-global.
- **Action for the contract, not this inventory**: before CK-F's migration
  moves live-feed rustic's keyframes into a skin, verify empirically (CDP
  computed-style, matching the Steps/Divider precedent) which opacity floor
  is actually rendering today, and preserve that exact value under the new
  namespaced name. Do not assume 0.5 (the "obviously correct" global) or 0.4
  (the "obviously correct, matches everyone else" local) without checking —
  the whole point of this trap is that both look equally plausible from
  reading the code alone.

---

## 5. Interaction paint summary — React state vs imperative writes

**Imperative `.style.<paint> =` writes: zero in this entire family**, by the
counter's channel list. The only imperative `.style.` write anywhere in
CK-F is notification-center/modern's dismiss-button hover
(`.style.opacity =`, modern.tsx:217-218) — real, but `opacity` is outside
the counted-channel set, so it contributes 0 to every total in this report
while still being a genuine hover mechanism a migration should convert to a
`:hover` rule (flagged in §1). No component in this family uses the
`el.style.background =` imperative-hover pattern WO-SKIN-04 found pervasive
in Menu/Stepper's rustic engines.

**Hover treatment is inconsistent and mostly absent**: comment-thread (both
engines) and live-feed (both engines) have **no hover paint anywhere** —
every button in those four files renders one fixed value regardless of
pointer state. notification-center is the only component with any hover
mechanism at all, and it is asymmetric even there: modern's dismiss button
brightens on hover (imperative, uncounted `opacity`); rustic's dismiss
button is a static, permanently-dimmed `opacity: 0.5` with no hover
treatment. activity-log and presence have no interactive hover surface to
speak of either (activity-log's rows are click targets with `cursor:
pointer` but no visual hover state; presence's dots/avatars are
non-interactive by design).

---

## 6. Engine asymmetries, dead code, pre-existing defects (record only)

- **Anatomy convention is a partial, inconsistent rollout.** The
  `ds-pattern-<name> ds-engine-<engine>` scope class exists on exactly 5 of
  12 engine-split files: comment-thread (modern + classic), notification-
  center (modern + classic), activity-log (classic only). It is **absent**
  from every rustic engine in the family (4 of 4) and from live-feed's
  classic engine (the only classic engine in the family without it). None of
  the 5 existing instances are referenced by any stylesheet today
  (grep-confirmed zero hits in `foundation/tokens/css/`) — a future skin gets a partial
  head start on naming, not a live coupling to worry about breaking.
- **`--ds-notification-center-*` (4 tokens) and `--ds-steps-line-color`-shaped
  phantoms recur here too**: declared nowhere, referenced with a fallback
  that always wins, only in `notification-center/classic.tsx` (out of this
  checkpoint's migration scope, but worth a team flag if classic is ever
  revisited).
- **`--ds-live-feed-*` (11 tokens) is the inverse and rarer case**: genuinely
  declared, genuinely tenant-overridden in first-party artifacts, but only
  consumed by one of three engines (rustic). A real theming surface that
  silently only works for one-third of the component's render paths.
- **activity-log's action-classification logic diverges between engines**,
  not just its color values (§2) — the single largest "cannot be fixed by a
  migration" finding in this checkpoint, on par with the Steps STOP-AND-
  REPORT and CK-C's saved-views pill-vs-tab findings in scope.
- **`getDotColor`/`getActionColor`-shaped functions are independently
  authored per engine per component** — no sharing, confirmed by the full
  §2 table; this generalizes the CK-C/CK-D "existence is not adoption,
  similarity is not sharing" lesson to a third checkpoint.
- **Counter blind spots found in this family, beyond the ones already
  catalogued in the triage**: (1) JS object shorthand hides one real
  STATE-SELECTED site (activity-log modern:74); (2) an inline anonymous
  function return-type annotation (`function f(): { color: string } {`) is
  an 8th shape of the interface/type-body blind spot, over-counting
  assistant's total by 1; (3) SVG presentation attributes (`fill=`/`stroke=`
  as bare JSX props, not `style` keys) hide 2 sites in presence, one of them
  genuinely RUNTIME — pushing this family's true RUNTIME count from the
  triage's stated 6 to a corrected 7. None of these change the family's
  headline "98% A" characterization; all of them matter to whoever actually
  migrates the affected files, since none will show up in a post-migration
  `fleet.inlinePaint` diff either way.
- **Zero DaisyUI structural coupling anywhere in this family** (grep-
  confirmed across all 10 files for `btn`/`badge`/`avatar`/`dropdown`/
  `menu`/`chat`/`alert`/`steps`/`card`/`join` class tokens) — CK-F is,
  along with CK-D, one of the two cleanest checkpoints inventoried so far on
  this axis; no Steps/FloatButton-shaped "paint that was never inline"
  problem exists here.
- **No `data-part` anywhere in this family** (grep-confirmed, all 10 files)
  — every component is greenfield for anatomy, matching every other
  checkpoint inventoried under WO-06 so far.

---

## Final report

**Totals (272 counted sites)**: **STATIC 238 · STATE-SELECTED 30 · RUNTIME
3** (comment-thread modern 2/54/0, comment-thread rustic 2/23/0,
notification-center modern 9/29/0, notification-center rustic 2/22/0,
activity-log modern 4/28/0, activity-log rustic 2/19/0, live-feed modern
0/22/0, live-feed rustic 0/22/0, assistant 9/6/0 + 1 false-positive,
presence 0/13/3). **Plus 3 counter-blind sites found by hand** (not in the
272): activity-log modern +1 STATE-SELECTED (JS shorthand, line 74),
presence +1 RUNTIME +1 STATIC (SVG `fill`/`stroke` attributes, lines
358/362) — corrected family RUNTIME count is **4**, corrected STATE-SELECTED
is **31**, and assistant's true migratable total is 15 of its 16 counted
(1 is a false-positive type annotation, not paint). Every real
migratable site in this family is STATIC or STATE-SELECTED-by-a-bounded-enum
except presence's genuine per-user identity colors — this checkpoint needs
no B-category exemption and no C-category custom-property hatch beyond what
presence already uses.

**The vocabulary map is the spine, and the answer is six skins, not one.**
No cross-component import exists anywhere in this family (live-feed
modern's use of a DS-wide, non-family-specific DaisyUI-replacement helper is
the sole partial exception). Three of the six components — comment-thread,
notification-center, activity-log — have their modern and rustic engines
independently reinvent the *same* concept with *different* values (§2's
table), and activity-log's divergence is in classification LOGIC, not just
color, which no skin can reconcile. `assistant` and `presence` are not even
structurally comparable to the other four (no engine split, composed from DS
primitives, 8 and 3 independent exports respectively rather than one
component). Treat this checkpoint as ten independent recipes to migrate
under one folder name, not one skin.

**Bridge rules: N/A, cleanly.** Nothing in `theme.css`/`personality.css`
targets any component in this family — the two near-miss grep hits
(`.ant-notification-notice`, `.ds-command-home-message--assistant`) are
same-sounding names for entirely unrelated components, confirmed by reading
the referencing code. No suppression risk to preserve, no dead rule to
avoid reviving.

**Imperative-write count: 0 counted, 1 real-but-uncounted.**
Notification-center/modern's dismiss-button hover uses `.style.opacity =`
(uncounted, `opacity` isn't a paint channel) — live, and the only imperative
mechanism in the family; every other component in CK-F drives its (mostly
absent) interaction state through plain React re-render, not imperative DOM
writes.

**The three biggest traps**:

1. **Live-feed rustic's local `@keyframes pulse` (opacity 1→0.4→1) is not a
   redundant duplicate of the global `@keyframes pulse` (opacity 1→0.5→1) —
   it is a deliberately different value, part of a DS-wide pattern of at
   least 5 other rustic engines making the identical choice, and a migration
   that "cleans up" the apparent duplication by deleting the local one and
   relying on the global will silently change the rendered pulse intensity.
   `detail-panel`'s own test suite already documents the correct fix
   (rename to a namespaced `ds-live-feed-pulse`, don't redefine the global) —
   follow that precedent, and verify empirically which value is live today
   before committing to which one the renamed keyframe should carry.
2. **Activity-log's action-category classification differs in LOGIC, not
   just paint value, between its modern and rustic engines** (5 categories
   with a `system`/warning catch-all vs. 4 categories with no catch-all,
   different verb-matching sets) — the same activity string can render a
   different color per engine today, and no byte-exact skin migration can
   fix or even flatten this; it must be preserved exactly as two independent
   recipes and flagged to the team as a product question, same shape as
   CK-C's saved-views pill-vs-tab finding.
3. **Three independent, previously-uncatalogued counter blind spots** hide
   real paint in this family alone: JS object shorthand (`color,` with no
   colon, activity-log modern:74), an inline function return-type annotation
   miscounted as paint (assistant:157, a false positive rather than a false
   negative — the opposite direction from the other two), and SVG
   `fill=`/`stroke=` JSX attributes (presence:358,362, hiding a 4th genuine
   RUNTIME site the triage's "presence's 3 sites" undercounted). None of
   these will register in a post-migration `fleet.inlinePaint` diff, so a
   migration that trusts the counter's line list instead of reading each
   function will silently leave (or misreport) real work.
