---
"@rottay/design-system": patch
---

WO-FAM-08 B5: the kanban-board family cut. Its chrome deriver owns the
`--ds-kanban-board-*` namespace, the hand-made skeleton gives way to the shared
anatomy renderer, inline paint moves to skin rules, and state is decided once
by the anatomy kernel. `columnGap` and `columnMinWidth` no longer carry prop
defaults: an omitted prop leaves the channel to the theme (the deriver rests it
on the spacing ramp, so a denser vertical narrows the gap), a stated prop stamps
the channel and outranks the theme. The prop TYPES are unchanged.

```contract-diff
signature .#KanbanBoardProps — `columnGap` and `columnMinWidth` keep their types (`number | string`, optional) and lose their implicit defaults (16 / 280): omitted, the theme-derived channel paints; stated, the value stamps the channel. Documentation of that precedence moved into the props' JSDoc, which is what changed the declaration fingerprint
```
