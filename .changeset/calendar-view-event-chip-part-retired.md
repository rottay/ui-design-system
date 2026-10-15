---
"@rottay/design-system": major
---

`CalendarView`, Modern engine: the read-only event chip no longer stamps
`data-part="event"` (298eeb0ff, owner answer 26 option c, 2026-10-14;
registered after the fact on 2026-10-15). The chip is named by its class hook.
It keeps the kernel's `data-state` (hovered, pressed, focused, focus-visible),
stamped once, after the caller attributes and handlers. The day cell keeps
`data-part="day-cell"`. Rustic and Classic are unchanged.

Break against the published 2.19.37: the Modern chip rendered
`data-part="event"` (`dist/ui/patterns/visualization/calendar-view/engines/modern/index.js:280`).
That is a DS-owned part, not a caller value. A selector or a test that keys on
`[data-part="event"]` inside a Modern `CalendarView` stops matching.
Replacement: the chip's class hook. Consumer census of 2026-10-15: no
application selects or passes the `event` part. app-evnto renders
`CalendarView` on two screens, but neither keys on it. app-bithire and
app-platform have no match.

Overlap: this is the retirement of a DS-owned published part. It is neither a
P-88 caller-anatomy break nor the sync-SSR break, so the owner's express
overlap exception of 2026-10-15 does NOT cover it. Whether it ships in this
major without a prior minor of overlap needs an explicit owner call. The
alternative is to restore the stamp until after a minor.
