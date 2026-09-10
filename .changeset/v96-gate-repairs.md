---
"@rottay/design-system": patch
---

V96 verification-repair lot (2026-09-09 96-checkpoint). Gate machinery only; no
published declaration moves.

- The `changeset` CI job installs the TypeScript dependency the gate statically
  imports. It previously installed nothing, so on a clean runner the gate died
  with `ERR_MODULE_NOT_FOUND` before executing a single assertion (V96-01).
- `contract-changeset` certifies an inferred public return type instead of
  eliding the body that states it, so `return 1` -> `return String(1)` is a
  contract event and a body edit that leaves the inferred type where it was is
  not. What it certifies is an annotated return, or an inferred return the
  certifier resolves for a function-like with a BLOCK body -- 200 of 4302
  published symbols, over 206 elision sites. An elision made without a
  certifier is marked and its symbol reported unresolved, never compared blind.
  Two shapes stay uncovered and are declared open, not closed: an
  expression-bodied arrow and a call-initialised constant keep their text, so a
  private helper's return type can move under either without a diff row
  (V96-02).
- `channel-liveness` walks the derivation registry recursively and resolves
  `vars[...]` keys that are not string literals, so the sub-owners that hold
  typography's and elevation's emissions stop reading as families that emit
  nothing: 19 -> 26 producer files, 33 resolved non-literal keys, 438 -> 468
  names in the liveness universe. It moves no ratchet. `read-without-producer`
  and `cascade-wiring` had already shrunk at the WO-DER-04 integration
  (deb9b1324) under the OLD walk, and the pins lowered here are byte-identical
  to the ones that landed on main for that merge.
- The responsive breakpoint sweep reads the whole shipped domain (px, rem, em,
  `inline-size`, range syntax) with lengths normalised before comparison, and
  pins workspace-switcher's `@media (max-width: 30rem)` reachability guard as a
  named off-ladder exception.
