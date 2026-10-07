---
"@rottay/design-system": patch
---

`Tabs` on the Modern engine emits `aria-controls` only on the selected tab, and
only while its panel is rendered. Modern only; Classic and Rustic frozen.

This changes published ARIA output. Every tab used to carry
`aria-controls="tabs-panel-…"`, but the engine renders a single panel, for the
active item, and only when that item has `children`. Every inactive tab
therefore pointed at an id that was not in the document, and a strip whose
items carry no `children` dangled on every tab. A reference that resolves to
nothing is a defect; an omitted optional reference is not (ARIA 1.2 does not
require `aria-controls` on `role="tab"`).

After this release:

- The selected tab carries `aria-controls` equal to the rendered panel's `id`,
  and the panel's `aria-labelledby` still names that tab.
- Inactive tabs carry no `aria-controls`. With `activationMode="manual"`, a
  focused but unselected tab carries none either.
- When the selected item has no `children`, no `role="tabpanel"` is rendered
  and no tab carries `aria-controls`. A fully panel-less strip is lawful.
- One predicate decides both the panel and the reference, so they cannot drift.

Unchanged: inactive panels are still not mounted; `children: null` still
renders an empty panel, which the selected tab references; tab ids, the panel
id grammar, `aria-selected`, the roving tab stop and the panel's `tabIndex`.

Rustic carries the same defect and is frozen: it is a known residual, not
repaired here. Classic passes no `id` to antd, so rc-tabs emits no
`aria-controls` there.

```contract-diff
signature .#TabItem — no member added, removed or retyped; the `children` docblock now states the panel-less case (omit it when selecting the tab changes content Tabs does not own: no tab panel is rendered and the selected tab carries no `aria-controls`) and that inactive tabs' content is not mounted (WO-EVI-02 packet T, G2)
```
