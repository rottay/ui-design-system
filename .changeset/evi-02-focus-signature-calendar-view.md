---
"@rottay/design-system": patch
---

pattern-calendar-view stops painting a solid focus outline on its day cells and
event chips and wears the tenant's focus signature (`states.focus-style`,
emitted as `--ds-focus-ring`).

Before, the day cell painted `outline: var(--ds-focus-ring-width) solid
var(--ds-focus-ring-color)` inset by its own width (`ring` 2px at -2px,
`underline` 2px at -2px, `glow` 1px at -1px) and the event chip painted the
same outline at `var(--ds-focus-ring-offset)` (2px at 2px, 2px at 0px, 1px at
0px): the same solid contour under all three signatures.

DECLARED VISUAL CHANGE, measured in Chromium after keyboard focus, in the
document scope and in a nested `[data-ds-root]`:

| family | node | carried by | `ring` | `underline` | `glow` |
| --- | --- | --- | --- | --- | --- |
| pattern-calendar-view | day cell (roving tab stop) | overlay inside the cell, inset by offset + width | double ring inside the cell | 2px underline inside the cell's bottom edge | 1px ring inside the cell and halo |
| pattern-calendar-view | event chip (reached with F2) | the chip | double ring | 2px inset underline | 1px ring and halo |

The calendar grid clips its cells, so the cell carries the signature on an
overlay inside it; the glow's halo is cut where the grid ends, and the 1px ring
is whole. The cell overlay paints only while the cell itself holds focus: a
chip focused inside a cell shows one indicator. The selected-day frame and the
today marker stay on the cell and the date label, under the overlay.

The event chip wears the signature on its own box, as the Button does. The
chip is filled with its accent, and the signature is drawn in the tenant focus
colour. Under `underline`, a chip whose fill equals the focus colour shows no
visible line, as the primary Button, the reference consumer, does not either:
measured with the default accent on bithire, evnto and rottay in the light
theme. The line is visible on evnto and rottay in the dark theme and on chips
that state their own colour. `ring` and `glow` are visible everywhere. This is
a property of the signature on accent-filled hosts, not of the chip, and it is
not fixed here.

In the first and last column a chip sits 3px from the grid's clip, so the
ring's outer band loses 1px on that side, as the previous outline did; the
underline and the glow's 1px ring are whole.

Open items, recorded for the owner of the focus signature rather than for this
family: under `underline` the signature has no ground-colour layer of its own,
as `ring` has, so it is ink on ink on any host filled with the focus colour (a
deriver decision); and the day cell's 3.5px padding is narrower than the ring's
4px reach.

A pointer focus shows no indicator. Forced colors: the cell paints `outline:
max(2px, var(--ds-focus-ring-width)) solid Highlight` inset by its own width,
the chip paints it at `var(--ds-focus-ring-offset)`, and both drop the overlay;
under `glow` the outline was 1px and is now 2px.

No channel, hook or deriver is added, removed or re-pointed. The skin no longer
reads `--ds-focus-ring-color` directly; the signature reads it.
