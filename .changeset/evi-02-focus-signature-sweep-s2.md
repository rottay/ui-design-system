---
"@rottay/design-system": patch
---

Nine navigation and shell families wear the tenant's focus signature on their
own focusable nodes.

Each of them painted `outline: var(--ds-focus-ring-width) solid <colour>` at
`--ds-focus-ring-offset`: one solid contour under all three
`states.focus-style` signatures, with only its width and offset following the
tenant. Each node now wears `var(--ds-focus-ring)`, on its own box where it has
room and on an overlay hosted by the node where an ancestor clips it or its
content covers it. A pointer-initiated focus shows no indicator, as before.

DashboardHeader, BottomTabBar and the Search surface are painted by
presentation skins that every engine shares, so their Classic and Rustic
renders change in the same way (as ColumnMenu and the chart data-access
controls did). The other six are Modern skins; the frozen engines are
untouched.

DECLARED VISUAL CHANGE, measured in Chromium after real keyboard focus, in the
document scope and in a nested `[data-ds-root]`:

| family | node | before (ring / underline / glow) | after: `ring` | after: `underline` | after: `glow` | forced colors |
| --- | --- | --- | --- | --- | --- | --- |
| CockpitHeader | breadcrumb trail (tab stop) | 2px / 2px / 1px solid outline | double ring around the pill, over its highlight | 2px underline inside the pill | 1px ring and halo | `max(2px, width)` Highlight outline at the signature offset |
| CockpitHeader | crumb link | 2px / 2px / 1px solid outline | double ring | 2px underline | 1px ring; the halo is cut by the trail at 4px | same |
| Layout | sider collapse trigger | 2px / 2px / 1px solid inset outline | double ring inside the trigger | 2px underline inside the trigger | 1px ring inside the trigger | inset Highlight outline (was an outward outline the sider clipped) |
| DashboardHeader | metrics readout (tab stop) | 2px / 2px / 1px solid outline | double ring | 2px underline | 1px ring and halo; the halo is cut by the compact header at 7.6px | `max(2px, width)` Highlight outline |
| BottomTabBar | tab button | 2px / 2px / 1px solid inset outline | double ring inside the tab | 2px underline inside the tab | 1px ring inside the tab | inset Highlight outline (the family had no forced-colors focus arm) |
| Anchor | link | 2px / 2px / 1px solid outline, cut by the scrolling list on its flush edges | double ring inside the link | 2px underline inside the link | 1px ring inside the link | inset Highlight outline, `HighlightText` on the selected link |
| BackTop | trigger | 2px / 2px / 1px solid outline | double ring around the circle, elevation kept | 2px underline inside the circle's lower edge, elevation kept | 1px ring and halo, elevation kept | `max(2px, width)` Highlight outline |
| Link | link | 2px / 2px / 1px solid outline in the link tone | double ring | 2px underline | 1px ring and halo | `max(2px, width)` Highlight outline |
| Typography.Link | link | 2px / 2px / 1px solid outline | double ring | 2px underline | 1px ring and halo | `max(2px, width)` Highlight outline (the family had no forced-colors focus arm) |
| Search surface | custom result row | 2px / 2px / 1px solid outline | double ring around the row | 2px underline above the row content | 1px ring and halo | `max(2px, width)` Highlight outline at the signature offset |

A Link or Typography.Link that wraps across lines draws the signature whole on
every line (`box-decoration-break: clone`): a closed ring per line, one
underline per line, a halo per line. This reaches every composer of the two
primitives: breadcrumbs, table cells and inline paragraph links were measured.

Link's default focus indicator no longer follows the link tone: it is the
tenant signature in the tenant focus colour, as on Button.

Published hooks: none is removed and every one is still read.

| hook | before | after |
| --- | --- | --- |
| `--ds-link-focus-ring-color` | outline colour, default a 60% mix of the link tone | outline colour, default a zero-weight mix of `--ds-focus-ring-color` (transparent); an authored value paints that outline together with the signature |
| `--ds-link-focus-ring-width` | outline width | width of that outline and of the forced-colors outline |
| `--ds-link-focus-ring-offset` | outline offset | offset of that outline and of the forced-colors outline |
| `--ds-anchor-focus-ring-offset` | outline offset | how far inside the link the overlay sits |
| `--ds-anchor-focus-ring-radius` | focused radius | focused radius, and the overlay's concentric radius |
| `--ds-backtop-focus-ring-offset` | outline offset | offset of the transparent outline and of the forced-colors outline |

Consumer note: the Search surface's custom result row is now
`position: relative`, so an absolutely positioned descendant of a custom
renderer resolves against the row.

Known follow-ups, none reachable from an application today (the three apps
inject a raw anchor as their navigation link):

- A design-system `Link` injected through `NavigationLinkProvider` into the
  activity strips' "view all" anchor or the DataTerminalCard link would paint
  its own signature under the family's overlay. Those overlays should stand
  down when the anchor is a `Link`.
- A `Link` composed inside a Menu item would paint its own signature beside the
  item's, and `navigation-static`'s `.rottay-menu--modern a:focus-visible`
  outline would stack on it.
