---
"@rottay/design-system": patch
---

The four `local-scope.integration` chrome tests (`mobile-header`, `stats-header`,
`sidebar-surface`, `scope-switcher`) read their engine-stamp assertions through a
class-door reader: the owner class door of a part is admitted beside
`[data-part=…]`, so the assertions hold when Wave C arms the caller parts while
still retiring on a widened selector, a foreign hook or a dropped compound
(ARC-12 M-P3, Wave C pin micro-lot PM-T2). The mobile-header loop template keeps
its full expansion table, evaluated row by row. Every assertion's intent is
preserved; adversarial negatives and non-vacuity proofs are in the lot evidence.
