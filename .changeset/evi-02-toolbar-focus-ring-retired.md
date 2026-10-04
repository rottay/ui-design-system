---
"@rottay/design-system": major
---

`--ds-toolbar-focus-ring` is retired.

The channel painted a focus signature on the ListToolbar shell whenever focus
was inside it. The Modern skin no longer reads it (one indicator per stop: the
focused control's), so the toolbar deriver no longer produces it and the name
leaves the published hook contract. A stylesheet or tenant statement that
still sets it has no effect. There is no replacement: the control's ring is
`--ds-toolbar-control-focus-ring` and the shell's edge under focus is
`--ds-toolbar-focus-border`. No typed tenant field maps to it
(`BrandToolbarChrome` has none). Census: zero readers and zero authors in the
package, the showroom, app-bithire, app-evnto and app-platform sources.
