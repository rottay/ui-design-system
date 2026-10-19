---
"@rottay/design-system": patch
---

`RecordActionBar`, `RecordField`, `RecordFieldGrid`, `RecordPanel`,
`FormSurface` and `WizardSurface` gain owner class doors on their Modern `Box`
and `Flex` caller parts (ARC-12 M-P3, Wave C lot LC7 of the Box and Flex
cohort). 12 elements that their skins reach by a caller `data-part` now also
carry a class beside that part, named `<owner block>__<part>` (for example
`ds-record__field`, `ds-record__field-grid`, `ds-record__action-bar`,
`ds-form-surface__error-banner`, `ds-wizard__error-banner`). In the
`form-surface` and `wizard-surface` skins 10 selectors that reach these
elements by `[data-part]` now also reach them by class, as a second selector
next to the part one, at the same specificity. The `record` skin folds 55
selectors in place as `:is([data-part='p'], .ds-record__p)`, and its 11
state-reading selectors take the second-selector form. The `[data-part]` side
stays. Rendered markup changes only by the new class tokens, and every rule
matches the same elements at the same specificity as before. The four vertical
CSS bundles carry the same selectors. This prepares the Modern `Box` to stamp
its own part (a later strip).
