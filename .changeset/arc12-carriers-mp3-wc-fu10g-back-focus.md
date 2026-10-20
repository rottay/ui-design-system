---
"@rottay/design-system": patch
---

`FormHeader` and `EditHeader` skins answer five more owner class doors that
their Modern `Box` and `Flex` caller parts already carry (ARC-12 M-P3, Wave C
follow-up lot FU-10G). No component markup changes. In the header-hero-shared
skin the `FormHeader` back chip's keyboard focus-visible selector and the
`EditHeader` success and error icon-badge selectors now also reach their
element by class. In the edit-header skin the info and error status-pill
selectors do the same. Each new selector sits next to the part one, at the same
specificity, and the `[data-part]` side stays. Every rule matches the same
elements at the same specificity as before. The four vertical CSS bundles carry
the same selectors. This prepares the Modern `Box` and `Flex` to stamp their
own part (a later strip).
