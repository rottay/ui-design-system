---
"@rottay/design-system": patch
---

WO-FAM-01 / R107-RUN-01. A press now ends when it can no longer complete.
`useInteractionState` cleared `focused`, `focusVisible` and its pointer-origin
ref on blur but left `pressed` set, so a control focused with a Space keydown
and blurred before the keyup kept painting `data-state~="pressed"` while no
longer active — visible on Checkbox, Radio and Toggle, whose Space press is
routed through the pointer handlers. The same latch survived a control going
disabled mid-press: the mask hid it, and enabling the control again brought the
press back.

Cancellation is now one path in the behavior kernel — pointer leave, pointer
cancel, pointer up, blur, and the transition into `disabled` all end the press
and clear the pointer-origin ref. Every `useInteractionState` and
`useFieldAction` consumer inherits it; the modern Button, which compensated
locally by calling `onPointerUp` from its own blur handler, drops that
duplicate and chains its blur like every other handler.

No export, signature or subpath changed: `UseInteractionStateResult` still
carries the same six handlers, and no skin or token was touched.
