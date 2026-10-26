---
"@rottay/design-system": patch
---

`PatternDataTable` gains an owner class door on its phone row-actions menu
(ARC-12 M-P3, Wave C follow-up lot FU-8A). The menu that the `menu` row-actions
posture opens from the trigger is `Popover` content, rendered in the portal
after a click. Its `Flex` now carries `ds-data-table__row-actions-menu` beside
its `data-part="row-actions-menu"`. The trigger, `data-part`, the `Popover`
props, focus handling and accessibility attributes are unchanged. In the
data-table-mobile skin the one selector that reaches the menu by
`[data-part]` now also reaches it by class, as a second selector next to the
part one, at the same specificity and in the same document scope. The
`[data-part]` side stays. Rendered markup changes only by the new class token,
and the rule matches the same element at the same specificity as before. The
four vertical CSS bundles carry the same selector. This prepares the Modern
`Flex` to stamp its own part (a later strip).
