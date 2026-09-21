---
"@rottay/design-system": minor
---

WO-FAM-09 (R3 chain). `NetworkGraph`, `SankeyChart` and `ScatterChart` take the
governed `colorScheme` input, mirrored exactly from bar-chart and from the
funnel/gantt lot: `ChartColorSchemeProps` on the family contract,
`useChartPaint({ family, scheme, override })` and
`useChartPersonality({ ..., colorScheme })` as the only resolver entry points.
Each family now resolves once at its root and stamps the scheme it resolved, so
the requested scheme IS the scope its marks paint from — network-graph and
sankey on their inline `fill`, scatter through the scope-keyed
`--ds-chart-paint-N` skin bridge. These were the last three categorical
families ignoring the request; `chart-scheme-scope-causality` measures 55 of 55
rows agreeing and names no unplumbed family.

Precedence is the resolver's real one and is pinned per family: per-datum
colour > `colors` > `colorScheme` > token > `default`, with `colors` replacing
the scheme table and cycling at its own length rather than merging. Scatter is
the declared exception, unchanged by this lot: its registry row already says
`honoursColorsProp: false` (per-point `color` and `colors[]` were dropped at the
W5 migration), so its chain is `colorScheme` > token > `default` and the family
does not pass an override the resolver would ignore.

No visual change for a caller that does not pass `colorScheme`; the default
remains the personality-resolved scheme.

```contract-diff
export .#ScatterChart — changed; additive optional `colorScheme` prop, no existing prop altered
export .#NetworkGraph — changed; additive optional `colorScheme` prop, no existing prop altered
export .#SankeyChart — changed; additive optional `colorScheme` prop, no existing prop altered
```
