---
"@rottay/design-system": patch
---

WO-ARC-12 law lot (W25-P88): the pass-through honesty law on
`BaseComponentProps` is aligned to the owner's P-88 ruling — a component
with its own skin keeps its canonical `data-part`/`data-state`; a caller
`data-part` is not forwarded and cannot replace it; composition goes through
the documented `className`/slot hooks; only a structural component with no
part of its own may forward. No runtime change; the type promise is narrowed
in documentation only. (This changeset closes the lot's contract-diff
obligation, registered after the fact.)

```contract-diff
signature .#BaseComponentProps — the `data-part` JSDoc narrows to the P-88 law (structural forwarding only); the `data-${string}` index signature's doc carves out `data-part` (W25-P88)
```
