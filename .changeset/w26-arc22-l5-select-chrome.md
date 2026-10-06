---
"@rottay/design-system": minor
---

WO-ARC-22 L5 (owner packet 2026-10-06 §E-1): the Select primitive gains the
chrome-less variant (`chrome="none"`, the shared ControlChrome axis) and a
typed `onKeyDown`, so hosts (the DataTable cell editor, the
collection-workspace page-size control) mount the canonical Select with the
behaviour contract intact and zero chrome paint. Engine factories gain
`modernOnlyProps` (CreateEngineComponentOptions): the frozen engines refuse
the modern-only props by construction. In forced colours, a host frame never
hides the Select's error/disabled arms (H6).

```contract-diff
signature .#SelectProps — gains chrome?: ControlChrome and onKeyDown?: KeyboardEventHandler (WO-ARC-22 L5)
export .#Select — the chrome-less variant drains the DataTable cell select and the page-size control (WO-ARC-22 L5)
signature .#CreateEngineComponentOptions — gains modernOnlyProps (frozen engines refuse those props by construction) (WO-ARC-22 L5, E5)
```
