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

WO-FAM-11 class retirement (owner ruling 8): **no impact measured** — zero
references to `rottay-app-shell*` / `rottay-action-dock*` in the app
(2026-10-02 sweep). See the [cross-app guide](../legacy-class-retirement/index.md).

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
- **X-07** — the supplier honesty check breaks on 3.0 (recorded 2026-10-03
  from the consumer census). 3.0 does not ship `supplier-contract.json` or `consumer/ds-supplier-honesty.mjs` at the package root (the contract is `contracts/runtime/suppliers/index.json`, the CLI is the built `dist/entrypoints/suppliers/cli/index.js`). `scripts/ds-supplier-honesty.mjs` reads the installed package by filesystem path, not through a specifier: `:1551` builds `node_modules/@rottay/design-system`, `:1566` resolves `supplier-contract.json` and `:1567` `consumer/ds-supplier-honesty.mjs` under it. First failure after the upgrade: `resolveInstalledContractMode` throws "has no canonical supplier contract/CLI" (`:1592-1601`). Second failure, once the paths are repointed: the content-equality checks (`:1662-1668`) compare the app's contract snapshot and its own CLI copy with the installed ones, and the 3.0 CLI is a built file, no longer byte-identical to the app's copy. Supported path: read the contract through the specifier `@rottay/design-system/supplier-contract` and run the check through the `rottay-ds-supplier-honesty` bin (the same file as `@rottay/design-system/supplier-honesty-cli`) instead of comparing a vendored copy. The consumer census lists these reads under `installedPathReads` as `breaksOnUpgrade`. The design system edits no application and claims no automatic upgrade. Wired at `package.json:60`
  (`test`), `:61` (`test:ds-suppliers`) and
  `.github/workflows/app-platform-full-program-build.yml:382`.
- app-platform is the WRITER of the tenant document v2 (contract §3), so its
  packet also carries the v1 → v2 row migration through the published,
  fail-closed `migrateDocumentV1ToV2`.
- app-platform is the sanctioned DB-driven-branding exception; nothing in its
  packet may copy app-bithire's static-first pattern verbatim.
