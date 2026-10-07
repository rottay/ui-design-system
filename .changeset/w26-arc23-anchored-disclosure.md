---
"@rottay/design-system": minor
---

WO-ARC-23 (owner packet 2026-10-06 §E-2): Popover gains the anchored mode —
a controlled disclosure anchored to a caller-owned element via `anchor`,
mounted in-tree under the tenant scope (never portalled), reusing the
interaction/focus/placement kernel (no new listener, no positioning math,
no new layer kind; the anchored arm registers the `dropdown` kind). While
the anchor is null or disconnected the engine withholds the surface in both
branches, with a dev warning. The collection-workspace filter dropdown
drains onto it and its bespoke component retires. The API was formalized
through the required independent debrief before landing.

```contract-diff
signature .#PopoverProps — gains the anchored arm: anchor: RefObject<HTMLElement | null> plus the anchored-only members (the trigger-only props are `?: never` on that arm); the trigger arm is unchanged (WO-ARC-23)
export .#Popover — the component now serves both modes (trigger and anchored); the anchored mode mounts in-tree under the tenant scope, never portalled (WO-ARC-23)
```
