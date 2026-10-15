---
"@rottay/design-system": major
---

ARC-12 step 3 (P-88): the Classic engine strips, which shipped without a
changeset (registered after the fact, 2026-10-15). Classic is frozen but
still published and reachable through `forceEngine` / the `engine` prop. The
engines below stop forwarding a caller `data-part` and `data-state`. `id`,
`aria-*`, every other `data-*` and `className` still reach the root. Compose
through `className`.

Break against the published 2.19.37, per family (measured in the installed
2.19.37 `dist` by the freeze-row9 adjudication and the DT table):

- `Button`, classic (S3-1, dcac564f2). The caller `data-state` rendered and
  no longer does. The `data-part` half changes nothing released: 2.19.37
  always stamped `trigger`.
- `Tag`, `Select`, `Textarea`, `Divider` and `Link`, classic (S3-2,
  21515f166). These stamped no part of their own, so both a caller
  `data-part` and a caller `data-state` rendered. Neither does now.
- `Card`, classic (S3-3, fd3a79e70). It stamped `root`. The caller
  `data-state` rendered and no longer does.
- Typography (`Heading`, `Text`, `Paragraph`, `Link`), classic (S3-4,
  ab88fc5c8). It stamped `root`. The caller `data-state` rendered and no
  longer does, and the engine now stamps `root` unconditionally.

Consumer census of 2026-10-15: no application renders through Classic
(app-bithire forces modern; app-evnto and app-platform pass neither attribute
to these components).

Overlap exception (owner, 2026-10-15): these identified P-88 and sync-SSR
breaks ship directly in this major, with an exact inventory, a migration
guide, replacements and reviewed evidence, by the owner's express exception
to the one-minor overlap rule. The exception does not extend to any other
deprecation or retirement. Migration guide:
`packages/core/docs/consumer-contract/migration/p88-caller-anatomy/index.md`.
