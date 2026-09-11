---
"@rottay/design-system": major
---

WO-EMI-02 step 4. `TenantConfig` is stripped to identity, bounded branding and a
reference to the artifact that paints it; `useTokens` reads the mounted
artifact's `ThemeCompilation.runtime` instead of merging config fields.

REMOVED FROM `TenantConfig`: `brandTheme`, `tokenOverrides`, `personality`,
`appearance`, `engine`. Each was a second authority over a question the compiled
artifact already answers, and every one of them was already stripped before a
component saw it — `getCodeOwnedRuntimeConfig` for a code-owned vertical and the
provider's runtime projection for every other tenant — so the fields described a
merge the runtime had stopped performing.

MIGRATION. A tenant's visual identity is authored as a `Theme`/`BrandTheme` and
compiled once into a `TenantThemeArtifact`; mount it with `mountTenantTheme` and
declare it with `visualAuthority={{ authority: 'compiled-artifact', artifact }}`.
The config references that artifact by identity (`slug` + `vertical`, the keys
the artifact is admitted under). The artifact's own normalized appearance is
published beside the config on `TenantContextValue.appearance` and the
`TenantProvider` `appearance` prop, and its non-CSS half reaches the runtime as
`EngineVisualDeclaration.runtime` through the `engineVisual` prop. `engine` has
no replacement on the tenant: the vertical roster decides it, and `resolveEngine`
already ignored a tenant pin.

WHAT IS NOT IN THE DIFF BELOW, and why. Six `subpath#symbol` pairs a reader
might expect are absent because they are not published at either end of the
range, so no contract diff exists for them: `./server#TenantConfig`,
`./server#TenantContextValue`, `./contracts/foundation#TenantContextValue`,
`.#censusRuntimeVisualPayload`, `.#resolveActiveIconExpressiveProfile` and
`./server#resolveActiveResponsivePosture`. `./server` is a named-export barrel
(`src/entrypoints/server/index.ts`) that never names `TenantConfig`,
`TenantContextValue` or `resolveActiveResponsivePosture`; `./contracts/foundation`
publishes `TenantConfig` but not `TenantContextValue`; and the root barrel
publishes neither `censusRuntimeVisualPayload` nor
`resolveActiveIconExpressiveProfile`. Nothing in this release changes which
subpath publishes which name — each of those six is absent on base and on head
alike. A release that wanted them published would be a separate, additive
decision.

```contract-diff
signature .#TenantConfig — REMOVED fields `brandTheme`, `tokenOverrides`, `personality`, `appearance`, `engine`; the type is identity + bounded branding + the artifact reference (`slug`/`vertical`). Migration: compile a `Theme`/`BrandTheme` into a `TenantThemeArtifact`, mount it with `mountTenantTheme` and declare `visualAuthority={{ authority: 'compiled-artifact', artifact }}`; the engine is the vertical roster's
signature ./contracts/foundation#TenantConfig — same five fields removed on the contracts barrel's re-export of the same declaration
signature .#TenantContextValue — gains optional `appearance: TenantAppearance`, the mounted artifact's normalized read-model, published beside the config instead of folded into it; absent when no artifact is mounted
signature .#RuntimeVisualPayloadCensus — reduced to `{ visualBranding: boolean }`; `tokenOverrides`, `personality`, `brandTheme` and `appearance` are gone because a `TenantConfig` can no longer carry them, leaving the branding seeds as the only raw visual channel
signature ./server#RuntimeVisualPayloadCensus — same reduction on the server barrel's re-export
signature ./server#censusRuntimeVisualPayload — input narrowed to `Pick<TenantConfig, "branding"> | null | undefined`; it returns the one-field census above
signature ./server#resolveActiveIconExpressiveProfile — input is `{ appearance?, expressive? }`: the artifact's normalized appearance and the governed expressive SELECTION, replacing the `{ appearance?, brandTheme? }` shape a tenant config used to satisfy
signature .#TENANT_CAPABILITY_REGISTRY — the `recipe-profile` row's evidence witness moves to `appearance?.recipeProfile ?? governedBehavior?.recipeProfile`, the expression the provider now reads: the artifact's normalized appearance for a published tenant and the identity-keyed governed slot for a code-owned vertical. Declarations, tiers and domains are unchanged
signature .#TenantProvider — gains an optional `appearance` prop carrying the mounted artifact's normalized appearance; it is snapshot and frozen exactly like the config and published on `TenantContextValue.appearance`
signature .#TenantProviderProps — same optional `appearance` field on the props declaration
signature .#TenantCreationConfig — REMOVED `engine`; the vertical roster owns the engine. Its `personality` preset and `density` posture no longer reach `createTenantConfig`'s output: they are BrandTheme channels, projected by the new `createTenantBrandTheme` from the same draft
signature .#resolveActiveResponsivePosture — takes the artifact's normalized appearance (`{ advanced?: { responsivePosture? } }`) directly instead of a config; the `brandTheme.responsive` arm is gone because nothing could reach it once the config stopped carrying a theme
```
