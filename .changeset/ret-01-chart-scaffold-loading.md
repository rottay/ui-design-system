---
"@rottay/design-system": major
---

WO-RET-01 (RET-01-CHART-SCAFFOLD-LOADING). The deprecated `loading?: boolean` member retires from the props of `ChartScaffold`, the shared chart shell exported from the package root. It was a boolean alias of `state="loading"` that an explicit `state` already overrode. The scaffold now takes its lifecycle from `state` alone.

The public chart `loading` prop is a different member and is unchanged: `ChartBaseProps.loading` stays live and non-deprecated on every chart family (`<BarChart loading />`, `<LineChart loading />`, ...), and `resolveChartScaffoldState` keeps accepting `loading` as the input that maps that flag to the `loading` state. Sixteen families already resolved the flag through `resolveChartScaffoldState` and handed the scaffold a `state`; only `SankeyChart` and `NetworkGraph` forwarded the flag to the scaffold alias, and they now resolve it to `state` themselves under the same law (an explicit `state` wins, otherwise `loading` selects the loading state). Rendered markup is byte-identical before and after for both families in the loading, skeleton-loading, error-over-loading and ready cases, and a focal test now pins the public flag on both.

Census, over `packages/core/src`, `packages/showroom/src` and the `src` roots of app-bithire, app-evnto and app-platform, including multi-line JSX and spreads: `ChartScaffold` is rendered only inside the design system (the chart families and their tests); the showroom and the three apps render no `ChartScaffold` and name no `ChartScaffoldProps`. The showroom's `<BarChart ... loading />` torture fixture uses the public chart prop, not the scaffold alias, and is untouched. The equivalence test that existed only to prove the alias is replaced by a loading-state test; the two scaffold tests that reached the loading state through the alias now state `state="loading"`.

Downstream: `<ChartScaffold loading />` (or `loading={flag}`) fails at compile time on upgrade and, untyped, renders the ready state; write `state="loading"` (or `state={flag ? 'loading' : 'ready'}`). No minor was published between the deprecation (2026-07-18) and 3.0, and no consumer exists to claim a compatibility window.

```contract-diff
signature .#ChartScaffoldProps — member `loading?: boolean` removed; deprecated alias of `state="loading"`, zero consumers outside the design system's own chart families; the public chart `loading` prop (`ChartBaseProps.loading`) and `resolveChartScaffoldState({ loading })` are unchanged; migrate to `state="loading"` (RET-01-CHART-SCAFFOLD-LOADING)
signature .#ChartScaffoldStateResolution — documentation only: member `loading?: boolean` is restated as the public chart flag rather than a legacy alias; type and resolution law unchanged (RET-01-CHART-SCAFFOLD-LOADING)
signature .#ChartScaffold — no longer reads `loading`; the loading state is selected by `state="loading"` only, rendered loading and skeleton markup unchanged (RET-01-CHART-SCAFFOLD-LOADING)
```
