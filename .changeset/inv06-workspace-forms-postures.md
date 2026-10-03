---
"@rottay/design-system": minor
---

Seven workspace and form recipes consume optional app-owned postures through the shared runtime. Existing loading, empty, error and populated regions obey hide/collapse; action and preview disclosures retain their original state and callbacks. Omitting postures retains previous behavior.

```contract-diff
signature .#CollectionWorkspaceSurface — consumes optional app-owned SurfacePostures
signature .#CollectionWorkspaceProps — adds optional SurfacePostures
signature .#RecordWorkbenchSurface — consumes optional app-owned SurfacePostures
signature .#RecordWorkbenchSurfaceProps — adds optional SurfacePostures
signature .#DecisionInboxSurface — consumes optional app-owned SurfacePostures
signature .#DecisionInboxSurfaceProps — adds optional SurfacePostures
signature .#CommandCenterSurface — consumes optional app-owned SurfacePostures
signature .#CommandCenterSurfaceProps — adds optional SurfacePostures
signature .#FormSurface — consumes optional app-owned SurfacePostures
signature .#FormSurfaceProps — adds optional SurfacePostures
signature .#DetailFormSurface — consumes optional app-owned SurfacePostures
signature .#DetailFormSurfaceProps — adds optional SurfacePostures
signature .#GuidedDraftFormSurface — consumes optional app-owned SurfacePostures
signature .#GuidedDraftFormSurfaceProps — adds optional SurfacePostures
```
