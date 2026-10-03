---
"@rottay/design-system": minor
---

DashboardSurface, DetailSurface, CompareSurface, VisualizationSurface, ReportSurface, SearchSurface, AuditSurface, BillingSurface, FileBrowserSurface, ImportExportSurface, IntegrationSurface, ProfileSurface, SettingsSurface and TeamSurface accept optional app-owned phone, tablet and desktop postures. Their existing named anatomy can render, collapse or hide; scoped density and supported primary-action placement use the canonical shared runtimes. Omitting postures preserves existing behavior.

SurfaceActionBar accepts typed data-surface-region, data-region-disposition and data-posture attributes and forwards them to its existing action-row container, preserving final access filtering and callbacks without adding a layout wrapper.

```contract-diff
signature .#DashboardSurface — consumes optional app-owned postures using the shared resolver
signature .#DetailSurface — consumes optional app-owned postures using the shared resolver
signature .#CompareSurface — consumes optional app-owned postures using the shared resolver
signature .#VisualizationSurface — consumes optional app-owned postures using the shared resolver
signature .#ReportSurface — consumes optional app-owned postures using the shared resolver
signature .#SearchSurface — consumes optional app-owned postures using the shared resolver
signature .#AuditSurface — consumes optional app-owned postures using the shared resolver
signature .#BillingSurface — consumes optional app-owned postures using the shared resolver
signature .#FileBrowserSurface — consumes optional app-owned postures using the shared resolver
signature .#ImportExportSurface — consumes optional app-owned postures using the shared resolver
signature .#IntegrationSurface — consumes optional app-owned postures using the shared resolver
signature .#ProfileSurface — consumes optional app-owned postures using the shared resolver
signature .#SettingsSurface — consumes optional app-owned postures using the shared resolver
signature .#TeamSurface — consumes optional app-owned postures using the shared resolver
signature .#DashboardSurfaceProps — adds optional SurfacePostures
signature .#DetailSurfaceProps — adds optional SurfacePostures
signature .#CompareSurfaceProps — adds optional SurfacePostures
signature .#VisualizationSurfaceProps — adds optional SurfacePostures
signature .#ReportSurfaceProps — adds optional SurfacePostures
signature .#SearchSurfaceProps — adds optional SurfacePostures
signature .#AuditSurfaceProps — adds optional SurfacePostures
signature .#BillingSurfaceProps — adds optional SurfacePostures
signature .#FileBrowserSurfaceProps — adds optional SurfacePostures
signature .#ImportExportSurfaceProps — adds optional SurfacePostures
signature .#IntegrationSurfaceProps — adds optional SurfacePostures
signature .#ProfileSurfaceProps — adds optional SurfacePostures
signature .#SettingsSurfaceProps — adds optional SurfacePostures
signature .#TeamSurfaceProps — adds optional SurfacePostures
signature .#SurfaceActionBarProps — accepts three typed optional posture anatomy attributes on the existing action row
```
