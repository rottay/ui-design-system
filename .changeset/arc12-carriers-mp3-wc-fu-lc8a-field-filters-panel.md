---
"@rottay/design-system": patch
---

`FieldFiltersPanel` gains the owner class door on its Modern filter card control
slot, `ds-field-filters-panel__control-slot`, beside the existing
`data-part="control-slot"`. In the `field-filters-panel` skin the control rule
and the control slot rule now also reach their elements by class, as a second
selector next to the part one, at the same specificity; the `[data-part]` side
stays. The four vertical CSS bundles carry the same selectors. The skin
structural test now reads the rustic input suppression rule per comma-separated
selector, so a neighbouring selector cannot lend it specificity or the root and
control conditions. Rendered markup changes only by the new class token.
