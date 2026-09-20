---
"@rottay/design-system": patch
---

The Card's ground follows the mode instead of stating white.

`presentation/components/card/index.css` stated `--ds-card-bg:
var(--ds-color-white)` — mode-blind, in the `rottay-components` layer — while
the theme states the correct `--ds-card-bg: var(--ds-color-bg-elevated)` in
`rottay-tokens`. A later cascade layer wins over an earlier one regardless of
selector weight, so the literal outranked the theme's own value and the theme's
declaration was dead. Bithire escaped only because its compiled artifact is
unlayered and re-aliased the name. This is the same defect class, at the same
owner tier, as the Input ground.

The base now states `var(--ds-color-bg-elevated)` — the theme's own statement,
restored verbatim into the layer that is actually reachable.

**The Modern Card itself painted white in rottay dark and evnto dark**, under a
near-white ink: the body copy measured **1.48:1** in both, and is **10.72:1**
now. Nine channels move and all nine move only in those two scopes —
`--ds-card-bg`, the `default`/`bordered`/`elevated` variant grounds, and the
derived `--ds-breadcrumb-current-bg`, `--ds-breadcrumb-bg`, `--ds-menu-bg`,
`--ds-menu-panel-bg` and `--ds-pagination-item-bg-hover`. `--ds-card-flat-bg`
reads `--ds-surface-panel` first and does not move; `--ds-card-cover-content-color`
is a deliberately mode-blind ink on an image scrim and does not move.

Every other scope is unchanged by channel value and by pixel: bithire dark,
bithire light, rottay light and evnto light render **byte-identical** captures.
An axe sweep over every `--ds-card-bg`-reading family (Card, Breadcrumb, Menu,
Pagination, Segmented, Stepper, Collapse) goes 4 failing nodes to 0 in rottay
dark and evnto dark, with an identical node set in the other four scopes and
**no new failing pairing anywhere**.

Nine pinned `rottay dark` nodes drop by identity across four causality suites:
`Breadcrumb` (1), `Pagination` (3), `Menu` (3) and `PatternFileManager` (2).
