---
"@rottay/design-system": patch
---

The eight `DashboardInsights` activity and metrics panel roots gain their owner
class door (ARC-12 M-P3, Wave C follow-up lot FU-F11R of the Box and Flex
cohort). Each root `Box` now carries `<owner block>__root` beside its
`data-part="root"` (`ds-activity-cards__root`, `ds-activity-compact__root`,
`ds-activity-ticker__root`, `ds-activity-timeline__root`,
`ds-metrics-cards__root`, `ds-metrics-chart__root`, `ds-metrics-minimal__root`,
`ds-metrics-rows__root`). In the eight panel skins 28 selectors now also reach
their elements by class, as a second selector next to the part one, at the same
specificity: the 27 rules that reach a panel root by `[data-part='root']` and
the `metrics-rows` hover rule that reveals the row shimmer. The `[data-part]`
side stays. Rendered markup changes only by the new class tokens, and every rule
matches the same elements at the same specificity as before. The four vertical
CSS bundles carry the same selectors. The source checks that read these roots
and the shimmer rule now accept the root class door and the class-paired rule,
and still refuse any other shape. This prepares the Modern `Box` to stamp its
own part (a later strip).
