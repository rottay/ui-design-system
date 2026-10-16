---
"@rottay/design-system": patch
---

`FormHeader` and `CollectionHeader` gain owner class doors on their Modern
`Box` and `Flex` caller parts (ARC-12 M-P3, family lot 7 of the Box and Flex
cohort). In `FormHeader`, eight elements that its skins reach by a caller
`data-part` now also carry a class beside that part: root, top-bar,
back-button, hero-panel, hero-row, hero-cluster, icon-badge and title carry
`ds-form-header__<part>`, and the four of them the shared header-hero skin
reads (root, back-button, hero-panel, icon-badge) also carry
`ds-edit-header__<part>`, that skin's own vocabulary. In `CollectionHeader`,
eleven elements carry `ds-collection-header__<part>`: root, eyebrow, meta-item,
identity, title, both subtitle rows, both subtitles and both secondary rails.
In the form-header skin 26 selectors, in the header-hero-shared skin 10, and in
the collection-header skin 24, that reach these elements by `[data-part]` now
also reach them by class, as a second selector next to the part one, at the
same specificity. The `[data-part]` side stays. Rendered markup changes only
by the new class tokens, and every rule matches the same elements at the same
specificity as before. The four vertical CSS bundles carry the same selectors.
This prepares the Modern `Box` and `Flex` to stamp their own part (a later
strip).
