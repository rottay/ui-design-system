---
"@rottay/design-system": patch
---

The `axis-difference` theme check reads three of its own source-text pins
class-aware, so a class door on a part no longer breaks a read whose intent it
keeps (ARC-12 M-P3, Wave C lot LC13 step 1; no door, no skin and no TSX change).
The sidebar-surface real-render anchor is now a `classAwareTag` gate. The
table-toolbar as-rendered row resolves its structure class through the new
`classAwareClassName` gate, which admits at most one appended class. The suite
pins the focus-signature read set by part (family, part, pseudo, property,
source) instead of by selector spelling, and keeps every other assertion
unchanged. Nine tests cover HEAD identity, the door-stamped forms, the
widening, foreign-block and count-once negatives, and a browser drill that
records whether the class form of a part reaches a mounted scene node.
