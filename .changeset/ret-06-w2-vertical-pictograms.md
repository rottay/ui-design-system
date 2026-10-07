---
"@rottay/design-system": major
---

WO-RET-06 W-2 (F-113). The shared pictogram corpus no longer carries
single-vertical vocabulary: `candidate-evidence` (BitHire) and `event-moment`
(Evnto) retire from `FEATURE_PICTOGRAM_NAMES`, `FEATURE_PICTOGRAM_CORPUS`,
`FEATURE_PICTOGRAM_PROVENANCE`, the `FeaturePictogramName` union and the
`FeaturePictogramCorpusEntry.family` union (`bithire`, `evnto`), together with
their artwork. The census was re-measured with `git grep` over the tracked and
working-tree files of app-bithire, app-evnto and app-platform and over the
showroom: zero renders of either name (app-bithire's two architecture tests
spell `candidate-evidence` inside a parsed source string and import nothing).

There is no replacement: render one of the six shared pictograms, or keep
vertical artwork in the application. A new test, "no vertical semantics in
shared corpora", now fails when a first-party vertical enters any shared
graphics corpus; the six BitHire icon roles conserved by WO-RET-01 E6 are its
only, fixed exception.

```contract-diff
signature ./pictograms#FEATURE_PICTOGRAM_NAMES — loses `candidate-evidence` and `event-moment`; six shared names remain (zero consumers, WO-RET-06 W-2)
signature ./pictograms#FEATURE_PICTOGRAM_CORPUS — loses the `candidate-evidence` and `event-moment` rows (zero consumers, WO-RET-06 W-2)
signature ./pictograms#FeaturePictogramName — the union loses `candidate-evidence` and `event-moment`; no replacement (zero consumers, WO-RET-06 W-2)
signature ./pictograms#FeaturePictogramCorpusEntry — `family` loses `bithire` and `evnto` (zero consumers, WO-RET-06 W-2)
```
