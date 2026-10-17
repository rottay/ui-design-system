---
"@rottay/design-system": patch
---

`GuidedDraftFormSurface` gains an owner class door on its submit bar (ARC-12
M-P3, family lot 9b of the Box and Flex cohort). The Modern `Box` that its skin
reaches by `data-part="submit-bar"` now also carries
`ds-guided-draft-form__submit-bar` beside that part. In the guided-draft-form
skin the submit bar selector now also reaches it by class, as a second selector
next to the part one, at the same specificity. The `[data-part]` side stays.
Rendered markup changes only by the new class token, and every rule matches
the same elements at the same specificity as before. The four vertical CSS
bundles carry the same selector. This prepares the Modern `Box` to stamp its
own part (a later strip). The axis-difference roster gate on that submit bar
now admits the class door: it still requires the same `Box` opening tag with
the same part and action-bar attributes, and accepts at most one string-literal
`className` between them.
