---
"@rottay/design-system": patch
---

`DetailHeader` arrow-key, Home and End tab navigation now finds its tab strip
and its tabs through the `tablist` / `tab` roles the header already stamps,
instead of their `data-part` attributes. The same elements are found as before,
so keyboard behaviour is unchanged, but navigation no longer depends on the
parts its layout carriers hold. The `EditHeader` title gains the owner class hook
`ds-edit-header__title`. Its two skin rules key on that hook beside the existing
`[data-part='title']` arm, and the loading skeleton resolves the title bone
through it. Rendered values, specificity and matched rules are unchanged: the
two arms match the same element at the same weight. This prepares the modern
Box/Flex/Stack caller-owner programme (ARC-12 M-P).
