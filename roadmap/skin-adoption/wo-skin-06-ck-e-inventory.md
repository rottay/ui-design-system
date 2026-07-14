# WO-SKIN-06 checkpoint CK-E (visualization) paint inventory (read-only)

All paths relative to `packages/core/src/components/patterns/visualization/`. Same
channel scope as WO-SKIN-02/03/04/06 precedents: a "site" is an object-literal style
key named `background*`, `border*`, `outline*`, `color`, `boxShadow`, `textShadow`,
`fill`, `stroke`, `accentColor`, `filter`, `backdropFilter`, `WebkitBackdropFilter`, or
`transform`, or an imperative `.style.<paint> =` write. Class legend: **A-static**
(author-time constant, moves to the skin verbatim), **A-state** (a ternary/map over
static values driven by React state, a prop, or D3's `.on('mouseenter'...)` — becomes
a CSS rule keyed on `:hover`/`[data-*]`), **B** (per-datum/per-series/caller-supplied
runtime value, no closed enum — exempt, cannot be migrated), **C** (a single
caller-supplied scalar per instance — completable via a `--ds-*` custom-property
hatch).

**Read this before anything else: the site counts below are a snapshot, not a
constant.** This is a shared, multi-agent session. `line-chart/index.tsx` measured 6
sites at the top of this task and 4 by the time it was read in full; `use-chart-brush.ts`
measured 12 then 11; `kanban-board/engines/rustic.tsx` and `map-view/engines/rustic.tsx`
each differ by exactly 1 between a live `engine-token-audit.mjs` run and this document's
own line-by-line grep of the same file taken minutes apart. None of this changes any
file's A/B/C composition — every discrepancy found was traced to either a genuine
concurrent edit elsewhere in this session or (once, for `line-chart`) a stale figure
from the very first census grep of this task. **Re-run
`node scripts/engine-token-audit.mjs | grep fleet.inlinePaint.patterns/visualization`
before a migration contract is cut from this document.** The counts quoted per file
below are this inventory's own verified re-derivation (grep + manual bracket-count
against the file actually read), not a single frozen census pull.

---

## 0. The headline finding: the census undercounts the charts sub-family by ~1.5x

**The counter cannot see D3's imperative painting idiom at all.** `fleet.inlinePaint`
recognizes two mechanisms: object-literal style keys (`style={{ fill: x }}`) and
`.style.<paint> =` assignment statements. D3's own idiom —
`.attr('fill', value)` / `.style('fill', value)` chained onto a `d3.select(...)`
result — is a **method call with a string literal argument**, structurally invisible
to a lexer built for React's two mechanisms. Every one of the 20 chart files paints
its actual marks (bars, arcs, lines, dots, nodes, links) almost entirely through this
mechanism; the census only ever sees the **legend swatches** (a React-rendered `<div>`
list that mirrors the same color logic in a `style={{}}` object) and a handful of
non-D3 helper files.

Measured by hand against every file actually read for this inventory (not sampled):

| | census-counted sites | D3-imperative sites (uncounted) | real total |
|---|---:|---:|---:|
| charts (20 files) | 101 | 149 | **250** |
| kanban/calendar/timeline/tree/map (10 files, React-only, no D3) | 194 | 0 | 194 |
| **CK-E total** | **295** | **149** | **444** |

The brief's scoping figure ("~308 sites across ~30 files") is the census number,
rounded; **the real paint footprint this checkpoint has to account for is 444, not
308**, and the entire gap is D3's `.attr()`/`.style()` calls in the 20 chart files.
This does not change what needs to migrate to a skin (the vast majority is still A —
axis text, grid lines, tooltip surfaces, value labels, the exact "static chrome" the
triage described) but it means **a byte-exact migration of any chart file cannot stop
when `fleet.inlinePaint` reads 0** — that number was never counting most of the paint
in the first place. §7 traps this explicitly.

Two secondary counter-behavior findings, checked by direct testing of
`countArc09PaintInFile` (not inferred from reading):

- **The triage's §7.5 "TypeScript interface member" blind spot is fixed.** The current
  lexer (`scripts/lib/inline-paint-counter.mjs`) tracks `typeBodyDepths` and excludes
  `interface X { ... }` / `type X = { ... }` bodies structurally. Confirmed by isolated
  repro (`interface Foo { color: string }` → 0) and by re-deriving `use-chart-theme.ts`'s
  4 counted sites by hand: none of them are the file's own `background: string;`
  interface members (lines 36, 55) — those are correctly excluded. The 7 sites named in
  triage §7.5 (`charts/sankey/index.tsx:116,134`, `charts/hooks/use-chart-theme.ts:36,55`,
  `charts/gauge/index.tsx:37`, `charts/tooltip/crosshair.ts:25`) are dead weight in that
  finding now — record this as CLOSED, not open.
- One narrower blind spot remains, confirmed but **not found anywhere in CK-E's 30
  files**: an inline parameter-destructure type annotation, `function f(opts: { color:
  string }) {}`, still counts (innermost bracket is `{`, and it isn't an `interface`/
  `type X =` keyword). Nothing in this scope uses that shape — noted for completeness,
  not actionable here.

---

## 1. Shared foundation files (`charts/chart-scaffold.tsx`, `charts/hooks/*`, `charts/tooltip/*`)

Every one of the 18 chart types wraps `<ChartScaffold>` and most import `useChartTheme`/
`useChartPersonality`/`useChartTooltip`/`useChartCompact` and `<ChartTooltip>`/
`createChartCrosshair`. These are the files that decide the family's shared vocabulary
(§3) — read first, not incidentally.

### `chart-scaffold.tsx` — 4 sites, all A-static

| Part | Line | Property | Value | Class |
|---|---|---|---|---|
| loading label | 213 | color | `var(--ds-color-text-secondary)` | A-static |
| title | 226 | color | `var(--ds-color-text-primary)` | A-static |
| subtitle | 228 | color | `var(--ds-color-text-secondary)` | A-static |
| `VISUALLY_HIDDEN_STYLE` | 25 | border | `0` | A-static (redundant — Tailwind preflight already zeroes this channel per P-76; harmless, not a bridge) |

No `data-part`, no scope class — `className` is fully consumer-supplied. This is the
**anatomy floor for the whole family**: nothing below stamps `data-part` either. A
future skin needs to add both the scope class and the part vocabulary from scratch,
same starting state as WO-SKIN-03/04's greenfield components.

### `charts/hooks/use-chart-theme.ts` — 4 sites: 3 A-static, 1 B, **and the hook itself is dead code**

| Part | Line | Property | Value | Class |
|---|---|---|---|---|
| SSR fallback `surface.background` | 155 | background | `FALLBACK_HEX.surfaceBg` (`'#ffffff'`, hardcoded, not a `--ds-*` token) | A-static |
| SSR fallback `cssVars.background` | 172 | background | `` `var(${CSS_VARS.surfaceBg})` `` | A-static |
| live `surface.background` | 291 | background | `resolveName(CSS_VARS.surfaceBg, ...)` — `getComputedStyle` read | **B** |
| live `cssVars.background` | 308 | background | `` `var(${CSS_VARS.surfaceBg})` `` | A-static |

Line 291 is the "one true runtime read" the brief named: a CSS var resolved to a hex
string via `getComputedStyle` because D3 needs hex for color interpolation. It is
correct and, if used, must stay inline. **But `useChartTheme` has zero callers anywhere
in this repository** — verified by a repo-wide grep for `useChartTheme` across
`packages/core` and `packages/showroom` (the only other hit is a doc-comment in an
unrelated hook referencing the pattern, not a call). The sibling hook it wraps,
`useChartPersonality`, is very much alive (imported by 18 of the 20 chart files). Treat
this as the same defect shape as P-74/P-77: a documented, worked example
(`const theme = useChartTheme(); ... theme.palette`) that nothing in the codebase
exercises. **Do not add this hook's B site to the named ratchet exemption on the
strength of "it's a runtime read that must stay" — it is a runtime read that currently
never runs.** Flag for the team: wire it up or delete it before deciding whether it
needs an exemption at all.

Also: 7 real fields in this file (`lineColor`, `tickColor`, `labelColor`, `gridColor`,
`tooltipBg`, `tooltipText`, `tooltipBorder`, `textTitle`, `textSubtitle`, `textLegend`,
`textValue`) go through the exact same `resolveName(...)` runtime-hex-resolution
pattern as the counted `background` field — invisible to the counter purely because
their key names don't literally start with `background`/`color`/etc. If this hook is
ever wired up, all of them are the same B-shaped runtime read as line 291.

### `charts/hooks/use-chart-brush.ts` — 11 sites, all A-static (uses `createElement` props, which the lexer DOES scan as an object literal)

`BRUSH_COLORS` (`selectionFill`, `handleFill`, `dimFill`, `borderStroke`, all
`var(--ds-*)`) feeds 8 `fill`/`stroke` values passed as **`createElement('rect', {...})`
props** — these become SVG presentation attributes, not `style` props, but the lexer
counts them anyway since it scans any object literal, not just `style={{}}`. `dimFill`,
`selectionFill`, `handleFill` are consumed 2×/1×/2× respectively across the brush
background, selection rect, selection border, and two drag handles; `borderStroke` is
consumed at the brush-area border and the separator line, plus its own declaration —
one of the few files in this checkpoint whose declaration key (`borderStroke`, matching
`border[A-Za-z]*`) is itself counted separately from its 2 usages. Two more static
literals (`fill: 'var(--ds-color-bg-secondary, #f5f5f5)'`, `fill: 'none'`,
`fill: 'transparent'`) round out the 11. This is the file the brief cited as the
canonical "static chrome, brush overlay" example — confirmed exactly. Zero B/C.

### `charts/hooks/use-chart-export.ts` — 1 site, not a DOM paint site at all

`backgroundColor: '#ffffff'` (line 92) is the default fill color used when
rasterizing the chart SVG to a PNG on export — a canvas/image-export config value, not
anything ever applied to an element on screen. It is hardcoded (not a `--ds-*` token),
which would normally be a flag, but it configures a white paper background for
transparent-PNG export, a reasonable place to hardcode white. **A skin rule cannot
consume this — there is no element to scope a selector to.** Classify as
out-of-scope-for-migration, not A/B/C; record and leave inline.

### `charts/tooltip/crosshair.ts` — 0 counted, 4 real sites (3 A-static, 1 B), 100% D3-imperative

The counter genuinely cannot see any of this file's paint: `CROSSHAIR_LINE_COLOR`
(`var(--ds-color-border)`) is consumed via `.attr('stroke', ...)` on both guide lines
(A-static ×2); `CROSSHAIR_DOT_RING_COLOR` (`var(--ds-color-bg-primary)`) via
`.attr('stroke', ...)` on the focus dots (A-static ×1); the dot `fill` is
`.attr('fill', (d) => d.color)` — genuinely per-series (**B**). This is the sharpest
illustration of §0: a file the ratchet reports as perfectly migrated (0 sites) that in
fact has real, unmigrated paint.

### `charts/tooltip/index.tsx` — 11 sites: 9 A-static, 2 B

`TOOLTIP_STYLE` (lines 53-67) is the tooltip surface chrome — `background`,
`border`, `color`, `boxShadow`, `borderRadius` (5 sites, all `var(--ds-*)`) — the exact
"tooltip surfaces" A-static example the brief names, confirmed. `SWATCH_STYLE`
contributes `borderRadius: '50%'` (1, A-static). `TooltipValue` and `TooltipSeries`
each render a swatch `backgroundColor: color` sourced from the caller (B, 2 sites total)
alongside static label/title text colors (3 sites, A-static). This is the single
shared tooltip surface every chart in the family mounts via `<ChartScaffold overlay=...>`
— migrating it once fixes the tooltip chrome for the whole family; the 2 B sites are
the per-series swatch color and cannot be migrated.

---

## 2. Charts — per chart-type paint (census sites + the D3-imperative supplement)

Every chart type shares the same three-layer shape: (1) a React-rendered **legend**
(when `legend` is true) built from `style={{}}` objects — this is what the census
counts; (2) a D3-rendered **axis/grid/value-label chrome** — invisible to the census,
always A-static, always `var(--ds-color-text-secondary)` / `var(--ds-color-text-primary)`
/ `var(--ds-color-border-secondary)` / `var(--ds-color-border-primary)`; (3) a
D3-rendered **data mark** (bar/arc/line/dot/node/tile/polygon) fill/stroke — invisible
to the census, and this is where all of the family's real B lives.

| chart | census sites | census A/B | D3-imperative sites | D3 A/B | real total | real A/B |
|---|---:|---|---:|---|---:|---|
| bar-chart | 6 | 4A + 2B | 29 | 23A + 6B | 35 | 27A + 8B |
| line-chart | 4 | 2A + 2B | 13 | 10A + 3B | 17 | 12A + 5B |
| area-chart | 4 | 2A + 2B | 13 | 9A + 4B | 17 | 11A + 6B |
| radar-chart | 5 | 2A + 3B | 8 | 5A + 3B | 13 | 7A + 6B |
| scatter | 3 | 2A + 1B | 11 | 9A + 2B | 14 | 11A + 3B |
| pie-chart | 3 | 2A + 1B | 3 | 2A + 1B | 6 | 4A + 2B |
| treemap | 3 | 2A + 1B | 4 | 3A + 1B | 7 | 5A + 2B |
| funnel-chart | 3 | 2A + 1B | 6 | 4A + 2B | 9 | 6A + 3B |
| waterfall | 6 | 2A + 4B | 14 | 12A + 2B | 20 | 14A + 6B |
| histogram | 5 | 3A + 2B | 14 | 9A + 5B | 19 | 12A + 7B |
| gauge | 6 | 5A + 1B | 7 | 3A + 4B | 13 | 8A + 5B |
| bullet | 14 | 2A + 12B | 10 | 4A + 6B | 24 | 6A + 18B |
| sankey | 5 | 2A + 3B | 8 | 6A + 2B | 13 | 8A + 5B |
| network-graph | 3 | 2A + 1B | 5 | 4A + 1B | 8 | 6A + 2B |
| **charts subtotal** | **70** | **34A + 36B** | **145** | **103A + 42B** | **215** | **137A + 78B** |
| + foundation (§1: scaffold 4, brush 11, export 1, theme 4, crosshair 0+4, tooltip 11) | 31 | 28A + 3B | 4 | 3A + 1B | 35 | 31A + 4B |
| **charts family total** | **101** | **62A + 39B** | **149** | **106A + 43B** | **250** | **168A + 82B** |

### Per-datum/per-series B sites — the exact list (this is the part the exemption needs to be precise about)

Every B site in the charts family reduces to one of these caller-configurable inputs.
None of them are enumerable — a skin rule cannot hold a per-datum value, and a
custom-property hatch would mean one `--ds-*` property per datum, which the triage
correctly called worse than the inline value:

- **`d.color ?? palette[i % palette.length]`** (or the equivalent `colors[i % ...]`
  with no per-item override) — the dominant shape. Present, as the actual data-mark
  fill (not just the legend swatch the census sees), in: `bar-chart` (single-series,
  both orientations), `line-chart`/`area-chart` (series color, used for stroke/gradient
  fill and the dot ring), `radar-chart` (series stroke+fill+dot), `scatter` (fill+stroke),
  `pie-chart` (slice fill), `treemap` (tile fill — **no per-item override at all**,
  pure index cycling, still B because `palette`/`colors` itself is a caller-supplied
  array), `funnel-chart` (segment fill), `network-graph` (node fill via `groupColor()`
  or `d.color`).
- **Prop-with-a-DS-token-default, typed `?: string`** — the value is arbitrary once a
  caller overrides it, even though the default is a static token. This is present, and
  was NOT captured by the triage's original B table, at: `gauge`'s `needleColor`
  (default `var(--ds-color-text-primary)`, feeds 3 D3 `.attr()` calls),
  `histogram`'s `color` (bar fill) and `cumulativeColor` (line/dots/axis, default
  `var(--ds-color-info)`), `waterfall`'s `increaseColor`/`decreaseColor`/`totalColor`
  (default success/error/primary), `bullet`'s `valueColor`/`targetColor` (default
  text-primary/error) and `resolvedRangeColors[0..2]` (the brief's own citation,
  default a 3-step primary opacity ramp). **These 8 props were not enumerated as B in
  §4 of the triage** — the triage's B table only names `resolvedRangeColors`. Any named
  exemption for this checkpoint needs to add: `gauge.needleColor`, `histogram.color`,
  `histogram.cumulativeColor`, `waterfall.increaseColor/decreaseColor/totalColor`,
  `bullet.valueColor/targetColor`.
- **`use-chart-theme.ts:291`** — see §1, dead code, do not exempt without a product
  decision.
- **`tooltip/crosshair.ts`'s dot fill and `tooltip/index.tsx`'s swatch `backgroundColor`**
  — both per-series pass-through, both invisible to the census (crosshair) or already
  counted (tooltip).
- **`sankey`'s node/link `color`** — `n.color ?? colors[i % colors.length]` (node) and
  `link.color ?? sn.color` (link, falls back to its source NODE's resolved color, a
  second-order per-datum chain).

### Interaction paint in charts

Charts have essentially no CSS `:hover` at all — every hover effect is D3-imperative,
and every one of them is **STATE-SELECTED between two already-computed values**, not
new runtime data:

- `bar-chart`: `attachBarHover` reads back the bar's OWN already-rendered fill via
  `select(event.currentTarget).attr('fill')` (a GET, not a paint site) to color the
  shared crosshair/tooltip — no new paint, just plumbing an existing B value to a
  second consumer.
- `sankey`: node `mouseenter`/`mouseleave` sets `stroke: 'var(--ds-color-text-primary)'`
  / `stroke-width: 1.5` on enter, `stroke: null` / `stroke-width: null` on leave — a
  real, static A-state hover ring, plus a link-opacity dim/brighten on hover
  (`stroke-opacity`, not a counted channel).
- `scatter`, `line-chart`, `area-chart`: hover reads the mark's current fill the same
  way `bar-chart` does, purely to feed the tooltip swatch.

No file in the charts family writes an imperative `.style.<paint> =` assignment (the
mechanism the WO-SKIN-04 nav family used heavily) — every D3 interaction goes through
`.attr()`/`.style()` D3 method calls instead, all captured in the D3-imperative counts
above.

### Keyframes / per-instance `<style>` tags in charts

None. No chart file injects a `<style>` tag or declares a local `@keyframes`. All
mount/update animation is D3 `.transition()`/`.attrTween()`/`.on('end', ...)` —
compositor-adjacent but not a CSS animation the counter or a skin would ever need to
touch.

### Attribute-painted vs. style-painted (the SVG caution)

This distinction is close to moot for the charts family specifically, and here is why,
confirmed by reading every file: **every single D3 mark's paint goes through `.attr()`
or `.style()` method calls, never through a bare JSX `fill="..."` string attribute.**
There is no case in these 20 files of `<rect fill="var(--ds-color-x)">` written as a
literal JSX attribute on a React-rendered SVG element. `.attr('fill', x)` on a D3
selection sets the DOM's `fill` **attribute** (same runtime mechanism as a JSX
attribute would); `.style('fill', x)` sets the DOM's inline `style.fill` **property**.
Per file, the split is a fixed convention, not per-site: `bar-chart`/`radar-chart`/
`network-graph`/`sankey`/`waterfall`/`funnel-chart`/`gauge`/`bullet`/`pie-chart`/
`treemap`/`scatter` paint their DATA MARKS via `.attr()` (attribute-painted — the
weakest possible mechanism, beaten by any CSS including a layered rule) and their AXIS
TEXT / VALUE LABELS via `.style()` (style-painted — the strongest mechanism, beaten by
nothing but `!important`). This is consistent within a file and does not vary by
branch. **The consequence for migration**: since the census/bridge grep (§4) confirms
ZERO existing CSS anywhere in `tokens/css/` targets any chart selector, there is
nothing today that an `.attr()`-painted mark is silently losing to — but the mechanism
still matters going forward: an unlayered skin rule targeting a data-mark element must
account for the fact that the current `.attr('fill', ...)` call, if left in place
alongside a new skin rule, would need to be DELETED (not just have a competing rule
added) for the migration to be attribute-vs-CSS clean, since a skin rule and a live
`.attr()` call painting the same channel is a race the skin will always lose today
(any CSS beats a presentation attribute) — meaning simply ADDING a skin rule without
removing the `.attr()` call is inert, not merely redundant.

---

## 3. `kanban-board` (48 sites, 2 files) — the richest interaction surface in CK-E

### Anatomy today

No `data-part` anywhere in either engine. Modern carries only Tailwind utility
classNames (no first-party scope class at all — `flex`, `rounded-xl`, `hover:shadow-md`,
`ring-2`, etc.); rustic carries no classNames beyond the consumer's own `className` —
100% inline, same greenfield shape as most of this family.

### `engines/modern.tsx` — 16 sites: 10 A-static, 5 A-state, 1 B

| Part | Line | Property | Value | Class |
|---|---|---|---|---|
| column header | 153 | background | `var(--ds-surface-inset)` | A-static |
| column header accent | 154 | borderTop | `` column.color ? `3px solid ${column.color}` : undefined `` | **B** (caller-supplied per-column) |
| WIP badge, over-limit branch | 172 | background, color | `color-mix(error 15%)`, `var(--ds-color-error)` | A-state (`isOverLimit` ternary) |
| WIP badge, normal branch | 173 | background, color | `var(--ds-surface-panel)`, `var(--ds-color-text-secondary)` | A-state |
| column body | 193 | background | `isDropping ? color-mix(primary 10%) : var(--ds-surface-card)` | A-state |
| empty-column message | 206 | color | `var(--ds-color-text-secondary)` | A-static |
| card | 239 | background, borderColor, boxShadow, borderRadius | `var(--ds-surface-card)`, `var(--ds-color-border)`, `var(--ds-elevation-1)`, `var(--ds-radius-lg)` | A-static ×4 |
| add-item button | 251 | background, color, borderRadius, border | `transparent`, `var(--ds-color-text-primary)`, `var(--ds-radius-md)`, `1px dashed var(--ds-color-border)` | A-static ×4 |

**Card hover and drag feedback are NOT inline-painted at all in modern** — `hover:shadow-md`
and `opacity-40`/`opacity-100` are Tailwind utility classNames, real `:hover`/conditional
classes, zero inline mechanism, nothing to migrate. **The drop-target ring
(`ring-2` + `'--tw-ring-color'`) is a hybrid**: `'--tw-ring-color'` is a custom-property
key (not matched by the paint regex — Tailwind's own ring mechanism, not counted, not a
migration site) set conditionally alongside the Tailwind `ring-2` class.

### `engines/rustic.tsx` — 32 sites: 16 A-static, 15 A-state (5 ternary + 10 imperative), 1 B

| Part | Line(s) | Property | Class |
|---|---|---|---|
| loading text | 119 | color | A-static |
| column header | 166-171 | borderRadius, background, borderBottom | A-static ×3 |
| column header accent | 168 | borderTop | **B** (`column.color`, falls back to a static token when absent — same shape as modern) |
| title | 197 | color | A-static |
| WIP badge shape | 209 | borderRadius | A-static |
| WIP badge fill | 213, 216 | background, color | A-state (`isOverLimit` ternary, 2 branches × 2 keys) |
| column body shape | 236 | borderRadius | A-static |
| column body fill | 241, 244 | background, border | A-state (`isDropping` ternary) |
| empty message | 259 | color | A-static |
| card | 286-289 | borderRadius, background, border, boxShadow | A-static ×4 |
| card drag transform | 295 | transform | A-state (`isDragging ? 'rotate(2deg) scale(1.02)' : 'translateY(0)'`) |
| add-button | 333-337 | border, borderRadius, background, color | A-static ×4 |
| **card hover (imperative)** | 304-305 / 311-312 | `.style.boxShadow=`, `.style.transform=` | A-state, IMPERATIVE |
| **add-button hover (imperative)** | 348-350 / 354-356 | `.style.borderColor=`, `.style.color=`, `.style.background=` | A-state, IMPERATIVE |

Rustic's card hover (`boxShadow` + `transform: translateY(-2px)`) and add-button hover
(`borderColor`/`color`/`background` all swap to primary) are **imperative `.style.x=`
writes, the direct-migration-target mechanism**: delete the write, add a `:hover`
(guarded by `:not([data-dragging='true'])`, since the code explicitly suppresses the
hover lift while dragging) rule to the skin. This is the richest single interaction
surface in CK-E — modern has NONE of this (its equivalent feedback is Tailwind
utility classes, real CSS already).

### Suppression risk

None. `tokens/css/` has zero `kanban` selectors anywhere (grep-confirmed) — fully
greenfield, no legacy layer to reconcile.

### Cross-family dependency (record, not a CK-E defect)

Modern imports `pillBadgeSmStyle`/`spinnerStyle` from
`patterns/_internal/engines/modern/styles.ts` — a file in a DIFFERENT checkpoint's
scope (`patterns/_internal`, 18 sites/1 file per the triage's family table, not part
of CK-E's 308/295). Whoever migrates `_internal/engines/modern/styles.ts` should know
`kanban-board` (and, per §5, `tree-view`) consume it; migrating one without checking
the other risks a visual regression the kanban/tree-view baselines would catch but the
`_internal` migration's own baselines would not necessarily cover.

---

## 4. `calendar-view` (45 sites, 2 files)

### Anatomy today

No `data-part`. Modern uses Tailwind utility classNames for layout only (no first-party
scope class); rustic is 100% inline. Both share the exact same event-color hatch shape.

### `engines/modern.tsx` — 28 sites: 25 A-static, 2 A-state, 1 B

Three nav buttons + Today button share one literal style object each (background
`transparent`, color, borderRadius, border `none` — 4 keys × 3 buttons = 12 A-static,
though the button style object is NOT factored into a shared const — copy-pasted 3×,
unlike rustic's `btn` const below); the view-mode `<select>` (4 keys, A-static);
loading spinner (border/borderTopColor/borderRadius, A-static ×3); grid container
border (A-static); day-name header background+border (A-static ×2); date cell
background — `cell ? 'var(--ds-surface-card)' : 'var(--ds-surface-inset)'` (A-state);
date-cell border (A-static); today's date number `color: 'var(--ds-color-primary)'`,
applied via a **whole-object ternary** `style={isToday ? {color:...} : undefined}`
(A-state); event chip `color` (A-static) + `background: ev.color ?? 'var(--ds-color-primary)'`
(**B**, per-event); "+N more" text (A-static).

### `engines/rustic.tsx` — 17 A-static... 13 A-static, 3 A-state, 1 B

A shared `const btn` style object (border, borderRadius, background, color — 4 keys,
reused by reference at 3 call sites, correctly counted once) is the direct analog of
modern's copy-pasted button style — **a real de-duplication modern does not have,
worth noting as an asymmetry, not a defect**. Grid border (A-static); day-name header
background+borderBottom (A-static ×2); date cell `borderRight` (A-state — suppressed
on the last column to avoid a double border) + `borderBottom` (A-static) + `background`
(A-state, `cell ? elevated : secondary`); today's-date-number `color` (A-state,
`isToday ? primary : text-primary`); event chip `borderRadius`+`color` (A-static ×2) +
`background: ev.color ?? 'var(--ds-color-primary)'` (**B**); "+more" text (A-static).

### Interaction paint, keyframes, suppression

No hover paint in either engine. No keyframes, no injected `<style>` tags. Zero
`tokens/css/` selectors target calendar-view — greenfield, suppression-risk-free.

---

## 5. `tree-view` (35 sites, 2 files)

### Anatomy today

No `data-part`, no first-party scope class in either engine.

### `engines/modern.tsx` — 16 sites: 14 A-static, 2 A-state

Selected-row highlight is a **conditional spread** —
`...(selected ? { background: color-mix(primary 10%), color: primary } : {})` — the
false branch is an empty object, not an alternate static value (A-state, maps to
`[data-selected]` with no base-state override needed). Expand/collapse toggle button
(background/color/borderRadius/border, A-static ×4). Checkbox `accentColor` (A-static).
Drag-handle `color` (A-static). Root container `boxShadow` from the SHARED
`panelCardStyle` import (same `_internal` cross-family dependency as kanban-board —
see §3) plus an inline `boxShadow` override, appearing at BOTH the loading branch and
the main branch (2 separate source occurrences, both A-static). Skeleton row
`borderRadius`+`background` (A-static ×2). Search input `borderRadius`/`border`/
`background`/`color` (A-static ×4).

### `engines/rustic.tsx` — 19 sites: 17 A-static, 2 A-state

A `s` namespace of pre-computed style objects (the same pattern Timeline's rustic
engine and Steps' rustic engine already use). `s.container` (color/background/border/
borderRadius, A-static ×4). `s.searchInput` (border/borderRadius/**outline**/background/
color, A-static ×5 — `outline: 'none'` is a real counted channel here, easy to miss
since it's the only `outline` site in this checkpoint). `s.nodeRow(depth, selected,
disabled)`: a STATIC `borderRadius` (1, A-static) plus `background`/`color` keyed on
`selected` (A-state ×2). `s.toggleBtn`: background/border/color, all static regardless
of the `visible` param (A-static ×3 — the function takes a boolean but only branches
`visibility`, not a paint channel). `s.checkbox` `accentColor` (A-static). `s.dragHandle`
`color` (A-static). `s.skeleton(w,h)`: `borderRadius`+`background`, static regardless of
size args (A-static ×2).

### Suppression risk

None (`tokens/css/` has zero tree-view selectors).

---

## 6. `map-view` (29 sites, 2 files) — the placeholder component

Both engines render a static "Map placeholder" panel (explicitly a stand-in for a real
map library) plus a marker list. This is the smallest, simplest component in CK-E.

### `engines/modern.tsx` — 13 sites: 11 A-static, 1 A-state, 1 B

Loading spinner (border/borderTopColor/borderRadius, A-static ×3). Placeholder panel
`background`+`borderColor` (A-static ×2, `background` is a STATIC `color-mix()` of
`var(--ds-color-info)`, not caller-driven — the placeholder tint is fixed, unlike
kanban's column accent). Three placeholder text lines, each its own `color` (A-static
×3). "No markers" text (A-static). Marker-list container `borderColor` (A-static,
carried alongside a `'--tw-divide-color'` custom property — not counted, Tailwind's
own divide mechanism, same hybrid shape as kanban's ring). Marker row background — a
whole-object ternary, `style={isSelected ? {background: color-mix(primary 10%)} : {}}`
(A-state). Marker color dot `background: marker.color` (**B**, per-marker, no default
fallback at all — unlike every other per-item color in this checkpoint, this one has
NO `?? var(--ds-*)` fallback; if `marker.color` is undefined the dot renders with no
background, worth flagging as a real (pre-existing, not migration-caused) rendering
gap). Coordinates text `color` (A-static).

### `engines/rustic.tsx` — 16 sites: 13 A-static, 2 A-state, 1 B

Loading text `color` (A-static). Placeholder panel `borderRadius`+`background`+`border`
(A-static ×3). Three placeholder text lines (A-static ×3). "No markers" text
(A-static). Marker-list container `border`+`borderRadius` (A-static ×2). Marker row:
`background` — `isSelected ? primary-50-tint : elevated-surface` (A-state) +
`borderBottom` — present except on the last row (A-state, structurally identical to
calendar-view rustic's last-column border suppression). Marker color dot `borderRadius`
(A-static) + `background: marker.color` (**B**, same no-fallback gap as modern).
Marker label `color` (A-static). Coordinates `color` (A-static).

### Suppression risk

None (`tokens/css/` has zero map-view selectors).

---

## 7. Vocabulary map — VERIFIED, not assumed

Per the triage's own corrections (CK-C, CK-D), similarity is not sharing, and every
claim below was checked against actual imports/values, not inferred from house style.

- **Charts genuinely DO share a vocabulary**, and it is real, not aspirational:
  `useChartPersonality` (18 of 20 chart files import it directly), `ChartScaffold`
  (every chart type), `ChartTooltip`/`TooltipValue`/`TooltipSeries` (every chart with
  a hover tooltip), and `createChartCrosshair`/`pointerToContainerPosition` (every
  line-family and discrete-mark chart: bar, line, area, scatter). The axis/grid/
  value-label color constants (`var(--ds-color-text-secondary)`,
  `var(--ds-color-text-primary)`, `var(--ds-color-border-secondary)`,
  `var(--ds-color-border-primary)`) are not merely similar across files — they are
  the literal same four `var()` strings, typed identically, in every chart that has
  axes. **One skin can genuinely cover this vocabulary once** — this is the positive
  counter-case to CK-C/CK-D's falsified premise, verified by reading all 20 files, not
  assumed from the shared imports.
- **kanban-board / calendar-view / tree-view / map-view do NOT share a vocabulary with
  each other or with charts.** Each reinvented its own token set: kanban's
  `pillBadgeSmStyle`/column-accent shape, calendar's day-grid/event-chip shape,
  tree-view's row/toggle/checkbox shape, map-view's placeholder/marker-row shape are
  four independent designs. The only thing they share is the STRUCTURAL pattern (a
  `column.color`/`ev.color`/`marker.color` per-item override with a `var(--ds-*)`
  fallback) — same shape as CK-C's finding, similarity without sharing. Each needs its
  own skin, own token names.
- **`_internal/engines/modern/styles.ts` is a real, if narrow, shared dependency** —
  `pillBadgeSmStyle`/`spinnerStyle` (kanban-board) and `panelCardStyle` (tree-view)
  both import from it. This file is OUTSIDE CK-E's own scope (it belongs to
  `patterns/_internal`, a separate family in the triage's table) but two CK-E
  components consume it. Flag for sequencing: migrating `_internal`'s styles file
  without checking these two importers risks an untracked visual change.
- **The event/marker/column-color hatch pattern is genuinely one shape, independently
  reinvented four times** (kanban `column.color`, calendar `ev.color`, map-view
  `marker.color`, plus the triage's own citation of `surfaces/pages/operations/kanban`'s
  `col.color` outside this checkpoint) — each its own prop, each its own fallback
  token, none importing from a shared source. This matches the triage's own C table
  characterization (§5) exactly; confirmed independently here.

---

## 8. Bridge rules — dead/live disposition

**`tokens/css/engines/{modern,rustic}/theme.css` and `tokens/css/runtime/personality.css`
carry ZERO selectors for any of `kanban`, `calendar`, `chart`, `treemap`, `sankey`,
`gauge`, `bullet`, `funnel`, `waterfall`, `histogram`, `network-graph`, `radar`,
`tree-view`, `map-view`** — grep-confirmed across both engine theme files and the
personality runtime file. This entire checkpoint is suppression-risk-free by the
CK-D definition: no legacy layer to reconcile, nothing pre-existing to preserve or
accidentally kill.

**One exception, found by grepping for the BARE (unprefixed) class family instead of
a first-party name — a real, live, cross-component bridge collision:**

`tokens/css/engines/modern/theme.css:787-794`:
```css
[data-tenant] .timeline::before {
  background-color: var(--ds-timeline-line-color);
  width: var(--ds-timeline-line-width);
}
[data-tenant] .timeline-start,
[data-tenant] .timeline-middle,
[data-tenant] .timeline-end {
  color: var(--ds-text-primary);
}
```

This is layered (`rottay-engines`), so per P-76 it is **DEAD on no channel here** —
`background-color` and `color` are both LIVE (unaffected by preflight); the `width`
declaration is not a paint channel at all (untouched by preflight regardless). This
rule was authored for `primitives/display/Timeline` (WO-SKIN-05 checkpoint D2,
already migrated, scoped under `.rottay-timeline.rottay-timeline--modern[data-part=...]`)
— **but `patterns/visualization/timeline`'s modern engine (this checkpoint's
component) independently renders the exact same bare DaisyUI classes**
(`<ul className="timeline timeline-vertical">`, `className="timeline-start"` /
`"timeline-end"` / `"timeline-middle"`, confirmed at `timeline/engines/modern.tsx`
lines 94, 102, 114, 143) with **no scope class of its own that would exclude it** —
`patterns/visualization/timeline`'s root only carries `ds-pattern-timeline
ds-engine-modern`, which this rule doesn't reference and doesn't need to.

**Consequence: this bridge rule is the live, sole source of the timeline item text
color today, for the wrong component.** `timeline/engines/modern.tsx` sets no inline
`color` anywhere on the `.timeline-start`/`.timeline-end` divs or their `<time>`/text
children — the timestamp, username, title, and description all render at
`var(--ds-text-primary)` purely because this bare selector matches them, not because
of anything in the component's own inline styles. **This is exactly the "personality/
bridge wins today, nothing inline contests it" hazard the lane's law warns about**,
except here it's a THEME.CSS bridge, not personality.css, and it's cross-component:
authored for one Timeline, silently painting a second, unrelated one. A byte-exact
migration of `patterns/visualization/timeline`'s modern engine must either (a) leave
this rule completely untouched and NOT add any unlayered skin rule targeting
`.timeline-start`/`.timeline-end`/`.timeline-middle` (an unlayered rule would silently
outrank this bridge and repaint the text a different way), or (b) explicitly
transcribe `color: var(--ds-text-primary)` onto the pattern's own `data-part`-scoped
selectors so the migration doesn't depend on a bridge rule that was never written with
this component in mind. Do not assume this channel is "already covered" just because
the pixels are currently correct.

---

## 9. Interaction paint summary (React state vs. imperative `.style.x=`, live vs. dead)

| component | mechanism | count | live/dead |
|---|---|---:|---|
| `kanban-board` rustic | imperative `.style.x=` (card hover, add-button hover) | 10 | LIVE — nothing else paints these channels |
| `kanban-board` modern | Tailwind `:hover` utility class (not inline, not counted) | — | LIVE, different mechanism entirely |
| `timeline` rustic | imperative `.style.boxShadow=` (card hover) | 2 | LIVE |
| `sankey` | D3 `.on('mouseenter'/'mouseleave')` → `.attr('stroke', ...)` | 2 (+ opacity, uncounted) | LIVE |
| `bar-chart`/`scatter`/`line-chart`/`area-chart` | D3 hover reads (`select(...).attr('fill')` as a GETTER, not a write) | n/a | not a paint site — feeds tooltip only |
| all other files in CK-E | none | 0 | — |

No imperative write in this checkpoint was found to be dead (the shape WO-SKIN-04
found in Menu — an injected `!important` CSS rule racing a JS handler and winning —
does not recur here; every imperative write in CK-E is the only mechanism painting its
channel).

---

## 10. Keyframes / per-instance `<style>` tags — one real collision found

**`tree-view/engines/rustic.tsx:230`** injects, on every mount of the loading state:
```js
<style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
```

`tokens/css/foundation/animations/keyframes.css:352` **already declares a global
`@keyframes pulse`** — with a DIFFERENT value: `50% { opacity: 0.5; }`, not `0.4`. Per
CSS keyframe resolution, a later-parsed `@keyframes pulse` declaration overrides the
earlier one by name, document-wide, regardless of selector scope or source order
otherwise — this is not a scoped rule, keyframe names are global. Since this
`<style>` tag is injected at component-render time (necessarily after the global
stylesheet has already loaded), **mounting a loading `TreeView` (rustic) can silently
change the opacity trough of every OTHER element on the page animating with
`animation: pulse ...`, anywhere, from 0.5 to 0.4, for as long as the tree view stays
mounted.** This is a real, live, currently-shipping cross-component contamination bug,
not a hypothetical.

**This is not unique to tree-view, and there is already a codified law it violates**:
`components/patterns/data/detail-panel/tests/PatternDetailPanel.real-engines.test.tsx:196`
has a real test asserting `detail-panel` "renames its local pulse to
`ds-detail-panel-pulse` and does not redefine the global `@keyframes pulse`" — i.e.
this exact hazard was already found, fixed, and tested for once elsewhere in the DS.
Grep confirms the SAME un-namespaced `@keyframes pulse {...opacity:.4}` body is ALSO
injected, unfixed, by (all outside CK-E, record only, do not action here):
`patterns/forms/step-wizard` (both engines), `patterns/workflow/approval-workflow`
(rustic, twice in the same file), `patterns/communication/live-feed` (rustic, twice),
`patterns/data/stats-grid` (rustic). **This is a systemic, cross-checkpoint defect**,
not a CK-E-specific one, but CK-E's instance (`tree-view/engines/rustic.tsx:230`) is
real and in-scope: a migration of tree-view should rename this keyframe to
`ds-tree-view-pulse` (or fold it into a shared, already-namespaced pulse token if one
gets established) as part of moving it into the skin, per the same law
`detail-panel` already follows.

**No other collision found.** `ds-spin` (consumed via inline `animation:` on the
loading spinners in `timeline`/`map-view`/`calendar-view` modern engines) is an
existing, correctly-namespaced global keyframe (`tokens/css/engines/rustic/theme.css:1052`)
— not a new collision, this is the CORRECT pattern tree-view's `pulse` should have
followed. No chart file injects any `<style>` tag or `@keyframes` at all (§2).

---

## 11. Engine asymmetries, dead code, pre-existing defects (record only)

- **`useChartTheme` is dead code** (§1) — zero callers anywhere in the repo. Its lone
  counted B site should not be added to a named exemption without a product decision
  to wire it up or delete it.
- **`use-chart-theme.ts` resolves 7 more fields via the identical runtime-hex-resolve
  pattern as its one counted `background` field**, invisible to the counter purely by
  key-name coincidence (`lineColor`, `tickColor`, etc. don't match the anchored
  regex). If the hook is ever wired up, budget for all 8, not 1.
- **`use-chart-export.ts`'s one counted site is not a DOM paint site** — a PNG-export
  background config value, unreachable by any skin rule.
- **Tree-view rustic's `@keyframes pulse` silently overrides the DS's own global pulse
  keyframe** (§10) — a live, currently-shipping cross-component bug, with a documented
  fix pattern (`detail-panel`'s test) already established elsewhere in the codebase
  but not applied here.
- **`map-view`'s marker color dot has no fallback token in either engine**
  (`background: marker.color`, no `?? var(--ds-*)`) — every other per-item color in
  this checkpoint (`column.color`, `ev.color`, `d.color`, `n.color`, `seg.color`, etc.)
  has a static fallback; this one does not. Pre-existing rendering gap (an undefined
  `marker.color` renders an empty/transparent dot), not migration-caused.
- **Kanban-board's WIP-limit accent color and calendar/map's per-item color are
  independently reinvented four times** (§7) with different prop names and different
  fallback tokens — a real duplication, not a defect, but not mergeable inside a
  byte-exact migration.
- **`kanban-board` modern's card hover/drag feedback is Tailwind-utility-class-driven
  (real CSS already); rustic's equivalent is 100% imperative `.style.x=`** — the
  widest interaction-mechanism gap between engines found in this checkpoint. Rustic
  additionally adds a drag `rotate(2deg) scale(1.02)` transform and a card-hover lift
  that modern has no equivalent of at all (modern only dims to `opacity-40` while
  dragging, no lift, no rotation) — a genuine feature-richness asymmetry, not just a
  mechanism difference; preserve both as-is.
- **`calendar-view` modern copy-pastes its 3-button style object 3×; rustic factors it
  into one shared `const btn`** — the same de-duplication asymmetry WO-SKIN-04 found
  repeatedly in the navigation family (rustic engines tend to share one object,
  modern engines tend to duplicate the literal). A skin can de-duplicate this even
  though the source never did.
- **`sankey`'s per-link color falls back through its SOURCE NODE's already-resolved
  color** (`link.color ?? sn.color`), a second-order dependency chain unique to this
  chart — worth flagging since it means the link B site is not independently
  computable from the link's own data alone.
- **No file in CK-E stamps `data-part` anywhere** — every one of these 30 files is
  greenfield for anatomy, same starting state as WO-SKIN-03's five status components
  and WO-SKIN-04's whole navigation family. `ds-pattern-timeline`/`ds-engine-{modern,
  rustic,classic}` (stamped by `patterns/visualization/timeline` only, all three
  engines) are the one exception — real classNames, but grep-confirmed dead (zero
  `tokens/css/` references to `ds-pattern-timeline` specifically), a hook for a future
  skin to key off, not a live mechanism today.

---

## 12. Final counts

**Census-scope sites (this document's own re-derivation, verified against every file
actually read — see the moving-target caution at the top before treating this as
frozen):**

| family | files | census sites | A (static+state) | B | C |
|---|---:|---:|---:|---:|---:|
| charts (incl. foundation) | 20 | 101 | 62 | 39 | 0 |
| kanban-board | 2 | 48 | 41 | 2 | 0 |
| calendar-view | 2 | 45 | 41 | 2 | 0 |
| timeline | 2 | 37 | 34 | 0 | 3 |
| tree-view | 2 | 35 | 35 | 0 | 0 |
| map-view | 2 | 29 | 27 | 2 | 0 |
| **CK-E total** | **30** | **295** | **240** | **45** | **3** |

**Plus the D3-imperative supplement, uncounted by the census, real paint, charts-only:**

| | sites | A | B |
|---|---:|---:|---:|
| D3 `.attr()`/`.style()` calls across all 20 chart files (§0, §2) | 149 | 106 | 43 |

**Grand real total for CK-E: 444 sites (353 A, 88 B, 3 C).**

**The exact B list for a named ratchet exemption** (every caller-configurable,
per-datum/per-series/per-item color in this checkpoint; a file wrongly on this list
never gets migrated, so treat every line below as load-bearing):

- All `d.color ?? palette[i % palette.length]` / `colors[i % colors.length]` sites
  (legend swatches AND the actual data-mark fill/stroke) in: `bar-chart`, `line-chart`,
  `area-chart`, `radar-chart`, `scatter`, `pie-chart`, `treemap`, `funnel-chart`,
  `network-graph`.
- `sankey`'s node `color` (`n.color ?? colors[i % ...]`) and link `color`
  (`link.color ?? sn.color`).
- The 8 prop-with-DS-token-default color props NOT in the triage's original B table:
  `gauge.needleColor`, `histogram.color`, `histogram.cumulativeColor`,
  `waterfall.increaseColor`, `waterfall.decreaseColor`, `waterfall.totalColor`,
  `bullet.valueColor`, `bullet.targetColor` (`bullet.resolvedRangeColors[0..2]` was
  already named by the brief/triage).
- `charts/tooltip/crosshair.ts`'s dot fill (`d.color`) and `charts/tooltip/index.tsx`'s
  swatch `backgroundColor` (`color`/`item.color`).
- `use-chart-theme.ts:291` — **only if the team decides to wire the hook up**; as dead
  code today it should not be added to a live exemption without that decision.
- `kanban-board`'s column accent (`column.color`, both engines).
- `calendar-view`'s event chip background (`ev.color`, both engines).
- `map-view`'s marker color dot (`marker.color`, both engines — no fallback token,
  see §11).

**The three C (custom-property hatch) sites** are all in `timeline/engines/rustic.tsx`
(§ established in the earlier per-family scan, not re-derived line-by-line in this
document since Timeline's inventory was completed and cross-checked before the rest of
this checkpoint): the dot fill, its matching box-shadow ring, and the custom-dot
border, all keyed off one caller-supplied `color` prop with a bounded set of
consumption sites — genuinely completable via `--ds-timeline-dot-color`, unlike the B
list above.

**The three biggest traps for whoever migrates this checkpoint:**

1. **The census is not the paint.** For the 20 chart files, `fleet.inlinePaint` sees
   40% of the real paint (101 of 250). A file reading 0 or a low single digit (bar-chart
   at 6, waterfall at 6, gauge at 6) is not close to migrated — it has 5-6x more real
   paint sitting in D3 `.attr()`/`.style()` calls that no gate currently tracks. Any
   "done" signal for this checkpoint MUST be defined against the real total, not
   `fleet.inlinePaint`, or the ratchet will report false completion the moment the
   census-visible sites are moved while the D3-imperative majority stays inline,
   untracked, forever.
2. **The theme.css bridge at `[data-tenant] .timeline-start/-middle/-end { color }`
   is live for THIS checkpoint's Timeline component today, and was authored for a
   different one.** A skin author who assumes "no bridge rules target this family"
   (true for every other component in CK-E) will miss the one real exception and either
   silently repaint the timeline item text (by adding any unlayered rule that happens
   to touch `.timeline-start`/`.timeline-end`) or ship a migration that LOOKS
   byte-exact in isolation but is only correct by accident of not having touched that
   selector.
3. **`useChartTheme` is a fully-worked, JSDoc-documented, exported hook with zero
   callers.** Its one counted B site is real code that never runs. Treating it as a
   live runtime-read exemption (which is what its own code comment and the brief's
   framing both invite) without first checking callers repeats the exact "a documented
   example is assumed exercised" mistake that produced P-74 and P-77 — measure before
   contracting, per the lane's own stated lesson.
