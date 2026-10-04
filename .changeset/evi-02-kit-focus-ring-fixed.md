---
"@rottay/design-system": patch
---

The commercial kit's focus ring is a fixed 2px inversion outline on every
tenant focus signature.

`TreeViewConnector` (the link a node with `href` renders) and `AsciiDiagram`
(the grid, focusable only while it overflows) each paint their own focus ring
in the surface's foreground. Both rules took the ring's width from the tenant
channel `--ds-focus-ring-width`, so a tenant on `states.focus-style: glow` got
a 1px kit ring against the commercial-surfaces law ("focus rings: 2px, always
visible"). The width is now the kit's own.

DECLARED VISUAL CHANGE, measured in Chromium on the real components under
bithire and evnto, on ink and on paper, at the document root and in a nested
`[data-ds-root]` scope carrying a different signature:

| tenant focus style | before | after |
| --- | --- | --- |
| `ring` | 2px solid, surface foreground, 2px offset | unchanged |
| `underline` | 2px solid, surface foreground, 2px offset | unchanged |
| `glow` | 1px solid, surface foreground, 2px offset | 2px solid, surface foreground, 2px offset |

The colour and the offset do not change. Pointer focus still paints nothing.

Forced colours: the outline was already `Highlight` and still is; under `glow`
it goes 1px to 2px with the rest. The colour is the user agent's, measured in
Chromium: both rules sit above the Modern forced-colours floor by layer, and the
browser replaces their non-system outline colour itself. No forced-colours arm
is added.

`prefers-contrast: more`: the 3px ring the increased-contrast floor gave the
kit through the same channel is kept, now stated by the two skins. It reaches
a nested tenant scope too, which the channel did not (2px under `ring` and
`underline`, 1px under `glow` before; 3px after).

No channel is added, removed or re-pointed, and no component markup changes.
A stylesheet that sets `--ds-focus-ring-width` no longer changes the width of
these two rings.
