---
"@rottay/design-system": patch
---

The table primitive's interactive parts now stamp the kernel interaction state
(`data-state`) their Modern skin already paints: sortable header cells, the
resize handle, inline/edit fields, selection controls, hoverable rows, editable
cells, the expand button and pagination buttons. The stamp is additive DOM:
at rest nothing changes, except natively disabled controls (the disabled row
checkbox and a disabled pagination button) which now carry
`data-state="disabled"` — the inert twin of the `:disabled` state the platform
was already reporting, with identical computed style. Consumers snapshotting
table DOM will see the new attributes. No public signature moved.
