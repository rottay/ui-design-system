---
"@rottay/design-system": patch
---

The Modern `ListToolbar` gains owner class doors on its caller parts (ARC-12
M-P3, Wave C lot LX3). The 22 elements that its Modern skin reaches by a caller
`data-part` now all carry a class beside that part: 19 already carried it, and
three gain one, the root (`ds-pattern-list-toolbar__root`), the main row
(`ds-pattern-list-toolbar__main-row`) and the filter chips strip
(`ds-pattern-list-toolbar__filter-chips-strip`). The filter menu, the settings
panel and the mobile overflow panel, which render in the portal, are among the 19. Existing classes, `data-part`, `data-state`, handlers and accessibility
attributes are unchanged. In the Modern `list-toolbar` skin 44 selectors keep
their order: each reached part token reads
`:is([data-part='<part>'], .<class>)`, at the same specificity. The
`[data-part]` side stays. The five remaining registered rules are
unchanged, among them the filter menu checkmark rule. The mixed search-section/Input-shell rule folds only the own section token; the foreign Input shell root gate stays unchanged. Rendered markup changes
only by the three new class tokens, and every rule matches the same elements at
the same specificity as before. The four vertical CSS bundles carry the same
selectors. This prepares the Modern `Box` to stamp its own part (a later strip).
