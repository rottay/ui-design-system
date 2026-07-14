# WO-SKIN-06 CK-E — visualization migration contract

Status: **Stage-1 certified** at `506d065f` (2026-07-14).

This contract is the executable authority for CK-E. It supersedes the stale `476 instrumented`
headline in `wo-skin-06-ck-e-inventory.md` and consumes the corrected per-file measurements in
`wo-skin-06-ck-e-reaudit.md`.

## 1. Exact boundary

CK-E starts with **478** measured paint sites across 35 paint-bearing files. The migration must move
exactly **367** static or finite-state sites and retain exactly **111** runtime/non-paint sites:

| channel | start | final floor | migrate |
| --- | ---: | ---: | ---: |
| inline paint | 299 | 50 | 249 |
| runtime SVG paint | 179 | 61 | 118 |
| **combined** | **478** | **111** | **367** |

All 179 runtime SVG sites are classified before migration: 166 D3 setters, nine JSX SVG
presentation attributes and four DOM `setAttribute` sites. Unclassified is zero and must remain
zero. `roadmap/skin-exemptions.json` owns the exact per-file floors; a floor is an identity, not a
budget that another site may consume.

The non-overlapping execution batches are:

| batch | scope | start | floor | migrate |
| --- | --- | ---: | ---: | ---: |
| non-chart A | CalendarView + MapView | 75 | 4 | 71 |
| non-chart B | KanbanBoard | 48 | 2 | 46 |
| non-chart C | Timeline + TreeView | 72 | 0 | 72 |
| chart A | Bar, Area, Radar, Treemap, Pie | 80 | 28 | 52 |
| chart B | Bullet, Waterfall, Line, Gantt, HeatMap, CalendarHeatMap | 79 | 35 | 44 |
| chart C | Histogram, Scatter, Gauge, Sankey, Sparkline, Funnel, NetworkGraph | 82 | 29 | 53 |
| foundation | scaffold, brush, tooltip, crosshair, theme/export | 42 | 13 | 29 |

## 2. Stage-1 law and non-goals

This is a byte-exact ownership move. Preserve every authored paint value, fallback, alpha, SVG
attribute/property choice, selector outcome, DOM/React/D3 element, conditional branch, engine
asymmetry, interaction and consumer-style precedence.

Stage 1 does not:

- redesign chart aesthetics, palettes, axes, density, motion or responsive information hierarchy;
- consolidate similar-looking chart or pattern vocabularies;
- wire `useChartTheme`, which currently has no callers;
- resolve CSS custom properties before D3 interpolation;
- change the current HeatMap/CalendarHeatMap colour behavior;
- replace D3, introduce Three.js, or add the later modern visualization layer;
- convert caller-, datum-, tenant-, series- or document-derived paint into static CSS.

Those are Stage-2 product/design changes and begin only after WO-SKIN byte-exact adoption is
certified.

## 3. Runtime and non-paint adjudication

The **50 inline** and **61 runtime SVG** floors remain at their existing source identities:

- caller/datum/series-derived marks, gradients, legend swatches and tooltip swatches;
- CalendarView event colour, MapView marker colour and KanbanBoard column colour;
- chart states whose value is computed from live data rather than selected from a finite authored
  palette;
- Crosshair's live series colour;
- the exporter’s two inline paint defaults and four DOM copy operations required for SVG/PNG
  fidelity;
- the four `background` fields in `use-chart-theme.ts`, which build theme-resolution data and are
  `SKIN-EXEMPT-NOT-PAINT`, not DOM paint.

The two computed exporter statements are counted only through the narrow
`@runtime-svg-paint-copy` marker. The marker applies to the immediately associated computed DOM
`setAttribute` statement; it is not a file-wide hatch.

`use-chart-export.ts` has one redundant white PNG default matching `exportAsPng`. It may be removed
only if a focused export test proves the default and explicit paths remain identical. Otherwise it
must remain and the final floor/contract must be adjusted explicitly rather than disappearing from
the census.

## 4. Selector anatomy

Every CSS rule must be anchored to the component's own scope. Bare `[data-part]` selectors are
forbidden.

The inert pre-step establishes these roots:

- non-charts: `.ds-pattern-calendar-view`, `.ds-pattern-map-view`,
  `.ds-pattern-kanban-board`, `.ds-pattern-timeline`, `.ds-pattern-tree-view`, always paired with
  `.ds-engine-modern` or `.ds-engine-rustic` and `data-part="root"`;
- charts: `.ds-chart-area`, `.ds-chart-bar`, `.ds-chart-bullet`,
  `.ds-chart-calendar-heatmap`, `.ds-chart-funnel`, `.ds-chart-gantt`, `.ds-chart-gauge`,
  `.ds-chart-heatmap`, `.ds-chart-histogram`, `.ds-chart-line`, `.ds-chart-network-graph`,
  `.ds-chart-pie`, `.ds-chart-radar`, `.ds-chart-sankey`, `.ds-chart-scatter`,
  `.ds-chart-sparkline`, `.ds-chart-treemap`, `.ds-chart-waterfall`;
- foundation: `.ds-chart-scaffold`, `.ds-chart-brush`, `.ds-chart-tooltip` and the scoped chart
  ancestor for Crosshair.

React, D3 and DOM-authored elements expose `data-part`; finite authored branches expose explicit
`data-state`, `data-status`, `data-variant`, `data-layout`, `data-orientation`, `data-x-type` or
pattern-specific boolean attributes. Runtime-valued elements may still receive anatomy hooks, but
their paint remains inline/runtime.

The migration may not introduce wrappers or reorder SVG layers. Attribute-stripped element-tree
hashes must continue to match the pre-step parents. In particular, preserve D3 layer order because
it controls both paint and pointer interception.

## 5. Skin ownership and wiring

Engine-split CalendarView, MapView, KanbanBoard, Timeline and TreeView own separate modern and
rustic skin files under `tokens/css/engines/{modern,rustic}/skin/`. Their filenames must identify
the pattern and avoid colliding with the primitive `calendar.css`, `timeline.css` and `tree.css`.

Charts and their shared foundation own component-scoped, unlayered files under
`tokens/css/components/skin/`. Separate files/batches are preferred over one monolithic chart skin
so a chart can evolve without creating accidental cross-chart vocabulary.

The orchestrator alone wires new skins append-only into both canonical entrypoints:

- `packages/core/src/tokens/css/foundation/base.css`;
- `packages/core/src/tokens/css/entrypoints/styles.css`.

After wiring, regenerate every tracked tenant/vertical artifact and bundle. A skin is not complete
if it only appears in source or in one entrypoint.

## 6. Specificity and precedence laws

- Preserve whether the source uses `fill`, `stroke`, `color`, `background`, `backgroundColor`,
  `border`, `borderColor`, `boxShadow`, `opacity` or SVG presentation attributes.
- Do not replace a runtime attribute with a custom-property bridge merely to lower the counter.
- Static D3 `.attr()`/`.style()` paint moves to CSS through the already-stamped part/state hook;
  geometry, transforms, dimensions, dash offsets and interaction writes stay in D3.
- Finite authored palettes are CSS states, not runtime exemptions.
- Preserve hover/drag/selected/loading specificity and SVG layer precedence without `!important`.
- Preserve caller `style` merge order. If extraction would let caller paint win where the local
  default previously won, keep the site or add a focused precedence contract before moving it.
- Do not reuse existing `components/skin/visualization.css`; it belongs to
  `VisualizationSurface`, not these patterns/charts.

## 7. Pre-step evidence

Before any paint moved, the certified pre-step proved:

- exact start census `478 = 299 inline + 179 runtime SVG`;
- exact target census `111 = 50 inline + 61 runtime SVG`;
- runtime channels `166 D3 + 9 JSX + 4 DOM`, classified `179`, unclassified `0`;
- unchanged React/D3/DOM topology for every paint-bearing file;
- all required scopes, parts and finite-state hooks exist;
- focused Node/component contracts, both typechecks, engine audit and `git diff --check` are green;
- production core build and the 289-page Showroom build are green.

The deterministic production fixture at `/probe/whitelabel-torture?ckE=1` covers five normal and
five loading non-chart patterns, 17 scaffold charts, one loading scaffold, Sparkline/brush,
tooltip/crosshair, Sankey hover, brush selection and rustic Kanban/Timeline interaction states.
Its 14 Playwright tests generate 23 snapshots and pass without updates across Rottay dark, BitHire
light, modern/rustic, desktop and mobile composition.

## 8. Migration and exit gate

Each batch must first prove its own exact post-migration floor, then the global audit must reconcile
all batches. CK-E is certified only when:

- `478 -> 111` is exact and all 367 migrations are accounted for;
- inline is exactly 50, runtime SVG exactly 61 and unclassified exactly zero;
- no new exemption, generic hatch, wrapper or topology change was introduced;
- all selector-referenced parts/states exist and all new skin rules are scope-anchored;
- `skins.parseErrors`, `skins.unwired`, `skins.deadParts` and `skins.exemptionsBreached` are zero;
- source topology, chart/pattern behavior, export behavior and caller precedence contracts pass;
- core typecheck/build, Showroom typecheck/build and every tracked artifact check pass;
- all 14 Playwright tests pass twice without updating the 23 pre-step snapshots;
- independent review finds no visual, responsive, engine, tenant or interaction regression.

All exit conditions were met at `506d065f`; CK-E may be marked complete in
`wo-skin-06-plan.md` and `roadmap/registry.json`.

## 9. Certified result

The migration closed at the contracted boundary with no floor drift:

- `478 -> 111` exact: inline `299 -> 50`, runtime SVG `179 -> 61`, unclassified `0`;
- all **367** static/finite-state sites moved into **23** scope-anchored skins across the seven
  non-overlapping batches;
- all tracked tenant/vertical bundles were regenerated and matched both canonical entrypoints;
- focused Node contracts passed `55/55`; the visualization Vitest matrix passed `134/134`;
- core and Showroom typechecks plus production builds passed; Showroom generated all 289 pages;
- the engine audit passed with `skins.parseErrors`, `skins.unwired`, `skins.deadParts` and
  `skins.exemptionsBreached` at zero;
- all 14 Playwright cases passed twice against the same 23 committed snapshots, with no update;
- independent adversarial review found no P0/P1/P2 regression.

The final review also pinned the high-risk parity edges that a paint counter alone cannot prove:
Gauge custom/default precedence and export fidelity; Sankey hover specificity; Histogram/Scatter
grid repaint order; rustic Kanban's initial/hover/settled cycle; and clickable versus inert rustic
Timeline rows. Stage-2 visual redesign remains explicitly outside this byte-exact checkpoint.
