---
"@rottay/design-system": patch
---

The theme `population` test fixture for the reviewed table-toolbar divider
exclusion (ARC-12 M-P3, PM-P14) now accepts a skin whose three divider rules are
already authored as the carrier pair `S, C`, which Wave C lot LC14 introduces.
Before arming its sandbox, the fixture rewrites an authored pair back to the
reviewed selector S and refuses a mixed authoring: the three rules must be all
unpaired or all paired. The arming step, its count of three and every armed
byte the mutations see are unchanged. The HEAD identity test now accepts exactly
one reviewed form per declaration (its own selector or its carrier pair), still
refuses the class twin alone, and requires the three divider rules to share one
form in their three reviewed contexts. No reader, exclusion entry, pin,
baseline, floor, skin or public surface changes; the eighteen tests keep their
negatives, and only the HEAD identity test title is reworded to match its claim.
