---
"@rottay/design-system": minor
---

`PresenceList` stamps its own presence seam, `data-ds-presence="open" | "closed"`,
on every keyed child. Families that keep their own `data-state` anatomy (P-88)
refuse the injected `data-state`, so exit CSS keyed on it never matched them; key
presence CSS on `[data-ds-presence]` instead. The `data-state` stamp stays as a
deprecated compatibility door for children that still forward it.

An exiting child now stays on its own DOM node and in its own slot. Before, it
was remounted at the end of the list, so its exit transition never ran (it was
dropped by the fallback window), focus was lost and the layout jumped.
