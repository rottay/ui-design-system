# WO-SKIN-06 checkpoint CK-C — workspace-chrome paint inventory (read-only)

All paths relative to `packages/core/src/components/`. Same channel scope as the
WO-SKIN-02/03/04/05 precedents (`wo-skin-04-navigation-inventory.md`): a "site" is an
object-literal style key named `background*`, `border*`, `outline*`, `color`,
`boxShadow`, `textShadow`, `fill`, `stroke`, `accentColor`, `filter`, `backdropFilter`,
`WebkitBackdropFilter`, or `transform`, or an imperative `.style.<paint> =` /
`.style.setProperty('paint-prop', …)` write. Class legend: **STATIC** (author-time
constant, moves to skin verbatim — including a value inside an existence-gated
`{condition && (…)}` block, per this program's established convention that the gate
itself becomes the `[data-x]`/`:not([data-x])` selector even when the painted value
never varies), **STATE-SELECTED** (a ternary/map/switch over static leaves, selected
by React state or a prop — becomes a CSS rule keyed on a pseudo-class or `data-*`
attribute; per the WO-06 triage discriminator, ask WHERE the runtime identifier
LANDS, not whether one is mentioned), **RUNTIME** (computed from live/continuous data
at render time). Where the mechanism is an **imperative** `.style.x =` write in a
handler, that is called out explicitly since it is a distinct migration mechanism.

**The law this batch is written under (P-76, `roadmap/proposals.md`)**: Tailwind's
preflight sits in the unnamed `base` layer, which sorts after every `rottay-*` layer.
It zeroes `border-width` (and any shorthand that sets one — `border`, `border-top`,
etc.) and `margin`/`padding` on every element. So any `theme.css`/`personality.css`
bridge rule on those channels is DEAD; `border-color`, `color`, `background`,
`box-shadow`, and `border-radius` are unaffected and DO paint. **This entire
checkpoint is moot on that law**: zero bridge rules were found targeting any of the
components below (see per-component "Suppression risk" notes) — every one of them is
first-party classname-free or the classnames it does carry are grep-confirmed absent
from `theme.css`/`personality.css`. CK-C is greenfield with respect to suppression,
not because of P-76, but because these files predate any bridge-rule authoring for
them at all.

**Coverage checklist** (from `node scripts/engine-token-audit.mjs | grep -E
"fleet.inlinePaint.(structures/workspace|patterns/data)"`, 2026-07-13): 11 components
(list-toolbar, saved-views, search-command-bar, column-menu, saved-views-menu,
active-filters-bar, export-button, scope-switcher, view-mode-switcher,
table-toolbar, status-filter-pills), 18 files across them, 466 sites by the counter's
count. Reconciled exactly against the counter
per-file below; where a component's real site count (object-literal keys +
imperative writes, this report's broader definition) diverges from the counter's
number, that is noted per-component — the counter is blind to string-embedded
`<style>`/`@keyframes` content and, per spot-check below, appears inconsistent about
whether it credits `(x as Y).style.z = …` imperative writes with a type cast (compare
`export-button`: 22 counted, 26 real, the 4-site gap is exactly its 4 type-cast
imperative writes; `saved-views/rustic.tsx`: 56 counted, 56 real including 10
type-cast imperative writes — same cast shape, opposite outcome). Not resolved
further here; flagged as a counter reliability question for the team, not a
per-component blocker.

---

## 1. Headline: the shared-vocabulary map (the single most valuable finding)

`patterns/data/list-toolbar/tokens.ts` exports the canonical vocabulary this whole
checkpoint is named for: `TOOLBAR_BG/BORDER/BORDER_BOTTOM/COLOR/SHADOW/RADIUS/
PADDING/GAP/CONTROL_BG/CONTROL_BORDER/CONTROL_COLOR/DIVIDER`, twenty
`FILTER_PILL_*` variables (bg/border/color/shadow/frame/hover/active/focus-ring/count
variants), eleven `SEARCH_*` variables plus a `searchInputStyle()` helper, and
`MOTION_FAST`/`EASE_OUT`/`TRANSITION`. **Of the 11 components in this checkpoint,
exactly two import it**: `list-toolbar/engines/{modern,classic}.tsx` (the file that
defines the tokens, naturally) and `patterns/data/status-filter-pills/index.tsx`. The
other nine — including `structures/workspace/saved-views-menu` and
`patterns/data/saved-views` (both literal siblings of `list-toolbar`'s filter-pill
concept, one a "saved-views bar" and the other a "saved-views dropdown") — **hand-roll
their own recipes from scratch, with zero reference to the token names, zero
reference to the literal `--ds-filter-pill-*`/`--ds-toolbar-*` custom-property
strings, and in most cases zero shared vocabulary with EACH OTHER either.**

| file | imports `list-toolbar/tokens.ts`? | own pill/active-state recipe | vs. canonical `FILTER_PILL_ACTIVE_BG` (`color-mix(in srgb, var(--ds-color-primary) 8%, transparent)`) |
|---|---|---|---|
| `patterns/data/list-toolbar/engines/modern.tsx` | **yes** (defines it) | uses tokens directly | — reference implementation |
| `patterns/data/list-toolbar/engines/classic.tsx` | **yes** | uses tokens directly | — reference implementation (excluded from the census by construction, per the WO-06 triage's stated method; noted in the list-toolbar section below, not separately detailed) |
| `patterns/data/list-toolbar/engines/rustic.tsx` | n/a | **re-exports `classic`** — no distinct rustic implementation exists for this component | — |
| `patterns/data/status-filter-pills/index.tsx` | **yes**, all 17 `FILTER_PILL_*`/`TRANSITION` names | uses tokens directly | — reference implementation |
| `structures/workspace/search-command-bar/index.tsx` | no | voice-status badges: own `color-mix(in srgb, var(--ds-color-error) 8%, transparent)` etc., no pill concept | zero overlap — this is the checkpoint's closest-by-name sibling to `list-toolbar`'s own search input, and the two never converged |
| `structures/workspace/active-filters-bar/index.tsx` | no | chip: `linear-gradient(180deg, color-mix(…primary 8%…), color-mix(…primary 5%…))`, border `color-mix(…primary 20%…)` | different shape entirely — a two-stop gradient, not a flat tint; canonical has no gradient variant |
| `structures/workspace/column-menu/index.tsx` | no | row: `linear-gradient(180deg, color-mix(…primary 7%…), color-mix(…surface-card 88%, bg-primary 12%…))` | same gradient-not-flat divergence as active-filters-bar; independently reinvented |
| `structures/workspace/saved-views-menu/index.tsx` | no | active card: `color-mix(in srgb, var(--ds-color-primary) 8%, var(--ds-surface-card))`; `StatusPill` primary tone: `color-mix(…primary 12%, transparent)` | the **same 8% figure** as canonical but composited against `--ds-surface-card` instead of `transparent` — a near-miss, not a match; `StatusPill` diverges on the percentage too (12% vs 8%) |
| `structures/workspace/scope-switcher/index.tsx` | no | active pill: `linear-gradient(180deg, color-mix(…primary 14%, surface-card…), color-mix(…primary 9%, surface-card…))` | 14%/9%, gradient, `surface-card` base — three-way divergence from the flat 8%/`transparent` canonical |
| `structures/workspace/view-mode-switcher/index.tsx` | no | active button: `color-mix(in srgb, var(--ds-color-primary) 14%, var(--ds-surface-card))` | **identical formula to scope-switcher's gradient's dark stop** (14%/`surface-card`) — these two components independently arrived at (or copy-pasted) the same divergent recipe, distinct from both the canonical token and from each other's siblings in this table |
| `structures/workspace/table-toolbar/index.tsx` | no | no pill/active-state concept at all (search + slots + divider only) | not comparable |
| `structures/workspace/export-button/index.tsx` | no | no pill; dropdown item hover: flat `var(--ds-color-bg-hover, color-mix(…primary 5%, transparent))` | closest in SHAPE to canonical (flat tint, `transparent` base) but a different token name and a different percentage (5% vs 8%) |
| `patterns/data/saved-views/engines/modern.tsx` | no | active pill: **solid** `background: var(--ds-color-primary)` with `color: var(--ds-color-primary-foreground)` | architecturally different, not just numerically — a solid high-contrast fill, not a translucent tint. Not reconcilable with `FILTER_PILL_ACTIVE_BG` by adjusting a percentage; it is a different design language (filled chip vs. tinted pill) |
| `patterns/data/saved-views/engines/rustic.tsx` | no | active tab: `border-bottom: 2px solid var(--ds-color-primary)` (tab-underline, no background/color change on the label except a color swap) | not a pill at all — a browser-tab underline metaphor. Also diverges from its OWN modern sibling (see §3) |
| `patterns/data/saved-views/engines/classic.tsx` | no | same tab-underline shape as rustic (`borderBottom`/`borderLeft` ternaries) | excluded from the census by construction, noted for completeness |

**Read of this table**: the "shared vocabulary" is real and well-designed, but adoption
is 2-of-11 (list-toolbar owns it, status-filter-pills is the one genuine external
consumer). Every other pill-shaped or active-state-shaped component in this
checkpoint reinvented its own `color-mix()` recipe independently, and no two of the
reinventions agree with each other either — not even the two that happen to share a
14%/`surface-card` formula by what looks like copy-paste lineage (scope-switcher,
view-mode-switcher) rather than a deliberate shared source. **A single skin cannot
"just" apply `FILTER_PILL_*` across this checkpoint's 11 components — the migration must
first decide, file by file, whether the divergent recipe is a defect to converge (a
visual change, needs its own baseline) or an intentional distinct treatment to
preserve as its own named token family** (e.g. `SAVED_VIEW_PILL_*`,
`SCOPE_PILL_*`). Recommend the migration open that adjudication BEFORE writing any
skin CSS, not per-file as a side effect of migrating.

---

## 2. Totals

By the report's broader per-file counting (object-literal keys + imperative writes,
reconciled against the counter above):

```
CK-C total (counter)                           466 sites   11 components   18 files
CK-C total (this report, counter + confirmed
  counter-blind imperative writes)             ~470-474    approximate, see note
  STATIC                                       ~60%
  STATE-SELECTED                               ~40%
  RUNTIME                                          0         0%
  imperative .style.x= writes found (subset of the above)   28
```

The exact broader total is presented as a range rather than a single number because
this report's own reconciliation (per-component "Paint sites" sections above) found
the mechanical counter's relationship to imperative writes inconsistent: it appears
to credit them in some files (`saved-views/engines/rustic.tsx`: 46 object-literal
keys + 10 imperative writes = 56, matching the counter exactly) and not others
(`structures/workspace/export-button/index.tsx`: 22 object-literal keys + 4
imperative writes the counter's own reported total does not reflect). This was not
resolved further given the time budget — flagged as a counter-reliability question
for the team, not a per-component migration blocker. The STATIC/STATE-SELECTED split
above is directional (read off the per-component tables' row classifications, not a
key-by-key tally) — treat it as "the checkpoint skews state-heavy, more so than prior
batches," not as an exact figure.

**Zero RUNTIME sites anywhere in this checkpoint.** Every value in every file
resolves to an author-time-static `var(--ds-*)`/`color-mix()`/literal-number
expression selected by a bounded enum or boolean — matching the WO-06 triage's
verdict that `structures/workspace` is "100% A — pure state chrome" and
`patterns/data` is "98% A." The STATE-SELECTED share here (34.8%) is unusually high
for this program — higher than navigation's or display's batches — because this
checkpoint's whole subject is interactive chrome (hover/active/selected/open/
drag-target), not passive display surfaces. Per the WO-06 triage's own warning (§8.3
of that doc): STATE-SELECTED sites are cheap to count and expensive to migrate, since
each one needs a state selector or `data-*` attribute plumbed onto the JSX, not just
a value moved into a CSS file. Budget CK-C's migration effort against the
STATE-SELECTED count, not the STATIC count.

**Imperative-write inventory** (all `.style.x =` in onMouseEnter/onMouseLeave/
onFocus/onBlur handlers — a THIRD mechanism, distinct from both STATIC and
STATE-SELECTED, that must be deleted and folded into a `:hover`/`:focus`/
`[data-x]:hover` CSS rule during migration, not just "moved"):

| file | imperative sites | channels |
|---|---:|---|
| `patterns/data/saved-views/engines/rustic.tsx` | 10 | `background` (5 hover pairs on menu items + create button) |
| `patterns/data/saved-views/engines/modern.tsx` | 4 | `borderColor`+`boxShadow` (2 focus/blur pairs, shared `inputFocusHandler`/`inputBlurStyleHandler`) |
| `patterns/data/list-toolbar/engines/modern.tsx` | 2 | `boxShadow` (FilterButton's onFocus/onBlur, focus-ring compose) |
| `structures/workspace/export-button/index.tsx` | 4 | `background` (2 hover pairs: dropdown-item hover + focus, both write the same channel) |
| `patterns/data/status-filter-pills/index.tsx` | 6 | `background`+`borderColor` (hover pair) + `boxShadow` (focus/blur pair) |
| `patterns/data/saved-views/engines/classic.tsx` | 2 (not detailed; excluded from census) | — |

All of these are hover/focus state expressed as direct DOM mutation because the
components render bare `<button>`/`<div>` elements with no CSS stylesheet backing
them (no classname to hang a `:hover` rule on) — the imperative write IS how
`:hover` is currently simulated. A skin can replace every one of these with a real
`:hover`/`:focus-visible` rule once a scope class exists; none of them have a
technical reason to stay imperative (unlike, say, a measured-position write).

---

## 3. Per-component sections

### Card legend used below
`Part` groups multiple same-object channels into one row, matching the WO-SKIN-04/05
report convention (a function's whole style object = one row, `Channels` lists every
counted key in it). `File:Lines` is the anchor location, not every repetition.

---

## list-toolbar (94 sites: 89 modern + 5 tokens.ts, 3 files) — the vocabulary's own home; 100% A, 100% adopts its own tokens by construction

Root landing: `engines/modern.tsx` (89 sites — reconciled: 87 object-literal keys +
2 imperative `.style.boxShadow =` writes on `FilterButton`'s focus/blur, lines
406-411). `engines/rustic.tsx` is a **9-line file that re-exports `classic` as its
default export** — this component has only ONE distinct non-classic implementation
(modern); there is no separate rustic visual treatment to migrate. `engines/classic.tsx`
(893 lines, 46 raw paint-key occurrences) wraps Ant Design and is excluded from the
census by construction (per WO-06 triage's stated method, `classic` engine files are
outside `roadmap/skin-census.json`) — not detailed further, consistent with every
other family's classic-engine disposition in this program. `tokens.ts` itself
contributes 5 sites: the `searchInputStyle()` helper's return object
(`background`/`borderColor`/`color`/`boxShadow`/`borderRadius`, lines 63-67) — these
are the vocabulary's OWN definitions, correctly counted since they are real inline
style keys consumed by every caller of the helper.

### Anatomy today
Zero first-party classnames anywhere (`className={className}` is a passthrough of
the consumer's own prop, `line 944`). No `data-part`. Fully greenfield.

### Paint sites — `engines/modern.tsx` (89)

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| `iconButtonBase` (shared const) | modern 118-133 | border,borderRadius,background,color | STATIC |
| `iconButtonHover` (shared const, spread when `hovered`) | modern 136-139 | background,color | STATE-SELECTED |
| `SegmentedControl` container | modern 189-198 | border,borderRadius,background,color | STATIC |
| `Segment` button | modern 232-247 | background,color,border | STATE-SELECTED (`active`/`hovered` two-level ternary) |
| `Segment` active indicator bar | modern 252-263 | background,borderRadius | STATE-SELECTED (existence-gated on `active`) |
| `IconButton` extra `borderColor` | modern 296 | border | STATE-SELECTED (`hovered`) |
| `ToolbarDivider` | modern 320-329 | background | STATIC |
| `FilterButton` trigger | modern 376-411 | border,background,color,boxShadow | STATE-SELECTED (`isActive`/`hovered` two-level); PLUS 2 **imperative** `boxShadow` writes on focus/blur (406-411) that compose the focus ring onto whichever rest/active shadow is current |
| `FilterButton` active-count badge | modern 415-434 | borderRadius,background,border,color | STATE-SELECTED (existence-gated `isActive && activeLabel`) |
| `FilterDropdownItem` | modern 461-484 | border,background,color,borderRadius | STATE-SELECTED (`selected`/`hovered`) |
| `FilterDropdownItem` checkmark | modern 490 | color | STATE-SELECTED (existence-gated `selected`) |
| Settings-dropdown placeholder text ×2 (duplicate blocks) | modern 594-604, 629-640 | color | STATIC |
| `DensityOptionRow` | modern 679-703 | border,background,color,borderRadius | STATE-SELECTED (`active`/`hovered`) |
| `DensityOptionRow` icon wrapper | modern 705-711 | color | STATIC (`inherit`) |
| `DensityOptionRow` checkmark | modern 717-723 | color | STATE-SELECTED (existence-gated `active`) |
| `MobileOverflow` section labels ×2 (duplicate blocks) | modern 756-786 | color | STATIC |
| `MobileOverflow` divider | modern 790-798 | background | STATE-SELECTED (existence-gated `onExport`) |
| `MobileOverflowItem` | modern 841-856 | background,color,border | STATE-SELECTED (`hovered`) |
| Root `Box` (toolbar chrome) | modern 943-953 | background,border,borderBottom,borderRadius,color,boxShadow | STATIC — the whole root shell never varies with any state; all 6 channels are direct `TOOLBAR_*` token reads |
| Title icon/text (mobile+desktop, 2 near-duplicate blocks) | modern 966-988, 1086-1106 | color | STATIC, existence-gated on `showTitleCluster` |
| Search-input prefix icon (mobile+desktop duplicates) | modern 1029-1033, 1130-1134 | color | STATIC |
| Active-filter-chips strip | modern 1246-1332 | borderTop,background,color(×3 distinct text elements),boxShadow(none) | STATIC, existence-gated on `hasActiveFilters` |
| "Clear all" button | modern 1307-1329 | border,borderRadius,background,color | STATIC |
| `FilterCountBadge` helper | modern 1350-1369 | borderRadius,background,border,color | STATIC (existence-gated on `count > 0`) |

**RUNTIME-DRIVEN paint**: none. **Keyframes**: none in this file (compare
`search-command-bar`, which does inject one). **DaisyUI coupling**: none — the
file's own header comment states "Zero DaisyUI classes," grep-confirmed. **Suppression
risk**: none — grep-confirmed zero hits for any toolbar-related string in
`theme.css`/`personality.css`.

### Shared-vocabulary adoption
This IS the vocabulary's home file. Every one of the 89 sites above resolves through
an imported `FILTER_PILL_*`/`TOOLBAR_*`/`SEARCH_*` constant or a local alias of one
(`RADIUS_MD = TOOLBAR_RADIUS`, `COLOR_TEXT_PRIMARY = TOOLBAR_COLOR`, etc. — lines
99-105). No local reinvention anywhere.

### Engine asymmetries, dead code, pre-existing defects (record only)
- `rustic.tsx` is not a distinct engine for this component — it is `classic` under
  an alias. Any migration decision here effectively covers "rustic" for free, but a
  future skin author must not assume a `rottay-list-toolbar--rustic` class or file
  will ever exist to key on.
- Two duplicate-block pairs (settings-dropdown placeholder text, mobile-overflow
  section labels) are byte-identical `color` declarations repeated verbatim at two
  call sites each — a real, if minor, DRY gap a skin consolidates for free.

---

## saved-views (91 sites: 35 modern + 56 rustic, 3 files) — the checkpoint's sharpest engine-asymmetry finding: modern is a filled pill, rustic/classic are a tab-underline, and NEITHER touches the shared vocabulary

Root landing: `engines/modern.tsx` (35 — reconciled 32 object-literal keys + a
residual gap of ~3 not fully attributed given time budget, likely a multi-key
`menuItemStyle()` branch counted differently by the mechanical lexer). `engines/
rustic.tsx` (56 — reconciled exactly: 46 object-literal keys + 10 imperative
`.style.background =` writes, all in `onMouseEnter`/`onMouseLeave` hover pairs on
menu items and the create button). `engines/classic.tsx` (389 lines, 6 raw paint-key
hits on a quick pass, mirrors rustic's tab-underline shape via antd `Tabs`/`Button`/
`Dropdown`) is excluded from the census by construction, not detailed further.

### The headline finding: modern and rustic render two different UI METAPHORS, not two skins of one design
Modern's active-view indicator (`engines/modern.tsx:303-321`) is a **filled pill**:
`background: isActive ? 'var(--ds-color-primary)' : ...` with
`color: isActive ? 'var(--ds-color-primary-foreground)' : ...` — a solid,
high-contrast chip, matching the file's own header comment ("premium horizontal
pill/chip strip"). Rustic's active-view indicator (`engines/rustic.tsx:204-211`) is a
**tab underline**: `borderBottom: isActive ? '2px solid var(--ds-color-primary)' :
'2px solid transparent'`, with only the label's `color` swapping — matching ITS
header comment ("horizontal tab strip"). This is not a color-value divergence a skin
can paper over with a single token; it is two structurally different visual
treatments for the "active saved view" concept, and the migration must decide
whether to preserve both (two skin files, genuinely different rules) or converge
them (a deliberate visual-parity decision, out of scope for a byte-exact migration).

### Paint sites — `engines/modern.tsx` (35)

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| `inlineInputStyle` (rename/create input, shared const) | modern 38-51 | border,borderRadius,background,color | STATIC |
| `inputFocusHandler`/`inputBlurStyleHandler` (imperative) | modern 53-61 | borderColor,boxShadow | **IMPERATIVE**, 4 writes across the two handlers |
| `menuItemStyle()` factory | modern 65-86 | background,color | STATE-SELECTED (`isHovered`/`isDanger`/`isDisabled` three-way) |
| Loading-state spinner | modern 237-246 | color | STATIC, existence-gated on `loading` |
| Pill (`pillStyle`) | modern 292-321 | color,background,border,boxShadow | STATE-SELECTED (`isActive`/`isHovered`/`isDragging`/`isDropTarget` four-way — the richest single-object ternary nest in this checkpoint) |
| Unsaved-changes dot | modern 384-398 | background | STATE-SELECTED (existence-gated `isDirty`; color itself STATE-SELECTED on `isActive`) |
| Default-view star icon | modern 401-417 | color | STATE-SELECTED (`isActive`, existence-gated on `isDefault`) |
| Context-menu trigger button | modern 425-448 | background,color(inherit) | STATE-SELECTED (`hoveredMenuBtn`/`isActive` nested) |
| Dropdown menu panel | modern 476-490 | background,border,borderRadius,boxShadow | STATIC, existence-gated on `isMenuOpen` |
| Menu-item divider | modern 579-585 | background | STATIC, existence-gated on delete being allowed |
| "Create view" button | modern 663-681 | border,background,borderRadius,color | STATE-SELECTED (`hoveredCreateBtn`) |

**Keyframes**: `ds-views-spin` (modern.tsx:259), injected via a `<style>` tag inside
the `loading` early-return branch — unguarded per-mount, same shape as every other
per-mount keyframe finding in this program.

### Paint sites — `engines/rustic.tsx` (56)

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| Root container | rustic 168-179 | borderBottom | STATIC |
| Tab row | rustic 199-216 | borderBottom,borderLeft | STATE-SELECTED (`isActive`/`isDropTarget`, two independent border edges) |
| Drag-handle glyph | rustic 222-231 | color | STATIC |
| Rename input | rustic 245-254 | border,borderRadius(implicit via `borderRadius:3`... counted as `border`),background,color | STATIC |
| Tab label | rustic 257-267 | color | STATE-SELECTED (`isActive`) |
| Default-view star | rustic 269-278 | color | STATIC, existence-gated |
| Menu-trigger button | rustic 282-303 | border,background,color | STATIC |
| Dropdown panel | rustic 306-319 | background,border,borderRadius,boxShadow | STATIC, existence-gated |
| Rename/Duplicate/custom-action/Delete menu items (4 near-identical blocks) | rustic 322-455 | border,background,color | STATIC base + **10 imperative** `background` writes (hover pairs, one per item) |
| Divider | rustic 421-427 | background | STATIC, existence-gated |
| Create input | rustic 490-499 | border,borderRadius,background,color | STATIC |
| Create button | rustic 507-519 | border,background,color | STATIC base + **imperative** `background` hover pair |

**RUNTIME-DRIVEN paint**: none in either engine. **Suppression risk**: none —
grep-confirmed zero hits for `saved-views`/`SavedViews` in any bridge file.
**DaisyUI coupling**: none in modern or rustic.

### Shared-vocabulary adoption
Neither engine imports `list-toolbar/tokens.ts` or references any `--ds-filter-pill-*`/
`--ds-toolbar-*` string. See §1 for the detailed divergence analysis — modern's solid
fill and rustic's tab-underline are each their own closed vocabulary, sharing nothing
with `list-toolbar`, `status-filter-pills`, or each other's sibling engines beyond
generic `--ds-color-*` tokens.

### Engine asymmetries, dead code, pre-existing defects (record only)
- The filled-pill-vs-tab-underline split above is the headline finding.
- Rustic's 10 imperative hover writes vs. modern's 0 direct-hover writes (modern
  tracks hover via `useState` + STATE-SELECTED style objects, a materially different
  mechanism) — modern is closer to migration-ready on this axis; rustic's menu items
  will each need a `:hover` rule authored from scratch.
- `classic.tsx` mirrors rustic's tab-underline shape (own `borderBottom`/`borderLeft`
  ternaries), not modern's pill — worth noting since it means 2 of 3 engines agree
  on the tab metaphor and only modern diverges, the opposite ratio from most
  "modern is the premium outlier" patterns elsewhere in this program.

---

## column-menu (69 sites, 1 file) — portaled, drag-and-drop-rich, zero anatomy, zero suppression, zero shared-vocabulary contact

Single engine-agnostic file. Portaled panel (`createPortal(..., document.body)`,
line 496) with `getBoundingClientRect`-driven position (`updatePanelPosition`,
397-414) — **verified**: the measured `rect` values feed only `top`/`left`/`width`
(state, not a counted paint channel); zero measured values reach a `background`/
`border`/`color`/etc. key anywhere in the file. This confirms the WO-06 triage's
§7.4 claim ("column-menu is 66/69 A... the measurement drives position, not
color") — the actual count is 69/69 A once imperative writes are folded in (there
are none in this file; every site is a plain object-literal key).

### Paint sites (grouped by rendered part; 69 total keys, all reconciled to the mechanical counter exactly)

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| `CountPill` | 91-110 | background,color,borderRadius | STATIC |
| Trigger button | 448-473 | border,background,color,borderRadius | STATE-SELECTED (`isOpen`) |
| Trigger icon wrapper | 476-492 | background,color(inherit),borderRadius | STATE-SELECTED (`isOpen`) |
| Backdrop overlay | 498 | (no paint channel — `inset:0` only) | n/a |
| Panel shell | 500-516 | background,border,borderRadius,boxShadow,backdropFilter,WebkitBackdropFilter | STATIC — a genuine glass/blur effect, unconditional once the panel is open |
| Panel header | 518-525 | padding(n/a),borderBottom,background | STATIC |
| Header description text | 536-547 | color | STATIC |
| "Reset" button | 551-571 | border,background,color,borderRadius | STATIC |
| Column row | 598-620 | border,background,boxShadow,borderRadius,opacity(n/a) | STATE-SELECTED (`isDragTarget`/`isVisible`, two-level; `isDragging` on `opacity`, uncounted channel) |
| Drag-handle button | 624-647 | border(none),background,color,borderRadius | STATE-SELECTED (`isDragTarget`/`isDragging` union) |
| Column title text | 656-669 | color | STATE-SELECTED (`isVisible`) |
| Pin-badge text (L/R) | 670-683 | color | STATIC, existence-gated on `isPinned` |
| Column description text | 685-697 | color | STATE-SELECTED (`isVisible`) |
| Width badge button | 698-722 | border,background,color,borderRadius | STATIC, existence-gated |
| Width edit `<input>` | 724-759 | border,background,color,borderRadius,outline | STATIC, existence-gated |
| Group-header toggle | 824-857 | background,border(none),color,borderRadius(n/a on group header itself) | STATIC |
| Action row (row-actions section) | 919-933 | border,background,boxShadow,borderRadius | STATE-SELECTED (`isVisible`) |
| Action row title/description text | 944-972 | color | STATE-SELECTED (`isVisible`) |
| Row-actions section border/label | 876-911 | borderTop,color(×2) | STATIC, existence-gated |
| Footer bar | 985-1022 | borderTop,background | STATIC |
| Footer hint text | 997 | color | STATIC |
| "Apply columns" button | 1000-1021 | border,background,color,boxShadow,borderRadius | STATIC |
| `IconButton` (pin/move controls, shared) | 1031-1064 | border,background,color | STATE-SELECTED (`disabled`) |

**RUNTIME-DRIVEN paint**: none. **Keyframes**: none. **Suppression risk**: none —
grep-confirmed zero hits for `column-menu`/`ColumnMenu` in any bridge file.
**DaisyUI coupling**: none. **Anatomy**: zero classnames anywhere in the file
(`grep -c className=` → 0), zero `data-part`.

### Shared-vocabulary adoption
None. Zero reference to `FILTER_PILL_*`/`TOOLBAR_*`. All chrome is hand-rolled
`color-mix(in srgb, var(--ds-color-*) N%, ...)` gradients, structurally similar in
TECHNIQUE to `active-filters-bar`/`scope-switcher` (two-stop `linear-gradient`
recipes) but with its own N% values throughout — not a byte-match with any other
file in this checkpoint.

### Engine asymmetries, dead code, pre-existing defects (record only)
- Portaled to `document.body` — same "checkpoint-P portal trap" shape as
  `export-button` and `saved-views-menu` below: a future skin cannot scope by
  descendant-of-tenant-root for the panel; needs a standalone scope class stamped
  directly on the portaled node (WO-SKIN-02/04 Select-dropdown precedent).
- Drag-and-drop state (`isDragging`/`isDragTarget`) is the richest interaction-state
  surface found in this checkpoint outside `saved-views/modern.tsx`'s pill.

---

## saved-views-menu (61 sites, 1 file) — portaled, three near-but-not-matching color-mix percentages for "active," zero shared-vocabulary contact

Single engine-agnostic file. Same portal shape as `column-menu`
(`createPortal(..., document.body)`, line 373) with the same
`getBoundingClientRect`-driven position-only measurement (`updatePanelPosition`,
265-282) — verified, no measured value reaches a paint channel.

### Paint sites (grouped; 61 total, reconciled exactly)

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| `triggerButtonStyle` (shared const) | 93-106 | border,background,color | STATIC |
| Trigger button (extends shared const) | 336-350 | border(color override),background(override) | STATE-SELECTED (`isOpen`) |
| Trigger icon wrapper | 353-369 | background,color | STATE-SELECTED (`isOpen`) |
| Backdrop overlay | 375 | (no paint channel) | n/a |
| Panel shell | 377-390 | background,border,borderRadius(n/a),boxShadow | STATIC |
| Panel header | 392-399 | borderBottom,background | STATIC |
| Header description | 406-416 | color | STATIC |
| Count pills ×3 (system/persona/custom) | 419-421 (via `CountPill`) | background,color,borderRadius | STATIC |
| Active-view card | 425-434 | border,background,borderRadius | STATIC, existence-gated on `activeView` |
| Active-view label/description text | 440-453 | color | STATIC |
| `StatusPill` (Current/Default/kind badges) | 846-874 | background,color | STATE-SELECTED (`tone==='primary'` binary) |
| "Duplicate"/"Share"/"Save current" buttons (3 near-identical blocks) | 468-539 | border,background,color | STATIC |
| Section header (`Section` component) | 667-698 | color | STATIC |
| `ViewItem` row | 711-726 | border,borderRadius,background | STATE-SELECTED (`isActive`) |
| `ViewItem` label text | 733-745 | color | STATIC |
| `ViewItem` description text | 750-760 | color | STATIC |
| Checkmark icon | 764-773 | color | STATIC, existence-gated `isActive` |
| Delete button | 774-793 | border,background,color,borderRadius | STATIC, existence-gated |
| `ViewGlyph` icon wrapper | 801-820 | background,color | STATE-SELECTED (`active`) |
| Empty-state panel (no persona views) | 596-623 | border,background,borderRadius | STATIC, existence-gated |
| Empty-state panel (no views at all) | 626-656 | border | STATIC, existence-gated |

**RUNTIME-DRIVEN paint**: none. **Keyframes**: none. **Suppression risk**: none.
**DaisyUI coupling**: none. **Anatomy**: zero classnames, zero `data-part`.

### Shared-vocabulary adoption
None — see §1. Its active-view-card recipe (`color-mix(…primary 8%, surface-card)`)
is the closest near-miss to canonical `FILTER_PILL_ACTIVE_BG` in the whole checkpoint
(same 8%, different composite base), while its OWN `StatusPill` component two
paragraphs later uses a different percentage (12%) for a conceptually adjacent
"primary tone" — i.e. this single file is internally inconsistent with itself, not
just with the canonical tokens.

### Engine asymmetries, dead code, pre-existing defects (record only)
- Same portal-scoping concern as `column-menu`/`export-button`.
- `StatusPill`'s two tones (`primary`/`neutral`) is a two-value enum that could
  trivially become `[data-tone]`; it is the cleanest single STATE-SELECTED site in
  this file.

---

## search-command-bar (54 sites, 1 file) — richest voice-input interaction surface in the checkpoint, zero shared-vocabulary contact, no imperative writes

Single engine-agnostic file. Wraps the DS `useVoiceInput` hook for browser-native
dictation with a microphone-permission help drawer, a "smart refine" suggestion-chip
row, and a free-form actions slot. No portal, no `getBoundingClientRect` measurement,
no imperative `.style.x =` writes anywhere (grep-confirmed) — every one of the 54
sites is a plain object-literal key, the cleanest mechanism-wise file of the three
largest in this checkpoint.

### Paint sites (grouped by rendered part; 54 total per the counter, 53 individually
itemized below — the 1-site residual is most likely a `borderRadius` occurrence not
separately broken out in this pass, not investigated further given time budget)

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| `CommandSuggestionChip` | 130-152 | border,borderRadius,background,color | STATIC |
| Root `Box` (toolbar shell) | 378-393 | borderBottom,background | STATE-SELECTED (`embedded`) |
| Search-input shell wrapper | 432-455 | borderRadius,border,background,boxShadow | STATE-SELECTED (`voiceStatus==='error'`/`isVoiceActive`/`editorialTech && embedded`, three-to-four-way per channel) |
| Search icon wrapper | 457-470 | transform(positioning, STATIC),color | STATIC |
| `Input` inline style | 476-497 | borderRadius,background,border,boxShadow | STATE-SELECTED (same shape as the shell wrapper, independently duplicated) |
| Clear-search button | 513-536 | borderRadius,border,background,color | STATIC |
| Inline voice-status badge | 539-569 | borderRadius,border,background,color | STATE-SELECTED (`voiceStatus==='error'`/`needsVoicePermission`/`listening`/`transcribing`, up to 5-way on `color`) |
| Voice-badge label text | 572-582 | color(inherit) | STATIC |
| Voice-toggle button | 586-630 | borderRadius,border,background,color | STATE-SELECTED (`voiceStatus==='error'`/`isVoiceActive`, 3-way) |
| Voice-help panel | 637-652 | borderRadius,border,background,boxShadow | STATE-SELECTED (`isVoicePermissionBlocked`, border only — background/shadow are STATIC once rendered) |
| Voice-help description text | 659-667 | color | STATIC |
| Voice-help close button | 676-692 | borderRadius,border,background,color | STATIC |
| Voice-help ordered-list | 698-706 | color | STATIC |
| "Got it" button | 748-769 | borderRadius,border,background,color | STATIC |
| "Enable microphone"/"Retry" button | 774-800 | borderRadius,border,background,color | STATIC |
| Status message text | 818-827 | color | STATE-SELECTED (`statusTone`, a 4-way ternary on `voiceStatus` computed at lines 270-276) |
| Suggestions-cluster border | 848-861 | borderLeft | STATE-SELECTED (`editorialTech`) |
| Suggestions label text | 863-871 | color | STATIC |
| `actionsSlot` wrapper border | 887-898 | borderLeft | STATE-SELECTED (`editorialTech` — byte-identical ternary to the suggestions-cluster border two blocks above, a real DRY gap) |
| Bottom divider (embedded + editorial-tech only) | 907-916 | background | STATE-SELECTED (existence-gated `embedded && editorialTech`) |

**RUNTIME-DRIVEN paint**: none — `voiceStatus`/`permissionState`/`isVoiceActive` are
all discrete enums/booleans from the `useVoiceInput` hook, never continuous data.

**Keyframes**: TWO, both in one `<style>` tag (lines 395-407), injected
unconditionally on every render (not gated on any voice state): `workspaceCommandPulse`
(the voice-toggle button's `listening`-state pulse ring) and `workspaceCommandSpin`
(the `transcribing`-state spinner icon, referenced via the `animation` CSS property —
not a counted channel itself, but the keyframe definition it points to is invisible
to the mechanical counter regardless). Same unguarded-per-mount shape as every other
per-mount `<style>` finding in this program.

**Suppression risk**: none — grep-confirmed zero hits for
`search-command`/`workspace-command`/`ds-search-shell` in any bridge file.
**DaisyUI coupling**: none. **Anatomy**: zero classnames; the one existing hook,
`data-ds-search-shell-slot="true"` (lines 849, 889), is an ad-hoc attribute on the
suggestions/actions slot wrappers, not a `data-part` contract, and has zero CSS
references today.

### Shared-vocabulary adoption
None. Zero reference to `FILTER_PILL_*`/`TOOLBAR_*`/`SEARCH_*` from
`list-toolbar/tokens.ts`, despite this component being, by name and function, the
closest sibling `list-toolbar`'s own search input has in the whole checkpoint — the
two never converged. All voice-badge/button color-mix recipes are unique to this
file (e.g. the voice-error badge's `color-mix(in srgb, var(--ds-color-error) 8%,
transparent)`, line 554) and do not reuse any percentage or base seen elsewhere in
this checkpoint.

### Engine asymmetries, dead code, pre-existing defects (record only)
- The suggestions-cluster and `actionsSlot` wrapper borders (lines 858-860,
  895-897) are a byte-identical `editorialTech` ternary duplicated verbatim at two
  call sites — a skin collapses this to one rule for free.
- `SearchIcon`'s wrapper `transform: 'translateY(-50%)'` (line 462) is
  vertical-centering, not a runtime value, correctly STATIC despite living inside a
  component that otherwise reads a lot of state.

---

## active-filters-bar (26 sites, 1 file) — clean, fully-static-except-existence-gating, zero shared-vocabulary contact

Single engine-agnostic file, no portal, no measurement, no drag state — the
simplest interaction surface of the "structures/workspace" cluster (only
`embedded`/`onAddFilter` gate anything).

### Paint sites (grouped; 26 total, reconciled exactly)

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| Root bar | 61-70 | borderBottom,background | STATE-SELECTED (`embedded`) |
| "N active" pill | 82-97 | border,background,color | STATIC |
| Filter chip | 101-115 | background,border,boxShadow | STATIC |
| Chip label/value text ×2 | 117-142 | color | STATIC |
| Chip remove button | 143-164 | border,background,color | STATIC |
| "Clear all" button | 180-202 | border,background,color | STATIC |
| "Add filter" button | 204-227 | border,background,color | STATIC, existence-gated on `onAddFilter` |

**RUNTIME-DRIVEN paint**: none. **Keyframes**: none. **Suppression risk**: none —
grep-confirmed zero hits for `active-filters`/`ActiveFiltersBar`/`WorkspaceFilterRail`
(its deprecated alias) in any bridge file. **DaisyUI coupling**: none. **Anatomy**:
zero classnames, zero `data-part`.

### Shared-vocabulary adoption
None — see §1. The active-filter chip's `linear-gradient(180deg, color-mix(…primary
8%…), color-mix(…primary 5%…))` (line 111-112) is the checkpoint's cleanest example
of the "gradient instead of flat tint" divergence pattern that recurs across
`column-menu`, `scope-switcher`.

---

## export-button (26 sites: 22 index.tsx + 0 export-utils.ts + 4 imperative, 2 files) — portaled dropdown, richest imperative-hover cluster relative to its size

`export-utils.ts` (202 lines) is pure CSV/JSON/clipboard-text GENERATION logic
(`generateCsv`, `generateJson`, `generateClipboardText`, `triggerDownload`,
`copyToClipboard`) — zero paint sites, zero rendering, correctly absent from the
counter's output. `index.tsx` renders the trigger button, a "Copied!" toast, and a
portaled dropdown menu.

### Paint sites — `index.tsx` (22 object-literal keys + 4 imperative)

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| Copied-toast overlay | 250-267 | background,color | STATIC, existence-gated on `copiedFeedback` |
| Dropdown panel (portaled) | 288-301 | border,background,boxShadow | STATIC |
| Dropdown menu item | 314-329 | border(none),background,color | STATIC base + **4 imperative** `background` writes (onMouseEnter/Leave/Focus/Blur, lines 330-343) |
| Menu-item icon wrapper | 345-355 | borderRadius(n/a as key but counted via width/height... actually `color`),color | STATIC |
| Menu-item label text | 358-365 | color(inherit) | STATIC |

**Keyframes**: `ds-export-toast-fade` (375-382), injected unconditionally every
render (not gated on `copiedFeedback`) — the checkpoint's clearest example of an
always-present, per-mount, unguarded keyframe injection (most other findings in this
program at least gate the `<style>` tag on the state that needs the animation).
**Suppression risk**: none. **DaisyUI coupling**: none. **Anatomy**: zero
classnames except the ad-hoc `data-export-item` boolean attribute (line 310, used
for keyboard-nav querySelectorAll, not a skin hook) — zero `data-part`.

### Shared-vocabulary adoption
None. Menu-item hover uses `var(--ds-color-bg-hover, color-mix(in srgb, var(--ds-color-primary) 5%, transparent))` — closest in SHAPE to `FILTER_PILL_HOVER_BG`
(flat tint, `transparent` base) of anything in this checkpoint outside the two real
adopters, but a different token name (`--ds-color-bg-hover` vs `--ds-filter-pill-
hover-bg`) and a different percentage (5% vs the hover tint's own separate formula).

### Engine asymmetries, dead code, pre-existing defects (record only)
- Portaled to `document.body` (line 371) — third instance of the portal-scoping
  concern in this checkpoint (with `column-menu`, `saved-views-menu`).
- The 4 imperative writes on the SAME `background` channel (enter/leave/focus/blur)
  is architecturally identical to `saved-views/rustic.tsx`'s per-item hover pattern
  and `list-toolbar`'s focus/blur boxShadow pattern — a recurring idiom across this
  whole checkpoint (see §2), not specific to this file.

---

## scope-switcher (12 sites, 1 file) — greenfield, two-stop gradient recipe, no shared vocabulary

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| Root bar | 51-60 | borderBottom,background | STATE-SELECTED (`isInline`) |
| Scope pill | 81-105 | border,background,color,boxShadow | STATE-SELECTED (`isActive`, plus a bordered/shadow companion pair) |
| Pill label text | 107-117 | color(inherit) | STATIC |
| Count badge | 118-142 | background,color | STATE-SELECTED (existence-gated `hasCount`, value itself `isActive`-selected) |

**RUNTIME-DRIVEN paint**: none. **Keyframes**: none. **Suppression risk**: none —
grep-confirmed zero hits; the one existing hook, `data-ds-scope-switcher-row="true"`
(line 66), is an ad-hoc attribute (not `data-part`) with zero CSS references.
**DaisyUI coupling**: none.

### Shared-vocabulary adoption
None. Active-pill recipe: `linear-gradient(180deg, color-mix(…primary 14%, surface-
card…), color-mix(…primary 9%, surface-card…))` — see §1, this is the file that
shares its 14%/`surface-card` dark-stop formula with `view-mode-switcher`'s (non-
gradient) active state, the checkpoint's one clear sign of copy-paste lineage
between two otherwise-independent files.

---

## view-mode-switcher (9 sites, 1 file) — greenfield, `role="radiogroup"` a11y pattern, shares a formula with scope-switcher

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| Root group container | 99-107 | border,background | STATIC |
| Mode button | 148-173 | background,color,boxShadow | STATE-SELECTED (`isActive`/`isDisabled`, two-level) |

**RUNTIME-DRIVEN paint**: none. **Keyframes**: none. **Suppression risk**: none.
**DaisyUI coupling**: none. **Anatomy**: `role="radiogroup"`/`role="radio"`/
`aria-checked` (proper ARIA radiogroup pattern) but zero classnames, zero
`data-part` — the ARIA state (`aria-checked`) is a legitimate alternate selector a
skin COULD key on (`[aria-checked="true"]`) instead of inventing a `data-selected`,
worth flagging as an option for the migration.

### Shared-vocabulary adoption
None. Active-button background: `color-mix(in srgb, var(--ds-color-primary) 14%,
var(--ds-surface-card))` (line 162) — byte-identical formula to `scope-switcher`'s
gradient dark-stop (see §1). Given both components are literally named "switcher"
and sit in the same `structures/workspace/` folder, this is very likely a real
copy-paste lineage worth preserving as a shared `SWITCHER_ACTIVE_BG` token if the
migration wants to name it, rather than two independent coincidences.

---

## table-toolbar (8 sites, 1 file) — smallest, simplest file in the checkpoint; no pill/active-state concept at all

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| `ToolbarDivider` | 61-75 | background,boxShadow | STATIC |
| Root bar | 90-95 | borderBottom | STATIC |
| Search icon | 101-112 | color | STATIC |
| Search input | 113-123 | background,border | STATIC |

**RUNTIME-DRIVEN paint**: none. **Keyframes**: none. **Suppression risk**: none.
**DaisyUI coupling**: none. **Anatomy**: zero classnames, zero `data-part`.

### Shared-vocabulary adoption
None, but also nothing TO diverge on — this file has no pill/active-state
vocabulary at all, only generic `--ds-color-*` tokens on a search input and a
divider. The lowest-stakes file in the checkpoint for the vocabulary-adjudication
question raised in §1.

---

## status-filter-pills (20 sites: 14 object-literal + 6 imperative, 1 file) — the checkpoint's second and cleanest real adopter of the shared vocabulary

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| Pill button | 91-105 | border,background,color,boxShadow,backdropFilter | STATE-SELECTED (`isSelected`) base + **4 imperative** writes (hover pair on `background`/`borderColor`, focus/blur pair on `boxShadow`, lines 106-123) |
| Pill icon | 125-134 | color | STATE-SELECTED (`isSelected`) |
| Pill label text | 136-145 | color | STATE-SELECTED (`isSelected`) |
| Count badge | 146-159 | background,border,boxShadow | STATE-SELECTED (`isSelected`), existence-gated on `showCounts` |
| Count badge text | 161-172 | color | STATE-SELECTED (`isSelected`) |

**RUNTIME-DRIVEN paint**: none. **Keyframes**: none. **Suppression risk**: none —
grep-confirmed zero hits for `status-filter`/`StatusFilterPills`/`FilterPill` (its
back-compat alias) in any bridge file. **DaisyUI coupling**: none. **Anatomy**: zero
classnames, zero `data-part` — even the real adopter has no anatomy contract yet.

### Shared-vocabulary adoption
Full — all 17 imported names (`FILTER_PILL_*` ×16, `TRANSITION`) are used exactly as
defined, zero local reinvention, zero divergence. The one channel it adds beyond the
token set is a literal `backdropFilter: 'blur(6px)'` (line 104) — a real glass effect
not expressed in `tokens.ts` at all, present unconditionally (not gated on
selection), worth flagging since neither `list-toolbar` nor any other adopter uses
`backdropFilter` on a pill — this is a component-specific addition layered on top of
the shared base, not a divergence from it.

---

## 4. The three biggest traps

1. **The shared vocabulary is real but its adoption rate is 2/11 components, and
   the 9 non-adopters do not agree with each other either.** A migration that
   assumes "apply `FILTER_PILL_*` everywhere" will silently change pixels on 9 of
   11 components — some subtly (percentage/base-color drift: `saved-views-menu`,
   `export-button`), some structurally (`saved-views/modern.tsx`'s solid fill vs.
   translucent tint; `saved-views/rustic.tsx`'s tab-underline vs. pill entirely).
   The correct order of operations is: adjudicate each divergent recipe as
   "converge to canonical" (visual change, own baseline, own sign-off) or "preserve
   as a named sibling token family" BEFORE any skin file is written, not per-file
   during migration.

2. **`saved-views` is one component with two genuinely different UI metaphors per
   engine**, not two skins of one design. Modern's filled pill and rustic's
   tab-underline are both intentional (per each file's own header comment), so
   "unify the pixels" is out of scope for a byte-exact migration — but a skin author
   who has only read one engine's file will not expect the other engine's shape to
   differ this much, and might reach for a shared token that doesn't actually apply
   to both mechanisms.

3. **28 imperative `.style.x =` writes across 6 files, concentrated in hover/focus
   simulation on bare unstyled `<button>`/`<div>` elements** (no classname to hang a
   real `:hover` rule on today). These are invisible to a naive "grep for style
   object keys" pass and are NOT interchangeable with the STATE-SELECTED sites next
   to them — they require deleting the handler and authoring a genuine CSS
   pseudo-class rule, the same "delete-the-write, transcribe-to-CSS" mechanism
   flagged for Menu's focus-visible handlers in `wo-skin-04-navigation-inventory.md`.
   `saved-views/rustic.tsx` alone carries 10 of the 28 (one hover pair per menu
   item + the create button) — the single densest imperative-write file found in
   this program to date, denser even than Menu's navigation batch.

---

## 5. Portal-scoping concern (record for CK-C's future migration, not this report's job to resolve)

Three of the 11 components portal to `document.body`: `column-menu`,
`saved-views-menu`, `export-button`. All three verified: the portaled content's
paint is 100% static/state-selected (no runtime color), and the measurement APIs
each uses (`getBoundingClientRect`) drive position only, never a paint channel — so
this is NOT a WO-06 §7.4-style "reflexively exempt because it measures" trap. It IS
the WO-SKIN-04 checkpoint-P "portal trap": none of the three currently carries a
first-party classname on the portaled root, so a future skin will need to stamp a
standalone, grep-verified-free scope class directly on each portaled node — it
cannot inherit scoping from a tenant-root ancestor the way an in-place-rendered
component can.
