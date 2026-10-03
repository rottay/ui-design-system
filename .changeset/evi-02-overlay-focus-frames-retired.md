---
"@rottay/design-system": patch
---

Tooltip and HoverCard no longer frame themselves while a control inside them
holds focus.

The interactive Tooltip bubble and the HoverCard surface are never focus
targets: the keyboard lands on a control inside them, and that control wears
its own focus indicator. The solid outline both painted on `:focus-within`, on
top of that indicator and on pointer focus too, is retired; neither paints a
focus signature or a forced-colors outline of its own.

| family | before | after |
| --- | --- | --- |
| Tooltip (interactive bubble) | solid outline around the bubble whenever focus was inside, pointer included | nothing; the focused control shows its own indicator |
| HoverCard | solid outline around the card whenever focus was inside, pointer included | nothing; the focused control shows its own indicator |

Two tenant hooks change their default, and none is removed:

| hook | before | after |
| --- | --- | --- |
| `--ds-tooltip-focus-color` (an outline colour) | `var(--ds-focus-ring-color)` | `transparent` |
| `--ds-hover-card-focus-color` (an outline colour) | `var(--ds-focus-ring-color)` | `transparent` |

Consumer note: both hooks stay read. A tenant or application that authors
either colour still gets a solid outline in that colour around the bubble or
the card, now only while the keyboard holds a control inside it; a pointer
press no longer paints it, and forced colors discard it.

The Modern Tooltip bubble and HoverCard surface stamp `data-state` (`focused`,
`focus-visible`) for focus held inside them, which is what the kept outline
rule reads.
