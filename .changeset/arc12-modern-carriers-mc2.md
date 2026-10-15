---
"@rottay/design-system": major
---

On the Modern engine, `Grid` now stamps its own `data-part="root"` after the
caller's attributes, so a caller `data-part` no longer replaces it, and it no
longer forwards a caller `data-state`. The public `Grid.Item` (the compound
behind `Grid.Item` / `GridItem`) does the same with `data-part="grid-cell"`.
The compound is engine-agnostic, so this `Grid.Item` change also applies on
Classic and Rustic. The Classic and Rustic `Grid` roots are unchanged. This
follows the `w25-p88-passthrough-law` ruling.

`id`, `aria-*`, every other `data-*` and `className` still reach the element.
Compose through `className`. The surface-owned class hooks of
`arc12-modern-carriers-mc1` (`ds-<owner>__root`, `ds-metrics-cards__cards-grid`) are what
the gallery-view, grid-view, stats-grid, metrics-cards, form, wizard and
detail-form skins now key on, and they are unchanged. In-repo callers that
still pass a non-root part on a Grid (`results`, the dashboard, visualization
and media skeleton grids) now render `root`, and the visualization aside
`Grid.Item` renders `grid-cell`. That aside now receives the Grid cell floor
(`min-inline-size: 0`, `min-block-size: 0`) that every other cell already had.
Without a caller `data-part` or `data-state` the attribute set is unchanged.
Only the attribute order moves. Break against the published 2.19.37: the
Modern `Grid` stamped no part and spread the caller rest, so both a caller
`data-part` and a caller `data-state` rendered; neither does now (no
application call site measured on 2026-10-15).

Overlap exception (owner, 2026-10-15): these identified P-88 and sync-SSR
breaks ship directly in this major, with an exact inventory, a migration
guide, replacements and reviewed evidence, by the owner's express exception
to the one-minor overlap rule. The exception does not extend to any other
deprecation or retirement. Migration guide:
`packages/core/docs/consumer-contract/migration/p88-caller-anatomy/index.md`.
