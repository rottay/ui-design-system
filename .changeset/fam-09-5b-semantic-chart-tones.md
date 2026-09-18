---
"@rottay/design-system": patch
---

WO-FAM-09 lot 5b: the semantic chart families' tones resolve through the paint chain. `GaugeChart`, `WaterfallChart` and `BulletChart` (and their SVG renderers) no longer carry hand-written default colour literals; the tones come from the resolver's semantic arm (`toneFor`), which reads the family's namespace channel over the governed root. No prop added, removed or re-typed; the literal defaults moved, never the shapes.

```contract-diff
export .#GaugeChart — changed; parameter defaults for segment tones now resolve through the chart paint chain (same values at rest). Patch: no prop shape moved.
export .#WaterfallChart — changed; same class (increase/decrease/total defaults resolve through the chain).
export .#BulletChart — changed; same class (range/value/target defaults resolve through the chain).
export ./charts/renderers#SvgGaugeRenderer — changed; the renderer's default palette reads the shared semantic arm.
```
