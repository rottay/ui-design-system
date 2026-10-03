---
"@rottay/design-system": major
---

WO-RET-01 retires four deprecated props from two published prop types, both
reachable from the package root.

`DividerProps.orientationMargin` and `DividerProps.margin` were forwarding
aliases of `textPosition` and `spacing`. All three engines read them only as a
fallback behind the canonical prop (`textPosition || orientationMargin`,
`spacing || margin`), and each alias had the same value type as its canonical
prop (`DividerTextPosition`, `DividerSpacing`), so renaming the prop at a call
site renders the same divider. The canonical props are unchanged in every
engine. A call site that stated both already rendered the canonical value;
delete the alias there. The frozen Classic and Rustic engines lose only the
alias destructure and the fallback term; their real-engine tests now state the
canonical props and keep the same assertions.

`CalendarProps.dateFullCellRender` and `CalendarProps.monthFullCellRender` were
accepted and ignored: Modern and Rustic never read them and Classic
destructured and discarded them. Nothing renders differently. Their documented
replacement `fullCellRender` is honoured only by the Classic engine today, so a
caller on Modern or Rustic gains no full-cell rendering by migrating; that
capability question, and the `dateCellRender` / `monthCellRender` markers, are
outside this change.

Census (2026-10-03, word and JSX search over the package source, the showroom
and the `src` roots of app-bithire, app-evnto and app-platform): zero callers of
any of the four props outside the Divider family's own tests. Spread props and
typed config objects were not exhaustively traced, so this remains a breaking
change for an unobserved consumer: passing a retired prop fails at compile time
on upgrade. No compatibility alias is left behind.

```contract-diff
signature .#DividerProps — members `orientationMargin?: DividerTextPosition` and `margin?: DividerSpacing` removed; deprecated forwarding aliases read by all three engines only as a fallback behind `textPosition` and `spacing`, identical value types, zero consumers across package, showroom and the three apps; migrate to `textPosition` and `spacing` (RET-01)
signature .#CalendarProps — members `dateFullCellRender?: (date: Date) => ReactNode` and `monthFullCellRender?: (date: Date) => ReactNode` removed; deprecated and never honoured by any engine (Classic discarded them, Modern and Rustic never read them), zero consumers, zero behavior change; `fullCellRender` is the documented replacement and is honoured by Classic only (RET-01)
```
