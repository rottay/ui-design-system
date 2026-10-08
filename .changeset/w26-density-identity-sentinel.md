---
"@rottay/design-system": patch
---

WO-RET-06 follow-up (the owner packet's P2 correction): the density
type-identity sentinel. A blocking pre-build gate (`density-identity` + its
drill) compiles a dedicated probe of the pinned density identities with a
strict `Equals` idiom, on a production-only tsconfig scope — green unmutated,
red at the exact flipped line, independent of the pre-existing
`typecheck:tests` TS2339 (which keeps its own receiver and is untouched).
Internal gate machinery; nothing published moves.
