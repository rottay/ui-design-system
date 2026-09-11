---
"@rottay/design-system": patch
---

WO-EVI-02. The `axis-difference` probe binds a negative control's witness to the
cell the control certifies: same vertical, same mode, same kit control.

`markVacuousControls` read the witness run-globally and across two catalog rows
at once, so states movement ANYWHERE would have credited all twelve
`states-emphasis-only` cells, and movement caused by `states.focus-style` would
have credited a control that isolates `states.emphasis`. A cell is now
evidential only when the `states` positive moved in ITS vertical and mode AND
the control's own pair — which differs in `states.emphasis` alone — moved on the
`states` axis there; either half absent leaves the published percentage standing
with its standing withdrawn and the missing half named. The measured verdicts of
the current tree are unchanged: palette-only 0 % on 36 of 36 evidential cells,
every `states-emphasis-only` cell NON-EVIDENTIAL because the states positive
reads 0 in each of them.

No published surface moves. The change is confined to
`packages/core/scripts/check/theme/axis-difference/`, which is an internal
measurement instrument and is not among the package's published `files`; the
bump exists because `contract-changeset` classifies everything under
`packages/core/` outside `docs/` as shipped bytes.
