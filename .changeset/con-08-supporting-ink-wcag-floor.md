---
"@rottay/design-system": patch
---

The light supporting-ink ladder clears WCAG 4.5:1 and stops running backwards.

`--ds-color-text-secondary`, `--ds-color-text-tertiary` and
`--ds-color-text-muted` are re-graded on the default theme's light `:root`
block — the one producer of all three (bithire and evnto author none of them,
measured, and the compiled vertical artifacts do not declare them):

```
--ds-color-text-secondary: #A0A0A5 -> #5A5A61
--ds-color-text-tertiary:  #9A9AA2 -> #62626A
--ds-color-text-muted:     #96969E -> #6B6B72
```

`--ds-color-text-subtle` keeps following `muted`.

Two faults, both measured through the productive door in real Chromium across
four rungs x fifteen grounds x six vertical/mode scopes. Every rung failed
4.5:1 on every light ground in every vertical — worst 2.07:1, best 2.94:1 —
so no supporting copy in light mode met WCAG 1.4.3. And `secondary`, the
strongest supporting role, was the LIGHTEST of the three, so it carried the
least contrast: a breadcrumb moving muted -> secondary on hover lost contrast
(2.94:1 -> 2.60:1). The W8 ladder it replaces was levelled to APCA Lc 45
against a dark page ground; Lc 45 is not a 4.5:1 pass, and the ordering it
claims does not reproduce on the light root.

The new values hold the existing OKLCH chroma and hue (`C 0.0116`, `h 286.1`)
so the cool-neutral tint is unchanged, and move in uniform 3-L steps — 1.6x
the separation the ladder had. `secondary` now carries the most contrast in
light, matching dark. 164 of 360 measured cells move from fail to pass, no
cell regresses, `--ds-color-text-primary` and the heading inks are untouched,
and all three dark scopes are byte-identical.

Supporting text on `--ds-surface-panel-bg` / `--ds-color-bg-tertiary`
(`#e5e5e5`) still reads 4.20:1. Closing it from the ink side would put
`secondary` within 2 OKLCH L of `--ds-color-text-disabled`; it is a ground
question, tracked separately.
