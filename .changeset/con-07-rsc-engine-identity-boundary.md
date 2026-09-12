---
"@rottay/design-system": minor
---

WO-CON-07. The public RSC boundary: the engine-identity owner
(`src/foundation/contracts/kernel/engine-identity`, React-free by its own
docblock) is now reachable through `@rottay/design-system/server`, the only
guaranteed subpath that carries no `'use client'` directive. The root barrel
keeps its directive and keeps exporting the same names, so no client consumer
moves; what changes is that a server module no longer has to join the client
graph to name the roster. `PRIMARY_ENGINE` is deliberately not published here:
it answers which engine a runtime resolves to, and `engine-wiring` closes that
reader set.

Additive only: no existing export changed shape, no subpath was added or
retired, and the published surface stays at 120 subpaths.

```contract-diff
export ./server#ENGINE_NAMES — added; the closed engine roster, re-exported from the identity owner
export ./server#IMPLEMENTED_ENGINE_NAMES — added; the roster minus the extension seam
export ./server#ADMITTED_ENGINE_NAMES — added; the engines a tenant/intent/runtime may select
export ./server#FROZEN_ENGINE_NAMES — added; shipped, never admitted
export ./server#isValidEngineName — added; the one type guard over the roster
export ./server#isImplementedEngineName — added; does the package still ship an implementation
export ./server#isFrozenEngineName — added; is this engine shipped but never admitted
export ./server#isAdmittedEngineName — added; may this engine be selected at all
export ./server#EngineName — added; the union derived from the roster
export ./server#ImplementedEngineName — added; the roster union minus the extension seam
```
