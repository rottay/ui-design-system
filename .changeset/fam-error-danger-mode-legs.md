---
"@rottay/design-system": patch
---

The danger family follows the mode.

The DS default restates its whole neutral ramp in dark and did not restate its
status ramps at all, so `--ds-color-error-50` resolved a near-white `#fef2f2`
on a dark canvas and `--ds-color-error-700` resolved a dark ink for a dark
ground. A seeded tenant never had this problem — bithire's compiler emits a
fully inverted dark error ramp from its own seed — which is why no ramp STEP
was ink-correct on a dark ground in both verticals, and why the Button's
quiet-danger ink could not be given a dark leg at all: a literal in the DS
sheet would have overwritten bithire's correct compiled value.

The dark block now states the error ramp inverted (the light ramp read
backwards, extended by one stop at `#450a0a`), with step 500 as an unmoved
pivot. In dark the role keeps the value it has always painted — step 600
resolves the same `#f87171`, so the dark block deliberately does not restate
it. The role moves at the light root only (see below).

`--ds-button-error-border{,-hover,-active}` step from 600/700/800 to 700/800/900:
those three names are the quiet-danger INK as well as the solid rim, and an ink
on a tone-tinted wash needs one step more than the same red needs on bare paper
(step 600 measured **4.35:1** on the 7% ghost wash in light). A new dark block
holds the solid danger fill's hover/active on the dark-graded side of the
inverted ramp — byte-identical for rottay and evnto, and it repairs bithire's
solid danger hover (white on `#F8675D`, **2.96:1**) and pressed (**2.06:1**).

`--ds-button-default-bg` stops stating a literal white and reads
`--ds-material-control-background`, the family its own `-hover` and `-active`
siblings already read. It measures `#ffffff` in every light scope, so no light
cell moves; in dark it repairs the variant's own near-white label on a white
pill — **1.05:1**, in all three dark scopes — which is also the ground the
quiet-danger ink is painted on. This is the third instance of the defect class
already repaired for the Input ground and the Card ground.

The frozen Classic and Rustic theme sheets consume `--ds-button-default-bg`
too (`engines/classic/theme/index.css:92`, `engines/rustic/theme/index.css:121`
and `engines/rustic/skin/button/index.css:85`), so their dark default-button
ground inherits this repair: a token repair flowing into frozen engines, not
content added to them.

`--ds-color-error` also steps from 400 to **600** at the light root — the stop
every status sibling already uses — so the light-mode role stops painting a
dark-graded `#f87171` at 2.65:1 on its own canvas. The dark block does not
restate it: step 600 against the inverted ramp is the same `#f87171` the role
has always painted there. `--ds-color-on-error` gains the mode leg that fill
now owes (`#ffffff` light, `#171717` dark), and the tooltip derivation stops
handing the ERROR surface the PRIMARY's on-ink — it reads the governed
`--ds-color-on-error`, which is also what the foundation sheet's own
`--ds-tooltip-error-color` already stated.

Measured through the productive door in real Chromium, 40 pairings x 6
vertical/mode scopes: **49 repaired, 0 regressions**. 32 channels move in
rottay/evnto light and 27 in rottay/evnto dark; bithire moves 3 and 7, all of
them Button channels, because its own seed already grades per mode.

Quiet-danger rows, before -> after: the file-manager's ghost wash 4.35 -> 5.75
(light) and 3.18 -> 7.31 (dark); hover 2.31 -> 10.34 and pressed 1.67 -> 11.39
in rottay/evnto dark; the error wash under its own ink 2.53 -> 5.84; the danger
toast 2.46 -> 8.39. Role rows in rottay/evnto light: error text on the canvas
2.65 -> 4.63 and on a card 2.77 -> 4.83, the form-field error message
2.65 -> 4.63, a destructive menu item 2.60 -> 4.55, the radio error ring
2.77 -> 4.83, the alert danger body 3.67 -> 5.64. The error tooltip's ink on
its own fill is repaired in dark, 2.77 -> 6.48.

The three committed vertical artifacts are stale by exactly one line after
this — `--ds-tooltip-error-color` — and need regenerating.
