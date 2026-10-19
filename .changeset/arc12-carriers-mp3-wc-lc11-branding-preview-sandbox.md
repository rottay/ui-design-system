---
"@rottay/design-system": patch
---

`BrandingPreviewSandbox` gains owner class doors on its Modern `Box` caller
parts (ARC-12 M-P3, Wave C lot LC11 of the Box and Flex cohort). The 21 `Box`
elements in its source that its skin reaches by a caller `data-part` now also
carry a class beside that part, named `<owner block>__<part>` (for example
`ds-pattern-branding-preview-sandbox__header`,
`ds-pattern-branding-preview-sandbox__surface`,
`ds-pattern-branding-preview-sandbox__preview-table-cell`). In the
`branding-preview-sandbox` skin 21 selectors that reach these elements by
`[data-part]` now also reach them by class, as a second selector next to the
part one, at the same specificity. The `[data-part]` side stays. Rendered markup
changes only by the new class tokens, and every rule matches the same elements
at the same specificity as before. The four vertical CSS bundles carry the same
selectors. This prepares the Modern `Box` to stamp its own part (a later strip).
