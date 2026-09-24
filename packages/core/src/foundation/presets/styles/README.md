# `foundation/presets/styles` — the first-party verticals' own style references

WO-DER-09 step 2. Each first-party vertical preset is now a style reference plus its own
brand/default data (`../verticals/<vertical>/document`, a v3 document). The style-class rows
it used to state moved here verbatim, as registered style content:

| Style | Referenced by | Rows | Source |
|---|---|---|---|
| `technical-dense@1` | bithire | 19 | bithire's preset (WO-DER-06, itself WO-DER-07's `product-dense` candidate) minus its three departures |
| `structural-neutral@1` | rottay, evnto | 18 | the structural-neutral decision set the two presets shared byte for byte |

Each vertical's sidebar tone travels on its own style reference (DT ruling A on the sidebar-tone
amendment): bithire `inverse`, rottay and evnto `subtle`.

## The named, bounded migration exception

This folder is the WO-DER-09 ficha's named exception: preset style DATA beside the current vertical
data, and nothing else.

- **Boundary.** JSON documents and manifests only, each exported raw. The style registry
  (`contracts/theme/runtime/styles/composition/registry`) is the one owner that defines and
  validates them, through `defineThemeStyle` (the digest law) and the partition, so the
  unknown-document boundary is unchanged: nothing here is admitted without passing the registry.
- **Dependency direction, confirmed before the edge was written.** The registry imports this
  folder (contracts -> foundation/presets); this folder imports nothing from contracts. A trial of
  that exact edge ran `structure:check`: 0 findings, "no new structural debt".
- **It moves ONCE, with the verticals, under RET-04.** It never races that move: no blanket
  legacy-root exemption, no identity-baseline widening, no global relocation now, no permanent
  forwarding wrapper.

## bithire's three departures are a restatement, not drift

bithire's own document still states `shape.radius-scale: 0.8`, `density.mode: compact` and
`surfaces.elevation-posture: soft`. They are the vertical's DELIBERATE departures from its own
profile (`experience.profile: rottay/bithire-technical@1` expands to 0.85, `normal` and `flat`).
Explicit statements win over the profile. As style rows they would be `preset-inherited` (rank 0)
under `profile-derived` (rank 1), and the profile would silently win. So they stay the vertical's
explicit default data (DT ruling, option A). `technical-dense@1` does not carry them, and the door
resolves the composition deterministically: the explicit row wins.

The proof lives in `../verticals/tests/style-split.test.ts`. Each preset recomposes its pre-split
decisions exactly (pinned canonical sha256), is admitted to the byte-identical patch, and renders
the committed artifact byte for byte. Dropping bithire's departures changes its patch.
