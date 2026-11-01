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
- [`workspace-frame-namespace/index.md`](./workspace-frame-namespace/index.md) — the
  `.ds-workspace-frame` ground/border/elevation names, now owned and declared by the
  frame itself; tenant `chrome.shell.*` unchanged and still compiled to the shell
  names alone; app-bithire's two `--list`/`--form` `--ds-workspace-shell-bg` reads move
  to `--ds-workspace-frame-bg` in its adoption lot, and its base frame read stays;
  `tenant-theme-compiler@5` refuses every `@4` artifact until the host recompiles it,
  and stored documents are not edited; app-platform adopts the release only with a
  `@rottay/tenancy` release that matches the DS on `tenant-theme-compiler@5` and both
  schema digests.
- [`p88-caller-anatomy/index.md`](./p88-caller-anatomy/index.md) — the next
  major (owner 2026-10-15): the P-88 caller `data-part`/`data-state` break and
  the legacy sync-SSR break, shipped under the owner's express overlap
  exception; per-family inventory against 2.19.37, consumer census, the
  `className` replacement. Legacy sync-SSR migration steps are in the guide
  below.
- [`legacy-sync-ssr/index.md`](./legacy-sync-ssr/index.md) — WO-CON-09 step 2:
  the 4.0 cold-lazy sync-SSR break, the async helper and controlled lint opt-in;
  delegable briefs for the seven app-bithire and two app-platform test files.
  Step 3's `guaranteed` flip awaits a real census-measured app consumer.
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
