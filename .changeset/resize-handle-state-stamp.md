---
"@rottay/design-system": patch
---

The shared `ResizeHandle` now stamps the kernel interaction state (`data-state`)
on the node it renders, so splitter's gutter — whose Modern skin already paints
hovered/pressed/focus-visible — has a producer for that paint. The consumer's
`anatomy` object spreads last, so a consumer that already passes its own state
vocabulary through `anatomy` (widget-board's resize edges) keeps the last word
and its DOM is unchanged. Splitter gutter DOM gains `data-state` attributes
under hover/press/keyboard focus; at rest nothing changes. No public signature
moved.
