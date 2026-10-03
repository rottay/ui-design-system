---
"@rottay/design-system": patch
---

Six families stop painting a solid focus outline and wear the tenant's focus
signature (`states.focus-style`, emitted as `--ds-focus-ring`) on their own
focusable nodes.

Each of these nodes painted `outline: var(--ds-focus-ring-width) solid
var(--ds-focus-ring-color)` at `var(--ds-focus-ring-offset)`: the same solid
contour under ring, underline and glow, with only its width and offset
following the tenant. Before, in every family below unless the row says
otherwise: `ring` 2px solid at 2px, `underline` 2px solid at 0px, `glow` 1px
solid at 0px.

DECLARED VISUAL CHANGE, measured in Chromium after keyboard focus, in the
document scope and in a nested `[data-ds-root]`:

| family | node | carried by | `ring` | `underline` | `glow` |
| --- | --- | --- | --- | --- | --- |
| collection-workspace | filter dropdown surface (script focus) | the surface, composed with the popover elevation | double ring over the elevation | 2px inset underline over the elevation | 1px ring and halo over the elevation |
| collection-workspace | page-size pill (for its invisible native select) | the pill, composed with its lift | double ring | 2px inset underline | 1px ring and halo |
| collection-workspace-render-dispatch | activatable card item (for its hidden activation control) | overlay inside the item, inset by offset + width | double ring inside the card edge | 2px underline inside the card's bottom edge | 1px ring inside the card edge and halo |
| collection-workspace-render-dispatch | fallback "Open details" anchor | the anchor | double ring | 2px inset underline | 1px ring and halo |
| pattern-kanban-board | card | overlay inside the card, inset by offset + width | double ring inside the card edge | 2px underline inside the card's bottom edge | 1px ring inside the card edge and halo |
| pattern-timeline | clickable item card | the card, composed with its own shadow | double ring over the shadow | 2px inset underline over the shadow | 1px ring and halo over the shadow |
| scheduler-surface | actionable agenda row | the row | double ring | 2px inset underline | 1px ring and halo |
| tenant-preview | sample table scroll region | the region | double ring | 2px inset underline under the table | 1px ring and halo |

Before, on the one row that was not a tenant-width outline: the page-size pill
painted a fixed `0 0 0 3px` wash at 12% of the primary under all three
signatures, on pointer focus too, and nothing at all in forced colors.

The kanban card list scrolls and clips its cards, and the collection card
covers its item flush in the grid, so those two carry the signature on an
overlay inside the node; the glow's halo is cut where the list or a neighbour
ends, and the 1px ring is whole. The kanban overlay paints only while the card
itself holds focus: a control focused inside a card shows one indicator. A
kanban card moved with the arrow keys keeps the overlay in its new column.

The collection fallback card renders its open affordance either as an anchor or
as a DS Button. The outline stacked on the Button is removed: the Button keeps
its own signature and the anchor wears it here.

The filter dropdown surface keeps its elevation under focus
(`var(--ds-focus-ring), var(--ds-popover-shadow, var(--ds-elevation-3))`) and
the timeline card keeps its resting shadow, or `--ds-shadow-md` while hovered.
Both compositions with a channel are guarded: a tenant whose elevation is
`none` gets the signature alone, never an empty shadow.

A pointer focus shows no indicator, with one exception: a native `<select>`
matches `:focus-visible` on click, so the page-size pill shows the signature on
pointer focus too. It keeps its border tint and lift on any focus and drops the
fixed wash.

The tenant-preview sample region wears the ambient signature, the one of the
scope that surrounds the preview: the preview's own CSS states no focus
channel, so the region does not preview the tenant's focus style.

Forced colors: every node above paints `outline: max(2px,
var(--ds-focus-ring-width)) solid Highlight` at `var(--ds-focus-ring-offset)`
(inset by its own width on the kanban card and the collection card item) and drops the shadow or the overlay. New arms:
scheduler-surface, tenant-preview, the filter dropdown surface, the page-size
pill and the fallback anchor had none of their own; under `glow` the outline
was 1px and is now 2px in every family.

No channel, hook or deriver is added, removed or re-pointed. The skins no
longer read `--ds-focus-ring-color` directly; the signature reads it.
collection-workspace-render-dispatch now reads `--ds-z-index-relative-above`
for its overlay.

Not changed: the collection preview-rail resize handle keeps its fixed inset
outline (`2px solid` at 42% of the primary, `-2px`); the rail clips half of the
handle, so an overlay there would be cut. ascii-diagram is stopped, with no
change in this release: its outline is drawn in the surface's own foreground
under the commercial kit's focus law, and whether that kit wears the tenant
signature is pending an owner ruling.
