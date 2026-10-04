---
"@rottay/design-system": major
---

WO-RET-01. Two public doors with no consumer are retired. The public map
changes from 40 to 38 subpaths.

`./patterns/charts` re-exported the eighteen chart family components that the
package root already publishes under the same names: `AreaChart`, `BarChart`,
`BulletChart`, `CalendarHeatMap`, `FunnelChart`, `GanttChart`, `GaugeChart`,
`HeatMap`, `Histogram`, `LineChart`, `NetworkGraph`, `PieChart`, `RadarChart`,
`SankeyChart`, `ScatterChart`, `Sparkline`, `TreeMap` and `WaterfallChart`.
Import them from `@rottay/design-system`. No chart component, prop type, hook
or engine capability leaves the package; `./charts`, `./charts/spec`,
`./charts/access` and `./charts/renderers` are unchanged. What is lost is the
narrower import graph of the dedicated door: an application that bundles
without tree shaking now loads the root barrel for a chart.

`./public-entrypoints-manifest` published the governed-entrypoint manifest as
JSON data. With `./patterns/charts` retired that manifest governs no subpath,
and no door replaces it: the published subpath set is the `exports` map of the
package's `package.json`. The manifest stays in the repository as a fence and
is no longer shipped in the package's `files`.

Census (consumer-census, showroom + app-bithire + app-evnto + app-platform,
source, tests, scripts and root config files, 2026-10-04): zero import sites
for either door, and no application reads the manifest by installed path. No
application is edited and no automatic upgrade is claimed. The codemod kit
re-points a named import of `./patterns/charts` to the package root and reports
any import of `./public-entrypoints-manifest`.

```contract-diff
subpath ./patterns/charts — removed; the eighteen chart family components are published by the package root under the same names (zero consumers measured by the consumer-census gate across showroom + 3 apps, 2026-10-04)
subpath ./public-entrypoints-manifest — removed; no replacement door, the published subpath set is the package.json exports map (zero consumers measured by the consumer-census gate across showroom + 3 apps, 2026-10-04)
signature ./eslint#PUBLISHED_SUBPATHS — the rows ./patterns/charts and ./public-entrypoints-manifest are deleted; 38 rows remain, order otherwise unchanged
```
