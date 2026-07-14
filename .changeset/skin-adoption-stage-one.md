---
"@rottay/design-system": minor
---

Complete Stage-1 skin adoption by extending the input work released in 2.18.0 across feedback,
overlay, navigation, display, layout, patterns, structures, surfaces, tenant previews and
visualization. Migratable static and finite-state paint now lives in scope-anchored, unlayered skins
with stable `data-part`/state hooks wherever the rendered owner can expose them. Composition-blocked
paint plus caller-, datum-, tenant-, user-, document-derived and runtime-SVG paint remains at exact
executable floors and is explicitly handed to Stage 2. This is a byte-exact ownership release, not
an intentional visual redesign; every public tenant/vertical CSS entrypoint is regenerated.
