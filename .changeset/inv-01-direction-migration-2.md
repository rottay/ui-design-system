---
"@rottay/design-system": patch
---

WO-INV-01 migration 2: the fifteen ordinary DOM direction probes are gone, and
the three families that were untestable now have the coverage that was the
point of migrating them.

Seven owners move to `useReadingDirectionIsRtl()`: `ContextMenu` (three inline
sites), `ActionDock` and `TableToolbar` (their `elementDirection` helpers
deleted), `DetailPanel`, `FileManager`, `EnvironmentToggle`, and the
`CollectionWorkspaceSurface` preview rail. Two components lose state that
existed only to hold a probe result — `ContextMenu` captured direction at open
time because the probe needed a source element to measure, so a menu left open
across a locale switch kept the direction it opened with; it realigns now.

**The three Group C families had no RTL keyboard test at all**, and could not
have had one: they resolved direction with `getComputedStyle(...).direction`
and nothing else, which jsdom never answers, because a `dir` attribute does not
cascade into computed style there. Each now carries its RTL case plus an LTR
counterfactual — the tablist arrows in `DetailPanel`, the grid-card arrows in
`FileManager`, the APG radiogroup arrows in `EnvironmentToggle`.

`CollectionWorkspaceSurface` is the one that needed checking rather than
swapping: it read `getComputedStyle(document.documentElement).direction`, and
the provider CLAIMS `documentElement`'s `dir` from the locale in its default
scope, so the authority returns the same value minus the layout read. In
`directionScope="element"` the provider deliberately leaves `<html>` alone, and
there the authority is the only correct answer — a locale island must not take
its direction from the shell it is embedded in.

Also fixed: `Tabs.modern-anatomy`'s RTL arrow case, which asserted nothing.
With `billing` disabled and `audit` loading the enabled set was two tabs, so
`ArrowLeft` and `ArrowRight` from the first both landed on the same element and
the case passed under either locale. A third enabled tab makes the mirror
discriminate, and an LTR counterfactual now sits beside it.

`structures/workspace/active-filters-bar` is deliberately untouched — WO-FAM-08
is stamping parts in that exact file — so the direction-authority baseline keeps
its two probes pinned, and the gate reads 2 probes in 1 file.
