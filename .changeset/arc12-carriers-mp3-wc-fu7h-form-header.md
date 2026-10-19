---
"@rottay/design-system": patch
---

`FormHeader` skins answer the owner class doors that its Modern `Box` and `Flex`
caller parts already carry (ARC-12 M-P3, Wave C follow-up lot FU-7H). No
component markup changes: the root, hero-panel and icon-badge elements keep the
`ds-form-header__*` and `ds-edit-header__*` classes they already had. In the
header-hero-shared skin 7 selectors of the `FormHeader` half (the editorial,
technical and governance hero-panel archetypes and the primary, success,
warning and info icon-badge variants) now also reach their element by class,
and in the form-header skin 12 selectors that reach the breadcrumb divider,
actions, action icons and context card through the root do the same. Each new
selector sits next to the part one, at the same specificity, and the
`[data-part]` side stays. The `EditHeader` selectors are unchanged, and the
back-button focus-visible selector stays as it was. Every rule matches the same
elements at the same specificity as before. The four vertical CSS bundles carry
the same selectors. This prepares the Modern `Box` and `Flex` to stamp their
own part (a later strip).
