---
"@rottay/design-system": patch
---

WO-ARC-22 L2: the DataTable inline boolean cell editor now mounts the
canonical Checkbox primitive (chrome-less branch) instead of a raw native
input — the editor gains the primitive's focus ring and error semantics
(autoFocus, error→aria-invalid); keyboard handling is unchanged (the
editor-shell keeps it). The `editor-checkbox` data-part leaves the
DataTable scope (the primitive keeps its own Checkbox parts). No public
prop or entrypoint changes.
