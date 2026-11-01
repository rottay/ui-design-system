---
"@rottay/design-system": patch
---

Correct the `sidebarPosition` JSDoc on `DetailSurfaceVisualConfig`: it named `'start'` and `'end'`, which the type rejects, and now names `'left'` and `'right'`, the values `DetailPanelSidebarPosition` declares. No type, export or behaviour changes.

```contract-diff
signature .#DetailSurfaceVisualConfig — documentation only: `sidebarPosition` is documented as `'left'` or `'right'`, the values its type declares; type and behaviour unchanged
```
