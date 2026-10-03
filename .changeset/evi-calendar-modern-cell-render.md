---
"@rottay/design-system": patch
---

`Calendar` on the Modern engine now honours `cellRender` and `fullCellRender`.

Both props have been part of `CalendarProps` as the documented replacement for
the deprecated `dateCellRender` / `monthCellRender`, but only the Classic
engine read them: Modern accepted them and rendered nothing. A caller that
followed the deprecation notice lost its cell content on the default engine.
No type changes; the two docblocks now state the per-engine scope.

Modern semantics, matching Classic:

- `cellRender(date, info)` is called for every day cell in month view
  (`info.type === 'date'`) and every month cell in year view
  (`info.type === 'month'`). Its result is appended after the default label,
  inside the existing `[data-part='cell-content']` part, so the Modern skin
  paints it exactly as it paints the legacy content. `info.today` is today's
  date and `info.originNode` is the default label.
- `fullCellRender(date, info)` replaces the cell's default content; the
  default label survives only if the caller renders `info.originNode`. No
  `cell-content` part is emitted.
- Precedence when several are passed: `fullCellRender`, then `cellRender`,
  then the legacy pair. A legacy renderer that loses is not called.
- Disabled cells are still rendered through the renderers, as before.

One declared difference from Classic: on Modern `fullCellRender` replaces the
children of the cell button, not the cell element. The `gridcell` role, the
roving tab stop, the selected / today / disabled state and the accessible name
stay engine-owned, so keyboard travel and selection are unchanged and the
returned node must not be interactive. A month cell normally takes its name
from its label; under `fullCellRender` it carries `aria-label` with the month
name, so replaced content cannot leave it unnamed. Day cells already carry
their date as `aria-label`.

Unchanged: `dateCellRender` and `monthCellRender` keep working on Modern when
the canonical props are absent, and stay deprecated. They are not retired: the
Rustic engine reads only that pair and does not read `cellRender` or
`fullCellRender`. Classic and Rustic are not touched.

```contract-diff
signature .#CalendarProps — no member added, removed or retyped; the docblocks of `cellRender` and `fullCellRender` now state engine support (Classic and Modern honour them, Rustic reads only the legacy pair), the precedence (`fullCellRender`, then `cellRender`, then `dateCellRender` / `monthCellRender`) and the Modern `fullCellRender` scope (replaces the cell button's children; role, tab stop, state and accessible name stay engine-owned)
```
