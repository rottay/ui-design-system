---
"@rottay/design-system": patch
---

WO-FAM-01 / R107-RUN-02. `--ds-radius-button`, the only channel
`shape.button-style` declares, now reaches the corner it is supposed to decide.

Both compilers emitted it correctly and no skin read it: the Modern button
paints through `--ds-button-{size}-radius`, and the base layer seeded those five
channels straight from the surface ramp, so the decision channel sat beside the
live path instead of above it. A profile default, which reaches the alias alone
by design, therefore painted nothing at all.

The decision is now the layer between the per-size channels and the ramp:
`--ds-button-{size}-radius: var(--ds-radius-button, var(--ds-button-{size}-border-radius))`.
For that to leave the ramp standing, `--ds-radius-button` states no default —
`initial` rather than `var(--ds-radius-md)` — because one channel cannot carry
five ramp steps, and a seeded alias would flatten xs, sm, lg and xl onto the md
corner. The two readers that had no fallback (`--radius-field` in the Modern
framework projection, and the `borders.radius.button` token mirror) now name
`var(--ds-radius-md)` explicitly and keep the value they had.

Measured with the cascade probe on the source-composed bundle: dialling
`--ds-radius-button` moves the painted `border-top-left-radius` on rottay
(10px), evnto (14px) and the tenant-less document (8px), and the intermediate
`--ds-button-md-radius` moves with it. At rest nothing moves: a full
before/after run over four scopes and both themes differs in exactly six rows,
all of them the alias's own resting readout, and in zero painted longhands.
BitHire is deliberately unmoved — its own `chrome.controls.buttonGeometry.radius`
leaf writes the five per-size channels, which is the precedence this wiring
preserves and the subject of a separate open adjudication.

Authored per-size geometry still wins, the surface ramp still decides when
nobody chose a silhouette, and no tenant-authored reference cycle becomes
admissible: WO-DER-03's refusal is unchanged, and this wiring adds no override
path a tenant can point at itself.
