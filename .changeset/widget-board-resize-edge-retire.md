---
"@rottay/design-system": patch
---

Widget-board's resize edges render the shared `ResizeHandle` directly now that
the primitive stamps the kernel interaction state itself; the internal
`BoardResizeEdge` wrapper (sixteen `display:contents` spans per board) is
retired. DOM snapshots will see those wrapper spans gone and `data-state`
appear on the edges under pointer/keyboard interaction (`pressed` is now
serialized too — the old wrapper never saw the press). Paint, geometry, z-order
and every resting attribute are unchanged, and the dead
`.ds-widget-board__resize-edge { display: contents }` skin rule is drained.
No public API moved.
