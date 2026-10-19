---
"@rottay/design-system": patch
---

`PatternGalleryView` and `PatternGridView` gain owner class doors on their
Modern `Box` and `Flex` caller parts (ARC-12 M-P3, Wave C lot LC2 of the Box
and Flex cohort). 16 elements that their skins reach by a caller `data-part`
now also carry a class beside that part, named `<owner block>__<part>` (for
example `ds-pattern-gallery-view__image-frame`, `ds-gallery-card__caption`,
`ds-pattern-grid-view__card-shell`, `ds-pattern-grid-view__cell`). The loading
placeholders carry the same classes as the loaded cards. In the `gallery-view`
and `grid-view` skins 29 selectors that reach these elements by `[data-part]`
now also reach them by class, as a second selector next to the part one, at the
same specificity. The `[data-part]` side stays. The grid view's loaded-root rule
(`[data-empty='false']`) is unchanged. Rendered markup changes only by the new
class tokens, and every rule matches the same elements at the same specificity
as before. The four vertical CSS bundles carry the same selectors. This prepares
the Modern `Box` and `Flex` to stamp their own part (a later strip).
