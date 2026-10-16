---
"@rottay/design-system": patch
---

`DetailHeader` gains owner class doors on its Modern `Box` and `Flex` caller
parts (ARC-12 M-P3, family lot 5 of the Box and Flex cohort). The 21 elements
that the detail-header skin reaches by a caller `data-part` now also carry
`ds-detail-header__<part>` beside that part (20 parts; both avatar variants
carry the avatar door): root, top-bar, back-button, breadcrumb-trail,
breadcrumb-divider, actions, hero-panel, hero-spine, hero-cluster, avatar,
title, context-rail, metadata-card, metadata-chip, metadata-chip-icon,
metadata-card-children, tab-strip, tab-list, tab and tab-rail. In the
detail-header skin, 70 selectors that reach them by `[data-part]` now also
reach them by class, at the same specificity. 64 selectors fold the part in
place as `:is([data-part="…"], .hook)`, since the skin is already over 800
lines. The 6 selectors that read `data-state` gain a second selector next to
the part one instead. The `[data-part]` side stays. Rendered markup changes
only by the new class tokens, and every rule matches the same elements at the
same specificity as before. The four vertical CSS bundles carry the same
selectors. This prepares the Modern `Box` and `Flex` to stamp their own part
(a later strip).
