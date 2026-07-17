# Contracts - Rottay Design System

Public type contracts for the design system. These define the shapes that
consuming apps, runtime providers, and the brand compiler all agree on.

## Structure

```
foundation/contracts/
  kernel/
    common/           # Shared primitives and component mixins
    engine-identity/  # Supplier-neutral engine names
    product-profile-identity/ # Stable product-profile keys
    responsive/       # Breakpoint and adaptive-value contracts
    spatial/          # Data-only spatial scene vocabulary
    tokens/           # DesignTokens, personality and extension contracts
    verticals/        # Vertical and motion-profile vocabulary
  runtime/
    components/       # Cross-component runtime contracts
    effects/          # Effect policy contracts
    engine/           # Engine-aware runtime contracts
    errors/           # Runtime error vocabulary
    motion/           # Motion policy contracts
  composition/
    components/       # Backward-compatible component base types
    tenants/          # Tenant, product-profile and theme contracts
  index.ts            # Stable package-root aggregation surface
```

## Key Types

### BrandTheme (code-owned premium visual source)

The single source of truth for premium visual identity. Merge precedence:
DS base -> vertical baseline -> BrandTheme -> generated artifacts.

Published customer writes use the bounded `TenantThemeDocument` schema stored
in the canonical tenancy DB. They are validated and server-compiled into the
exact SSR/hydration artifact; `BrandTheme` is not an unrestricted DB write
contract.

Categories: palette, typography, surfaces, motion, charts, chrome, engineBridge.

### TenantConfig (runtime/compat root)

Flat JSON-serializable tenant configuration. Holds identity (slug, name, plan,
features, locale, logos) plus compatibility visual fields. Published customer
visual authority comes from a compiled `TenantThemeDocument` artifact;
backward-compatible `brandTheme`, `branding`, `personality`, `appearance` and
`tokenOverrides` fields remain readable at compatibility boundaries.

### DesignTokens (resolved token graph)

Full resolved token set consumed by `useTokens()`. Includes colors, spacing,
typography, borderRadius, shadows, glass, gradients, surface, motion, and
personality dimensions.

### PersonalityTokens (5 visual dimensions)

Animation, chart, typography, accent, and card personality. These define the
"feel" of a product (formal, playful, expressive) independently of colors.

### Reserved compatibility surface

<!-- GAT07-CLAIM component-extensions: reserved-deprecated; runtime=unimplemented; affirmative-behavior=false; owner=DS-IMP-021 -->

GAT07-CONTRACT component-extensions: symbols=[ComponentExtensions, ExtensionHelpers, EngineAwareProps.extensions]; disposition=reserved-deprecated; runtime-status=unimplemented; affirmative-behavior=false; production-consumers=0; executable-assertions=0; owner=design-system-program/DS-IMP-021; target-phase=2A.

The generated contract above is authoritative. Prefer evidenced
component-owned props, compounds, and slots.

## Usage

All contracts are re-exported from the package root:

```typescript
import type { BrandTheme, TenantConfig, DesignTokens, EngineName } from '@rottay/design-system';
```

Primitive component props (ButtonProps, AvatarProps, etc.) live next to their
component implementations, not in this directory.
