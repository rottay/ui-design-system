---
"@rottay/design-system": patch
---

`GuidedDraftFormSurface` and `CollectionWorkspaceSurface` gain owner class
doors on their Modern `Box` and `Flex` caller parts (ARC-12 M-P3, family lot 9
of the Box and Flex cohort). In `GuidedDraftFormSurface`, fifteen elements that
its skin reaches by a caller `data-part` now also carry
`ds-guided-draft-form__<part>` beside that part: the title bar and title copy,
the section navigation in its sidebar, dropdown and pill layouts, the dropdown
select, the navigation item row and main, the sidebar content and both content bodies, the section card
header, and the submit bar panel, progress placeholder and actions. In the
guided-draft-form skin 19 selectors that reach these elements by `[data-part]`
now also reach them by class, as a second selector next to the part one, at the
same specificity. The ten `CollectionWorkspaceSurface` elements in this lot
(content, collection, toolbar row, controls row and rail, strip host, body,
body content, views strip) already carried their `ds-collection-workspace__<part>`
class; in its skin, 14 selectors now accept either the part or that class at
the same token, at the same specificity. The `[data-part]` side stays.
Rendered markup changes only by the new class tokens, and every rule matches
the same elements at the same specificity as before. The four vertical CSS
bundles carry the same selectors. This prepares the Modern `Box` and `Flex` to
stamp their own part (a later strip).
