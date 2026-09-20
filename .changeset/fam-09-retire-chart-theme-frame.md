---
"@rottay/design-system": major
---

WO-FAM-09 (owner resolution R2). Retired and removed from the public surface:
`useChartTheme` (and its exclusive types `ChartTheme`, `ChartThemeOwner`) and
`ChartFamilyFrame` (with `ChartFamilyFrameProps`, `ChartFamilyFrameStateProps`)
— zero productive callers measured in core, the showroom and the three apps.
Chart theming is owned by the governed scheme chain (`colorScheme` / the
tenant document); a frame around chart families was dead surface.

The categorical `colors` prop is NOT yet removed: it has live app callers
(measured), whose migration runs as the paired app-side lot; the prop's
removal ships when that migration validates. The retirement drills
(`tests/architecture/retired-chart-theme`, `retired-chart-family-frame`) fail
if any retired name reappears on the published surface.
