---
"@rottay/design-system": major
---

WO-RET-06 W-3b (F-84 remainder (c)): `buildRecipeManifest`, `RecipeManifest` and
`RecipeManifestFamily` are removed from the package root, and their module is deleted.

They had no consumer in the three applications or the showroom. The one fact a tenant
needed from them, which custom properties it may own, is published by the guaranteed
`./hooks-manifest` door. Recipe profiles stay public (`RECIPE_PROFILES`,
`resolveRecipeProfile`, `RecipeProfileProvider`), and each component's props type states
its recipe axes.

Migration: read `@rottay/design-system/hooks-manifest` for the custom properties a tenant
may own; `RECIPE_PROFILES` for the profile registry; each component's props type for its
recipe axes. The 3.0 codemods report every import of the three names; there is no
successor builder.

```contract-diff
export .#buildRecipeManifest — removed; no consumer; tenant-ownable channels are published by ./hooks-manifest, profiles by `RECIPE_PROFILES`, axes by each component's props; codemod `symbol-removed-no-replacement/.#buildRecipeManifest` (report-only); census: 0 apps, 0 showroom
export .#RecipeManifest — removed with its builder; codemod `symbol-removed-no-replacement/.#RecipeManifest` (report-only); census: 0
export .#RecipeManifestFamily — removed with its builder; codemod `symbol-removed-no-replacement/.#RecipeManifestFamily` (report-only); census: 0
```
