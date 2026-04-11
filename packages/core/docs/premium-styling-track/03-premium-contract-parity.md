# Premium Contract Parity Matrix

Wave H3 deliverable. Defines the minimum expressive contract every
first-party vertical must support. World-class means parity of
expressive power, not identical visuals.

## Current Coverage (post-I6 — all gaps closed)

All three verticals now have full H3 contract parity.

| Category | Rottay | BitHire | Evnto |
|----------|:------:|:-------:|:-----:|
| Palette | FULL | FULL | FULL |
| Typography | FULL | FULL | FULL |
| Surfaces | FULL | FULL | FULL |
| Motion | FULL | FULL | FULL |
| Charts | FULL | FULL | FULL |
| Chrome: sidebar | FULL | FULL | FULL |
| Chrome: layout | FULL | FULL | FULL |
| Chrome: shell | FULL | FULL | FULL |
| Chrome: controls | FULL | FULL | FULL |
| Chrome: table | FULL | FULL | FULL |
| Dark-mode | Authored | Authored | Authored |
| State semantics | Authored | Authored | Authored |

433 green assertions, 0 skipped. Artifacts synced. dist verified.

### Gap History (all closed)

All gaps identified pre-I4 have been closed. See the wave commits for details:
- Rottay: I4 (palette, surfaces, controls, dark-mode, state semantics)
- BitHire: I5 (surfaces, layout, shell, controls, dark-mode, state semantics)
- Evnto: I6 (palette, surfaces, layout, shell, controls, table, dark-mode, state semantics)

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

## Gap Closure History (completed)

All gaps were closed in I4-I6. The table below is retained as historical reference.

| Vertical | Gap | Closed In |
|----------|-----|-----------|
| Rottay | Palette: semantic colors | I4 |
| Rottay | Surfaces: borderRadius, shadows, glass, gradients, overlays | I4 |
| Rottay | Controls: input + disabled treatment | I4 |
| BitHire | Surfaces: borderRadius, shadows, glass, gradients, overlays | I5 |
| BitHire | Layout: all 6 fields | I5 |
| BitHire | Shell: all 3 fields (intentionally minimal) | I5 |
| BitHire | Controls: buttonDefault, buttonGhost, disabled | I5 |
| Evnto | Palette: semantic colors | I6 |
| Evnto | Surfaces: shadows, glass, gradients, overlays | I6 |
| Evnto | Layout: all 6 fields | I6 |
| Evnto | Shell: all 3 fields (intentionally minimal) | I6 |
| Evnto | Controls: buttonDefault, buttonGhost, disabled | I6 |
| Evnto | Table: headerColor, headerFontWeight, headerFontSize | I6 |
| All three | Dark-mode authored chrome | I4-I6 |
| All three | State semantics (disabled + focus) | I4-I6 |

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
