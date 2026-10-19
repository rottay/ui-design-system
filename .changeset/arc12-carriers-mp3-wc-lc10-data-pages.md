---
"@rottay/design-system": patch
---

`SearchSurface`, `DashboardSurface`, `ListSurface` and `CommandCenter` gain
owner class doors on their Modern `Box` caller parts (ARC-12 M-P3, Wave C lot
LC10 of the Box and Flex cohort). 14 elements that their skins reach by a
caller `data-part` now carry a class beside that part, named
`<owner block>__<part>` (for example `ds-search__search-skeleton-block`,
`ds-search__result-custom`, `ds-dashboard__dashboard-skeleton-block`). Four of
them already carried that class (`ds-search__empty-state` on two,
`ds-list__filters-plain`, `ds-command-center__quick-action-icon`), so the
`ListSurface` and `CommandCenter` markup is unchanged. In the `search`,
`dashboard`, `list` and `command-center` skins 21 selectors that reach these
elements by `[data-part]` now also reach them by class, as a second selector
next to the part one, at the same specificity. The `[data-part]` side stays.
The search skeleton `preview` size rule is unchanged. Rendered markup changes
only by the new class tokens, and every rule matches the same elements at the
same specificity as before. The four vertical CSS bundles carry the same
selectors. This prepares the Modern `Box` to stamp its own part (a later
strip).
