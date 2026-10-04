---
"@rottay/design-system": patch
---

The Modern SavedViews reorder grip wears the tenant focus signature.

With `onViewReorder` the pill renders a grip (`[data-part='drag-handle']`,
`role="button"`, `tabIndex=0`): the keyboard move affordance, and the one tab
stop of the bar that is not a composed Button or Input. The Modern skin had no
state rule for it, so keyboard focus showed the browser's ring, at the grip's
resting 0.4 opacity.

Under `:is([data-state~='focus-visible'], :focus-visible)` the grip now paints
`box-shadow: var(--ds-focus-ring)` with a transparent outline, the pill's own
focus corner (`--ds-saved-views-focus-ring-radius`) and `opacity: 1`. The lift
to full strength is required by the indicator, not a restyle of the resting
grip: opacity dims the element's shadow with it, and at 0.4 the ring measures
1.85:1 (bithire) and 2.54:1 (evnto) against the bar, below the 3:1 a focus
indicator needs; at 1 it measures 5.55:1 and 17.18:1. The resting opacity and
its channel are unchanged. In forced colors the grip keeps
`outline: max(2px, var(--ds-focus-ring-width)) solid Highlight`, and
`HighlightText` on the active pill, whose fill is `Highlight` itself.

DECLARED VISUAL CHANGE, measured in Chromium on the real Modern component under
`EngineProvider`, layered bithire and evnto bundles, `html` scope and a nested
`[data-ds-root]`: keyboard focus on the grip shows the tenant's `ring`,
`underline` or `glow` instead of the browser ring; pointer focus shows nothing,
as before. The ring is not clipped by the pill or the scrolling bar at 640px
and 260px. The engine, the grip's semantics and arrow-key reordering are
unchanged; the composed Buttons and Inputs keep their own rings.
