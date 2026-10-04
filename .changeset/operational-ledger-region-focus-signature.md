---
"@rottay/design-system": patch
---

The Modern OperationalLedger scroll region wears the tenant focus signature.

`[data-part='table-region']` is the tab stop that makes the overflowing columns
keyboard-reachable. The Modern skin had no focus rule for it, so keyboard focus
showed the browser's own ring whatever `states.focus-style` the tenant chose.

The root clips (`overflow: hidden`) and the sticky header and the rows cover the
region, so the signature cannot be painted on the region itself. It rides a
`::before` overlay of the focused region, positioned against the root (now
`position: relative`), inset by the signature's own reach
(`--ds-focus-ring-offset` + `--ds-focus-ring-width`), above the sticky header,
with `box-shadow: var(--ds-focus-ring)` verbatim and no pointer events. Because
the overlay hangs from the root and not from the scroller, it stays still while
the region scrolls. The region keeps a transparent outline; in forced colors the
overlay carries `outline: max(2px, var(--ds-focus-ring-width)) solid Highlight`
on the same inset edge. The engine stamps the region through the interaction
kernel (`partAttributes('table-region', …)`), so `data-state~='focus-visible'`
is the twin of `:focus-visible`.

DECLARED VISUAL CHANGE, measured in Chromium on the real Modern component under
`EngineProvider`, layered bithire and evnto bundles, `data-engine="modern"` on
`html` and on a nested `[data-ds-root]`:

| | before | after |
| --- | --- | --- |
| keyboard focus, `ring` | browser ring, the same under every signature, top edge covered by the sticky header | double ring, whole on four sides inside the card |
| keyboard focus, `underline` | the same browser ring | 2px underline on the card's inner bottom edge |
| keyboard focus, `glow` | the same browser ring | 1px ring on four sides; the soft halo is clipped by the root |
| scrolled region | ring stays on the region | indicator stays still on the card |
| pointer focus | nothing | nothing |
| forced colors | browser ring, top edge covered | 2px `Highlight` outline on four sides |

With a filter bar the indicator frames the whole card, filter bar included: the
region's own top edge has no CSS-reachable position from an overlay that must
not scroll. Layout, the root's resting elevation and the row hover are
unchanged. Classic is frozen and untouched.
