---
"@rottay/design-system": patch
---

An actionable Card keeps a system-colour focus outline in forced colours, on
every card and under every focus style.

The Modern Card skin's forced-colours focus rule was outranked by the skin's
own normal focus rule, so it never applied. On most cards the browser's own
colour forcing hid that; three cases showed it:

| case | before | after |
| --- | --- | --- |
| consumer sets `forced-color-adjust: none` on the card | the tenant-coloured outline | `Highlight` |
| selected card with a colour tone | the 1px inset selection outline; focus changed nothing | `Highlight`, outside the card |
| `states.focus-style: glow` | 1px outline | 2px outline |

The rule now paints `outline: max(2px, var(--ds-focus-ring-width)) solid
Highlight` at `var(--ds-focus-ring-offset)`, and is the last and heaviest
outline the skin states for the card root. A selected card keeps its
`Highlight` border. Measured in Chromium with forced colours emulated: 30 of
72 readings change, all in the three cases above.

No change outside forced colours: 169 computed readings of keyboard, pointer
and pressed cards and of the DataTable mobile card are identical before and
after. No channel is added, removed or re-pointed.

NOT IN THIS RELEASE. The Card's normal-mode focus is still a solid outline
built from `--ds-card-focus-ring-width`, `-color` and `-offset`, identical
under ring, underline and glow, and the DataTable mobile card's interim focus
rules stay. The personality layer paints `box-shadow` on every card under
`[data-engine]` from a later cascade layer than the Card skin, so a signature
stated by the skin does not paint in an application.
