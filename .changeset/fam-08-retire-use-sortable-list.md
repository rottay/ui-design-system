---
"@rottay/design-system": major
---

WO-FAM-08 (owner resolution R2, 2026-09-19). `useSortableList` is retired and
removed from the public surface: the hook, its four exclusive types
(`UseSortableListOptions`, `UseSortableListReturn`, `SortableContainerProps`,
`SortableItemProps`) and its owner module
(`src/infrastructure/runtime/application/interaction/drag-and-drop`) are gone.

Migration: sortable behaviour is owned by the collection sortable kernel
(`useDragSession` / `reorderByKey`, consumed by kanban-board, file-manager,
saved-views, column-menu, tree and upload). A single-list `useSortableList`
caller maps to `reorderByKey(items, activeId, overId)` inside the kernel's
drag session; cross-container moves were never expressible through the retired
hook and are the kernel's native shape.

Caller census at removal (measured, not assumed): zero productive callers in
`packages/core/src`, `packages/showroom/src`, app-bithire, app-evnto and
app-platform. The retirement is pinned by
`packages/core/tests/architecture/retired-sortable-list` (10 drills: the name
and its types fail type-check and runtime import if they reappear; the source
scan refuses any productive reintroduction).
