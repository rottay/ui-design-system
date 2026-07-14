# WO-SKIN-06 CK-E — current visualization re-audit

Status: measured contract input with inert pre-step certified (2026-07-14). This file supersedes
the `476 instrumented` headline in `wo-skin-06-ck-e-inventory.md`; the older inventory remains
useful as historical source notes. The executable migration contract now lives in
`wo-skin-06-ck-e-contract.md`.

## Exact current scope

CK-E contains **478 gate sites** across 35 paint-bearing files:

| family | inline | runtime SVG | classified | unclassified |
| --- | ---: | ---: | ---: | ---: |
| charts | 104 | 179 | 179 | 0 |
| calendar-view | 46 | 0 | 0 | 0 |
| kanban-board | 48 | 0 | 0 | 0 |
| map-view | 29 | 0 | 0 | 0 |
| timeline | 37 | 0 | 0 | 0 |
| tree-view | 35 | 0 | 0 | 0 |
| **total** | **299** | **179** | **179** | **0** |

The runtime channel is 166 D3 setters, nine JSX SVG attributes and four DOM setters. The two
computed DOM setters in `charts/utils/export.ts` are now explicitly classified:

- `setAttribute(prop, value)`;
- `setAttribute(prop === 'color' ? 'fill' : prop, value)`.

They copy live presentation paint for export fidelity. The fail-closed classifier counts them via
the narrow `@runtime-svg-paint-copy` statement marker without changing behavior; the exporter keeps
its exact runtime-SVG floor of four.

## Stage-1 target

| channel | start | final floor | migrate |
| --- | ---: | ---: | ---: |
| inline | 299 | 50 | 249 |
| runtime SVG | 179 | 61 | 118 |
| **combined** | **478** | **111** | **367** |

The 61 runtime-SVG sites are caller-, datum- or document-derived paint. All now have exact per-file
executable floors in `roadmap/skin-exemptions.json`, and runtime unclassified is pinned at zero.

## Per-file target floors

`I` is current inline paint, `C/U` is classified/unclassified runtime SVG, and `IF/RF` are the
required final inline/runtime floors.

| file | I | C/U | IF | RF |
| --- | ---: | ---: | ---: | ---: |
| calendar-view modern | 28 | 0/0 | 1 | 0 |
| calendar-view rustic | 18 | 0/0 | 1 | 0 |
| kanban modern | 16 | 0/0 | 1 | 0 |
| kanban rustic | 32 | 0/0 | 1 | 0 |
| map modern | 13 | 0/0 | 1 | 0 |
| map rustic | 16 | 0/0 | 1 | 0 |
| timeline modern | 16 | 0/0 | 0 | 0 |
| timeline rustic | 21 | 0/0 | 0 | 0 |
| tree modern | 16 | 0/0 | 0 | 0 |
| tree rustic | 19 | 0/0 | 0 | 0 |
| charts/area-chart | 4 | 16/0 | 2 | 8 |
| charts/bar-chart | 6 | 29/0 | 2 | 6 |
| charts/bullet | 14 | 10/0 | 12 | 6 |
| charts/calendar-heatmap | 0 | 3/0 | 0 | 1 |
| charts/chart-scaffold | 4 | 0/0 | 0 | 0 |
| charts/funnel-chart | 3 | 6/0 | 1 | 2 |
| charts/gantt-chart | 0 | 9/0 | 0 | 2 |
| charts/gauge | 6 | 7/0 | 1 | 4 |
| charts/heatmap | 0 | 5/0 | 0 | 1 |
| charts/histogram | 5 | 13/0 | 2 | 5 |
| hooks/use-chart-brush | 12 | 0/0 | 0 | 0 |
| hooks/use-chart-export | 1 | 0/0 | 0 | 0 |
| hooks/use-chart-theme | 4 | 0/0 | 4 | 0 |
| charts/line-chart | 4 | 14/0 | 2 | 5 |
| charts/network-graph | 3 | 5/0 | 1 | 1 |
| charts/pie-chart | 3 | 3/0 | 1 | 1 |
| charts/radar-chart | 5 | 7/0 | 3 | 3 |
| charts/sankey | 5 | 6/0 | 3 | 2 |
| charts/scatter | 3 | 11/0 | 1 | 2 |
| charts/sparkline | 0 | 9/0 | 0 | 4 |
| tooltip/crosshair | 0 | 4/0 | 0 | 1 |
| tooltip/index | 11 | 0/0 | 2 | 0 |
| charts/treemap | 3 | 4/0 | 1 | 1 |
| charts/utils/export | 2 | 2/2 | 2 | 4 |
| charts/waterfall | 6 | 14/0 | 4 | 2 |

## Adjudications before the contract

- Keep `useChartTheme`. Its four `background` properties build runtime theme-resolution data, not
  DOM style, so they become an exact `SKIN-EXEMPT-NOT-PAINT` floor. The hook currently has no
  callers.
- Do not wire that hook during Stage 1. D3 interpolates unresolved CSS-variable strings as black,
  which exposes a real HeatMap/CalendarHeatMap defect, but fixing it moves pixels and belongs to the
  deliberate Stage-2 chart redesign.
- `use-chart-export` supplies the same white PNG background already defaulted by `exportAsPng`.
  CK-E may remove the redundant site only with an exact export test.
- The original sources had no usable production anatomy under `patterns/visualization`. The inert
  pre-step now gives every CK-E root a unique scope, stamps every selector-bearing React/D3/DOM
  element and finite state, and proves the paint counts and attribute-stripped element topology did
  not move.
- Existing `components/skin/visualization.css` belongs to `VisualizationSurface`; primitive
  `calendar.css`, `timeline.css` and `tree.css` do not cover these patterns. CK-E needs its own skins
  wired into both canonical entrypoints.

## Non-overlapping execution slices

Root first owns the exact floor registry, exporter classification, ChartScaffold/tooltip/hooks
anatomy, the shared visual fixture and both entrypoints. Component migration then splits as:

| slice | scope | start | floor | migrate |
| --- | --- | ---: | ---: | ---: |
| non-chart A | calendar + map | 75 | 4 | 71 |
| non-chart B | kanban | 48 | 2 | 46 |
| non-chart C | timeline + tree | 72 | 0 | 72 |
| chart A | bar, area, radar, treemap, pie | 80 | 28 | 52 |
| chart B | bullet, waterfall, line, gantt, heatmap, calendar-heatmap | 79 | 35 | 44 |
| chart C | histogram, scatter, gauge, sankey, sparkline, funnel, network | 82 | 29 | 53 |
| root foundation | scaffold, hooks, tooltip, crosshair, exporter | 42 | 13 | 29 |

Agents create separate skin files. Only the orchestrator edits the exemption registry, audit
machinery, shared visual fixture and canonical CSS entrypoints.

## Inert pre-step closure

The pre-step is certified before any paint migration:

- inventory remains exactly `478 = 299 inline + 179 runtime SVG`;
- all 179 runtime SVG sites are classified (`166 D3 + 9 JSX + 4 DOM`, unclassified `0`);
- exact Stage-1 floors reconcile to `111 = 50 inline + 61 runtime SVG`;
- source contracts pin scope/part/state coverage and the unchanged React/D3/DOM topology;
- core and the 289-page Showroom production build are green;
- the deterministic Showroom CK-E fixture covers five non-chart patterns, 17 scaffold charts,
  Sparkline/brush, loading, tooltip/crosshair, Sankey hover, brush selection and rustic
  Kanban/Timeline interactions;
- all 14 Playwright tests pass without snapshot updates across Rottay dark, BitHire light,
  modern/rustic, desktop and mobile composition.
