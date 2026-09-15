---
"@rottay/design-system": major
---

WO-DER-06 (D6-2c-ii). The authored first-party themes are retired. A code-owned
vertical is the neutral foundation with its preset document admitted through the
same door every tenant takes; `foundation/tokens/ts/presentation/brand-themes/`
is deleted and nothing reads it. The compile door derives that baseline once and
hands it to the resolver, which carries no baseline of its own; the draft ledger,
the tenant registry and every instrument that read an authored theme now read the
composed baseline or the artifact's own runtime block. D6-2c-iii then renames that flat view
`BrandTheme` -> `FlatTheme` by closed substitution, together with its mode types
and the four root exports that carry it. The shape does not move: the rename
changes names only, and `FlatTheme` still carries two roles -- the read view the
lowering consumes and the draft transport the studio, preview and fixtures
author -- which WO-DER-08 splits.

```contract-diff
export .#rottayBrandTheme — removed; the authored theme is gone, the vertical is the neutral foundation plus its preset document
export .#bithireBrandTheme — removed; same retirement
export .#evntoBrandTheme — removed; same retirement
export .#FirstPartyBrandTheme — removed; the ISO normalizer takes a ThemeSource
export .#FirstPartyBrandThemeRequiredKey — removed with the first-party required inventory
export .#FIRST_PARTY_BRAND_THEME_REQUIRED_KEYS — removed with the first-party required inventory
export .#ThemeSource — added; the flat theme the ISO normalizer lowers: appearance, palette and capabilities required, governed selections partial, identity open
export .#THEME_BASELINE_SOURCES — removed; there is one baseline source
export .#ThemeBaselineSource — removed; there is one baseline source
signature .#baselineFor — loses the third parameter; always the neutral foundation with the vertical's preset admitted, labelled with the slug
signature .#CompileThemeIntentOptions — loses baselineSource; every intent resolves over the vertical's composed baseline
signature .#ResolveThemeOptions — baseline is required; resolveTheme validates the intent first and refuses a call without a baseline by name
signature .#DraftPreviewThemeIntentInput — carriedFrom, when absent, is the vertical's composed baseline instead of an authored theme
signature .#renderFirstPartyArtifact — returns governed beside css and compiled: the motion dial, expressive selection and decided channels the artifact's runtime block publishes
signature .#VerticalPreset — loses personality and tokenOverrides; a vertical's decisions reach the runtime through its compiled artifact only
signature .#VERTICAL_REGISTRY — every entry loses personality and tokenOverrides
signature .#FlatTheme — shape unchanged; its capabilities note names ThemeSource as the required form
signature ./server#Theme — shape unchanged; its identity note no longer cites the first-party brand theme
signature ./server#brandModeSelector — names the renamed flat view; BrandTheme -> FlatTheme in the declaration text, shape unchanged
signature ./server#EmissionScope — names the renamed flat view; BrandTheme -> FlatTheme in the declaration text, shape unchanged
signature ./server#EngineVisualDeclaration — names the renamed flat view; BrandTheme -> FlatTheme in the declaration text, shape unchanged
signature ./server#Theme — names the renamed flat view; BrandTheme -> FlatTheme in the declaration text, shape unchanged
signature ./server#ThemeCompilation — names the renamed flat view; BrandTheme -> FlatTheme in the declaration text, shape unchanged
signature ./server#ThemeCompilationModeBlock — names the renamed flat view; BrandTheme -> FlatTheme in the declaration text, shape unchanged
signature ./server#themeModeSelector — names the renamed flat view; BrandTheme -> FlatTheme in the declaration text, shape unchanged
signature .#authoredThemePatch — names the renamed flat view; BrandTheme -> FlatTheme in the declaration text, shape unchanged
signature .#BrandControlsChrome — names the renamed flat view; BrandTheme -> FlatTheme in the declaration text, shape unchanged
signature .#BrandSurfaces — names the renamed flat view; BrandTheme -> FlatTheme in the declaration text, shape unchanged
export .#BrandTheme — renamed to FlatTheme; the flat view keeps its shape, only the name moves
export .#BrandThemeMode — renamed to FlatThemeMode; the flat view keeps its shape, only the name moves
export .#BrandThemeModeOverlay — renamed to FlatThemeModeOverlay; the flat view keeps its shape, only the name moves
export .#BrandThemeModes — renamed to FlatThemeModes; the flat view keeps its shape, only the name moves
export .#brandThemeToTenantAppearance — renamed to flatThemeToTenantAppearance; the flat view keeps its shape, only the name moves
export .#brandThemeToTenantAppearanceAdvanced — renamed to flatThemeToTenantAppearanceAdvanced; the flat view keeps its shape, only the name moves
signature .#CardProps — names the renamed flat view; BrandTheme -> FlatTheme in the declaration text, shape unchanged
export .#deserializeBrandTheme — renamed to deserializeFlatTheme; the flat view keeps its shape, only the name moves
export .#deserializeFlatTheme — renamed from deserializeBrandTheme; shape byte-identical
signature .#DraftPreviewThemeIntentInput — names the renamed flat view; BrandTheme -> FlatTheme in the declaration text, shape unchanged
signature .#EmissionScope — names the renamed flat view; BrandTheme -> FlatTheme in the declaration text, shape unchanged
signature .#EngineProjectionMode — names the renamed flat view; BrandTheme -> FlatTheme in the declaration text, shape unchanged
signature .#EngineVisualDeclaration — names the renamed flat view; BrandTheme -> FlatTheme in the declaration text, shape unchanged
export .#FlatTheme — renamed from BrandTheme; shape byte-identical
export .#FlatThemeMode — renamed from BrandThemeMode; shape byte-identical
export .#FlatThemeModeOverlay — renamed from BrandThemeModeOverlay; shape byte-identical
export .#FlatThemeModes — renamed from BrandThemeModes; shape byte-identical
export .#flatThemeToTenantAppearance — renamed from brandThemeToTenantAppearance; shape byte-identical
export .#flatThemeToTenantAppearanceAdvanced — renamed from brandThemeToTenantAppearanceAdvanced; shape byte-identical
signature .#FOUNDATION_AUTHORITIES — names the renamed flat view; BrandTheme -> FlatTheme in the declaration text, shape unchanged
signature .#migrateV1 — names the renamed flat view; BrandTheme -> FlatTheme in the declaration text, shape unchanged
signature .#PatternBrandStudioProps — names the renamed flat view; BrandTheme -> FlatTheme in the declaration text, shape unchanged
export .#serializeBrandTheme — renamed to serializeFlatTheme; the flat view keeps its shape, only the name moves
export .#serializeFlatTheme — renamed from serializeBrandTheme; shape byte-identical
signature .#TENANT_CAPABILITY_REGISTRY — names the renamed flat view; BrandTheme -> FlatTheme in the declaration text, shape unchanged
signature .#TenantCapabilityDeclaration — names the renamed flat view; BrandTheme -> FlatTheme in the declaration text, shape unchanged
signature .#TenantStatusSeedAuthorship — names the renamed flat view; BrandTheme -> FlatTheme in the declaration text, shape unchanged
signature .#ThemeCompilation — names the renamed flat view; BrandTheme -> FlatTheme in the declaration text, shape unchanged
signature .#ThemeCompilationModeBlock — names the renamed flat view; BrandTheme -> FlatTheme in the declaration text, shape unchanged
signature .#ThemeSource — names the renamed flat view; BrandTheme -> FlatTheme in the declaration text, shape unchanged
signature .#VerticalTheme — names the renamed flat view; BrandTheme -> FlatTheme in the declaration text, shape unchanged
channel --ds-switch-label-color — removed; no reader anywhere (D6-2d-resto)
channel --ds-switch-{sm,md,lg}-{width,height,thumb-size} — removed; no reader anywhere (D6-2d-resto)
channel --ds-switch-{radius,transition,thumb-offset,label-gap} — removed; no reader anywhere (D6-2d-resto)
channel --ds-control-brand-tint-hover — removed; no reader anywhere (D6-2d-resto)
channel --ds-control-ink-muted — removed; no reader anywhere (D6-2d-resto)
channel --ds-control-surface-raised — removed; no reader anywhere (D6-2d-resto)
channel --ds-surface-shadow-hover — removed; no reader anywhere (D6-2d-resto)
channel --ds-color-interactive-bg-muted — removed; no reader anywhere (D6-2d-resto)
channel --ds-color-interactive-border — removed; no reader anywhere (D6-2d-resto)
channel --ds-color-text-page — removed; no reader anywhere (D6-2d-resto)
signature .#BrandSwitchChrome — loses labelColor with its only producer (D6-2d-resto)
signature .#BrandSemanticControlChrome — loses inkMuted, surfaceRaised and brandTintHover with their producers (D6-2d-resto)
signature .#BrandSurfaceChrome — loses shadowHover with its producer (D6-2d-resto)
signature .#BrandPalette — loses textPageColor, interactiveBorderColor and interactiveBgMutedColor with their producers (D6-2d-resto)
signature .#TENANT_THEME_REFERENCE_TOKENS — loses the --ds-color-text-page row (D6-2d-resto)
signature .#ThemeIntent — gains optional readonly baseline; the ingress sets it to carriedFrom ?? the vertical's baseline so authorship classification and resolution measure the same floor (D6-CORE-01)
channel --ds-focus-ring-color — now derived by the ramps lowering owner when the theme states a seed: the nearest ramp stop that clears the 3:1 ring floor against the surface's own ground, a compliant seed resolving to itself (D6-FAM-01); the foundation sheet's declaration remains the answer for a seedless theme
```
