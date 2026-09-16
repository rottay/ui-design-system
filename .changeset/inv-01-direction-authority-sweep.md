---
"@rottay/design-system": minor
---

WO-INV-01: every remaining component that probed the DOM for the reading
direction now asks the i18n authority instead.

Twelve call sites across eleven families — `KanbanBoard`, `CalendarView`,
`WorkbenchHeader`, `PageShell`, `WorkspaceSwitcher`, `LocaleSwitcher`,
`NotificationCenter`, `Tree`, `Carousel` (two), `Slider` and
`PatternDataTable` (three) — each carried a private `element.closest('[dir]')`
probe, in three spellings of the same idiom. Every one is replaced by
`useOptionalDirection`. The probe was unavailable during SSR, so
server-rendered markup always assumed LTR; it forced a style recalculation at
the moment a drag or a panel was deciding its geometry; and it re-derived from
paint a fact the provider already holds, so the two could disagree between
first paint and the effect that writes `dir` onto the document. `KanbanBoard`
additionally loses a `useState` + `useEffect` pair that existed only to re-run
the probe after mount.

**Measured consequence, the same one the `Splitter` cut declared:** direction
signalled ONLY by a bare `dir` attribute, with no `I18nProvider` above, no
longer mirrors these families. Consumer census across the design system, the
showroom and app-bithire / app-evnto / app-platform: the only production code
rendering any of them under a `dir` attribute is three showroom probes
(`Carousel`, `Tree`, `Slider`), and all three wrap in
`ShowroomTenantProvider` → `DesignSystemProvider` → `I18nProvider` with the
locale, so they are unaffected. No application consumer does it at all.

Seven suites moved their RTL cases from a bare `dir` wrapper (or from
`document.documentElement.dir`) to `I18nProvider locale="ar"`. One of them,
`PatternKanbanBoard.touch-move`, would otherwise have gone **vacuously green**:
its assertion is that the move intent stays logical, which holds in LTR too, so
a bare wrapper would have left the case passing for the wrong reason.
