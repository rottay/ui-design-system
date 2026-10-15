---
"@rottay/design-system": major
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
caller passes one, and no skin keys on a state on these roots. Break against
the published 2.19.37: those roots spread the caller rest, so a caller
`data-state` rendered; it no longer does (no application call site measured
on 2026-10-15). Compose through
`className`. Classic and Rustic are unchanged, and the public `Grid.Item`
(compound) is out of this change.

Overlap exception (owner, 2026-10-15): these identified P-88 and sync-SSR
breaks ship directly in this major, with an exact inventory, a migration
guide, replacements and reviewed evidence, by the owner's express exception
to the one-minor overlap rule. The exception does not extend to any other
deprecation or retirement. Migration guide:
`packages/core/docs/consumer-contract/migration/p88-caller-anatomy/index.md`.
