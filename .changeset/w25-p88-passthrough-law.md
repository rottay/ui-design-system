---
"@rottay/design-system": major
---

WO-ARC-12 law lot (W25-P88): the pass-through honesty law on
`BaseComponentProps` is aligned to the owner's P-88 ruling — a component
with its own skin keeps its canonical `data-part`/`data-state`; a caller
`data-part` is not forwarded and cannot replace it; composition goes through
the documented `className`/slot hooks; only a structural component with no
part of its own may forward. This file changes no runtime by itself: it
narrows the type promise in documentation. The promise it retires was
published. In 2.19.37 the law read "`data-*` ... MUST reach the root ... an
engine may not silently drop them", with caller `data-part` winning (P-79),
and the released engines honored it (see the per-family inventory in
`arc12-step2-modern-engine-strips`, `arc12-step3-classic-strips`,
`arc12-o3-o4-strips`, `arc-12-caller-anatomy-contract-diff-reconciliation`,
`e8b-typography-engine-strip`, `arc12-modern-carriers-m1` and
`arc12-modern-carriers-mc2`). Narrowing a published law is a major change for
consumers of the published package. (This changeset closes the lot's
contract-diff obligation, registered after the fact.)

Overlap exception (owner, 2026-10-15): these identified P-88 and sync-SSR
breaks ship directly in this major, with an exact inventory, a migration
guide, replacements and reviewed evidence, by the owner's express exception
to the one-minor overlap rule. The exception does not extend to any other
deprecation or retirement. Migration guide:
`packages/core/docs/consumer-contract/migration/p88-caller-anatomy/index.md`.

```contract-diff
signature .#BaseComponentProps — the `data-part` JSDoc narrows to the P-88 law (structural forwarding only); the `data-${string}` index signature's doc carves out `data-part` (W25-P88)
```
