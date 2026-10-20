---
"@rottay/design-system": patch
---

`SidebarSurface` gains owner class doors on its Modern `Box` caller parts
(ARC-12 M-P3, Wave C lot LC13 step 2 of the Box and Flex cohort). The 4
elements that its skin reaches by a caller `data-part` (the root, the panel
body, the navigation region and the main region) now carry a class beside that
part, named `<owner block>__<part>` (`ds-sidebar-surface__root`,
`ds-sidebar-surface__panel-body`, `ds-sidebar-surface__navigation`,
`ds-sidebar-surface__main`). In the `sidebar-surface` skin 10 selectors that
reach these elements by `[data-part]` now also reach them by class, as a second
selector next to the part one, at the same specificity. The `[data-part]` side
stays. The stacked-posture root rule and the `data-ds-motion='reduced'` root
rule are unchanged. Rendered markup changes only by the new class tokens, and
every rule matches the same elements at the same specificity as before. The
four vertical CSS bundles carry the same selectors. This prepares the Modern
`Box` to stamp its own part (a later strip).
