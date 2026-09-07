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

## What will be in the packet when it is written

- **X-01** — visual-authority declaration: app-evnto sends a bare string today.
- **X-02** — stop mounting `<style>` by hand; adopt `mountTenantTheme` through
  the WO-CON-02 codemod.
- **X-04** — app-evnto only: retire its own pre-paint script and emit
  `data-engine` in SSR.
- `oauth-transition`: routes 3 and 4 of the table in
  [`app-bithire`](../app-bithire/index.md) §3 are app-evnto's
  (`src/app/oauth/redirect/page.tsx`, `src/app/(auth)/callback/page.tsx`). They
  import the ROOT specifier `@rottay/design-system`, so they break on the first
  upgrade past the removal and are protected only by the app's version pin.
  The same literal-copy step and the same `dbe18dea` visual reference apply.
