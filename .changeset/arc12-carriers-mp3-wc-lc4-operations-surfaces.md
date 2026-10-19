---
"@rottay/design-system": patch
---

`KanbanSurface`, `SchedulerSurface` and `OperationalSurface` gain owner class
doors on their Modern `Box` and `Flex` caller parts (ARC-12 M-P3, Wave C lot
LC4 of the Box and Flex cohort). 14 elements that their skins reach by a caller
`data-part` now also carry a class beside that part, named
`<owner block>__<part>` (for example `ds-kanban__kanban-skeleton-block`,
`ds-kanban__mobile-lane-navigation`, `ds-scheduler__scheduler-skeleton-block`,
`ds-operational__operational-skeleton-block`). In the `kanban-surface`,
`scheduler-surface` and `operational-surface` skins 19 selectors that reach
these elements by `[data-part]` now also reach them by class, as a second
selector next to the part one, at the same specificity. The `[data-part]` side
stays. The operational skeleton `section` size rule is unchanged. Rendered
markup changes only by the new class tokens, and every rule matches the same
elements at the same specificity as before. The four vertical CSS bundles carry
the same selectors. This prepares the Modern `Box` and `Flex` to stamp their own
part (a later strip).
