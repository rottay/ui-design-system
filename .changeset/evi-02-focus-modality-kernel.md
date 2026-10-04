---
"@rottay/design-system": patch
---

The keyboard focus signature is no longer stamped on a focus that a pointer
caused, where the browser itself hides it.

`useInteractionState` stamped `data-state~="focus-visible"` on any focus that
arrived while no pointer was down on that same part. A focus moved by script, or
forwarded by a label, lands on a part nobody pressed, so a pointer user saw the
keyboard signature: pressing the label of a Toggle, Checkbox or Radio, opening a
Popover, Dropdown, Modal or Drawer with the mouse, or clicking anything that
then moves focus.

The hook now asks the platform. A focus is stamped `focus-visible` only when no
pointer is down on the part and the element the focus landed on matches
`:focus-visible`, which is the browser's own answer for script-moved and
label-forwarded focus, for assistive-technology activation and for shortcuts.

The stamp equals the native pseudo-class at the moment of every focus the
platform can be asked about, with three exceptions:

- A direct pointer press on a text field whose part carries the pointer
  handlers: the platform shows focus, the stamp is withheld, as before.
- A click followed by a key on the same control: Chromium turns the native
  pseudo-class on without a focus event, and the stamp stays off, as before.
- A focus the platform cannot be asked about counts as visible, as before: a
  runtime without the selector or without `getRootNode`, a focus event
  dispatched without focusing anything, and a focus whose target is not the
  active element of its document or shadow root.

Measured in Chromium, stamp before and after:

- Label press on Toggle, Checkbox and Radio: stamped on every press, now never.
- Pointer open of a Popover (first control), a Modal and a Drawer (close
  button), a Dropdown item focused by script after a pointer open, and script
  focus after a pointer press inside an iframe and inside a shadow root:
  stamped, now not stamped.
- Keyboard paths (Tab, arrows, Enter or Space open) and a direct pointer press
  on a part: unchanged. Text fields: unchanged, stamp and paint.

Measured in WebKit: a label press on Toggle, Checkbox or Radio does not focus
the control and was never stamped; a Dropdown item focused by script after a
pointer open was stamped and no longer is; Option+Tab and keyboard opens are
unchanged.

Behaviour per engine:

- Modern: every part built on the hook changes as described.
- Rustic: frozen, no file edited. Its eight parts built on the hook inherit the
  same correction.
- Classic: does not use the hook; unchanged.

Limits:

- A caller that invokes the kernel `onFocus` without a real focus on the event
  target keeps the previous stamp, pointer or not.
- A web component that holds focus inside its own shadow tree, under a React
  root outside it, is judged by its host element; not measured.

NOT IN THIS RELEASE

WebKit answers native `:focus-visible` true for a script focus that follows a
pointer open (Popover first control, Modal and Drawer close button, script focus
after a press inside an iframe and a shadow root; Dropdown items excepted). The
stamp follows that answer, so a pointer user still sees the keyboard signature
there, exactly as before this change. Receiver: kernel modality, WebKit, in
WO-EVI-02.

No API, anatomy, token or skin change, and no document listener.
