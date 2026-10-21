---
"@rottay/design-system": patch
---

`TableToolbar`, `ScopeSwitcher`, `ViewModeSwitcher`, `ActionDock` and
`StatusFilterPills` gain owner class doors on their Modern caller parts (ARC-12
M-P3, Wave C lot LC14). The 13 elements that their skins reach by a caller
`data-part` now carry a class beside that part, named `<owner block>__<part>`.
Five classes are new (`ds-table-toolbar__root`, `ds-table-toolbar__controls`,
`ds-scope-switcher__root`, `ds-view-mode-switcher__root`,
`ds-action-dock__root`); the other eight elements already carried their class.
`ViewModeSwitcher` keeps the caller `className` and `ActionDock` adds its root
class on every placement and mode. In the `table-toolbar`, `scope-switcher`,
`view-mode-switcher`, `action-dock` and `status-filter-pills` skins 47
selectors that reach these elements by `[data-part]` now also reach them by
class, as a second selector next to the part one, at the same specificity. The
`[data-part]` side stays. The fixed bottom `ActionDock` rules (with and without
`data-keyboard-open`) and the first-child table-toolbar divider rule are
unchanged. Rendered markup changes only by the new class tokens, and every rule
matches the same elements at the same specificity as before. The four vertical
CSS bundles carry the same selectors. This prepares the Modern `Box` to stamp
its own part (a later strip).
