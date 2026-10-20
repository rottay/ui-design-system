---
"@rottay/design-system": patch
---

`MobileHeader`, `BottomTabBar` and `WorkspaceShell` gain owner class doors on
their Modern `Box` and `Flex` caller parts (ARC-12 M-P3, Wave C lot LC5 of the
Box and Flex cohort). 20 elements that their skins reach by a caller
`data-part` now carry a class beside that part, named `<owner block>__<part>`
(for example `rottay-mobile-header__root`, `rottay-mobile-header__label`,
`rottay-bottom-tab-bar__tab-button`, `ds-collection-shell__root`). In the
`mobile-header`, `bottom-tab-bar` and `collection-shell` skins 81 selectors
that reach these elements by `[data-part]` now also reach them by class, as a
second selector next to the part one, at the same specificity. The
`[data-part]` side stays. The sticky, right-to-left, pressed, focus and hover
header rules, the unselected tab hover rule and the orbital, ambient, variant
and anatomy-layout shell rules are unchanged. Rendered markup changes only by
the new class tokens, and every rule matches the same elements at the same
specificity as before. The four vertical CSS bundles carry the same
selectors. This prepares the Modern `Box` to stamp its own part (a later
strip).
