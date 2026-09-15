---
"@rottay/design-system": major
---

WO-DER-06 (D6-2c-ii). The authored first-party themes are retired. A code-owned
vertical is the neutral foundation with its preset document admitted through the
same door every tenant takes; `foundation/tokens/ts/presentation/brand-themes/`
is deleted and nothing reads it. The compile door derives that baseline once and
hands it to the resolver, which carries no baseline of its own; the draft ledger,
the tenant registry and every instrument that read an authored theme now read the
composed baseline or the artifact's own runtime block. `serializeBrandTheme` and
`deserializeBrandTheme` keep their signature over the flat read view; that view
is renamed in D6-2c-iii, together with the type it serializes.

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
signature .#BrandTheme — shape unchanged; its capabilities note names ThemeSource as the required form
signature ./server#Theme — shape unchanged; its identity note no longer cites the first-party brand theme
```
