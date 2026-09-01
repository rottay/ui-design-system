# Badge / Chip / Pill ownership

This directory owns the shared compact-label family for the Modern engine. `Badge`,
`Chip`, and `Pill` are structural roles of one primitive (`kind`), not three visual
implementations that may drift.

## Design-system ownership

- Stable anatomy: root, trigger/content, spinner, avatar, icon, dot, label, count,
  localized close/remove control, and overlay anchor.
- Native interaction and accessibility behavior: selection, keyboard activation,
  disabled/loading state, focus-visible, RTL logical positioning, reduced motion,
  forced colors, touch targets, and responsive/container behavior.
- All paint, geometry, typography, density, border, shadow, and motion through
  `--ds-badge-*` channels with semantic/global compiler-owned fallbacks.
- Semantic icons. Product code must not substitute ad-hoc SVG glyphs for DS actions.

## Product ownership

- Meaning: `tone`, `kind`, selected state, count, and whether the label is removable.
- Localized visible copy and accessible names (`removeLabel`, `loadingText`, and
  `aria-label`). When the caller supplies none, the close control and the busy
  trigger fall back to the DS catalogue (`common.remove` / `common.loading`,
  all five locales) with the documented English floor — an unnamed control is
  never an acceptable default.
- Controlled state and handlers. Product code must not target `.rottay-badge*` with
  application CSS or provide inline paint.

## Tenant and locale ownership

- A vertical-owned static `BrandTheme` or tenant-owned DB theme changes the
  same JSX through compiled semantic, personality, and dedicated `chrome.badge`
  tokens. `chrome.filterPill` remains only a backward-compatible fallback.
- Tenant and locale are independent axes. The required evidence matrix is BitHire
  and The Management Miami across English, Spanish, and Arabic/RTL.
- A passing white-label check requires material divergence in typography, shape,
  density, surfaces, frames, state treatment, shadow, and motion—not only a primary
  color swap.

## Non-negotiable constraints

- No colored/chromatic left rails.
- No physical left/right spacing for bidirectional anatomy.
- No `transition: all`, JS hover paint, inaccessible faux buttons, or hardcoded
  user-facing strings.
- Brand personality belongs in compiler inputs/tokens; recruiting-specific meaning
  belongs in product composition, never in this primitive.
