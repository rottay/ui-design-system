# Customization Model: Vertical Theme vs Tenant Appearance

Wave H2 deliverable. Separates two concerns that are currently blurred:
code-owned vertical identity and DB-owned tenant customization.

## Core Principle

Maximum customization should exist at the system level.
Maximum DB exposure should be layered and safe.
These are not the same thing.

## Three-Layer Model

### 1. Vertical Theme

**Owner:** codebase (design-system repo)

**Purpose:** Define the full authored visual system for a vertical or
first-party product. This is where the deepest premium identity belongs.
It can legitimately carry hundreds of decisions.

**Scope:**

- Palette (full color system, light + dark)
- Typography (families, scale, weight strategy, heading/label policies)
- Surfaces (elevation, material posture, glass/gradient)
- Motion (philosophy, entrance, hover, spring, skeleton, count-up)
- Charts (line style, tooltip, fill, color scheme)
- Chrome: sidebar (full sidebar identity)
- Chrome: layout (page background, header, sider)
- Chrome: shell (grid, atmosphere)
- Chrome: controls (button variants, input treatment)
- Chrome: table (header, rows, density)
- Engine bridge (DaisyUI variables, engine-specific values)
- Dark-mode authored strategy
- Component family policies
- Density and spacing defaults

### 2. Tenant Appearance: General

**Owner:** DB, App Platform UI

**Purpose:** Safe, high-signal, high-visibility customization for most
tenant admins. Visible in screenshots, understandable by a non-designer,
hard to break.

**Scope:**

| Category | Fields |
|----------|--------|
| Palette | primary, secondary, accent, backgroundMode (light/dark/auto) |
| Typography | fontFamilyBase, fontFamilyHeading, scale (compact/normal/large) |
| Shape | radiusScale, buttonStyle (sharp/soft/pill) |
| Surfaces | elevation (flat/soft/elevated), density (compact/normal/spacious) |
| Navigation | sidebarTone (subtle/strong/inverse) |
| Motion | level (minimal/normal/expressive) |
| Media | logo, logoMark, favicon |
| Data | chartColorFamily, tableDensity (compact/normal/spacious) |

### 3. Tenant Appearance: Advanced

**Owner:** DB, App Platform UI, expert mode / guarded users

**Purpose:** Fine-grained tuning without requiring code edits. Role-gated,
validated, previewed, reversible, audited.

**Scope:**

| Category | Fields |
|----------|--------|
| Chrome: sidebar | Exact sidebar values (bg, text, item sizing, group styling) |
| Chrome: layout | Header/backdrop/sider values |
| Chrome: shell | Grid/atmosphere treatment |
| Chrome: controls | Per-control hover/active/focus values |
| Chrome: table | Header/row styling |
| Motion | Timing knobs, spring tuning |
| Charts | Behavior toggles, tooltip style |
| Dark mode | Dark-specific overrides |
| Raw overrides | Allowlisted `--ds-*` token overrides (namespace-restricted, validated) |

## Merge Chain

```
DS base
  -> vertical baseline
    -> Vertical Theme
      -> Tenant Appearance: General
        -> Tenant Appearance: Advanced
          -> runtime safety normalization
            -> generated artifacts / applied CSS
```

Each layer can only override what the layer above provides. Later layers
do not wipe earlier layers — they spread on top.

## Ownership Matrix

### Code-Owned (Vertical Theme)

- Brand language and premium identity
- Motion philosophy and animation system
- Shell behavior and layout strategy
- Complex chrome (sidebar rhythm, header treatment)
- Cross-component consistency rules
- Engine bridging and DaisyUI mapping
- Complex dark-mode behavior
- Flagship premium visual identity

### DB-Owned: General (safe to expose)

- Major colors (primary, secondary, accent)
- Font family selection
- Radius and density presets
- Surface/elevation presets
- Logo and media assets
- Major button/card/sidebar feel presets
- Light/dark preference
- Chart color family

### DB-Owned: Advanced (expose carefully)

- Detailed sidebar and layout values
- Hover/active/focus specifics
- Table tuning
- Animation timing knobs
- Chart tuning
- Allowlisted raw token overrides
- Dark-mode overrides

## Validation Rules

### General Tier

- Strict schemas with preset ranges
- Contrast checks on color combinations
- Safe defaults for every field
- No unknown fields accepted

### Advanced Tier

- Allowlisted keys only
- Namespace restrictions (`--ds-*` prefix required)
- Min/max ranges on numeric values
- Dark-mode completeness checks
- Preview-required before publish
- Audit trail on changes

## App Platform UI Recommendation

Do not start with one huge JSON editor. Use two sections:

**General section:** Brand, Typography, Shape, Surfaces, Buttons,
Navigation, Data Display, Motion Level

**Advanced section:** Sidebar, Layout, Shell, Controls, Table, Charts,
States, Dark Mode, Raw Override JSON

## What This Document Does NOT Define

- Exact TypeScript shapes (deferred to I2 implementation wave)
- Runtime merge implementation (already exists from Waves A-F + G1)
- Database schema (app-platform responsibility)
- UI components for the admin editor (app-platform responsibility)
