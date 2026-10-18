---
"@rottay/design-system": patch
---

Three skin-pinning tests (`Record.cut`, `skin-radius-dial-reach`,
`ActionDock.actions`) now read their selectors class-aware: the own-block class
door of a named part (`:is([data-part='p'], .block__p)` fold form, or the
`.block__p` pair arm) is read back as its part token, so the assertions survive
the Wave C arm fold/pair rewrite while still retiring on a widened selector, a
foreign block's hook or a dropped compound (ARC-12 M-P3, Wave C pin micro-lot
PM-T). Every assertion's intent is preserved byte-for-byte; adversarial
negatives and non-vacuity proofs are recorded in the lot evidence.
