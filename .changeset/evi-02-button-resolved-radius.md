---
"@rottay/design-system": patch
---

Button publishes the radius it resolves.

Published component channel `--ds-button-resolved-radius` (replaces a private
variable); readable by a pseudo-element or wrapper of the button. The Modern
Button declares it on its own element, beside `--ds-button-resolved-height`: the
size step, the `round` / `circle` shape, or an explicit `radius`. The responsive
size projection writes the same name, and leaves it to the shape or the explicit
radius where one is set. A joined `Button.Group` child keeps its size step there,
which is the radius of its exterior corners.

Painted radii are unchanged for every size, shape and explicit radius, measured
in Chromium in the three first-party verticals; before, the private variable
disagreed with the painted corner under `round`, `circle` and every explicit
radius. The shift-matrix cell reads the published channel for its focus carrier;
the carrier radius is unchanged.
