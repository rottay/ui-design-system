# Premium Contract Parity Matrix

Wave H3 deliverable. Defines the minimum expressive contract every
first-party vertical must support. World-class means parity of
expressive power, not identical visuals.

## Current Coverage (measured against minimum contract)

Legend: FULL = all minimum fields present, PARTIAL = some fields present,
MISSING = category absent, count = fields present / fields required.

| Category | Rottay | BitHire | Evnto |
|----------|:------:|:-------:|:-----:|
| Palette | PARTIAL (6/10) | FULL (10/10) | PARTIAL (6/10) |
| Typography | FULL (6/6) | FULL (6/6) | FULL (6/6) |
| Surfaces | PARTIAL (1/6) | PARTIAL (1/6) | PARTIAL (2/6) |
| Motion | FULL (13/13) | FULL (13/13) | FULL (13/13) |
| Charts | FULL (6/6) | FULL (6/6) | FULL (6/6) |
| Chrome: sidebar | FULL (16/16) | FULL (16/16) | FULL (16/16) |
| Chrome: layout | FULL (6/6) | MISSING (0/6) | MISSING (0/6) |
| Chrome: shell | FULL (3/3) | MISSING (0/3) | MISSING (0/3) |
| Chrome: controls | PARTIAL (4/5) | PARTIAL (2/5) | PARTIAL (2/5) |
| Chrome: table | FULL (4/4) | FULL (4/4) | PARTIAL (1/4) |
| Dark-mode | Not authored | Not authored | Not authored |
| State semantics | Not authored | Not authored | Not authored |

### Key Gaps By Vertical

**Rottay (10 missing fields):**
- Palette: missing success, warning, error, info
- Surfaces: missing borderRadius, shadows, glass, gradients, overlays
- Controls: missing input treatment

**BitHire (17 missing fields):**
- Surfaces: missing borderRadius, shadows, glass, gradients, overlays
- Layout: entirely missing (6 fields)
- Shell: entirely missing (3 fields)
- Controls: missing buttonDefault, buttonGhost, buttonPrimary.border/shadow

**Evnto (23 missing fields):**
- Palette: missing success, warning, error, info
- Surfaces: missing shadows, glass, gradients, overlays
- Layout: entirely missing (6 fields)
- Shell: entirely missing (3 fields)
- Controls: missing buttonDefault, buttonGhost, buttonPrimary.border/shadow
- Table: missing headerColor, headerFontWeight, headerFontSize

**All three share:** missing surfaces (shadows/glass/gradients/overlays),
no authored dark-mode chrome, no authored state semantics.

**BitHire and Evnto share:** missing buttonDefault/buttonGhost,
incomplete buttonPrimary (border/shadow).

## Required Minimum Contract

Every first-party vertical theme must define all of the following.
Omission is only acceptable as an explicit "none/minimal" declaration,
not by absence.

### Palette

- Primary color + full scale (light and dark)
- Secondary color + scale
- Accent color
- Semantic colors: success, warning, error, info
- Dark-mode palette strategy (authored, not just derived)

### Typography

- Base font family
- Heading font family
- Mono font family (for data/system surfaces)
- Heading weight bias
- Heading letter spacing
- Label style (uppercase/sentence/capitalize)

### Surfaces

- Density scale
- Border radius scale (sm/md/lg/xl)
- Elevation philosophy (shadows)
- Glass/gradient/overlay philosophy (if applicable, or explicit "none")

### Motion

- Intensity level
- Entrance style
- Hover lift and scale
- Spring philosophy (on/off, tension, friction)
- Skeleton loading style
- Stagger behavior

### Charts

- Line style
- Tooltip style
- Gradient fill philosophy
- Dot visibility
- Mount animation duration

### Chrome: Sidebar

- Background
- Text + muted text
- Group styling (font size, weight, color, letter spacing)
- Item styling (font size, weight, color active, bg active, bg hover)
- Icon size
- Padding rhythm

### Chrome: Layout

- Page background
- Header background + border or separation strategy
- Header backdrop treatment (blur/solid/none)
- Sider background + border

### Chrome: Shell

- Grid/atmosphere treatment
- If a vertical does not want visible shell chrome, it must declare
  that intentionally (e.g. gridOpacity: 0), not by omission.

### Chrome: Controls

- Primary button (bg, bgHover, color, border, shadow)
- Secondary button (bg, bgHover, color, border)
- Default button (bg, bgHover, color, border)
- Ghost button (bg, bgHover, color)
- Input (bg, border, borderFocus, shadowFocus)

### Chrome: Table

- Header background
- Header text color
- Header font weight
- Header font size

### Dark-Mode

Every vertical must explicitly answer:

1. Is dark mode supported? (yes/no)
2. If yes, is it authored or derived?
3. Which chrome categories have dark-specific values?

### State Semantics

Every vertical must provide a coherent story for:

- Success, warning, error, info colors
- Disabled treatment
- Focus treatment

## Gap Closure Required (Implementation Waves)

| Vertical | Gap | Target Wave |
|----------|-----|-------------|
| Rottay | Palette: semantic colors (success/warning/error/info) | I4 |
| Rottay | Surfaces: borderRadius, shadows, glass, gradients, overlays | I4 |
| Rottay | Controls: input treatment | I4 |
| BitHire | Surfaces: borderRadius, shadows, glass, gradients, overlays | I5 |
| BitHire | Layout: all 6 fields | I5 |
| BitHire | Shell: all 3 fields | I5 |
| BitHire | Controls: buttonDefault, buttonGhost, buttonPrimary completeness | I5 |
| Evnto | Palette: semantic colors | I6 |
| Evnto | Surfaces: shadows, glass, gradients, overlays | I6 |
| Evnto | Layout: all 6 fields | I6 |
| Evnto | Shell: all 3 fields | I6 |
| Evnto | Controls: buttonDefault, buttonGhost, buttonPrimary completeness | I6 |
| Evnto | Table: headerColor, headerFontWeight, headerFontSize | I6 |
| All three | Dark-mode authored chrome | I4-I6 |
| All three | State semantics (success/warning/error/info/disabled/focus) | I4-I6 |

## Acceptance Criteria

A vertical overhaul wave (I4/I5/I6) should not be considered complete until:

1. All categories in the minimum contract are defined in the authored
   BrandTheme source
2. Tests verify presence of required categories
3. Generated CSS includes all contract-required variables
4. Docs call out any intentionally richer flagship areas separately
   from required parity

## What This Document Does NOT Define

- The exact visual values (see H4 vertical style briefs)
- Implementation order beyond gap closure targets
- TypeScript type changes (deferred to I2)
