---
"@rottay/design-system": patch
---

`SurfaceSectionCard` gains three owner class hooks on its layout carriers:
`ds-section-card__content-stack` on the content stack,
`ds-section-card__header-main` on the header's main row and
`ds-section-card__header-copy` on the header copy stack. The header row keeps
`ds-section-card__header`, which the section-card recipe already stamps. The
five section-card skin rules that select these elements by `data-part`
(content, header, header-main, header-copy, and the narrow-container header)
now also select them by class, at the same specificity. The `[data-part]` arm
stays. Rendered values and matched rules are unchanged: each class arm matches
exactly the section card's own elements that the part arm reaches. This
prepares the modern Box/Flex/Stack caller-owner programme (ARC-12 M-P).
