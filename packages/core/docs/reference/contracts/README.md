# Contracts - Rottay Design System

Public type contracts for the design system. These define the shapes that
consuming apps, runtime providers, and the brand compiler all agree on.

## Structure

```
contracts/
  common/           # Shared primitives: Size, Variant, BaseComponentProps, mixins
  components/       # Backward compat: WithChildrenProps, BaseComponentProps re-export
  engine/           # EngineName, EngineAwareProps, EngineConfig, EngineCapabilities
  themes/           # ThemeConfig, ThemeContextValue, BrandTheme, BrandCompiler
  tenants/          # TenantConfig, TenantBranding, TenantTokenOverrides
  tokens/           # DesignTokens, PersonalityTokens, SurfaceTokens, MotionTokens
  product-profiles/ # ProductProfile, ProductProfileKey
  extensions/       # Universal Extension System (16 categories)
  index.ts          # Barrel re-exporting all contracts
```

## Key Types

### BrandTheme (canonical premium visual source)

The single source of truth for premium visual identity. Merge precedence:
DS base -> vertical baseline -> BrandTheme -> generated artifacts.

Categories: palette, typography, surfaces, motion, charts, chrome, engineBridge.

### TenantConfig (white-label root)

Flat JSON-serializable tenant configuration. Holds identity (slug, name, plan,
features, locale, logos) plus an optional inline `brandTheme` object.
Backward-compatible `branding`, `personality`, and `tokenOverrides`
fields remain for existing consumers.

### DesignTokens (resolved token graph)

Full resolved token set consumed by `useTokens()`. Includes colors, spacing,
typography, borderRadius, shadows, glass, gradients, surface, motion, and
personality dimensions.

### PersonalityTokens (5 visual dimensions)

Animation, chart, typography, accent, and card personality. These define the
"feel" of a product (formal, playful, expressive) independently of colors.

### ComponentExtensions (universal extension system)

16 independently optional extension categories (slots, columns, actions,
filters, rendering, selection, sorting, pagination, motion, layout, data,
drag-and-drop, export, keyboard, lifecycle, accessibility).

## Usage

All contracts are re-exported from the package root:

```typescript
import type { BrandTheme, TenantConfig, DesignTokens, EngineName } from '@rottay/design-system';
```

Primitive component props (ButtonProps, AvatarProps, etc.) live next to their
component implementations, not in this directory.
