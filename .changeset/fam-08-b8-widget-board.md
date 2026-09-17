---
"@rottay/design-system": patch
---

WO-FAM-08 B8: the widget-board family cut. The hand-made board skeleton gives
way to the shared anatomy renderer over the board's own anatomy, the solver's
grid lines and committed height stop travelling as inline paint and become
runtime `--ds-widget-board-cell-*` channels gated on the solver's own
`data-placed` flag, hover/press/focus state is decided once by the anatomy
kernel on five parts, the shared and Modern skins now select the anatomy the
board stamps rather than its structural classes, and the four resize-rail
corners move from `border-width: 2px 0 0 2px` to the logical border widths so
they mirror under RTL. A new `derivation/chrome/widget-board` produces the three
catalog channels the skin read without a producer. Geometry-by-channel
(WO-FAM-12) and the cross-container DnD kernel (WO-FAM-13) are out of scope:
board geometry and drag behaviour are unchanged. No prop type and no prop
default changed.
