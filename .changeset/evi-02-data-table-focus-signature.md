---
"@rottay/design-system": patch
---

DataTable's keyboard focus wears the tenant's focus signature on every node
that takes focus: the body row, the group header row, the sortable header cell,
the column resize handle and the mobile card.

Each of them painted one fixed shape under all three `states.focus-style`
signatures: the row an inset band repeated on every cell (doubled at each cell
joint), the header an inset ring built from the width and the primary colour,
the resize handle a solid inset outline. They now carry `var(--ds-focus-ring)`.
A row, a header cell and the handle sit inside the table scroller and cannot
paint outward, so each hosts one overlay on itself, inset by the signature's
own reach (offset + width); the row overlay runs above its pinned cells and
under the sticky header. The mobile card is not clipped and wears the signature
on its own box.

Two derived defaults change under the family deriver; no hook is added or
removed:

| channel | before | after |
| --- | --- | --- |
| `--ds-data-table-header-focus-shadow` | `inset 0 0 0 var(--ds-focus-ring-width, 2px) color-mix(in srgb, var(--ds-color-primary) 48%, transparent)` | `var(--ds-focus-ring)` |
| `--ds-data-table-mobile-card-focus-ring` | `0 0 0 var(--ds-focus-ring-width, 2px) color-mix(in srgb, var(--ds-color-primary) 42%, transparent), var(--ds-collection-card-shadow-hover, var(--ds-premium-card-shadow-hover, var(--ds-elevation-2)))` | `var(--ds-focus-ring)` |

`--ds-table-row-focus-shadow` keeps its name and has no derived default: the
skin reads it over the signature, on the row overlay instead of on each cell.

DECLARED VISUAL CHANGE, measured in Chromium after keyboard focus, in the
document scope and in a nested `[data-ds-root]`:

| node | `ring` | `underline` | `glow` |
| --- | --- | --- | --- |
| body row / group header row, before | a 2px inset band on every cell | the same 2px band | a 1px band |
| body row / group header row, after | one double ring around the row | one 2px underline along the row | one 1px ring and its halo |
| sortable header cell, before | 2px inset ring | the same 2px ring | 1px inset ring |
| sortable header cell, after | the double ring inside the cell | the 2px underline | the 1px ring and its halo |
| resize handle, before | 2px solid inset outline | the same outline | 1px outline |
| resize handle, after | the double ring on the handle | the underline at the handle's foot | the 1px ring and its halo |
| mobile card, before | no ring of its own (the stated one never painted) | none | none |
| mobile card, after (plus the Card's solid outline, see above) | the double ring around the card | the 2px underline | the 1px ring and its halo |

The group header row had no focus rule and showed the browser default. A
focused cell no longer carries a shadow of its own, so a selected or hovered
row keeps its keyline while focused. Pointer focus shows no indicator, as
before. A row wider than its scroller has the ends of its ring scrolled out of
view with the row; the glow halo is cut by the scroller and by neighbouring
pinned cells.

Forced colors: the row, the group header row and the sortable header had no
focus indicator at all. The row, the group header row, the sortable header cell
and the resize handle now keep a system-colour outline,
`max(2px, var(--ds-focus-ring-width)) solid Highlight`, with the overlay's
shadow switched off; the mobile card restates its focus in `Highlight` through
the Card's outline on the stamped path; the unstamped path carries a `Highlight`
box-shadow and no outline.

On the mobile card the signature travels on `--ds-card-bordered-shadow`, the
channel the outlined Card paints its shadow from. The card is always actionable,
so the Card's own focus outline (`modern/skin/card/index.css:198-201`, a solid
outline from the signature's width and colour) paints on every keyboard focus;
under `ring` and `glow` it coincides with the signature's outer layer, under
`underline` it is a full 2px solid outline around the card in addition to the
underline. The signature is not distinct on the mobile card under `underline`
until the Card family wears it; receptor: Card focus packet (card:198-201 and
:603-606), which also removes these two mobile-card rules.

Consumer note: an authored `--ds-table-row-focus-shadow`,
`--ds-data-table-header-focus-shadow` or
`--ds-data-table-mobile-card-focus-ring` outranks the signature in the compile
and in every emitted scope, and is now painted on the row or header overlay, or
on the card, rather than on each cell. A `--ds-card-bordered-shadow` set
anywhere, tenant root included, is lost on the mobile card while the card holds
keyboard focus.

Proof is Chromium-only: no non-Chromium engine was read for the row overlay,
whose containing block is a relatively positioned `tr`.

CORRECTION (mobile card). The "mobile card, after" row above was measured
without `data-engine` on the document. In an application, where the engine
provider stamps `html[data-engine]`, the personality layer owned the card
root's `box-shadow` from a later cascade layer, so the mobile-card signature
stated here did not paint: the focused card showed only the Card's solid
outline, under all three focus styles. The signature paints on the mobile card
in an application from the release that carries
`evi-02-card-focus-signature.md`, which also removes the two mobile-card focus
rules and the `--ds-card-bordered-shadow` route described above, and closes the
solid-outline residual.
