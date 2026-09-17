---
"@rottay/design-system": patch
---

WO-FAM-08 B6: the calendar-view, file-manager, table-toolbar, status-filter-pills
and active-filters-bar family cuts.

PUBLIC CSS HOOK RENAMED. The per-event accent a consumer stamps through
`CalendarEvent.color` moves from `--ds-calendar-event-accent` to
`--ds-calendar-view-event-accent`, the calendar-view family's own namespace. The
old spelling sat inside the `calendar` PRIMITIVE's prefix and no deriver, theme
or declaration ever wrote it, so it resolved to its inline fallback forever. It
is published in `contracts/css/hooks/index.json`, so the manifest is regenerated
with `hooks:generate` in this lot. A tenant stylesheet or app override that sets
`--ds-calendar-event-accent` by hand must be renamed; the resting fallback is
byte-identical (`var(--ds-color-primary)`), and the engine now stamps the channel
only when the event states a colour, so an uncoloured event leaves it to the
theme instead of shadowing it inline on every render.

THREE NEW DERIVERS, each owning its family's namespace at the resting values its
skin already read: `derivation/chrome/calendar-view` (`--ds-calendar-view-`
`{cell-min-height, cell-min-height-compact, event-accent, touch-target}`),
`derivation/chrome/file-manager` (`--ds-file-manager-`
`{content-min-height, link-color, link-hover-color, touch-target}`) and
`derivation/chrome/active-filters-bar` (`--ds-active-filters-bar-`
`{background, border, chips-basis, count-block-size, count-color,`
`embedded-padding-block, motion-duration, padding-block, padding-inline}`).
Channels that had no producer become tenant-movable; the global
read-without-producer debt follows the tree down 558 -> 550.

FOCUS RING CHANGES ON TWO file-manager PARTS. The folder link and the grid card
read `var(--ds-focus-ring, var(--ds-shadow-focus-ring))` instead of the static
token alone, joining the one focus decision every other cut family uses.
`--ds-focus-ring` always resolves, so the painted ring moves from
`0 0 0 3px` primary-at-24% to the W8 double ring. No prop or type changed.
