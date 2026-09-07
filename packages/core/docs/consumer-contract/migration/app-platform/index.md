# Migration packet — `app-platform` (DEFERRED)

Status: **deferred by owner decision, 2026-09-05.** `app-platform` and the
commercial programme are outside this programme; D-13 keeps the commercial
surfaces paused. No packet is written until the owner puts it back in scope.

Why this file exists at all: the deferral is a decision, not an oversight.

## What is already measured, so nobody measures it twice

Out-of-scope observation from the consumer contract §1.7 (not normative, read by
no rule):

| Subpath | app-platform specifiers |
|---|---|
| `@rottay/design-system` | 453 |
| `./icons` | 171 |
| `./server` | 12 |
| `./commercial` | 53 |
| `./commercial.css` | 3 |
| `./dist/platform.css` | 1 |
| `./motion` | 1 |
| `./surfaces` (not published) | 1 |

`./commercial` and `./commercial.css` are `forbidden` with **no design-system
action** (contract §1.5): the package does not export them, `app-platform`
reaches them through a webpack alias in `next.config.ts`, and the two artifacts
do not exist in `dist/`. app-platform resolves that on its own side when it
enters scope.

## What will be in the packet when it is written

- **X-01** — visual-authority declaration: app-platform sends none today.
- **X-02** — stop mounting `<style>` by hand; emit `data-ds-root` /
  `data-vertical` (no artifact matches today).
- **X-03** — retire `buildPreviewVariables` (a second compiler) and
  `branding-bounds` (a third validator); stop passing `vertical="platform"`,
  which is not in the first-party roster.
- **X-06** — delete the `[data-engine='classic']` patches in `globals.css`.
- app-platform is the WRITER of the tenant document v2 (contract §3), so its
  packet also carries the v1 → v2 row migration through the published,
  fail-closed `migrateDocumentV1ToV2`.
- app-platform is the sanctioned DB-driven-branding exception; nothing in its
  packet may copy app-bithire's static-first pattern verbatim.
