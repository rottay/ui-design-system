---
"@rottay/design-system": patch
---

The default theme's light tertiary ground becomes an explicit seed at
`#ededed`, so the one ground that carries text stops being decided by the
border rung.

`--ds-color-bg-tertiary` derived from `var(--ds-color-neutral-200)` (`#e5e5e5`)
in the light `:root`. That rung is simultaneously the tertiary GROUND and the
default BORDER rung (`--ds-color-border`, `--ds-color-border-primary`), with 28
component border channels carrying the same literal independently, so the
ground could not be lifted from the ramp side without repainting every hairline
in the catalog for a text-only defect. The seed now states its own value —
`#ededed`, the per-channel sRGB midpoint of `--ds-color-neutral-100` and
`--ds-color-neutral-200` — and the neutral ramp remains the border rung's
producer. The dark block already restated this token as a literal (`#172033`),
so this makes light and dark the same kind of declaration.

**Customization is unchanged.** No tenant-reachable door flowed through the
retired edge: `palette.neutral-temperature` re-hues only an AUTHORED neutral
ramp and no document door authors one, and the closed `tokenOverrides` set
contains neither `--ds-color-neutral-200` nor `--ds-color-bg-tertiary`. The
ground is customized as before, through the `backgroundTertiaryColor` FlatTheme
field (which maps straight to `--ds-color-bg-tertiary`) or through the
downstream `--ds-surface-panel` override, both of which land in the compiled
artifact and beat the base sheet.

**DECLARED visual change, measured.** The ground and its eight aliases move
`#e5e5e5` -> `#ededed` in the three light scopes; `--ds-color-neutral-200` and
both border roles stay `#e5e5e5`, and the six ink rungs do not move. Contrast
wells repaired: 7 in rottay, 8 in bithire, 7 in evnto, with zero pass-to-fail
cells across the 42-well table or the 42-cell ladder cross-product —
`text-muted` on the ground reads 4.20:1 -> 4.52:1 and `text-tertiary` 4.80:1 ->
5.16:1 in every light scope. All three dark scopes are byte-identical. Sighted
in both verticals: identity, layout, type and hierarchy unchanged, the panel
and status chip a hair lighter.

The midpoint relation is now asserted in
`default-theme-neutral-derivation.test.ts`, so a future ramp re-grade fires the
suite instead of letting the seed drift. On the axe side this drains exactly
the `bithire light` `draft-status-label` pin in the guided-draft-form causality
ledger (4.31 -> 4.64); `evnto light` and `bithire dark` stay pinned on the
success FILL ink, which is a separate packet's cause.
