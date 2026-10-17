---
"@rottay/design-system": patch
---

`EditHeader` gains owner class doors on its Modern `Box` and `Flex` caller
parts (ARC-12 M-P3, family lot 10 of the Box and Flex cohort). Sixteen elements
that its skins reach by a caller `data-part` now also carry a class beside that
part: root, top-bar, breadcrumb-divider, hero-panel, hero-row, hero-copy,
icon-badge, status-pill, dirty-chip, dirty-dot, actions, context-card,
context-rail and context-card-children carry `ds-edit-header__<part>`, and the
title keeps the `ds-edit-header__title` class it already had. The back chip
(`data-part="back-button"`) carries `ds-edit-header__back-chip`: its anatomy
contract forbids `back-button` in that element's class, and the skeleton
renderer still draws it from its stamped part. In the edit-header skin 58
selectors, and in the header-hero-shared skin 16 (the `EditHeader` halves only;
the `FormHeader` halves are unchanged), that reach these elements by
`[data-part]` now also reach them by class, as a second selector next to the
part one, at the same specificity. The `[data-part]` side stays. Rendered
markup changes only by the new class tokens, and every rule matches the same
elements at the same specificity as before. The four vertical CSS bundles carry
the same selectors. This prepares the Modern `Box` and `Flex` to stamp their
own part (a later strip).
