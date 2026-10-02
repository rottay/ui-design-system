---
"@rottay/design-system": minor
---

WO-EVI-02, owner ruling 3. `GlassCard` paints from its skin
(`presentation/components/skin/glass-card`, imported by the base entrypoint
into `layer(rottay-components)`) instead of inline styles. The skin reads the
tenant glass channels first -- `--ds-glass-bg`, `--ds-glass-border`,
`--ds-glass-blur`, which a tenant authors through `surfaces.glass` or the
`--ds-glass-*` tokenOverrides door -- so an authored value now reaches the
component's paint. `blur`, `bgOpacity` and `borderOpacity` keep their meaning
and feed only the innermost fallback, as before.

What changes for a caller: the glass paint now requires the package
stylesheet, like every other skinned component, and a consumer class can
restyle the container because the paint is layered rather than inline.
`GlassCardProps` is unchanged.

The internal `Overlay` backdrop gains an optional `intensity: 'light' |
'heavy'` step whose skin rule reads `--ds-overlay-light` /
`--ds-overlay-heavy`; omitting it keeps the canonical scrim. `Overlay` is not
on the published surface, so this is not a contract change.
