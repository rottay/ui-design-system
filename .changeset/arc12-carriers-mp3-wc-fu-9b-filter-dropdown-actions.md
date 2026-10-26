---
"@rottay/design-system": patch
---

The `CollectionWorkspaceSurface` skin answers two more owner class doors that
its Modern filter dropdown caller parts already carry (ARC-12 M-P3, Wave C
follow-up lot FU-9B). No component markup changes. The filter dropdown content
rule and the dropdown action row rule now read each part token as
`:is([data-part='<part>'], .ds-collection-workspace__<part>)`, for the
`filter-dropdown-content` `Box` and the `filter-dropdown-actions` `Flex`, at the
same specificity and on the same lines. In the action row rule both the content
token and the actions token are folded, so the row stays spaced from the
dropdown's own content box, never from the workspace root. The `[data-part]`
side stays, so every rule matches the same elements at the same specificity as
before. The filter sheet and preview sheet selectors are unchanged. The four
vertical CSS bundles carry the same selectors. This prepares the Modern `Box`
and `Flex` to stamp their own parts (a later strip).
