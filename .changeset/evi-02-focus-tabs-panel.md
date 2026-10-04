---
"@rottay/design-system": patch
---

Tabs: the panel and the overflow controls show one focus indicator, in forced
colors too, and keep their elevation while focused.

Panel. The tab panel is a tab stop of its own. In forced colors it showed no
indicator at all when it held focus; it now draws a system-colour outline
inside its box, at least 2px wide, inside the border of a `contained` panel. In
normal rendering its focus signature was an outward shadow on the panel, so a
scrolling host cut it: inside the list toolbar's settings panel the `ring` and
`glow` signatures showed on the top edge only. The signature now rides an
overlay inside the panel, inset by its own reach (`--ds-focus-ring-offset` +
width), following the radius of a `contained` panel. It applies only while the
panel itself holds focus; before, the panel kept it while a control inside it
held focus, so two indicators were painted at once. A `contained` panel keeps
its own elevation while focused, where the signature used to replace it.

The panel is now `position: relative` in every variant (the `contained` panel
already was). An absolutely positioned child of a plain panel that has insets
and no nearer positioned ancestor now resolves against the panel instead of the
tabs root.

Overflow controls (previous, next, more). A focused control dropped its
elevation, and a control that was hovered while focused lost the focus
signature to the hover shadow. The signature is now stated first and composed
with the rest shadow (`--ds-tabs-overflow-control-shadow`) or the hover shadow
(`--ds-tabs-overflow-control-shadow-hover`). In forced colors their outline is
now at least 2px wide; under a 1px signature such as `glow` it was 1px.

Each composition applies only where the composed shadow is not `none`
(`--ds-tabs-overflow-control-shadow`, `--ds-elevation-1`;
`--ds-tabs-overflow-control-shadow-hover`, `--ds-elevation-2`), so a flat
elevation posture keeps the indicator. The signature still reads
`--ds-tabs-panel-focus-ring` / `--ds-tabs-focus-ring`, which alias
`--ds-focus-ring`. A pointer-initiated focus shows no indicator, as before.
Rest, hover and selected shadows are unchanged.

DECLARED VISUAL CHANGE, measured in Chromium on the real Modern components
after real keyboard focus, in the document scope and in a nested
`[data-ds-root]`, on the bithire and evnto bundles:

| node | before | after: `ring` | after: `underline` | after: `glow` | forced colors, before | forced colors, after |
| --- | --- | --- | --- | --- | --- | --- |
| panel, focused | signature outside the panel | double ring inside the panel's edge | 2px line inside the panel, 2px above its bottom edge | 1px ring inside the panel's edge | nothing | 2px Highlight outline inside the panel |
| panel, focused, inside a scrolling host | `ring` and `glow` on the top edge only | whole, four sides | whole | whole, four sides | nothing | 2px Highlight outline, four sides |
| panel, `contained`, focused | signature outside, elevation dropped | ring inside the border, elevation kept | line inside, elevation kept | ring inside the border, elevation kept | nothing | 2px Highlight outline inside the border |
| panel, a control inside it focused | signature on the panel and on the control | on the control only | on the control only | on the control only | outline on the control only | unchanged |
| overflow control, focused | signature, elevation dropped | signature over the elevation | same | same | outline as wide as the signature (1px under `glow`) | outline at least 2px |
| overflow control, focused and hovered | hover shadow, no signature | signature over the hover shadow | same | same | outline | outline at least 2px |

Inside the panel the soft halo of `glow` is drawn only where the panel's
surroundings leave room for it; its 1px ring is always whole.
