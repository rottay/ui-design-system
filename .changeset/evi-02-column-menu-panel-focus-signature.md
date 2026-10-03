---
"@rottay/design-system": patch
---

ColumnMenu's panel wears the tenant's focus signature when it takes focus on
open.

The panel is focused programmatically when the menu opens (`tabIndex=-1`). It
painted `outline: 2px solid var(--ds-color-border-focus)` at `-2px`: one solid
contour under all three `states.focus-style` signatures. It now carries
`var(--ds-focus-ring)` on an overlay hosted by the panel itself and inset by
the signature's own reach (offset + width), because the Popover surface clips
the panel and nothing can paint outward.

One derived channel is added under the family deriver, and no hook is removed:

| channel | before | after |
| --- | --- | --- |
| `--ds-column-menu-panel-focus-ring` | — | `var(--ds-focus-ring)` (new; the overlay's `box-shadow`) |
| `--ds-column-menu-panel-focus-outline` | `var(--ds-focus-ring-width, 2px) solid var(--ds-color-border-focus)` | `var(--ds-focus-ring-width) solid transparent` |
| `--ds-column-menu-panel-focus-outline-offset` | `-2px` | `-2px` (unchanged) |

DECLARED VISUAL CHANGE, measured in Chromium on the open panel after keyboard
focus, in the document scope and in a nested `[data-ds-root]`:

| `states.focus-style` | before | after |
| --- | --- | --- |
| `ring` | 2px solid inset outline | the double ring, landing on the panel edge |
| `underline` | 2px solid inset outline | the 2px underline along the panel's bottom edge |
| `glow` | 1px solid inset outline | the 1px ring; its halo is cut by the surface |

A pointer-initiated open shows no indicator, as before. Forced colors keep a
system-colour outline (`max(2px, var(--ds-focus-ring-width)) solid Highlight`)
at the offset hook, and the overlay is switched off.

Consumer note: a tenant or application that authors
`--ds-column-menu-panel-focus-outline` still gets that outline, at
`--ds-column-menu-panel-focus-outline-offset`, painted together with the
signature. To replace the signature rather than add to it, also author
`--ds-column-menu-panel-focus-ring` (`none`, or a `box-shadow` value of your
own). An authored value of any of the three outranks the derived default in the
compile and in every emitted scope.

Correction: the Popover that hosts the menu focuses its own surface on open, so
at keyboard open the panel did not hold focus and its overlay did not paint
(the Popover surface showed a solid outline instead). The overlay DID paint
once a control inside the panel took focus, as a second indicator next to that
control's own. The indicator, and the three hooks above, now belong to the
Popover surface (see `evi-02-focus-signature-overlays`); the panel keeps its
overlay for its own focus only, when a script parks focus on the panel itself.
