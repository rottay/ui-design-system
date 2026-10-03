---
"@rottay/design-system": patch
---

Ten families stop painting a solid focus outline and wear the tenant's focus
signature (`states.focus-style`, emitted as `--ds-focus-ring`) on their own
focusable nodes.

Each of these nodes painted `outline: var(--ds-focus-ring-width) solid
var(--ds-focus-ring-color)` at `var(--ds-focus-ring-offset)`: the same solid
contour under ring, underline and glow, with only its width and offset
following the tenant. Before, in every family below: `ring` 2px solid at 2px,
`underline` 2px solid at 0px, `glow` 1px solid at 0px.

DECLARED VISUAL CHANGE, measured in Chromium after keyboard focus, in the
document scope and in a nested `[data-ds-root]`:

| family | node | carried by | `ring` | `underline` | `glow` |
| --- | --- | --- | --- | --- | --- |
| activity-cards | view-all anchor | overlay on the anchor | double ring around the pill | 2px underline on the pill's bottom edge | 1px ring and halo |
| activity-compact | view-all anchor | overlay on the anchor | double ring | 2px underline | 1px ring and halo |
| activity-ticker | view-all anchor | overlay on the anchor | double ring | 2px underline | 1px ring and halo |
| activity-ticker | prev/next buttons, pagination dots | the control | double ring | 2px inset underline | 1px ring and halo |
| activity-timeline | view-all anchor | overlay on the anchor | double ring | 2px underline | 1px ring and halo |
| activity-log | interactive item body | overlay on the body | double ring | 2px underline above the diff panel | 1px ring and halo |
| stats-grid | interactive card | the card, composed with its elevation | double ring over the elevation | 2px inset underline over the elevation | 1px ring and halo over the elevation |
| pricing-table | described feature label | the label | double ring | 2px inset underline | 1px ring and halo |
| invoice-template | line-items scroll wrapper | the wrapper | double ring | 2px inset underline | 1px ring and halo |
| gallery-view | card | overlay inside the card, inset by offset + width | double ring inside the card edge | 2px underline inside the card's bottom edge | 1px ring inside the card edge |
| data-terminal-card | full-body link | overlay on the link | double ring around the card | 2px underline on the card's bottom edge | 1px ring and halo |

Where the node's own content covers it (the view-all pill, the activity-log
diff panel, the terminal card, the gallery media and caption) an inset
underline painted on the node would be hidden, so an overlay carries the
signature above the content. The gallery card clips its own box, so its overlay
sits inside the card and the glow's halo is cut there; the 1px ring is whole.
The pricing-table label sits 6px from the scroll frame's inline-start edge, so
the glow's halo is cut on that side; the ring and the underline are whole.

The stats-grid card keeps its elevation under focus (`var(--ds-focus-ring),
var(--ds-elevation-1)`, or `--ds-elevation-2` while hovered). The composition
is guarded: a tenant whose elevation is `none` gets the signature alone, never
an empty shadow.

A pointer focus shows no indicator, as before. Forced colors: every node above
paints `outline: max(2px, var(--ds-focus-ring-width)) solid Highlight` at
`var(--ds-focus-ring-offset)` and drops the shadow or the overlay. Three of
these arms are new or stronger: invoice-template had none of its own; the
activity strips had none of their own; under `glow` the outline was 1px and is
now 2px in every family.

No channel, hook or deriver is added, removed or re-pointed. The skins no
longer read `--ds-focus-ring-color` directly; the signature reads it.
