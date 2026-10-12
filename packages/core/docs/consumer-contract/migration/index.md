# Consumer migration packets

One packet per consuming application: the ordered work the consumer contract
([`../index.md`](../index.md)) implies for that app, with the commands the
design system ships and the acceptance that closes it.

A packet is a BRIEF, not an execution log. Each one is executed in its own
repository by its own owners; the design-system track never edits an app
repository (contract §7).

Cross-app guides, applying to every consumer at once:

- [`legacy-class-retirement/index.md`](./legacy-class-retirement/index.md) — WO-FAM-11
  (owner ruling 8): the `rottay-app-shell*` / `rottay-action-dock*` rename to
  `ds-*`; what changed, who is affected, the exact rename table, verification.
- [`db-first-paint-probe/index.md`](./db-first-paint-probe/index.md) — WO-ARC-21:
  the frozen dispatch record for the DB-to-first-paint probe in each
  application (route, tenant fixture, first-paint assertions, rollback, disable,
  telemetry). Awaits the owner's D-31 authorization; not dispatched.

- **X-07** (all three applications) — `scripts/ds-supplier-honesty.mjs` reads
  the installed package by filesystem path and breaks on 3.0; each packet
  carries the note with its own wiring lines.

| Packet | Status |
|---|---|
| [`app-bithire/`](./app-bithire/index.md) | active — the only APP track in flight (owner, 2026-09-05) |
| [`app-evnto/`](./app-evnto/index.md) | deferred |
| [`app-platform/`](./app-platform/index.md) | deferred |
