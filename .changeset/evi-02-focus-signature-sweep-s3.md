---
"@rottay/design-system": patch
---

Five families wear the tenant's focus signature (`states.focus-style`: ring,
underline or glow, emitted as the box-shadow `--ds-focus-ring`) on their own
focus targets, instead of one solid outline under every focus style.

DECLARED VISUAL CHANGE, measured in Chromium with real keyboard focus, in the
document scope and in a nested `[data-ds-root]`. A pointer press shows no
indicator on any of these targets.

| family | focus target | before | ring | underline | glow | forced colors |
| --- | --- | --- | --- | --- | --- | --- |
| Tour | surface (focused on open and on every step) | solid outline whenever focus was anywhere inside, pointer included | double ring in front of the elevation | 2px underline on the surface's bottom edge, elevation kept | 1px ring and halo in front of the elevation | `max(2px, width) solid Highlight` at the tour offset |
| Tour | step actions, close control | solid outline | double ring | 2px underline | 1px ring and halo | same outline |
| Collapse | header toggle | solid inset outline | double ring inside the header row's padding | 2px underline | 1px ring and halo | `max(2px, width) solid Highlight` at the focus offset |
| Collapse | icon toggle (`collapsible="icon"`) | solid outline | double ring | 2px underline, which turns with the chevron when the panel is open | 1px ring and halo | same outline |
| ScrollArea | scroll region | solid outline | double ring | 2px underline on the region's bottom edge | 1px ring and halo | `max(2px, width) solid Highlight` at the scroll-area offset |
| Splitter | separator | solid outline | double ring around the rail | 2px mark on the rail's bottom edge (the full length of a horizontal rail, the rail's own width on a vertical one) | 1px ring and halo | `max(2px, width) solid Highlight` at the gutter offset |
| VirtualList | scroll region | solid inset outline | double ring, now outside the region | 2px underline on the region's bottom edge | 1px ring and halo | `max(2px, width) solid Highlight` at the focus offset |

A focused Tour action keeps the signature while it is hovered or pressed.

Notes for consumers:

- VirtualList's indicator is now OUTWARD (it was an inset outline). A consumer
  that wraps the list flush in an `overflow: hidden` box cuts it; give the list
  clearance of the focus offset plus width, or do not clip it.
- VirtualList's skin is a presentation skin shared by every engine's render of
  the pattern, so the change also paints under Classic and Rustic renders.
- Splitter under `underline`: on a vertical rail the indicator is an 8x2px mark
  at the rail's foot. A projection along the rail needs an owner decision.
- Collapse's icon toggle is turned by the skin when the panel is open, and its
  indicator turns with the arrow (follow-up).
- Tooltip, Popover and HoverCard are not changed: Tooltip and Popover need a
  Modern TSX state stamp before their panels can wear the signature, and
  HoverCard's surface is not a focus target (a keyboard-only frame is undecided).

One tenant hook changes its default, and none is removed:

| hook | before | after |
| --- | --- | --- |
| `--ds-tour-focus-ring` (an outline colour) | `var(--ds-focus-ring-color)` | `transparent` |

Consumer note: a tenant or application that authors `--ds-tour-focus-ring`
still gets a solid outline in that colour on the Tour surface, its actions and
its close control, at `--ds-tour-focus-ring-width` and
`--ds-tour-focus-ring-offset`, painted together with the signature. An authored
value outranks the derived default in the compile and in every emitted scope.
`--ds-scroll-area-focus-ring-offset`, `--ds-scroll-area-focus-ring-radius`,
`--ds-splitter-gutter-focus-ring-offset`, `--ds-collapse-header-focus-ring-radius`
and `--ds-collapse-arrow-focus-ring-radius` are read as before.
