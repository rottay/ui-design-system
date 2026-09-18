---
"@rottay/design-system": patch
---

WO-FAM-10 cohorts D and E: the four shell headers (cockpit-header,
workbench-header, mobile-header, stats-header) and section-frame.

FIVE NEW CHROME DERIVERS, each owning its family's namespace at the resting
values its skins already read: `derivation/chrome/cockpit-header`
(`--ds-cockpit-header-` `{actions-backdrop, bg, icon-size, sticky-z}`),
`derivation/chrome/workbench-header` (`--ds-workbench-header-`
`{actions-backdrop, bg, icon-size}`), `derivation/chrome/mobile-header` (15
`--ds-mobile-header-*` channels: the 56px bar row, gutters, hairline, sticky
posture, optical title, back-trigger chrome and focus ring),
`derivation/chrome/stats-header` (34 `--ds-stats-header-*` channels: the pulse
card frame, editorial metric scale, change-pill rungs, sparkline and glow) and
`derivation/chrome/section-frame` (12 `--ds-section-frame-*` channels: the
framing rule, mono label rung and the two section inks). Channels that had no
producer become tenant-movable at the same pixel values; family-private
`--_ds-*` names move into the family namespace or stay per-instance by
measurement.

TWO REPAIRS FROM THE DRAFT CALIBRATION, both replacing a claim the emitted
artifact could not keep. (1) The shell-header ground channels were drafted as
`var(--ds-card-header-bg, <seeded gradient>)`, but the foundation ships
`--ds-card-header-bg: transparent` on `:root` in every vertical, so the
gradient was dead code and the palette arm over-claimed causality the shared
ground does not have. Both derivers now produce the ground as
`var(--ds-card-header-bg)` — the shared card-header ground verbatim — and both
Modern skins drop the dead fallback. An authored `--ds-card-header-bg` still
wins through the chain; painted palette causality for these families lives on
the identity tile's ink, which the causality probes now measure. (2)
`--ds-mobile-header-safe-area` is no longer produced: its only honest value is
an `env()` chain, and `env` is not in the emission door's admitted value
functions, so the door dropped the channel whole and the `produces` claim was
false (same disposition as `--ds-cockpit-header-sticky-top`). The skin keeps
stating the inset as its own `var(--ds-safe-area-top, env(...))` fallback, so
the pixels are unchanged.

RUNTIME/SKIN MIGRATION at the same resting paint: the mobile-header runtime
stamps no geometry (`position: sticky` moved into the skin, keyed on the
`data-sticky` stamp; the back trigger's hover/press/ring now ride the shared
kernel state via `data-state`); section-frame retires its per-element BEM
classes and keys the skin on `data-part` alone; the layout-header skin keys its
one resilience rule on the stamped anatomy and carries no deriver by
measurement (every visual it renders belongs to a component it composes). No
prop shape moved; every new channel is additive.
