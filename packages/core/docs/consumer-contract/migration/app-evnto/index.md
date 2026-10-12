# Migration packet — `app-evnto` (DEFERRED)

Status: **deferred by owner decision, 2026-09-05.** No packet is written, and
none should be started, until the owner puts `app-evnto` back in scope.

Why this file exists at all: the deferral is a decision, not an oversight, and a
missing file reads like the second one. Contract §7 names the scope — "the only
APP track in flight is app-bithire; app-platform, the commercial programme and
app-evnto are outside the programme and their migration packets are deferred".

## What is already measured, so nobody measures it twice

Out-of-scope observation from the consumer contract §1.7 (not normative, read by
no rule):

| Subpath | app-evnto specifiers |
|---|---|
| `@rottay/design-system` | 383 |
| `./icons` | 99 |
| `./server` | 4 |
| `./eslint` | 1 |
| `./styles/evnto` | 1 |

### WO-FAM-11 class retirement — measured impact (2026-10-02)

The deferred packet carries this register; nothing here executes until the
owner returns app-evnto to scope. The design-system major
`.changeset/fam-11-legacy-class-retirement.md` retires the
`rottay-app-shell*` / `rottay-action-dock*` vocabulary, and app-evnto
selects the old spelling in exactly one file —
`src/vertical/surface/shell/__tests__/phone-navigation.test.tsx` (7 lines):
`:213, :264, :308` query `.rottay-app-shell[data-part="root"]`,
`:222` asserts `toHaveClass('rottay-app-shell__navigation-trigger')`,
`:223` reads `dsDeclarations('.rottay-app-shell__navigation-trigger')`,
`:281`/`:282` assert `toHaveClass('rottay-app-shell__main')` and read
`dsDeclarations('.rottay-app-shell__main')`. At the bump past the major the
queries null-deref and the assertions fail; the migration is the class-for-
class rename to `ds-app-shell*` (the file moved to
`src/vertical/surface/shell/__tests__/` in R098 — any roster pointing at the
old path is stale). The two `dsDeclarations` reads should be re-checked
against what they meant, since the skin never selected the trigger by class.
Full table and verification:
[cross-app guide](../legacy-class-retirement/index.md).

### WO-ARC-21 DB-to-first-paint probe — frozen definition (2026-10-12)

Nothing here executes until the owner authorizes it under D-31. The probe's
route, tenant fixture, assertions and execution control for app-evnto are
recorded in the [cross-app record](../db-first-paint-probe/index.md) §3.

## What will be in the packet when it is written

- **X-01** — visual-authority declaration: app-evnto sends a bare string today.
- **X-02** — stop mounting `<style>` by hand; adopt `mountTenantTheme` through
  the WO-CON-02 codemod.
- **X-04** — app-evnto only: retire its own pre-paint script and emit
  `data-engine` in SSR.
- **X-07** — the supplier honesty check breaks on 3.0 (recorded 2026-10-03
  from the consumer census). 3.0 does not ship `supplier-contract.json` or `consumer/ds-supplier-honesty.mjs` at the package root (the contract is `contracts/runtime/suppliers/index.json`, the CLI is the built `dist/entrypoints/suppliers/cli/index.js`). `scripts/ds-supplier-honesty.mjs` reads the installed package by filesystem path, not through a specifier: `:1551` builds `node_modules/@rottay/design-system`, `:1566` resolves `supplier-contract.json` and `:1567` `consumer/ds-supplier-honesty.mjs` under it. First failure after the upgrade: `resolveInstalledContractMode` throws "has no canonical supplier contract/CLI" (`:1592-1601`). Second failure, once the paths are repointed: the content-equality checks (`:1662-1668`) compare the app's contract snapshot and its own CLI copy with the installed ones, and the 3.0 CLI is a built file, no longer byte-identical to the app's copy. Supported path: read the contract through the specifier `@rottay/design-system/supplier-contract` and run the check through the `rottay-ds-supplier-honesty` bin (the same file as `@rottay/design-system/supplier-honesty-cli`) instead of comparing a vendored copy. The consumer census lists these reads under `installedPathReads` as `breaksOnUpgrade`. The design system edits no application and claims no automatic upgrade. Wired at `package.json:23`
  (`test`) and `:24` (`test:ds-suppliers`).
- `oauth-transition`: routes 3 and 4 of the table in
  [`app-bithire`](../app-bithire/index.md) §3 are app-evnto's
  (`src/app/oauth/redirect/page.tsx`, `src/app/(auth)/callback/page.tsx`). They
  import the ROOT specifier `@rottay/design-system`, so they break on the first
  upgrade past the removal and are protected only by the app's version pin.
  The same literal-copy step and the same `dbe18dea` visual reference apply.
