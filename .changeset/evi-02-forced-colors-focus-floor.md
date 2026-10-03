---
"@rottay/design-system": patch
---

The forced-colors focus outline of NotificationCenter's panel and of
DecisionComparison's root is never thinner than 2px.

Both arms painted `outline: var(--ds-focus-ring-width) solid Highlight`, so a
tenant whose `states.focus-style` is `glow` (ring width 1px) got a 1px system
outline. They now paint `outline: max(2px, var(--ds-focus-ring-width)) solid
Highlight`, the floor the rest of the fleet uses.

Measured in Chromium with forced colors emulated, after keyboard focus, in the
document scope and in a nested `[data-ds-root]`:

| family | node | `ring` | `underline` | `glow` before | `glow` after |
| --- | --- | --- | --- | --- | --- |
| notification-center | panel (focus hand-off target) | 2px, unchanged | 2px, unchanged | 1px | 2px |
| decision-comparison | root, while the scrollport holds focus | 2px, unchanged | 2px, unchanged | 1px | 2px |

The offset is unchanged (`var(--ds-focus-ring-width)`, outward): neither host is
clipped by an ancestor. Outside forced colors nothing changes: the computed
outline, shadow and overlay of both nodes are identical before and after under
all three focus styles. No channel is added, removed or re-pointed.
