---
"@rottay/design-system": patch
---

`SavedViewsMenu` gains owner class doors on its Modern caller parts (ARC-12
M-P3, Wave C lot LX1). The 27 elements that its skin reaches by a caller
`data-part` now carry a class beside that part, named `<owner block>__<part>`:
the anchor, trigger, trigger body and trigger icon, and 23 elements of the open
panel and its backdrop, which render in the portal. All 26 classes are new.
The two empty states (no persona views, no views at all) share
`ds-saved-views-menu-panel__empty-state` and keep their own
`data-empty-state`. Existing classes, `data-part`, `data-state`, `data-open`,
handlers and accessibility attributes are unchanged. In the `saved-views-menu`
skin 109 selectors that reach these elements by `[data-part]` now also reach
them by class, at the same specificity: 95 keep their place and line, each
reached part token reading `:is([data-part='<part>'], .<owner block>__<part>)`,
and the 14 that read `[data-state]` gain a second selector next to the part
one. The `[data-part]` side stays. Rendered markup changes only by the new
class tokens, and every rule matches the same elements at the same specificity
as before. The four vertical CSS bundles carry the same selectors. This
prepares the Modern `Box` to stamp its own part (a later strip).
