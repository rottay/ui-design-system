---
"@rottay/design-system": major
---

WO-RET-01 (RET-01-CH, owner-ordered chain 2026-10-02). Three liveness-pinned
channels retire with their producers after the consumer-census gate measured
zero consumers across the package, the showroom and the three apps:
`--ds-text-body-letter-spacing` and `--ds-text-emphasis-letter-spacing` (the
type ramp's body/emphasis tracking facets — the browser default, read by no
surface anywhere; the ramp's other letter-spacing facets and the `font`
shorthand composition are unchanged) and `--ds-text-inverse` (the palette alias
channel, read only by the dead, outranked themes/default `--ds-sidebar-text`
relay). The public `BrandPaletteAliases.textInverse` field leaves with its
producer; consumers that read it move to the named substitute
`--ds-color-text-on-primary`, the exact channel the alias forwarded to — the
themes/default `--ds-sidebar-text` floor now forwards to it directly, so every
painted byte is unchanged. A stored document still carrying the retired
`textInverse` alias leaf compiles with nothing emitted for it.

```contract-diff
signature .#BrandPaletteAliases — loses textInverse with its producer; the --ds-text-inverse channel is removed; consumers move to --ds-color-text-on-primary, the exact channel the alias forwarded to (RET-01-CH)
signature .#PALETTE_ALIAS_CHANNELS — loses the textInverse alias channel; setExtendedPaletteVariables emits nothing for a document still carrying the retired leaf (RET-01-CH)
signature .#setTypeRampVariables — the --ds-text-body-letter-spacing and --ds-text-emphasis-letter-spacing facet channels are removed from the ramp's emitted facet set (zero readers anywhere; body/emphasis tracking is the browser default); the detail/title/display/eyebrow letter-spacing facets and the font-shorthand composition are unchanged (RET-01-CH)
signature .#TYPE_SCALE_FACET_CHANNELS — loses --ds-text-body-letter-spacing and --ds-text-emphasis-letter-spacing; the two facet tables stay equal by the family suite (RET-01-CH)
signature .#paletteDeriver — produces loses --ds-text-inverse (RET-01-CH)
```
