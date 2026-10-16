---
"@rottay/design-system": patch
---

`CompareSurface` gains owner class doors on its Modern `Box` caller parts
(ARC-12 M-P3, family lot 2 of the Box and Flex cohort). The four elements
that the compare skin reaches by a caller `data-part` now carry
`ds-compare__<part>` beside that part. The two loading skeleton blocks gain
`ds-compare__compare-skeleton-block`. The value divider and the table
viewport already carried `ds-compare__divider` and
`ds-compare__table-viewport`, so their markup does not change. In the compare
skin, 10 selectors that reach them by `[data-part]` now also reach them by
class, as a second selector next to the part one, at the same specificity.
The `[data-part]` side stays. Rendered markup changes only by the new class
token on the skeleton blocks, and every rule matches the same elements at the
same specificity as before. The four vertical CSS bundles carry the same
selectors. The Stack and page-shell divider rules that also reach the compare
divider are unchanged. This prepares the Modern `Box` to stamp its own part
(a later strip).
