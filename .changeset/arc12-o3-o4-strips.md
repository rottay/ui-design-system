---
"@rottay/design-system": major
---

ARC-12 O-3 and O-4 batch 1b (P-88): strips that shipped without a changeset
(registered after the fact, 2026-10-15). O-4 batches 1 and 2 are declared in
`arc-12-caller-anatomy-contract-diff-reconciliation`. Each element below
stops forwarding the caller anatomy named for it. `id`, `aria-*`, every other
`data-*` and `className` still reach it. Compose through `className`.

Break against the published 2.19.37, per family:

- `Card`, modern and rustic (O-3, 6d9fa082e): the caller `data-state` at
  rest. Measured on rustic: it rendered. Modern not individually measured.
- `Card.Body`, `Card.Footer`, `Card.Header` and `Card.Image` (O-3 part 2,
  a3575a9cd): the caller `data-part` and `data-state`. These compounds are
  engine-agnostic, so the change applies on every engine. Not individually
  measured.
- `Skeleton`, modern (O-3, bbe048558): the caller `data-part`. Measured: it
  won (`?? "root"`). Now `root` is always stamped.
- `AspectRatio`, `Empty`, `QRCode`, `Timeline` and `Segmented`, modern (O-4
  batch 1b, bbe4c2861): the caller `data-part` and `data-state`. Measured:
  each let the caller `data-part` win (`?? "root"`). `VoiceInputButton`, in
  the same lot, was not individually measured.

Consumer census of 2026-10-15: no application call site passes either
attribute to these components.

Overlap exception (owner, 2026-10-15): these identified P-88 and sync-SSR
breaks ship directly in this major, with an exact inventory, a migration
guide, replacements and reviewed evidence, by the owner's express exception
to the one-minor overlap rule. The exception does not extend to any other
deprecation or retirement. Migration guide:
`packages/core/docs/consumer-contract/migration/p88-caller-anatomy/index.md`.
