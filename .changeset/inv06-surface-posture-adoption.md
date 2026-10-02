---
"@rottay/design-system": minor
---

ListSurface now accepts app-owned phone, tablet and desktop postures. Named regions can render, collapse or disappear on the server and client; density flows through the existing scoped density runtime, and the primary action uses the existing action dock for bottom-bar or floating placement. The optional presentation.previewRail slot supplies supporting content. Callers omitting postures retain their existing layout, action placement and inherited density.

ActionDock accepts typed data-surface-region, data-region-disposition and data-posture attributes on its toolbar root. Surface action placement annotates that existing dock directly, preserving its sticky containing block and accessible toolbar semantics.

```contract-diff
signature .#ActionDockProps — accepts three typed surface posture attributes on the existing toolbar root (INV-06)
signature .#ListSurfacePresentationConfig — adds the optional previewRail content slot (INV-06)
signature .#ListSurface — consumes optional app-owned postures using the shared resolver (INV-06)
signature .#ListSurfaceProps — adds optional SurfacePostures without changing omitted behavior (INV-06)
```
