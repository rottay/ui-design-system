---
"@rottay/design-system": minor
---

WO-FAM-10 sub-lot D2: the `detail-header` family cut — the chrome deriver, the
drained runtime and the drained Modern skin land together, and the family ends
with zero inline paint, zero unpaired state pseudo-selectors and one routed
unproduced read.

THE DERIVER. `derivation/chrome/detail-header` exports
`detailHeaderChromeDeriver` (family `detail-header`, rank `derived`) producing
the thirty `--ds-detail-header-*` channels the skin read with no producer —
the highest unproduced share of the WO-FAM-10 cut (31 of 79 reads). Each is
stated at exactly the fallback the skin reads it with, so producing the name
moves no pixel: the hero type rungs state the page-title role chains the C1
wave converged on, the avatar rungs are density-neutral by decision, and the
shadow states the tenant identity-chrome chain verbatim so `--ds-detail-hero-*`
still wins through the family channel. `--ds-size-touch-target` is deliberately
NOT produced: it is the root lane's governed 44px accessibility floor, owned
by the token lane and read by many families (WO-FAM-10 census §4, roots
group). The deriver's contract test pins every produced value against the skin
file itself and proves precedence by a direct ranked merge; it does NOT assert
`FAMILY_DERIVERS` membership, because the DT adds the registration line at
integration and the productive artifact must not emit these channels before
that commit.

THE RUNTIME. The last four inline paints — the two hero wrappers'
`min-width: 0; flex: 1` pairs — are gone: the wrappers are stamped parts now
(`hero-cluster`, `hero-copy`) and the skin owns the flex shares. The back chip
and the APG tabs adopt the shared interaction kernel: hover, press and the
tab keyboard ring are decided once and read off `data-state`, with the
platform pseudo as the fallback arm of each paired skin rule (F-37, 7 -> 0).
The back chip's keyboard ring is the one arm with no kernel twin, measured
rather than omitted: the chip sits inside its anchor, so focus never reaches
its handlers — the same ruling the form/edit header contract recorded. The
APG keyboard contract (Enter/Space activate, direction-aware arrows under
RTL, Home/End), the governed autoMirror back icon, the i18n floors
(back/tabs/details), the named metadata region and the decorative avatar are
unchanged.

CONSUMER-VISIBLE CONTRACT. Two new `data-part` values render in the hero
(`hero-cluster`, `hero-copy`); `data-state` now appears on the back chip and
each tab as the kernel reports hover/press/focus-visible. No prop shape moved.

```contract-diff
DOM  [data-part='hero-cluster'] — added; the hero identity row, its flex share skin-owned
DOM  [data-part='hero-copy'] — added; the hero copy column, its flex share skin-owned
DOM  [data-state] on back-button / tab — added; kernel-decided hover/press/focus-visible (absent at rest)
```
