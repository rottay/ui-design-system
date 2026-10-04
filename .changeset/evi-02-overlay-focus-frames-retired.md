---
"@rottay/design-system": patch
---

Tooltip and HoverCard no longer frame themselves while a control inside them
holds focus.

The interactive Tooltip bubble and the HoverCard surface are never tab stops:
the keyboard lands on a control inside them, and that control wears
its own focus indicator. The solid outline both painted on `:focus-within`, on
top of that indicator and on pointer focus too, is retired; neither paints a
focus signature or a forced-colors outline of its own.

| family | before | after |
| --- | --- | --- |
| Tooltip (interactive bubble) | solid outline around the bubble whenever focus was inside, pointer included | nothing; the focused control shows its own indicator |
| HoverCard | solid outline around the card whenever focus was inside, pointer included | nothing; the focused control shows its own indicator |

The two outline colour hooks behind that frame, `--ds-tooltip-focus-color` and
`--ds-hover-card-focus-color`, are retired with it: see the major entry
`evi-02-overlay-focus-retired`. Neither is read any more, so an authored colour
paints nothing, and the bubble and the surface stamp no `data-state`.
