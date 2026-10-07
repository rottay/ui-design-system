---
"@rottay/design-system": patch
---

WO-RET-04 W-2: the injective change-key helper moves, unchanged, from
`infrastructure/runtime/foundation/change-key` to `kernel/change-key`, the
first owner of the `kernel/` root. Internal only: it is not published, no
public subpath, export or signature moves. The spatial experience's mode-event
guard now folds its four fields with `changeKey` instead of `join('|')` — the
same injective encoding, behaviour unchanged (F-116's adoption clause).
