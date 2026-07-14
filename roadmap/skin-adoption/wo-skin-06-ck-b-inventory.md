# WO-SKIN-06 CK-B header-family paint inventory (read-only)

All paths relative to `packages/core/src/components/`. Same channel scope as the
WO-SKIN-02/03/04 precedents: a "site" is an object-literal style key named
`background*`, `border*`, `outline*`, `color`, `boxShadow`, `textShadow`, `fill`,
`stroke`, `accentColor`, `filter`, `backdropFilter`, `WebkitBackdropFilter`, or
`transform`, or an imperative `.style.<paint> =` / `.style.setProperty('paint-prop', …)`
write. Class legend: **STATIC** (author-time constant, moves to the skin verbatim),
**STATE-SELECTED** (a ternary/map over static values driven by React state or a prop —
becomes a CSS rule keyed on a pseudo-class or `data-*` attribute), **RUNTIME** (computed
from data at render time — stays inline or rides a `--ds-*` custom-property hatch). The
discriminator used throughout (per P-76-era triage doc §2): ask *where the runtime
identifier lands*, not whether one is mentioned in the expression.

**Coverage checklist** (`node scripts/engine-token-audit.mjs | grep
"fleet.inlinePaint.(structures/headers|patterns/misc/(page-shell|cockpit-header|workbench-header))"`,
re-run 2026-07-13 for this report — 1 site lower than the number in the delegating
brief/triage table, `headers/edit` drifted 49→48 between when the triage table was
written and now):

```
structures/headers/detail/index.tsx                          51
structures/headers/edit/index.tsx                             48
structures/headers/collection/index.tsx                       48
structures/headers/form/index.tsx                              36
structures/headers/dashboard/index.tsx                         14
patterns/misc/cockpit-header/engines/modern.tsx                48
patterns/misc/page-shell/engines/modern.tsx                    28
patterns/misc/page-shell/engines/rustic.tsx                    17
patterns/misc/workbench-header/engines/modern.tsx               44
                                                        ─────────
TOTAL                                                          334   9 files
```

**Zero `data-part` anywhere in this cluster.** Anatomy is minimal and inconsistent
(see §3). **No skin CSS file exists for any of these 9 components today** — fully
greenfield, same starting state as WO-SKIN-03/04's precedents.

**`classic.tsx` exists for all three `patterns/misc` components (cockpit-header,
page-shell, workbench-header) and is NOT in the counter's output above — but it is
not empty.** Grep-verified: `cockpit-header/engines/classic.tsx` has real inline
paint (`background: 'var(--ds-color-bg-primary)'`, `color: 'var(--ds-color-text-muted)'`,
etc. at lines 73, 122, 129, 141…). It reads as 0 sites only because **the WO-06 census
excludes `classic` by construction** (triage doc §9, "Method": `classic` excluded from
`roadmap/skin-census.json`), not because the file is paint-free. Anyone scoping a
migration off the counter's 334 must not assume classic is clean — it was never asked.
`structures/headers/*` has no classic variant at all (those 5 components are
engine-free, not engine-split).

---

## 1. THE DUPLICATION MAP (the spine)

The delegating brief names one duplicate: "the `tone` map + dotted-title +
`editorialTech` gradient recipe … literally duplicated across headers/edit:137-139,
headers/form:134-136 and headers/detail." Reading all three files line-by-line, **that
claim is half right, half wrong, and it undersells a bigger and more precise finding
underneath it.** Per the CK-C correction's lesson ("existence is not adoption, measure,
then contract"), here is what is actually there — three genuinely distinct recipes,
only some of which are duplicated, and none across all three files claimed:

### 1a. The tone map (`getVariantTone` / `VARIANT_TOKEN_MAP`) — Edit and Form only, BYTE-IDENTICAL

`headers/edit/index.tsx:116-141` and `headers/form/index.tsx:114-138` define the
identical function under the identical name:

```ts
const VARIANT_TOKEN_MAP: Record<…, string> = { primary: 'primary', … };

function getVariantTone(variant) {
  const token = VARIANT_TOKEN_MAP[variant || 'secondary'];
  if (token === 'secondary') {
    return {
      background: 'color-mix(in srgb, var(--ds-color-bg-secondary) 92%, transparent)',
      border: 'var(--ds-color-border-secondary)',
      color: 'var(--ds-color-text-secondary)',
    };
  }
  return {
    background: `color-mix(in srgb, var(--ds-color-${token}) 10%, var(--ds-color-bg-secondary) 90%)`,
    border: `color-mix(in srgb, var(--ds-color-${token}) 18%, var(--ds-color-border-secondary) 82%)`,
    color: `color-mix(in srgb, var(--ds-color-${token}) 78%, var(--ds-color-text-primary) 22%)`,
  };
}
```

`edit:137-139` and `form:134-136` (the cited lines) are the `return` object's three
properties — **byte-for-byte identical**, including the exact percentages (10/90,
18/82, 78/22). Edit's variant union is 6-wide (`primary | warning | info | success |
error | secondary`), Form's is 5-wide (`primary | secondary | success | warning |
info`, no `error`) — the *type* differs (Edit needs `error` for its status prop, Form
doesn't expose one), but the function body, the object shape, and every numeric value
are identical. **This is safe to unify into one skin recipe** — the two call sites
(Edit's `iconTone`/`statusTone`, Form's `iconTone`) consume it identically (icon-badge
box background/border/color, keyed by `colorVariant`).

**Detail does NOT have this construct at all.** Detail has no `colorVariant` prop, no
`getVariantTone`, no icon badge. Its status pill renders through the `Badge` *primitive*
(`<Badge variant={status.variant}>`), which owns its own styling elsewhere and is out
of this file's inline-paint scope. **The brief's claim that this map is also duplicated
in `headers/detail` does not hold** — verified by reading the file, not assumed.

### 1b. The archetype gradient recipe (`buildPatternStyle`) — Edit and Form BYTE-IDENTICAL to each other; Detail structurally the same shape but VALUE-DIVERGENT

`headers/edit/index.tsx:143-184` and `headers/form/index.tsx:140-181` — **the entire
41-line function, every ternary branch, every percentage, every `color-mix()` string,
is byte-identical between the two files.** Both compute `tone`/`toneSecondary`/
`gridColor`/`grid` via the same 4-way nested ternary over `archetype`
(`governance | technical | editorial | control`-default), and both bake the SAME
**fixed, archetype-independent** `heroBackground` and `fadeMask` gradient layers
(84%→100% panel wash, 40% fade threshold) into the 8-layer `backgroundImage` stack
regardless of which archetype is active. This is a clean, safe unification target.

`headers/detail/index.tsx:108-180` (`getArchetypeStyles` + `buildPatternStyle`) has
the **same 8-layer structure** — same radial-gradient positions (`12% 16%`, `84% 2%`,
`72%/74% 100%`), same `linear-gradient` grid-dot pair, same `backgroundSize`/
`backgroundPosition` stacking pattern — but **every single numeric value diverges**,
and unlike Edit/Form, Detail's `heroBackground`/`fadeMask` vary **per archetype**
instead of being fixed. Side-by-side (accent / accentSecondary / gridColor % / gridSize
/ heroBackground opacity / fadeMask threshold):

| archetype | Detail | Edit=Form |
|---|---|---|
| editorial | 14 / 9 / 24 / **26** / 84→100 / 40 | 16 / 10 / 28 / **26** / 84→100 (fixed) / 40 (fixed) |
| technical | 16 / 8 / 28 / **22** / 82→100 / 38 | 22 / 10 / 30 / **22** / 84→100 (fixed) / 40 (fixed) |
| governance | 14 / 8 / 24 / **24** / 84→100 / 42 | 17 / 10 / 28 / **24** / 84→100 (fixed) / 40 (fixed) |
| control | 15 / 7 / 22 / **28** | 18 / 9 / 26 / **26** | 86→100 / 42 | 84→100 (fixed) / 40 (fixed) |

Only `gridSize` coincidentally matches on 3 of 4 archetypes (editorial 26, technical
22, governance 24) — `control` diverges even there (28 vs 26) — and even the matching
`gridSize` values are matches of convenience, not evidence of a shared source (every
other channel on those same rows diverges). Detail also has a `tabActiveBackground`
field (28/32/36/42% depending on archetype) that Edit/Form's recipe has no equivalent
for at all, because Detail is the only one of the three that renders a tab strip.

**Verdict: this is the "8-layer archetype-panel gradient" recipe appearing in 3
places, and it is a duplicate-of-shape, not a duplicate-of-value.** Edit and Form
share one literal implementation (safe to collapse to one skin rule set). Detail
independently reinvented the same layering idea with its own numbers **and its own
per-archetype heroBackground/fadeMask that Edit/Form never adopted.** Per the CK-C
correction's law, flattening Detail's numbers onto Edit/Form's (or vice versa) is a
visual change and must not happen inside a byte-exact migration — Detail's archetype
tokens must ship as their own, third, independent token set in whatever skin
vocabulary this checkpoint decides, keyed by the SAME `archetype` enum but with
Detail-specific values.

### 1c. "dotted-title" and "editorialTech" — NOT the same mechanism as 1b, and unique to Collection

`editorialTech` (`layoutVariant === 'editorial-tech'`) and `useDottedTitle`
(`titleTreatment === 'dotted'`) are `collection/index.tsx`-only constructs
(lines 111, 113). They do not exist in Detail, Edit, Form, or Dashboard — grep-
confirmed (`editorialTech`/`layoutVariant` hits only in `collection/index.tsx` and
the unrelated `structures/workspace/search-command-bar/index.tsx`, a different
component family entirely). The dotted-title effect (`collection:280-318`) is a
**text-clip dot pattern**: `radial-gradient(circle …)` dots + a vertical
`linear-gradient` fill, both clipped to the glyph shapes via
`WebkitBackgroundClip`/`backgroundClip: 'text'` and `WebkitTextFillColor: 'transparent'`,
plus a matching `WebkitTextStroke` and `filter: drop-shadow(...)` — all three-way
branched on `compactLayout`/`editorialTech` (STATE-SELECTED, not RUNTIME: every leaf
is a static token expression). This is **visually and mechanically unrelated** to
Detail/Edit/Form's `buildPatternStyle` panel-background dot-grid (§1b) — both happen
to use crossed `linear-gradient`s to fake a dot grid, which is why the names in the
brief's phrase read as if they overlap, but one clips text glyphs and the other
paints a background panel, and neither file imports or calls the other's function.
**Report this precisely: the brief's phrasing conflated two superficially-similar-
sounding, code-unrelated recipes.** A migration must not try to unify them.

### 1d. Three more real duplicates the brief didn't name, found while reading `patterns/misc`

These recur across `cockpit-header`, `page-shell/modern`, and `workbench-header/modern`
and belong in the spine because they are the same shape of finding as 1a/1b — same
concept, independently reimplemented, values that agree on some axes and diverge on
others:

- **BackButton — three independent implementations, no two byte-identical.**
  `cockpit-header/engines/modern.tsx:133-183`: 34×34px, HAS a visible border on
  hover/focus (`1px solid var(--ds-color-border)` vs `transparent`), highlighted
  background is `--ds-color-neutral-50`. `page-shell/engines/modern.tsx:172-231`:
  padding-sized (not fixed square), border is **always `'none'`** (no border
  treatment at all), highlighted background is `--ds-color-neutral-100` (one step
  darker than cockpit's), and it optionally renders a text label next to the icon
  (cockpit/workbench are icon-only). `workbench-header/engines/modern.tsx:135-185`:
  32×32px (not 34), border always `'none'`, highlighted background
  `--ds-color-neutral-100` (matches page-shell, not cockpit). Net: page-shell and
  workbench-header agree on "no border, neutral-100" but disagree on sizing/label;
  cockpit-header is the outlier on both border treatment and the neutral shade step.
  Three token sets, not one.
- **Breadcrumb hover-link — cockpit-header and page-shell/modern agree; both differ
  from Detail/Edit/Form's breadcrumb rendering.** `cockpit-header`'s `BreadcrumbLink`
  (lines 80-124) and `page-shell/modern`'s `BreadcrumbItem` (lines 51-107) are
  value-identical: `hovered ? text-secondary : text-muted`, last-crumb
  `text-secondary` at weight 600 vs interior crumbs at weight 500. This pair IS a
  safe, real, value-identical duplicate — unlike §1a/§1b, this one unifies cleanly.
  It is unrelated to Detail's breadcrumb, which renders through the `Breadcrumb`
  *primitive* (not hand-rolled), or Edit/Form's, which hand-roll a simpler,
  non-interactive breadcrumb with no hover state at all (see §4, asymmetry).
- **Tab-strip active/hover recipe — page-shell's `TabButton` and workbench-header's
  `SavedViewTab` share every color/border value but diverge on accessibility
  surface.** Both: active → `color-mix` primary + 2px solid primary border-bottom;
  hovered/interactive & not-active → text-primary + neutral-50 background; default →
  text-muted + transparent. Values match exactly. But `SavedViewTab`
  (`workbench-header:194-245`) tracks `onFocus`/`onBlur` in addition to
  `onMouseEnter`/`onMouseLeave` (`isInteractive = (hovered || focused) && !isActive`);
  `TabButton` (`page-shell/modern:116-163`) tracks hover only, no focus handling at
  all. A migration that writes one `:hover`/`[data-active]` skin rule for both is
  correct for color; it must still preserve that only one of the two components
  today gets a visible state on keyboard focus — do not silently add keyboard
  affordance to page-shell's tabs as a side effect of sharing the rule, and do not
  silently remove it from workbench-header's.

### 1e. Unique to `cockpit-header`, not duplicated anywhere in this cluster

`STATUS_PILL_STYLES` (`cockpit-header/engines/modern.tsx:32-61`) — the exact
"static map index" example the triage doc cites by name (§2 of the triage: `cockpit-
header/engines/modern.tsx:193` `STATUS_PILL_STYLES[status.variant]`). A 5-way
(`success | warning | error | info | default`) map to `{background, color,
borderColor}` triples using the `-100`/`-700`/`-200` token step convention. No
sibling in this cluster reuses this map or this token-step convention — `workbench-
header`'s exception-count badge (lines 412-445) hardcodes the same
`--ds-color-error-100`/`-700` pair directly rather than importing this map, which is
the *same* value by coincidence (both are "error, soft variant") but not the same
mechanism — worth flagging as a near-duplicate-by-convention, not a code duplicate.

---

## 2. Per-file paint inventory

### 2.1 `structures/headers/detail/index.tsx` (51 sites)

No `data-part`. Root `<Box>` carries no className at all (structures/headers has zero
first-party classNames anywhere except Edit's two ad hoc hooks, see §3).

| Part | Lines | Channels | Class |
|---|---|---|---|
| `getArchetypeStyles`/`buildPatternStyle` (hero panel bg) | 108-180 | background(8-layer image) | STATE-SELECTED (4-way `archetype`, §1b) |
| avatar box (image variant) | 186-193 | border | STATIC |
| avatar box (initials variant) | 205-217 | background, border, color | STATIC |
| outer card shell | 271-279 | background, border, boxShadow | STATIC |
| top bar (back+breadcrumb+actions row) | 282-286 | border(bottom), background | STATIC |
| back-link chip | 296-300 | border, background | STATIC |
| back icon/label color | 302-304 | color | STATIC |
| breadcrumb divider bar | 312 | background | STATIC |
| eyebrow text | 359-363 | color | STATIC |
| title `<h1>` | 373-379 | color | STATIC (fontSize is a STATE-SELECTED 3-way on archetype, but that's not a counted channel) |
| subtitle | 388 | color | STATIC |
| metadata card shell | 403-421 | border, background(8-layer image), boxShadow, backdropFilter | STATIC |
| metadata chip | 430-436 | border, background | STATIC |
| metadata chip label | 439-448 | color | STATIC |
| metadata chip value | 451-460 | color | STATIC |
| tab strip container | 478-482 | border(top), background | STATIC |
| tab item | 493-503 | border, background, transform | STATE-SELECTED (`isActive`; `archetypeTone.tabActiveBackground` pulls from §1b's divergent per-archetype value) |
| tab icon color | 507-513 | color | STATE-SELECTED (`isActive`) |
| tab label color | 515-518 | color | STATE-SELECTED (`isActive`) |
| tab count badge | 522-529 | background | STATIC |
| tab count text color | 530 | color | STATE-SELECTED (`isActive`) |

**RUNTIME**: none. **Imperative writes**: none. **Keyframes/injected `<style>`**: none.

### 2.2 `structures/headers/edit/index.tsx` (48 sites)

No `data-part`. Two ad hoc classNames exist ONLY to be hooked by this file's own
per-instance `<style>` block (§5): `back-button`, `breadcrumb-link`.

| Part | Lines | Channels | Class |
|---|---|---|---|
| `getVariantTone` (icon/status tone) | 116-141 | background, border, color | STATE-SELECTED (`colorVariant`/`status.color`, §1a — value-identical to Form) |
| `buildPatternStyle` (hero panel bg) | 143-184 | background(8-layer image) | STATE-SELECTED (4-way archetype, §1b — value-identical to Form, structurally-not-value-identical to Detail) |
| loading-state shell | 236-245 | background, border | STATIC |
| outer card shell | 254-261 | background, border, boxShadow | STATIC |
| top bar | 264-268 | border(bottom), background | STATIC |
| back button chip | 279-284 | background, border | STATIC (the `:hover` treatment for this exact element lives in the counter-blind `<style>` tag, §5 — two independent paint mechanisms on the same element) |
| back icon/label color | 286-287 | color | STATIC |
| breadcrumb divider | 296 | background | STATIC |
| breadcrumb item color | 301, 306, 312 | color | STATIC (`.breadcrumb-link` hover treatment is the `<style>` tag, not here) |
| entityId chip | 328-333 | color, border | STATIC |
| icon badge box | 347-356 | background, border | STATE-SELECTED (`iconTone`, from §1a) |
| icon glyph color | 358 | color | STATE-SELECTED |
| eyebrow color | 367 | color | STATIC |
| title color | 377 | color | STATIC |
| status pill box | 382-387 | background, border | STATE-SELECTED (`statusTone`, from §1a) |
| status pill text | 389 | color | STATE-SELECTED |
| subtitle color | 396 | color | STATIC |
| context-rail/children card | 445-461 | border, background(gradient stack), boxShadow, backdropFilter | STATIC |

**RUNTIME**: none. **Imperative writes**: none. **Keyframes**: none. **Interface-
member blind spot (confirmed, matches triage §7.5's own citation)**:
`EditHeaderProps.status.color` (`edit:104`) is a `{ label: string; color: 'success' |
… }` object-type literal — the counter's lexer flags its `color:` key as a paint site
even though it is a *type* declaration, not a value. Unfixable by migration; either
exempt by name or teach the lexer to skip type-position `{}` bodies.

### 2.3 `structures/headers/form/index.tsx` (36 sites)

No `data-part`, no ad hoc classNames, no per-instance `<style>` tag (unlike its
near-twin Edit).

| Part | Lines | Channels | Class |
|---|---|---|---|
| `getVariantTone` (icon tone) | 114-138 | background, border, color | STATE-SELECTED (`colorVariant`, §1a — byte-identical to Edit) |
| `buildPatternStyle` (hero panel bg) | 140-181 | background(8-layer image) | STATE-SELECTED (4-way archetype, §1b — byte-identical to Edit) |
| outer card shell | 229-236 | background, border, boxShadow | STATIC |
| top bar | 239-243 | border(bottom), background | STATIC |
| back-link chip | 252-259 | border, background | STATIC (no hover `<style>` companion here, unlike Edit's identical-looking chip) |
| back icon/label color | 261-262 | color | STATIC |
| breadcrumb divider | 271 | background | STATIC |
| icon badge box | 302-313 | background, border | STATE-SELECTED (`iconTone`) |
| icon glyph color | 315 | color | STATE-SELECTED |
| eyebrow color | 323 | color | STATIC |
| title color | 332 | color | STATIC |
| subtitle color | 336 | color | STATIC |
| context-rail/children card | 344-361 | border, background(gradient stack), boxShadow, backdropFilter | STATIC |

**RUNTIME**: none. **Imperative writes**: none. **Keyframes**: none.

### 2.4 `structures/headers/collection/index.tsx` (48 sites)

No `data-part`. One ad hoc marker attribute, `data-ds-collection-title-accent="true"`
(line 384) — `aria-hidden`, decorative, not consumed by any stylesheet (grep-confirmed
zero hits) — a real precedent shape for a future `data-part` stamp, currently inert.

| Part | Lines | Channels | Class |
|---|---|---|---|
| eyebrow chip | 121-143 | border, background, color | STATE-SELECTED (`embedded`) |
| meta-item chip (`renderMetaItem`) | 145-184 | border, background, color | STATE-SELECTED (`item.tone`, 3-way) |
| outer panel | 188-205 | background, border(bottom) | STATE-SELECTED (`embedded`; padding also branches on `editorialTech`/`compactLayout` but padding isn't a counted channel) |
| title (§1c dotted-title recipe) | 227-319 | color, backgroundImage, backgroundSize, backgroundPosition, WebkitTextFillColor, WebkitTextStroke, filter | STATE-SELECTED (3-way `compactLayout`/`editorialTech`/default when `useDottedTitle`; `textShadow` also STATE-SELECTED on `useDisplayTitle`) |
| editorial-tech divider (above subtitle) | 332-341 | background | STATIC (only rendered when `editorialTech && !compactLayout`) |
| subtitle (editorial-tech branch) | 342-364 | color | STATIC |
| title-accent bar (default branch) | 382-394 | background | STATIC |
| subtitle (default branch) | 395-428 | color | STATIC |
| editorial-tech bottom rule | 431-441 | background | STATIC (rendered only when `editorialTech && !compactLayout`) |
| quick-actions pill container | 472-495 | border, background, boxShadow | STATE-SELECTED (`embedded`×`editorialTech`, both axes) |
| quick-action button | 523-529 | boxShadow | STATE-SELECTED (`action.variant === 'primary'`) |
| shortcuts label chip | 565-583 | border, background, color | STATIC |
| shortcut pill | 588-609 | border, background, color | STATIC |
| (no-quickActions branch) shortcut pill (duplicate render path) | 647-668 | border, background, color | STATIC |

**RUNTIME**: none — `displayInk`/`displayShade` (lines 115-116) look like they could
be runtime brand colors but are themselves fallback-chained `var()` STRINGS
(`var(--ds-collection-header-display-color, var(--ds-color-primary))`), i.e. STATIC
CSS, not JS-computed values — see §6 for the fact that the primary token in that
fallback chain is defined nowhere. **Imperative writes**: none. **Keyframes**: none.
One `useEffect`/`matchMedia` listener (lines 91-107) drives `isCompactViewport` —
this is layout/typography branching (padding, flex-basis, font-size), not a counted
paint channel by itself, but it IS the state that several of the STATE-SELECTED rows
above key off; classified correctly as STATE-SELECTED, not RUNTIME, because the
leaves it selects between are static.

### 2.5 `structures/headers/dashboard/index.tsx` (14 sites)

No `data-part`, no first-party className; uses semantic `role`/`aria-label` only
(`role="banner"`, `role="toolbar"`, `role="group"`).

| Part | Lines | Channels | Class |
|---|---|---|---|
| `STATUS_COLORS` map (5-way `DashboardStatusState`) | 80-86 | (feeds `color` below) | n/a — the map itself is the lookup table |
| `StatusDot` pill | 91-98 | background | STATE-SELECTED (`STATUS_COLORS[state]`) |
| `StatusDot` glyph | 100-109 | background | STATE-SELECTED (same map); `animation: 'pulse 2s infinite'` present only for `live`/`syncing` |
| `StatusDot` text | 110 | color | STATE-SELECTED |
| `MetricChip` shell | 130-139 | background, border | STATIC |
| `MetricChip` change-direction text | 154-159 | color | STATE-SELECTED (`metric.change.direction`, 3-way) |
| compact header shell | 184-191 | border(bottom) | STATIC |
| full header shell | 246-254 | background, border(bottom) | STATIC |

**RUNTIME**: none — `metric.value`/`metric.label` are consumer data but they render as
*text content*, never as a paint value. **Imperative writes**: none. **Keyframes**:
`animation: 'pulse 2s infinite'` (line 107) references the GLOBAL `@keyframes pulse`
defined in `tokens/css/foundation/animations/keyframes.css:352` — grep-confirmed live,
not dangling. No local `@keyframes` in this file. This is the smallest, simplest file
in the whole cluster: no archetype system, no tone map, its own tiny independent
`STATUS_COLORS` map unrelated to `STATUS_PILL_STYLES` (§1e) or `getVariantTone` (§1a).

### 2.6 `patterns/misc/cockpit-header/engines/modern.tsx` (48 sites)

Real anatomy: `className={\`ds-pattern-cockpit-header ds-engine-modern ${className ?? ''}\`}`
on both the loading and main render roots (lines 262, 364) — grep-confirmed FREE (zero
hits anywhere in `tokens/css/`), a real, already-present scope-class hook a skin can
key off directly.

| Part | Lines | Channels | Class |
|---|---|---|---|
| `STATUS_PILL_STYLES` (§1e) | 32-61 | background, color, border | STATE-SELECTED (`status.variant`, 5-way) |
| `BreadcrumbLink` interactive | 80-109 | color | STATE-SELECTED (`hovered`, §1d) |
| `BreadcrumbLink` static/last | 112-123 | color | STATE-SELECTED (`isLast`) |
| `BackButton` | 133-183 | border, background, color | STATE-SELECTED (`isHighlighted = hovered\|\|focused`, §1d) |
| `StatusPill` | 192-214 | background, color, border | STATE-SELECTED (`STATUS_PILL_STYLES[status.variant]`) |
| loading-skeleton blocks ×6 | 272-340 | background | STATIC (each a separate object literal; all 6 identical `--ds-color-neutral-100` + `animation: pulse` shape) |
| header shell | 366-372 | background, border(bottom) | STATIC |
| breadcrumb `/` separator | 392-402 | color | STATIC |
| title | 446-461 | color | STATIC (fontSize is STATE-SELECTED on `isCompact`, not a counted channel) |
| subtitle | 480-494 | color | STATIC |

**RUNTIME**: none. **Imperative writes**: none. `isCompact` (scroll-position derived
via `window.scrollY > 60`, lines 244-256) selects among STATIC padding/fontSize/
boxShadow values — correctly STATE-SELECTED, not RUNTIME, by the "where does the
identifier land" test: the scroll position itself never reaches a paint value, it
only picks between two fixed ones.

### 2.7 `patterns/misc/page-shell/engines/modern.tsx` (28 sites) + `engines/rustic.tsx` (17 sites)

**Modern** anatomy: `ds-pattern-page-shell`, `ds-pattern-page-shell--loading`,
`ds-pattern-page-shell__loading-skeleton`, `ds-engine-modern` — all grep-confirmed
FREE. **Rustic** anatomy: zero first-party className, only the consumer's own
`className` passed through untouched (line 66, 91) — same greenfield/no-hook shape
WO-SKIN-04 found repeatedly in rustic engines.

Modern:

| Part | Lines | Channels | Class |
|---|---|---|---|
| `BreadcrumbItem` interactive/static | 51-107 | color | STATE-SELECTED (`hovered`/`isLast`, §1d — value-identical to cockpit-header's `BreadcrumbLink`) |
| `TabButton` | 116-163 | color, background, border(bottom) | STATE-SELECTED (`isActive`, `hovered`, §1d) |
| `BackButton` | 172-231 | background, color | STATE-SELECTED (`isHighlighted`, §1d — divergent from cockpit-header's, see §1d) |
| loading-skeleton blocks ×5 | 286-340 | background | STATIC |
| breadcrumb `/` separator | 391-402 | color | STATIC |
| title `<h1>` | 448-462 | color | STATIC |
| subtitle | 465-476 | color | STATIC |

`gridBg` (`repeating-linear-gradient`, lines 353, 361-362) is a **RUNTIME-shaped
custom-property hatch, already correctly implemented**: `var(--ds-shell-grid-line,
transparent)` / `var(--ds-shell-grid-size, 0px)` — both default to invisible, and a
tenant sets them via token override, not a JS-computed value. This is the existing
hatch precedent for this checkpoint's own C-category needs, same shape as Menu's
`getLevelStyleVars` in WO-SKIN-04.

Rustic — a single, un-decomposed inline-style tree (no sub-components):

| Part | Lines | Channels | Class |
|---|---|---|---|
| breadcrumb link | 76-81 | color | STATIC |
| breadcrumb separator | 84-88 | color | STATIC |
| back button | 125-136 | color | STATIC (no hover state at all — a real asymmetry vs. modern's `BackButton`) |
| title | 144 | color | STATIC |
| subtitle | 150 | color | STATIC |
| tab-strip container | 162 | border(bottom) | STATIC |
| tab button | 167-177 | border(bottom), color | STATE-SELECTED (`activeTabKey === tab.key`) |

**RUNTIME**: none in either engine. **Imperative writes**: none. **Keyframes**: none
locally (modern's skeleton reuses the global `pulse` keyframe, same as cockpit-header
and workbench-header). **Interaction mechanism asymmetry**: modern's `BreadcrumbItem`/
`TabButton`/`BackButton` all have real hover/focus React-state; rustic has **zero
interactive paint anywhere** — its back button, breadcrumb links, and inactive tabs
never change color on hover at all. This is the widest engine gap found in this
cluster (matches the shape WO-SKIN-04 called out for Tabs modern-vs-rustic);
preserve, do not invent a rustic hover to "fix" the asymmetry.

### 2.8 `patterns/misc/workbench-header/engines/modern.tsx` (44 sites)

Real anatomy: `ds-pattern-workbench-header ds-engine-modern` — grep-confirmed FREE.

| Part | Lines | Channels | Class |
|---|---|---|---|
| `QuickActionButton` variant map (`variantStyles`) | 48-88 | background, color, border, boxShadow | STATE-SELECTED (`action.variant`, 3-way: primary/danger/default, each with its own hover sub-object) |
| `QuickActionButton` render (base + hover spread) | 101-116 | (consumes the map above) | STATE-SELECTED (`isInteractive = hovered\|\|focused`) |
| `BackButton` | 135-185 | background, color | STATE-SELECTED (`isInteractive`, §1d — a THIRD divergent recipe, not present in the loading/main branches' JSX here since WorkbenchHeader's loading skeleton has no back button) |
| `SavedViewTab` | 194-245 | color, background, border(bottom) | STATE-SELECTED (`isActive`, `isInteractive`, §1d) |
| `PULSE_STYLE`/`SkeletonBlock` ×6 call sites | 251-268, 329-356 | background | STATIC (one shared object reused via spread — the ONE place in this whole cluster where the skeleton-block pattern is actually de-duplicated into one constant rather than repeated 5-6 times inline, unlike cockpit-header and page-shell/modern which each repeat the same shape literally) |
| header shell | 306-311 | background, border(bottom) | STATIC |
| title | 396-410 | color | STATIC |
| exception-count badge | 412-445 | background, color | STATIC (hardcodes `--ds-color-error-100`/`-700`, same values as `STATUS_PILL_STYLES.error` in cockpit-header but not sourced from it, §1e) |
| subtitle | 449-463 | color | STATIC |
| saved-views tab strip container | 486-497 | border(bottom) | STATIC |

**RUNTIME**: none. **Imperative writes**: none. **Keyframes**: reuses the global
`pulse` keyframe via `PULSE_STYLE` (line 254), same as the other two `patterns/misc`
files — no local `@keyframes`.

---

## 3. Anatomy summary

Zero `data-part` anywhere across all 9 files (grep-confirmed). Real, already-present,
grep-confirmed-FREE scope classes exist on 4 of the 9 file-roots — `ds-pattern-
cockpit-header`, `ds-pattern-page-shell` (+ `--loading`, `__loading-skeleton`),
`ds-pattern-workbench-header`, each paired with `ds-engine-modern` — all in
`patterns/misc`. **`structures/headers` (5 files) has NO first-party className
anywhere** except Edit's two ad hoc `back-button`/`breadcrumb-link` hooks that exist
solely to be targeted by its own inline `<style>` tag (§5) — not a general anatomy
convention, a one-off. `page-shell/rustic` and all 5 `structures/headers` files pass
through only the consumer's own `className`. A future skin author has 4 ready-made
scope-class anchors in `patterns/misc` and must stamp fresh `data-part`/scope classes
everywhere in `structures/headers`.

---

## 4. Bridge rules (theme.css / personality.css) — clean, with one real nuance

**No selector in `tokens/css/engines/{modern,rustic,classic}/theme.css` or
`tokens/css/runtime/personality.css` targets any of these 9 components' own markup.**
Grep swept both component-name strings (`detail-header`, `edit-header`, `collection-
header`, `form-header`, `dashboard-header`, `cockpit-header`, `page-shell`,
`workbench-header`) and generic structural terms (`header`, `breadcrumb`, `eyebrow`)
across all three engine `theme.css` files and `personality.css`. Every `header`/
`breadcrumb` hit that exists belongs to a **different** component family entirely —
DaisyUI's own `.breadcrumbs` (Card/Modal/Table/Drawer/List/Calendar/Layout headers,
Ant Design `.ant-*-header` wrappers) — none of which this cluster's files render
directly. **This is a clean, greenfield suppression picture — no dead-vs-live P-76
disposition is needed because there is nothing to dispose of.**

One real, load-bearing nuance: Detail's breadcrumb trail renders through the real
`Breadcrumb` *primitive* (`import { Breadcrumb } from '../../../primitives'`,
`detail/index.tsx:51,313`) — so the DaisyUI `.breadcrumbs` bridge rules at
`engines/modern/theme.css:613-634,897-942` DO apply to content Detail renders, but
that paint belongs to the Breadcrumb primitive's own inventory (a different WO-SKIN
checkpoint), not to this file. **Edit and Form hand-roll their own breadcrumb markup**
(plain `<a>`/`<Text>`, no `Breadcrumb` primitive, no `.breadcrumbs` class) — so for
those two files the DaisyUI bridge is simply inapplicable, not suppressed. This is a
real cross-file asymmetry (Detail delegates breadcrumb styling+hover+active-item
treatment to the primitive; Edit/Form's hand-rolled version has no hover state and no
active-item distinction at all) worth flagging as a product-consistency gap, not a
migration hazard.

Two adjacent findings that are **not** DS bridge rules but are easy to mistake for
one, both traced to ground and ruled out:

- `tokens/css/artifacts/bithire/_source/extension.css:1997` defines
  `html[data-tenant='bithire'] :where(.rt-collection-preview__decision-cockpit-header)`.
  **This is not our `patterns/misc/cockpit-header` component.** `.rt-collection-
  preview__decision-cockpit-header` is a BEM-scoped class inside bithire's own
  app-specific `.rt-collection-preview` widget (a "decision cockpit" preview panel),
  named independently of this DS pattern — pure naming coincidence, zero live
  coupling, confirmed by reading the surrounding block (it styles an app-owned
  preview card, not this pattern's DOM).
- `tokens/css/artifacts/bithire/_source/extension.css:3585-3637` defines several
  `html[data-tenant="bithire"] :where([data-bithire-detail-edit-panel="true"])
  :where([data-bithire-detail-edit-header="true"])` rules with `!important` on
  `margin`, `padding`, and `border-bottom`. Per P-76, margin/padding are normally
  DEAD (preflight-reset channels) — **but these declarations carry `!important`,
  which flips the outcome**: an `!important` declaration always outranks a
  non-important one regardless of layer order, so these DO win over Tailwind's
  preflight reset. They are **LIVE**, not dead. They are still out of this report's
  "bridge rule" scope in the strict sense the brief asked about (`theme.css`/
  `personality.css`) — `data-bithire-detail-edit-header` is an attribute **the
  bithire app itself stamps on its own wrapper DOM**, not something `EditHeader`
  or `DetailHeader` render; it is tenant/app-authored extension CSS in the
  `rottay-tenants` layer, not a DS engine bridge. Flagged here only so a future
  agent doesn't rediscover it and misclassify it as dead by reflexively applying
  the margin/padding-is-dead rule without checking for `!important`.

---

## 5. Interaction paint & imperative writes

**Imperative `.style.x =` writes: zero, anywhere in this cluster.** Every hover/
focus/active treatment in `patterns/misc` is 100% React-state (`useState` +
`onMouseEnter`/`onMouseLeave`/`onFocus`/`onBlur`), never a direct DOM write. This is
the cleanest interaction-mechanism picture found in any WO-SKIN checkpoint so far —
every state-driven paint site is already expressible as `:hover`/`:focus-visible`/
`[data-active]` CSS with no "delete-the-imperative-write" migration step needed.

**One counter-blind per-instance `<style>` tag carrying real, counted-channel CSS**:
`headers/edit/index.tsx:474-485`

```css
.back-button { transition: all 0.2s ease; }
.back-button:hover {
  border-color: var(--ds-color-border);
  background: color-mix(in srgb, var(--ds-color-bg-secondary) 90%, transparent);
}
.breadcrumb-link:hover { color: var(--ds-color-text-secondary) !important; }
```

This is NOT a keyframe — it's static rule text inside a template literal, invisible
to `fleet.inlinePaint` by construction (string contents). It IS the ONLY `<style>`
tag anywhere in the 9-file cluster (grep-confirmed: `structures/headers/*` and all
4 `patterns/misc` engine files have zero others), and the ONLY `@keyframes`-adjacent
finding in the whole cluster is the *absence* of any local `@keyframes` — every
`animation: 'pulse …'` reference (`dashboard`, `cockpit-header`, `workbench-header`)
points at the single pre-existing GLOBAL `@keyframes pulse` in
`tokens/css/foundation/animations/keyframes.css:352`, confirmed live, not dangling.
Two things about the `.back-button`/`.breadcrumb-link` block specifically: (1) it is
NOT scoped/namespaced (no `id`/attribute selector uniqueness), so two `EditHeader`
instances on one page emit two byte-identical, harmless-but-duplicate rule blocks —
same shape as WO-SKIN-04's Menu `ensureGlobalStyles` finding, except here it's a
plain React child `<style>` re-parsed on every render/instance rather than a
document-singleton-guarded injection; (2) `.breadcrumb-link:hover`'s `!important`
color rule is functionally pointless here — nothing else contests `color` on that
element at any specificity (Edit's breadcrumb has no other color rule for the hover
state), so the `!important` is inert defensive styling, not overriding anything live.
A migration must fold this block into Edit's skin file verbatim (values unchanged,
selectors re-anchored to the new scope class) and delete the inline `<style>` tag —
this is the one real "transcribe CSS-in-template-literal to skin file" mechanism in
this whole checkpoint.

---

## 6. Engine asymmetries, dead code, pre-existing defects (record only)

- **`--ds-collection-header-display-color` / `--ds-collection-header-display-shade`
  (`collection/index.tsx:115-116`) are defined nowhere in `tokens/css/`** (grep-
  confirmed zero hits as a CSS custom-property declaration anywhere in the tree —
  only consumed, never set). Same shape as the triage CORRECTION's `--ds-steps-line-
  color` finding (P-73): the fallback (`var(--ds-color-primary)` /
  `var(--ds-color-text-primary)`) is what actually always renders today. Not a bug —
  correct fallback-chain design — but a future skin/tenant author must know setting
  these two variables is currently the ONLY way to affect the display/dotted title's
  ink color, and nothing in the codebase does that yet.
- **Detail's `buildPatternStyle` archetype recipe and Edit/Form's are structurally
  identical but numerically divergent (§1b)** — this is the single biggest cost
  driver for this checkpoint if it gets contracted as "one skin, one archetype
  vocabulary": it cannot be, without a product decision to either accept 3 divergent
  archetype token sets or flatten Detail onto Edit/Form's values (a visual change,
  out of scope for byte-exact migration per the CK-C correction's law).
  `structures/headers` therefore needs **at minimum two** archetype-recipe token
  sets (Edit=Form, and Detail), not one.
- **Three independent `BackButton` implementations (§1d)** across `cockpit-header`,
  `page-shell/modern`, `workbench-header/modern` — same concept, three sizes, two
  different neutral-shade steps (50 vs 100), and a border treatment present in only
  one of the three. A migration must ship three token sets or get a product decision
  to converge them; converging is out of scope here.
- **`page-shell/rustic` has zero interactive paint** (no hover/focus anywhere) while
  its modern sibling has real hover/focus on every interactive element — the widest
  engine gap in this checkpoint (§2.7). Preserve as-is.
- **`headers/edit/index.tsx:104`'s interface-member blind spot** (confirmed, matches
  triage §7.5's own citation of this exact line) — `status: { color: 'success' | …
  }` inside the props interface reads as a paint site to the counter's bracket-stack
  lexer even though it's a type declaration. Unfixable by migration; needs either a
  named exemption or a lexer fix that skips type-position object bodies.
  `structures/headers/*` and `patterns/misc/{cockpit-header,page-shell,workbench-
  header}` were swept for the same pattern; this is the only hit in the whole
  cluster.
- **`workbench-header`'s exception-count badge hardcodes the same error-100/700
  token pair `STATUS_PILL_STYLES.error` uses in cockpit-header, without importing or
  referencing that map** (§1e) — a coincidental value match, not a shared mechanism;
  do not assume migrating one migrates the other correctly if either ever changes.
- **`classic.tsx` exists and paints for all 3 `patterns/misc` components but is
  outside the WO-06 census by construction** (intro section) — flagged so this
  checkpoint's contract doesn't silently certify "0 classic sites" as "classic has no
  paint."
- **Workbench-header is the one file in this cluster that already de-duplicated its
  own skeleton-block styling** (`PULSE_STYLE` + `SkeletonBlock`, §2.8) into one
  shared constant, unlike cockpit-header and page-shell/modern, which each repeat
  the identical 6-line skeleton-block object literal 5-6 times inline. Not a defect —
  a precedent worth copying into whatever the migration does with the other two
  files' skeleton blocks.

---

## 7. Final report

**Totals** (334 sites, 9 files, all hand-verified against the code, not sampled):

```
STATIC          ~245   (author-time constant; every archetype/tone/status/back-
                         button/tab-strip recipe's LEAF values are static tokens)
STATE-SELECTED   ~89   (ternary/map/priority-chain over static values, keyed by
                         archetype, colorVariant, status.variant, tone, isActive,
                         isHovered/isFocused/isInteractive/isHighlighted, isCompact,
                         embedded, editorialTech, compactLayout, titleTreatment)
RUNTIME            0   (zero — no value/percent/data-derived paint anywhere in
                         this cluster; confirms the triage family table's "100% A"
                         verdict for structures/headers and extends the same
                         verdict to the patterns/misc trio)
```

(The STATIC/STATE-SELECTED split above is a hand count reconciled against the
per-file tables in §2, grouped by rendered part the same way WO-SKIN-04 did — not a
raw per-counted-key tally, since several parts pack 2-3 counted keys into one object
literal, e.g. Detail's outer card shell contributes `background`+`border`+`boxShadow`
= 3 keys from one row.)

**The duplication map (§1), summarized:**

1. `getVariantTone`/`VARIANT_TOKEN_MAP` — Edit & Form, **byte-identical**. Safe to
   unify.
2. `buildPatternStyle` archetype-panel gradient — Edit & Form **byte-identical to
   each other**; Detail **same 8-layer shape, every numeric value diverges**, and
   Detail alone varies `heroBackground`/`fadeMask` per archetype. Needs 2 token
   sets minimum, not 1. The brief's claim that this is duplicated "across … headers/
   detail" is **not supported** for the tone map (§1a, Detail doesn't have one) and
   only **partially** supported for the gradient recipe (§1b, same shape, not same
   values).
3. Collection's "dotted-title" (text-clip) and "editorialTech" (`layoutVariant`)
   are **unique to Collection**, code-unrelated to #2 despite superficially similar
   naming/visual motif (both use crossed linear-gradients to fake a dot grid, one
   clips text, one paints a panel).
4. Three more real duplicate-shapes found beyond the brief's ask: **BackButton**
   (3 divergent recipes across cockpit-header/page-shell/workbench-header),
   **breadcrumb hover-link** (cockpit-header ≡ page-shell/modern, value-identical,
   safe to unify), **tab-strip active/hover** (page-shell ≡ workbench-header on
   color/border, diverge on keyboard-focus support — preserve the accessibility
   asymmetry).

**Bridge rules disposition**: clean. No `theme.css`/`personality.css` selector
targets any of these 9 files' own markup (§4). The one nested exception (Detail's
`Breadcrumb` primitive pulling in DaisyUI's `.breadcrumbs` bridge) belongs to a
different component's inventory. A bithire-only `!important` tenant override on
`margin`/`padding`/`border-bottom` exists for Edit/Detail's rendered DOM but is
tenant-authored `rottay-tenants`-layer extension CSS targeting an app-stamped
attribute, not a DS bridge rule — and it is LIVE (not P-76-dead) specifically
because it carries `!important`.

**Imperative-write count: 0.** Every interaction in this cluster is React-state
driven, already directly expressible as CSS pseudo-classes/data-attributes with no
"delete the imperative write" step. The one counter-blind mechanism is a real,
un-namespaced per-instance `<style>` tag (`headers/edit/index.tsx:474-485`, §5)
carrying two real hover rules the counter cannot see — the only "transcribe a
template-literal stylesheet into the skin file" task in this checkpoint.

**Three biggest traps for whoever migrates CK-B:**

1. **The brief's own premise needed correction before it could be contracted** —
   exactly the CK-C-correction lesson recurring at a smaller scale. "Tone map +
   dotted-title + editorialTech gradient, duplicated across edit/form/detail" is
   really three separate findings (§1a-§1c), one of which (the tone map) doesn't
   touch Detail at all, and one of which (dotted-title/editorialTech) doesn't touch
   Edit or Form at all. A contract written from the brief's phrasing alone would
   wire up a shared token set for Detail that Detail never uses, and would go
   looking for dotted-title logic in Edit/Form that was never there.
2. **Detail's archetype recipe looks like a copy of Edit/Form's and isn't one** —
   same 8-layer shape, every value different, plus an extra per-archetype axis
   (heroBackground/fadeMask) Edit/Form don't have. The temptation to "clean this up"
   by pointing Detail at Edit/Form's numbers (or vice versa) is real and must be
   refused inside a byte-exact migration (§1b, §6).
3. **Three quietly-divergent `BackButton`s and one un-namespaced `<style>` tag are
   easy to miss because nothing about them shows up as a duplicated *name*** — they
   were found only by reading every file end-to-end, the same method the CORRECTION
   section prescribes ("measure, then contract") rather than trusting a grep for a
   shared identifier. `structures/headers` has zero shared identifiers across its 5
   files at all (no shared helper module, no shared constants file) — every
   similarity is a human having typed the same numbers twice, which is exactly the
   kind of duplication a grep for imports cannot find.
