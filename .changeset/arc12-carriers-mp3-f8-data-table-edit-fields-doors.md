---
"@rottay/design-system": patch
---

`PatternDataTable` and the inline edit-fields structures gain owner class doors
on their Modern `Box` and `Flex` caller parts (ARC-12 M-P3, family lot 8 of the
Box and Flex cohort). In the phone card and list projection of
`PatternDataTable`, seventeen elements that its mobile skin reaches by a caller
`data-part` now also carry `ds-data-table__<part>` beside that part: the card
title, summary rows, summary labels and summary values (also in the card
loading anatomy), the card actions, and the list item and its open target. In
the edit-fields structures, eleven elements carry `ds-edit-fields__<part>`: the
`InlineEditor` root, header and lead, the `InlineEditGrid` root, the
`InlineEditSection` root, header, lead and content, and the `InlineEditFooter`
root, impact preview and actions. In the data-table-mobile skin 10 selectors,
and in the edit-fields skin 34, that reach these elements by `[data-part]` now
also reach them by class, as a second selector next to the part one, at the
same specificity. The `[data-part]` side stays. Rendered markup changes only by
the new class tokens, and every rule matches the same elements at the same
specificity as before. The four vertical CSS bundles carry the same selectors.
This prepares the Modern `Box` and `Flex` to stamp their own part (a later
strip).
