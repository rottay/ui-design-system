---
"@rottay/design-system": minor
---

Auth, Media, EmptyState and Activity surfaces consume optional app-owned viewport postures through the canonical shared runtimes. Existing named regions and primary actions preserve permissions and callbacks; omitted postures preserve the previous recipe path.

```contract-diff
signature .#AuthSurface — consumes optional app-owned SurfacePostures
signature .#AuthSurfaceProps — adds optional SurfacePostures
signature .#MediaSurface — consumes optional app-owned SurfacePostures
signature .#MediaSurfaceProps — adds optional SurfacePostures
signature .#EmptyStateSurface — consumes optional app-owned SurfacePostures
signature .#EmptyStateSurfaceProps — adds optional SurfacePostures
signature .#ActivitySurface — consumes optional app-owned SurfacePostures
signature .#ActivitySurfaceProps — adds optional SurfacePostures
```
