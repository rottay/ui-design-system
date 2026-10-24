---
"@rottay/design-system": minor
---

WO-FAM-09. The compact-capable charts take the `adapt` slot: compact mode can
follow the request's viewport and the chart's OWN measured box, per posture,
instead of only the explicit `compactMode` flag or the legacy `autoCompact`
width check.

The slot lives on the opt-in `ChartCompactProps` trait, so exactly the nine
families that implement compact mode advertise it -- `AreaChart`, `BarChart`,
`BulletChart`, `GaugeChart`, `Histogram`, `LineChart`, `PieChart`,
`ScatterChart`, `WaterfallChart`. The other scaffold-backed charts have no
posture-dependent structure and do not gain a prop they would ignore.

One family contract joins the adaptation kernel: `ChartAdaptation`, a single
`compactMode` boolean. The posture decides WHEN compact mode is active; the
existing `compact` configuration keeps deciding WHAT it hides, merged over the
defaults whichever layer activated it. There is deliberately NO family
default, because compact mode is opt-in: a chart that declares no `adapt`
resolves exactly as before. Precedence at the postures in force, highest
first: the measured container entry, the viewport entry, `compactMode`, then
`autoCompact` against `compactBreakpoint` (640 px, unchanged). A viewport
entry applies from the first server paint; a container entry once the box is
measured, and the box is observed only while `adapt` declares a container
entry.

`useChartCompact` is the single resolver: it accepts `adapt` and the chart's
`containerRef`, resolves through the shared adaptation runtime, and returns the
`data-posture` value as `postureAttribute`. `ChartScaffold` stamps
`data-posture` on its root in every lifecycle state (loading, empty, error,
ready); without a `postureAttribute` it stamps the viewport posture alone and
observes nothing. The only rendered-markup change for a chart without `adapt`
is that attribute.

`ChartAdaptation` is NOT aggregated into the adaptation kernel's family barrel
and is not exported by name; a consumer types it as `LineChartProps['adapt']`.

Additive on the public surface: every changed declaration gains one optional
member, except `ResolvedChartCompact`, an output type, which gains the required
`postureAttribute: string` the hook always returns. No subpath was added or
retired and no published export was removed.

```contract-diff
signature .#ChartScaffold — changed; stamps `data-posture` on its root in every lifecycle state
signature .#useChartCompact — changed; resolves the optional `adapt` slot and returns `postureAttribute`
export .#ChartCompactProps — changed; adds optional `adapt?: Adapt<ChartAdaptation>`
export .#ChartScaffoldProps — changed; adds optional `postureAttribute?: string`
export .#UseChartCompactOptions — changed; adds optional `adapt` and `containerRef`
export .#ResolvedChartCompact — changed; adds the required output member `postureAttribute: string`
export .#AreaChartProps — changed; inherits optional `adapt` from `ChartCompactProps`
export .#BarChartProps — changed; inherits optional `adapt` from `ChartCompactProps`
export .#BulletChartProps — changed; inherits optional `adapt` from `ChartCompactProps`
export .#GaugeChartProps — changed; inherits optional `adapt` from `ChartCompactProps`
export .#HistogramProps — changed; inherits optional `adapt` from `ChartCompactProps`
export .#LineChartProps — changed; inherits optional `adapt` from `ChartCompactProps`
export .#PieChartProps — changed; inherits optional `adapt` from `ChartCompactProps`
export .#ScatterChartProps — changed; inherits optional `adapt` from `ChartCompactProps`
export .#WaterfallChartProps — changed; inherits optional `adapt` from `ChartCompactProps`
```
