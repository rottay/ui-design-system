---
"@rottay/design-system": patch
---

`SearchCommandBar`, the `AuthSurface`, `ChatSurface`, `NotificationSurface` and
`MarketingSurface` experience pages, and the `DashboardInsights` activity and
metrics panels gain owner class doors on their Modern `Box` and `Flex` caller
parts (ARC-12 M-P3, family lot 11 of the Box and Flex cohort). 126 elements that
their skins reach by a caller `data-part` now also carry a class beside that
part, named `<owner block>__<part>` (for example `ds-search-command-bar__frame`,
`ds-auth__auth-skeleton-field`, `ds-metrics-cards__meter-track`); 9 of them
already carried that class. In the thirteen skins of these components 427
selectors that reach these elements by `[data-part]` now also reach them by
class, as a second selector next to the part one, at the same specificity. The
`[data-part]` side stays. The eight insights panel roots and the search bar's
voice badge and voice help are unchanged. Rendered markup changes only by the
new class tokens, and every rule matches the same elements at the same
specificity as before. The four vertical CSS bundles carry the same selectors.
This prepares the Modern `Box` and `Flex` to stamp their own part (a later
strip).
