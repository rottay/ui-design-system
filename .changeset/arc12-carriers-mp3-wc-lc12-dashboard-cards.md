---
"@rottay/design-system": patch
---

`DataTerminalCard` and `StatsHeader` gain owner class doors on their Modern
caller parts (ARC-12 M-P3, Wave C lot LC12). The 74 elements that their skins
reach by a caller `data-part` now carry a class beside that part, named
`<owner block>__<part>`: 66 in `DataTerminalCard` (all four variants and the
stat tile) and 8 in `StatsHeader`. The stat tile root keeps its
`ds-data-terminal-stat` class and gains `ds-data-terminal-card__root`, the class
its owner skin already composes with. In the `stats-header` skin 54 selectors
that reach these elements by `[data-part]` now also reach them by class, as a
second selector next to the part one, at the same specificity. In the
`data-terminal-card` skin 288 selectors keep their place and line: each reached
part token reads `:is([data-part='<part>'], .ds-data-terminal-card__<part>)`,
at the same specificity. The `[data-part]` side stays. The band, trend, hover,
pressed, focus and right-to-left state rules that no current case reaches are
unchanged. Rendered markup changes only by the new class tokens, and every rule
matches the same elements at the same specificity as before. The four vertical
CSS bundles carry the same selectors. This prepares the Modern `Box` to stamp
its own part (a later strip).
