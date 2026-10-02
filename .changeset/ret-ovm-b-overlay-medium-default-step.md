---
"@rottay/design-system": minor
---

WO-EVI-02, owner ruling 3, the wiring branch (RET-OVM-b). `--ds-overlay-medium`
does not retire: a live tenant row authors it. It becomes the default step of the
internal `Overlay` backdrop instead. `intensity` gains `'medium'` and now
defaults to it. The overlay skin
(`presentation/components/skin/overlay-modal-compounds`) paints that step with
`var(--ds-overlay-medium, var(--ds-overlay-bg, var(--ds-modal-overlay-bg, rgba(0, 0, 0, 0.5))))`.
The fallback is byte-identical to the old inline default, and no first-party
vertical artifact emits the channel. So when no tenant authors it, the default
backdrop computes exactly what it did before. An explicit `backgroundColor` and
`style` still win, as inline values.

What changes for a caller: the default backdrop colour now comes from the
package stylesheet instead of an inline style, the same way the light/heavy
steps already do. `Overlay` is not on the published surface, so this is not a
contract change.

Tenant consequence: The Management Miami's stored row authors
`--ds-overlay-medium: rgba(32, 48, 40, 0.05)`. That value now paints any default
`Overlay` backdrop rendered under their scope. This is the tenant's own authored
value, which had no reader until now. Reach today: no package component mounts
`Overlay`. Modal, Sheet, AlertDialog and ConfirmDialog paint their own scrims
through their component channels, so none of those scrims changes.

Migration: nothing is required. To keep the canonical ~0.5 scrim on a default
`Overlay`, a tenant removes the `--ds-overlay-medium` token override. A consumer
passes `backgroundColor` to pin the veil regardless of the tenant.
