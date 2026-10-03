---
"@rottay/design-system": minor
---

Eight experience and operations recipes consume optional app-owned SurfacePostures with canonical regions, density and primary-action placement. Sticky and floating controls follow the body rather than remaining trapped in header chrome; loading, empty and error anatomy respects owned slots. Omitted postures preserve the existing path.

```contract-diff
signature .#EditorSurface — consumes optional app-owned SurfacePostures
signature .#EditorSurfaceProps — adds optional SurfacePostures
signature .#ChatSurface — consumes optional app-owned SurfacePostures
signature .#ChatSurfaceProps — adds optional SurfacePostures
signature .#MarketingSurface — consumes optional app-owned SurfacePostures
signature .#MarketingSurfaceProps — adds optional SurfacePostures
signature .#PricingSurface — consumes optional app-owned SurfacePostures
signature .#PricingSurfaceProps — adds optional SurfacePostures
signature .#NotificationSurface — consumes optional app-owned SurfacePostures
signature .#NotificationSurfaceProps — adds optional SurfacePostures
signature .#KanbanSurface — consumes optional app-owned SurfacePostures
signature .#KanbanSurfaceProps — adds optional SurfacePostures
signature .#SchedulerSurface — consumes optional app-owned SurfacePostures
signature .#SchedulerSurfaceProps — adds optional SurfacePostures
signature .#OperationalSurface — consumes optional app-owned SurfacePostures
signature .#OperationalSurfaceProps — adds optional SurfacePostures
```
