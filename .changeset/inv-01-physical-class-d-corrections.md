---
"@rottay/design-system": patch
---

WO-INV-01: the two live physical-property defects become logical, and each is
proven in a real browser rather than asserted.

`Countdown`'s prefix and suffix carried `marginRight: '4px'` and
`marginLeft: '4px'`. That is not a missing convention — it is a divergent
second copy of a rule the same family already owns, spelled correctly, in its
modern skin: `[data-part='prefix'] { margin-inline-end: var(--ds-spacing-1) }`,
whose comment already says the gap "is LOGICAL (inline-end / inline-start), so
it flips with direction instead of pinning to the physical left/right". The
compound now matches it, which also settles which ramp rung the `4px` literal
belonged to: the one its own sibling uses.

`ProgressLine`'s percentage label carried `textAlign: 'right'`. A percentage
sits at the end of the bar it describes, and under RTL that end is the LEFT, so
the physical spelling put it on the wrong side of its own box for every RTL
reader. `end` is the same pixel in LTR and the correct one in RTL.

Neither family had RTL coverage, and neither could have had it in jsdom, which
resolves neither a logical margin nor `text-align: end` against a direction —
a unit assertion would have passed on the physical spelling too. Both cases are
new, measured in Chromium through the shared causality harness, and each is
built as its own counterfactual: the same markup under `dir="ltr"` must not
move a pixel, and under `dir="rtl"` the gap and the label must land on the
opposite physical edge. Both were then run against the OLD spelling and both
fail there, so neither passes vacuously.

`engine-styles`' `menuItemStyle` is deliberately untouched: it is a dead export
(0 consumers measured) that retires under WO-RET-04 with its three dead
siblings rather than being made logical. It is the one row the
`physical-properties` baseline still pins, which now reads 1 debt site.
