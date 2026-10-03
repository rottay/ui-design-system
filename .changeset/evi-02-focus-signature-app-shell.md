---
"@rottay/design-system": patch
---

AppShell wears the tenant's focus signature on its own focusable nodes.

The skip link and the two navigation controls painted
`outline: var(--ds-focus-ring-width) solid <colour>` at
`--ds-focus-ring-offset`: one solid contour under all three
`states.focus-style` signatures. The content landmark, which takes focus from
the skip link (`tabIndex=-1`), showed the browser's default ring. Each node now
wears `var(--ds-focus-ring)`. A pointer-initiated focus shows no indicator, as
before.

AppShell is painted by a presentation skin that every engine shares, so its
Classic and Rustic renders change in the same way.

DECLARED VISUAL CHANGE, measured in Chromium on the real component after real
keyboard focus, in the document scope and in a nested `[data-ds-root]`:

| node | before (ring / underline / glow) | after: `ring` | after: `underline` | after: `glow` | forced colors |
| --- | --- | --- | --- | --- | --- |
| skip link | 2px / 2px / 1px solid outline | double ring over the lift | 2px underline over the lift | 1px ring and halo over the lift | `max(2px, width)` Highlight outline at the signature offset |
| navigation trigger | 2px / 2px / 1px solid outline | double ring | 2px underline | 1px ring and halo | same |
| navigation close | 2px / 2px / 1px solid outline, cut by the drawer header when the header is 44px tall | double ring inside the control | 2px underline inside the control | 1px ring inside the control | inset Highlight outline |
| content landmark | the browser's default ring around the whole landmark | double ring framing the visible content area | 2px underline along the bottom of the visible content area | 1px ring framing the visible content area | inset Highlight outline on the landmark |

The landmark's signature rides an overlay pinned to the viewport between the
shell's own insets (`--ds-shell-top-inset`, `--ds-shell-inline-start-inset`,
`--ds-shell-main-padding-block-end` / `--ds-shell-bottom-inset`), so it stays
visible on a page of any height and at any scroll position. The landmark itself
is not positioned: an absolutely positioned descendant keeps its containing
block when the landmark takes focus.

The skip link composes the signature with its lift only where the lift is not
`none` (`--ds-app-shell-skip-link-shadow`, `--ds-elevation-2`), so a flat
elevation posture keeps the indicator.

Consumer note: the overlay follows the block-end space the shell reserves. A
persistent bottom bar whose content is taller than the 64px the shell reserves
for it covers the overlay's bottom edge, as it already covers the page content
there; state `geometry.bottomInset` to reserve the real height.
Today the bar body wears the sidebar's derived padding, so the default bar is
taller than that reservation in every scope and the `underline` signature is
hidden under it; that reservation error predates this change. The overlay is
`position: fixed`: an ancestor with a transform or `container-type`, or a shell
rendered inside a pane that is not the viewport, anchors it the way it anchors
the shell's own fixed chrome.
