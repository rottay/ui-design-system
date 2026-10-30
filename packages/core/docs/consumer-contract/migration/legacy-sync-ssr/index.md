# Guide — legacy sync SSR in the 4.0 major line

Status: delegable consumer guidance for WO-CON-09 step 2. Execution belongs to
each application's maintainers, in its own repository and roadmap. The design
system edits no application. This guide does not record app adoption or close
WO-CON-09.

Authority: the [consumer contract §1.2](../../index.md#12-tabla-ejecutable-los-38-subpaths-publicados),
[WO-CON-09](../../../../../../roadmap/consumer-contract.md#wo-con-09-40-adoption-consumers-migrate-legacy-sync-ssr-to-renderresolvedstaticmarkup)
and [owner decision 6](../../../../../../roadmap/owner-decisions-2026-10-15.md#6--legacy-sync-ssr-is-a-documented-major-break).
The change ships in the major through `suspense-phase-b-w1`.

## 1. What breaks and what replaces it

Engine components load their implementations through `React.lazy`. In the
4.0 line, synchronous `renderToString` / `renderToStaticMarkup` over a cold
lazy engine family raises React's own error ("suspended while responding to
synchronous input") instead of silently rendering the empty fallback. A test
that happens to pass after another test warmed the family does not prove the
cold path works.

For static HTML assertions whose tree reaches a cold engine family, use the
public async helper:

```tsx
import type { ReactNode } from 'react';
import { renderResolvedStaticMarkup } from '@rottay/design-system/server/static-markup';

export async function renderFixture(node: ReactNode): Promise<string> {
  return await renderResolvedStaticMarkup(node);
}
```

The helper requires React >= 19 and a compatible `react-dom` >= 19 providing
`react-dom/static`. On React 18 the module fails to load: `react-dom` 18 does
not export `react-dom/static`, so Node reports `ERR_PACKAGE_PATH_NOT_EXPORTED`
before the function can run. Verify the versions actually resolved in the
app's test realm before migrating.

The helper renders the same node in two passes:

1. React's public `prerender` waits for the reachable code-split payloads to
   resolve; each `React.lazy` object caches its resolved module.
2. `renderToStaticMarkup` renders the same node synchronously and returns the
   static HTML, with no Suspense markers.

This is a server/test-realm-only entrypoint. Keep its import out of browser
code and client import graphs. Import it from
`@rottay/design-system/server/static-markup`; the separate `./server` door
keeps its React-free contract.

This is not general data-Suspense rendering. A promise that is not cached
between renders can suspend again in the second pass and throw. Resolve the
fixture's data through the app's existing setup before rendering. The helper
returns static HTML, not a stream or hydration output: use it for static
assertions, not as a replacement for a framework's streaming or hydration
renderer. Assertions that depend on `renderToString` hydration semantics need
an app-owned decision rather than a mechanical replacement.

## 2. Adopt the controlled door and await the result

Take a published 4.0-line package containing the subpath on the app's own
upgrade schedule; do not substitute DS source aliases for the installed
package. This guide does not assert that a 4.0 artifact is already published
or installed in either app.

Until the first real consumer is measured, the contract lists
`./server/static-markup` as `lab`, owned by WO-CON-09. Here `lab` means
supported with controlled adoption during the 4.0 interregnum. The intended
migration opt-in for `@rottay/no-unsanctioned-ds-subpath` is:

```js
'@rottay/no-unsanctioned-ds-subpath': ['error', {
  allowSubpaths: ['./server/static-markup'],
}],
```

Apply that entry to the relevant server/test lint configuration, preserving
any existing options and justified entries. It permits this public subpath;
it does not permit private DS imports. This opt-in is the intended migration
guard, not debt for the DS to remove before adoption.

For each affected call, replace the synchronous renderer with
`await renderResolvedStaticMarkup(node)`. Make its test callback and any
fixture helpers async, and await their results at every caller before making
HTML assertions. Remove renderer imports only when no remaining call needs
them. Keep the existing tree, providers, inputs and behavioral assertions.
Do not make test order or an unrelated warm-up render a prerequisite.

## 3. Delegable brief — app-bithire (seven registered files)

Owner of execution: app-bithire maintainers, tracked in `app-bithire/roadmap/`.
This brief covers only legacy sync SSR; the broader
[app-bithire packet](../app-bithire/index.md) keeps its own scope.

The registered W1 census of 2026-10-15 reports `renderToStaticMarkup` calls in:

| File (relative to app-bithire) |
| --- |
| `tests/unit/core/providers/i18n-single-root.unit.test.ts` |
| `tests/unit/features/candidates/candidate-comparison-report.unit.test.ts` |
| `tests/unit/features/candidates/candidate-list-workbench-instance.unit.test.ts` |
| `tests/unit/features/my-work/work-queue-listing-wiring.unit.test.ts` |
| `tests/unit/features/teams/team-member-roster-wiring.unit.test.ts` |
| `tests/unit/lib/theme/runtime-tenant-theme-hydration.unit.test.ts` |
| `tests/architecture/ui/icon-facade-runtime-boundary/index.arch.test.ts` |

Review these seven files against the installed major. For each file, record
whether its rendered tree reaches a cold engine family. Migrate only the
calls that need resolved static markup, using §2; retain synchronous rendering
where it is valid. Declare the app write set before editing: affected files
from this list, directly affected async fixture callers, and the narrow lint
opt-in. Package/lockfile changes belong to the app's authorized upgrade.

Acceptance for this brief is the per-file disposition and the verification
in §5, including the architecture test when affected. This list is a reported
migration target, not evidence that any file already imports the new door.

## 4. Delegable brief — app-platform (two registered files)

Owner of execution: app-platform maintainers, tracked in `app-platform/roadmap/`
when its owner schedules adoption. This finite brief does not activate the
broader deferred [app-platform packet](../app-platform/index.md).

The same registered W1 census reports `renderToStaticMarkup` calls in:

| File (relative to app-platform) |
| --- |
| `tests/unit/core/providers/root-provider-composition.test.ts` |
| `tests/unit/core/lib/docs/catalog-workbench-rail.test.ts` |

Review these two files against the installed major and record, per file,
whether a cold engine family is reached. Apply §2 only to the calls that need
resolved static markup. Declare the app write set as affected files from this
list, directly affected async fixture callers, and the narrow lint opt-in;
package/lockfile changes belong to its authorized upgrade. Preserve its own
provider composition and fixtures.

Acceptance for this brief is the per-file disposition and §5. No app-platform
file is claimed migrated by this guide.

## 5. Verification and handback from each app

The app owner records:

1. The installed DS version and integrity, resolved React/react-dom versions,
   app revision, exact changed files and a migrate/retain reason for each
   registered file. The census above is dated; reconcile those exact paths in
   the app before changing them.
2. The affected unit/architecture tests, run through the app's existing test
   commands, with the engine family cold in a fresh test process before any
   other test can warm it. Assert resolved implementation HTML and preserve
   the original behavioral checks; an empty fallback is not success.
3. Lint and type checks over the affected scope using the app's existing
   commands. The helper import passes with the explicit opt-in, every async
   caller awaits the result, and no browser/client import graph reaches it.
4. Exact commands, results and the landed app revision, with file:line evidence
   of a real import of `@rottay/design-system/server/static-markup`, returned
   to the DS owner for census measurement. A proposed patch or this brief is
   not evidence of landed consumption.

The DS-side guidance is deliverable now. WO-CON-09 step 3 remains open until a
4.0 line containing the subpath is published to the applications and the
consumer census measures a real app consumer after migration lands. Only
then does the DS owner perform the coordinated `guaranteed` flip, rule-mirror
and count updates, `releaseSync.lab` removal, changeset and closure gates named
in WO-CON-09. This guide changes none of those records.

DS tests, `tests/support/resolved-markup` and the helper's JSDoc do not count
as app consumers or door attribution. If no app has adopted by the door's
`reviewBy` line, the DT re-adjudicates it under WO-CON-09 instead of silently
extending it. Documentation delivery alone does not satisfy the work order's
acceptance gate.
