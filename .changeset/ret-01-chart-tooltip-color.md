---
"@rottay/design-system": major
---

WO-RET-01 (RET-01-CHART-TOOLTIP, the chart tooltip value swatch prop). The deprecated `color` prop of `TooltipValue` retires; `swatchColor` is the only swatch input. `TooltipValue` is published from the package root, so the prop removal is a signature change. The tooltip resolved its swatch as `swatchColor ?? color` and painted it only when the result was truthy; every caller passed exactly one of the two, so the same expression moved to `swatchColor` resolves to the same value, the same inline `backgroundColor`, and the same omitted swatch when the value is undefined. The consumer census measured zero consumers of `TooltipValue` across the showroom and the three vertical apps; its only callers are the design system's own chart families. Five of them passed `color` (histogram, gauge, waterfall, funnel chart, bar chart) and now pass `swatchColor`; the line chart already did. `TooltipSeries` is out of this lot: its `items[].color` is not deprecated and stays. Downstream apps: a `color` attribute on `TooltipValue` fails at compile time on upgrade; rename it to `swatchColor`. A `color` key that reaches `TooltipValue` through a spread may not be reported by the compiler and would drop the swatch silently, so search for it.

```contract-diff
signature .#TooltipValue — the deprecated `color` prop is removed; `swatchColor` replaces it and is the only swatch input; zero consumers of `TooltipValue` outside the design system's chart families across showroom and the three apps; the five families that passed `color` pass `swatchColor`, swatch paint unchanged; migrate by renaming the prop (RET-01-CHART-TOOLTIP)
```
