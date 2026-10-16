---
"@rottay/design-system": patch
---

`PatternBrandStudio` gains owner class doors on thirteen Modern `Box` caller
parts (ARC-12 M-P3, family lot 4 of the Box and Flex cohort). Twelve of them
already carried their owner class beside `data-part`, so they gain no new
token. The preview grid, whose owner class is also stamped on the preview
column, now carries `ds-pattern-brand-studio__preview-grid-part` beside its
`data-part`. In the brand-studio skin, 34 selectors that reach these elements
by `[data-part]` now also reach them by class, as a second selector next to
the part one, at the same specificity. The `[data-part]` side stays. Rendered
markup changes only by the one new class token, and every rule matches the
same elements at the same specificity as before. The four vertical CSS bundles
carry the same selectors. This prepares the Modern `Box` to stamp its own part
(a later strip).
