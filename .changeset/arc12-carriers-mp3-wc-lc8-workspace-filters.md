---
"@rottay/design-system": patch
---

`ActiveFiltersBar`, `FieldFiltersPanel` and `SelectionPreviewRail` gain owner
class doors on their Modern `Box` and `Flex` caller parts (ARC-12 M-P3, Wave C
lot LC8 of the Box and Flex cohort). 37 elements that their skins reach by a
caller `data-part` now also carry a class beside that part, named
`<owner block>__<part>` (for example `ds-active-filters-bar__chip-label`,
`ds-field-filters-panel__filter-card`,
`ds-selection-preview-rail__snapshot-row`). In the `active-filters-bar`,
`field-filters-panel` and `selection-preview-rail` skins 108 selectors that
reach these elements by `[data-part]` now also reach them by class, as a second
selector next to the part one, at the same specificity. The `[data-part]` side
stays. The active filters `less-toggle` rule, the field filters control rules
and the field filters control slot are unchanged. Rendered markup changes only
by the new class tokens, and every rule matches the same elements at the same
specificity as before. The four vertical CSS bundles carry the same selectors.
This prepares the Modern `Box` and `Flex` to stamp their own part (a later
strip).
