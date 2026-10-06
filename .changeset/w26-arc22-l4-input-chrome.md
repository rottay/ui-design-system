---
"@rottay/design-system": minor
---

WO-ARC-22 L4 (owner packet 2026-10-06 §E-1): the Input primitive gains the
chrome-less variant. `chrome="none"` keeps the full behaviour contract
(keyboard, focus, aria) and drops the chrome (height floor, padding, variant
paint) for in-grid and in-pill embedding; the host paints only the cascade
properties (the H1 law: identity — radius, type, cursor, transition, gap —
comes from the primitive's own props or inherited channels, never host rules
on the primitive). The DataTable inline text editor drains onto it. Known
limitation, registered: a chrome-less Input shows the UA autofill state (the
DS autofill re-tint is chrome paint); cell editors carry no autocomplete.

```contract-diff
export .#ControlChrome — new exported type ('default' | 'none'), the chrome axis shared by the canonical controls (WO-ARC-22)
signature .#InputProps — gains chrome?: ControlChrome (Modern only; the frozen engines refuse it by construction) (WO-ARC-22 L4)
```
