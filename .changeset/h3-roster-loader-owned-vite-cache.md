---
"@rottay/design-system": patch
---

The executable first-party roster loader (`scripts/libraries/roster`) now gives
Vite a cache directory of its own for every execution.

`readFirstPartyRosterSource` runs the authored TypeScript roster in a child
process through a Vite middleware server. That server started the default
dependency optimizer with no `cacheDir`, so it wrote into
`<package>/node_modules/.vite` — a cache shared by every checkout that links the
same `node_modules` — and the optimizer's startup cleanup deleted any `*_temp_*`
directory there older than 24 hours, including other runs' entries. Severity
HIGH: foreign cache data could be removed by any gate that reads the roster
(CSS freshness, cascade probe scope, single-author, claim exactness and the
first-party roster drill).

The parent now creates a fresh directory under the OS temp root before the child
starts, passes it to the child as Vite's `cacheDir`, and removes it when the call
ends — on success and on every failure (cache creation, spawn or working
directory, timeout, failing module, rejected output). A removal failure is
reported, never swallowed; after another failure it keeps that first message as
the prefix and the first error as `cause`.

Unchanged: the real TypeScript/Vite execution, the optimizer (still enabled,
confined to the owned directory), the projection, `validateExecutableRoster`,
the function signature and return value, and every existing error message. No
consumer changes.
