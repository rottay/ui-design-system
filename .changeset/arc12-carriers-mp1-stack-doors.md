---
"@rottay/design-system": patch
---

Modern `Stack` caller parts gain owner class doors (ARC-12 M-P1, the Stack
pilot). Thirteen owners stamp a `ds-<owner>__<part>` class hook on the Stack
they render with a caller `data-part`: the assistant diff row, the data table's
mobile root, toolbar stack, record list/cards and mobile card primary, the
metrics card body, the detail and form header hero copy, the header surface
root, the inline edit group, editor copy, section copy and footer support, the
form sections root, section copy, facts card items and facts card item copy,
the record summary item, and the compare, empty-state and guided draft form
roots plus the guided draft content. In 21 skins, each rule that selects these
elements by `data-part` now also selects them by class, at the same
specificity (128 selectors: in the form-sections skin the class sits beside
the part inside `:is()`, elsewhere it is a second selector next to the part
one). Where an owner block class already sits on the
element (auth, marketing, chat, widget board, collection workspace, record
workbench, brand studio), that class is reused. The modern Stack skin's
divider rule also selects the engine's own `rottay-stack-divider` span by
class. The `[data-part]` arms stay. Rendered markup changes only by the new
class tokens, and every rule matches the same elements at the same specificity
as before. The four vertical CSS bundles carry the same selectors. This
prepares the modern Stack to stamp its own part (ARC-12 M-P strip).
