---
"@rottay/design-system": patch
---

The Input's control ground follows the mode instead of stating white.

`presentation/components/input/index.css` stated `--ds-input-bg:
var(--ds-color-white)` and `--ds-input-bg-focus: var(--ds-color-white)` — two
mode-blind literals — and they beat the theme's correct dark value. Not by
specificity: the base entrypoint orders `rottay-tokens` BEFORE
`rottay-components`, and a later cascade layer wins regardless of selector
weight, so a `:root` literal in the component layer outranked
`html[data-theme='dark']` in the token layer. The mode chain beneath it was
never broken — `--ds-color-bg-input` and `--ds-surface-control` both resolve
`#0F0F12` in rottay dark — it simply never ran. Bithire escaped only because
its compiled artifact is unlayered and re-aliased the name back.

Both declarations now state `var(--ds-color-bg-input,
var(--ds-surface-control))`, at the component base rather than in the artifact
emitter: the base is the only reachable declaration of the DS default for this
channel, and repairing it makes bithire's re-alias redundant rather than
load-bearing. A tenant statement still outranks it, unchanged.

Measured: rottay dark and evnto dark move `#ffffff` → `#0F0F12`, and bithire
dark's focus leg — which its artifact never re-aliased, so a focused field
grounded white while the resting field was `#0c0c0c` — moves `#ffffff` →
`#0c0c0c`. All three light scopes are byte-identical, because
`--ds-color-bg-input` already resolves `#ffffff` at every light root.
`--ds-input-bg-hover` and `--ds-input-bg-disabled` do not read the channel and
do not move.

The search field of `column-settings` in rottay dark goes 1.04:1 → 18.29:1.
Fourteen causality suites drop a pinned `rottay dark` contrast row by identity —
the twelve input-family primitives that read `--ds-input-bg` downstream, plus
`column-settings` and `filter-panel`. `Input` and `InputNumber` had pinned the
debt explicitly "until the input's ground derives with the mode"; it does now.
