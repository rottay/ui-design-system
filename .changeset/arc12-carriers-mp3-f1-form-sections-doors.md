---
"@rottay/design-system": patch
---

`FormSections` and `FormFactsCard` gain owner class doors on their Modern `Box`
and `Flex` caller parts (ARC-12 M-P3, family lot 1 of the Box and Flex
cohort). The 16 elements that the form-sections skin reaches by a caller
`data-part` now also carry `ds-form-sections__<part>` beside that part:
section, section-header, section-lead, section-index, section-trailing,
section-summary, section-chip, section-error, section-toggle, section-grid,
section-clip, section-content, facts-card, facts-card-body, facts-card-title
and facts-card-item. In the form-sections skin, 91 selectors that reach them
by `[data-part]` now also reach them by class, at the same specificity. 88
selectors fold the part in place as `:is([data-part="…"], .hook)`, since the
skin would otherwise exceed 800 lines. The 3 selectors that read `data-state`
gain a second selector next to the part one instead. The `[data-part]` side
stays. Rendered markup changes only by the new class tokens, and every rule
matches the same elements at the same specificity as before. The four
vertical CSS bundles carry the same selectors. This prepares the Modern `Box`
and `Flex` to stamp their own part (a later strip).
