---
"@rottay/design-system": patch
---

The static tenant path resolves its recipe profile from the ARTIFACT, not from a
second reading of the authored theme (WO-EMI-02, F-12's own arm / D-26).

A code-owned vertical ships its CSS inside `styles.css`, so the runtime has no
artifact row to read the non-CSS half off — and the governed recipe SELECTION is
not paint, so no stylesheet can hand it to React. The tenant registry therefore
re-derived it by calling `validateRecipeProfileSelection` on the authored
`BrandTheme`: a second, independently projected reader of one decision, which is
only ever as true as the last person to edit one of the two.

The same compile that writes each vertical's CSS artifact now also writes its
runtime half as a generated build output, and that is what the runtime reads.
`mountTenantTheme` holds both on every server render and refuses by name when
the shipped block disagrees with its own compile; `build:vertical-css --check`
refuses a stale one at build time. `DesignSystemProvider` resolves the profile
from the mounted artifact's compiled runtime block first, then the artifact's
normalized appearance, then the code-owned vertical's generated block — no arm
reads an authored theme.

contract-diff: none. No public subpath, exported symbol or signature moves. The
generated module
(`src/infrastructure/compilers/runtime/tenant-css/artifact-runtime`) is internal
and is deliberately NOT re-exported from the `tenant-css` barrel, because that
barrel reaches the artifact renderer and therefore the whole lowering — the
reachable fan-out ceiling of `./runtime/tenant` is the guard. The only public
type touched is the doc comment on the internal-facing
`CodeOwnedGovernedBehavior.recipeProfile`, whose declared shape is unchanged.
