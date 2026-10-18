---
"@rottay/design-system": patch
---

`LoadingOverlay` and `CapabilityAnatomy` gain owner class doors on their Modern
`Box` and `Flex` caller parts (ARC-12 M-P3, Wave C lot LC1 of the Box and Flex
cohort). 7 elements that their skins reach by a caller `data-part` now also
carry a class beside that part, named `<owner block>__<part>` (for example
`ds-loading-overlay__root`, `ds-loading-overlay__content`,
`ds-capability-anatomy__capability`). In the `loading-overlay` and
`surface-states` skins 19 selectors that reach these elements by `[data-part]`
now also reach them by class, as a second selector next to the part one, at the
same specificity. The `[data-part]` side stays. The surface lifecycle stale
banner is unchanged. Rendered markup changes only by the new class tokens, and
every rule matches the same elements at the same specificity as before. The four
vertical CSS bundles carry the same selectors. This prepares the Modern `Box`
and `Flex` to stamp their own part (a later strip).
