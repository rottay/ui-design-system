---
"@rottay/design-system": patch
---

`GalleryView`, `GridView`, `StatsGrid`, the metrics-cards grid and the
`FormSurface` / `WizardSurface` / `DetailFormSurface` roots now carry a
surface-owned class hook (`ds-<owner>__root`; `ds-metrics-cards__cards-grid`
on the cards grid), and their skins key the root rules on that hook beside
the existing `[data-part]` arm. Rendered values, specificity and matched
rules are unchanged (the two arms match the same elements at the same
weight); this prepares the Grid carrier strip (ARC-12 M-C2), after which the
part arms are removed by a later, separately authorized dead-arm lot. The
settings surface gains nothing: no rule reads its Grid's part.
