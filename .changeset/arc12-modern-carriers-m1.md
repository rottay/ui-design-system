---
"@rottay/design-system": patch
---

On the Modern engine, `Container`, `Space` and the Modern grid item no longer
forward a caller `data-state` to the element they render, and neither does the
notifier stack behind `Toast`, `Notification` and `Message`. Each one already
stamps its own part after the caller's attributes (`root`, `root`, `grid-cell`,
`stack`) and stamps no state of its own, so the caller value was the only state
on a painted root. This follows the `w25-p88-passthrough-law` ruling.

Nothing else changes. `id`, `aria-*`, every other `data-*` (including the
PresenceList seam `data-ds-presence`) and `className` still reach the root. The
caller `data-part` is still replaced by the component's own part, as before.
Without a caller `data-state` the rendered markup is byte-identical. No in-repo
caller passes one, and no skin keys on a state on these roots. Compose through
`className`. Classic and Rustic are unchanged, and the public `Grid.Item`
(compound) is out of this change.
