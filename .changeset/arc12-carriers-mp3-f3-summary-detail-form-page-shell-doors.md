---
"@rottay/design-system": patch
---

`RecordSummaryStrip`, `DetailFormSurface` and `PageShellSurface` gain owner
class doors on their Modern `Box` caller parts (ARC-12 M-P3, family lot 3 of
the Box and Flex cohort). The summary strip root and its grid now carry
`ds-record__summary-strip` and `ds-record__summary-grid`, the page shell body
carries `ds-page-shell-surface__body`, and the detail form error banner
carries `ds-detail-form__error-banner`, each beside its `data-part`. In the
record, page-shell-surface and detail-form-surface skins, 25 selectors that
reach these elements by `[data-part]` now also reach them by class, as a
second selector next to the part one, at the same specificity. The
`[data-part]` side stays. Rendered markup changes only by the new class
tokens, and every rule matches the same elements at the same specificity as
before. The four vertical CSS bundles carry the same selectors. This prepares
the Modern `Box` to stamp its own part (a later strip).
