# Token System Catalog

Source: `ui-design-system/packages/core/src/tokens/`

The token layer is the single source of truth for all visual values in the design system. Tokens are maintained in two parallel formats that reference the same `--ds-*` CSS custom properties.

---

## Dual Format Architecture

### CSS Custom Properties (`tokens/css/`)

Consumed by stylesheets and CSS-in-JS at runtime.

```ts
import '@rottay/design-system/tokens/css/index.css';
```

### TypeScript Mirrors (`tokens/ts/`)

Type-safe references to the same CSS variables for use in component logic, inline styles, and test utilities.

```ts
import { colors, spacing, buttonTokens } from '@rottay/design-system/tokens';
```

---

## Token Tiers

Tokens are organized into three hierarchical tiers:

### 1. Base Tokens (Foundation)

Source: `tokens/ts/base/` and `tokens/css/base/`

Global primitives that all component tokens and tenant overrides build upon.

| Category | CSS Variable Prefix | TS Export | Description |
|----------|-------------------|-----------|-------------|
| Colors | `--ds-color-*` | `colorPrimary`, `colorSecondary`, `colorNeutral`, `colorSuccess`, `colorWarning`, `colorError`, `colorInfo` | 10-step scales (50-900) for semantic palettes, neutral gray scale, common colors (black/white), alpha transparency overlays |
| Spacing | `--ds-spacing-*` | `spacingScale`, `spacingNamed`, `spacingGutter` | 4px grid system. Numeric scale (0-96), semantic aliases (xxxs-5xl), contextual layout spacing (gutter, section, container) |
| Typography | `--ds-font-*` | `fontFamily`, `fontSize`, `fontSizeHeading`, `fontWeight` | Font families (base, heading, mono, display), sizes (xs-9xl + h1-h6), weights (thin-black), line heights, letter spacing, pre-composed text styles |
| Shadows | `--ds-shadow-*` | `shadow`, `shadowPrimary`, `shadowSecondary`, `shadowSuccess`, `shadowWarning`, `shadowError` | Elevation scale (xs-3xl + inner), semantic colored shadows, component-specific shadows (card, button, input, overlay, navigation), focus ring shadows |
| Borders | `--ds-border-*`, `--ds-radius-*` | `borderWidth`, `radius`, `borderStyle` | Widths (0-8 + semantic: none/thin/default/medium/thick), radii (none-full + component-specific: button/input/card/modal/badge/avatar), styles, colors, dividers, outlines |
| Z-Index | `--ds-z-index-*` | `zIndex`, `zIndexNavigation`, `zIndexMenu`, `zIndexOverlay`, `zIndexFeedback` | Global elevation scale (base through max), domain sub-scales (navigation, menus, overlays, feedback, form dropdowns) |

### 2. Component Tokens

Source: `tokens/ts/components/` and `tokens/css/components/`

Per-component semantic variables built on base tokens, covering sizes, variants, states, and transitions.

| Component Token Set | TS Export | CSS File |
|-------------------|-----------|----------|
| Avatar | `avatarTokens` | `avatar.css` |
| Badge | `badgeTokens` | `badge.css` |
| Button | `buttonTokens` | `button.css` |
| Card | `cardTokens` | `card.css` |
| Checkbox | `checkboxTokens` | `checkbox.css` |
| Collapse | `collapseTokens` | `collapse.css` |
| Icon | `iconTokens` | `icon.css` |
| Input | `inputTokens` | `input.css` |
| List | `listTokens` | `list.css` |
| Modal | `modalTokens` | `modal.css` |
| QRCode | `qrcodeTokens` | `qrcode.css` |
| Radio | `radioTokens` | `radio.css` |
| Rate | `rateTokens` | `rate.css` |
| Select | `selectTokens` | `select.css` |
| Space | `spaceTokens` | `space.css` |
| Spinner | `spinnerTokens` | `spinner.css` |
| Tag | `tagTokens` | `tag.css` |
| Timeline | `timelineTokens` | `timeline.css` |
| Toggle | `toggleTokens` | `toggle.css` |

### 3. Tenant Tokens

Source: `tokens/ts/tenants/` and `tokens/css/tenants/`

Brand-specific CSS variable overrides scoped by tenant.

| Tenant | TS Export | CSS File | Selector |
|--------|-----------|----------|----------|
| Rottay (default) | `rottayTokens` | `rottay.css` | `html[data-tenant='rottay']` |
| BitHire | (CSS-only at runtime) | `bithire.css` | `html[data-tenant='bithire']` |
| Evnto | (CSS-only at runtime) | `evnto.css` | `html[data-tenant='evnto']` |

Additional tenants apply overrides via CSS class scoping at runtime rather than the TS layer.

---

## CSS Layer Architecture

The CSS entry point (`tokens/css/index.css`) uses `@layer` for cascade priority:

```
@layer rottay-reset, rottay-tokens, rottay-components, rottay-engines, rottay-tenants, rottay-personality, rottay-responsive;
```

| Layer | Priority | Content |
|-------|:--------:|---------|
| `rottay-reset` | 0 | Ant Design base styles (apps import separately) |
| `rottay-tokens` | 1 | Foundation + default theme (`base/index.css` + `themes/default.css`) |
| `rottay-components` | 2 | Component-scoped semantic variables (19 component CSS files) |
| `rottay-engines` | 3 | Engine-specific class mappings (`engines/index.css`) |
| `rottay-tenants` | 4 | Tenant variable overrides (~200-500 lines each) |
| `rottay-personality` | 5 | Cross-engine personality-driven CSS rules |
| `rottay-responsive` | 6 | Responsive overrides |

---

## Per-Tenant CSS Entry Points

For tree-shaking, import only the tenant you need instead of the full bundle:

| Entry Point | Content |
|------------|---------|
| `tokens/css/index.css` | Full bundle (all tenants, backward-compatible) |
| `tokens/css/index-all.css` | Alias for full bundle |
| `tokens/css/rottay.css` | Base + Rottay tenant only |
| `tokens/css/bithire.css` | Base + BitHire tenant only |
| `tokens/css/evnto.css` | Base + Evnto tenant only |

---

## Engine Token Mapping

Each engine provides its own base values for visual properties. These are resolved via `useTokens()` in a 4-layer cascade:

```
Engine Defaults -> Product Profile -> Tenant Config -> Component Props
```

| Token | Classic (Ant Design) | Modern (DaisyUI) | Rustic (Vanilla) |
|-------|---------------------|------------------|-----------------|
| `borderRadius.sm` | 4px | 8px | 2px |
| `borderRadius.lg` | 8px | 16px | 4px |
| `shadows.md` | Corporate multi-layer | Bold single shadow | Whisper shadow |
| `surface.borderWidth` | 1px | 0 | 1px |
| `surface.useGradients` | false | true | false |
| `surface.useGlass` | false | true | false |
| `motion.hover` | 150ms ease | 200ms cubic-bezier | 100ms ease |
| `motion.transform` | none | translateY(-1px) | none |
| `densityScale` | 1.0 | 1.05 | 1.0 |

Engine-specific token resolution is defined in `src/core/hooks/tokens/engine-tokens.ts`.

---

## Typography Scale

Source: `tokens/typography-scale.ts`

A hardcoded Geist-based typography scale with concrete rem values for inline `style` props and canvas/SVG rendering (where CSS variables are unavailable).

| Preset | Font Size | Weight | Line Height |
|--------|-----------|--------|-------------|
| `pageTitle` | 2.25rem | 700 | 1.2 |
| `sectionTitle` | 1.5rem | 600 | 1.3 |
| `subsection` | 1.25rem | 600 | 1.3 |
| `cardTitle` | 1rem | -- | -- |
| `body` | -- | -- | -- |
| `bodySmall` | -- | -- | -- |
| `caption` | -- | -- | -- |
| `code` | -- | -- | -- |
| `kpiValue` | -- | -- | -- |
| `kpiLabel` | -- | -- | -- |

Personality-level adjustments (headingWeightBias, labelStyle, letterSpacing) are layered on top via `getPersonalityTypography()`.

---

## Usage Patterns

### Direct import (tree-shakeable)

```ts
import { colorPrimary, spacing, buttonTokens } from '@rottay/design-system/tokens';

const style = {
  color: colorPrimary[500],
  padding: spacing.md,
  borderRadius: buttonTokens.radius.md,
};
```

### Combined introspection object

```ts
import tokens from '@rottay/design-system/tokens';

console.log(tokens.base.colors);
console.log(tokens.components.button);
console.log(tokens.tenants.rottay);
```

### Dark mode

Tenant CSS supports dark mode via:
- `html[data-tenant='<slug>'][data-theme='dark']`
- `html[data-tenant='<slug>'].dark`
- `@media (prefers-color-scheme: dark)` (when no explicit theme attribute)
