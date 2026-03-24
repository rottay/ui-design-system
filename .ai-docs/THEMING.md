# Theming Reference

Complete guide to the Rottay Design System theming architecture: tokens, personality, product profiles, tenants, dark mode, and CSS variable system.

---

## 4-Layer Resolution Model

Tokens resolve through four layers, each overriding the previous:

```
Foundation (DS defaults)
  -> Engine (classic/modern/rustic token overrides)
    -> Product Profile (personality + tokenOverrides for the domain)
      -> Tenant Config (branding + personality + tokenOverrides per customer)
```

This is implemented in the `useTokens()` hook at:
`src/core/hooks/tokens/index.ts`

### Layer 1: Foundation

Hard-coded defaults shared by all engines. Includes color scales (CSS variables), spacing scale, typography scale, and default personality tokens.

Colors use CSS custom properties (`var(--ds-color-primary)`, etc.) so tenants can override them without JS changes.

### Layer 2: Engine

Each engine provides its own values for borderRadius, shadows, surface tokens, and motion tokens. See `src/core/hooks/tokens/engine-tokens.ts`.

| Token | Classic | Modern | Rustic |
|-------|---------|--------|--------|
| `borderRadius.sm` | `4px` | `8px` | `2px` |
| `borderRadius.md` | `6px` | `12px` | `4px` |
| `borderRadius.lg` | `8px` | `16px` | `6px` |
| `borderRadius.xl` | `12px` | `24px` | `8px` |
| `borderRadius.full` | `9999px` | `9999px` | `9999px` |
| `shadows.sm` | Multi-layer corporate | Soft single | Whisper thin |
| `shadows.lg` | Deep corporate | Bold dramatic | Gentle thin |
| `surface.borderWidth` | `1px` | `0` | `1px` |
| `surface.borderStyle` | `solid` | `none` | `solid` |
| `surface.useGradients` | `false` | `true` | `false` |
| `surface.useGlass` | `false` | `true` | `false` |
| `motion.hover` | `150ms ease` | `200ms cubic-bezier` | `100ms ease` |
| `motion.transform` | `none` | `translateY(-1px)` | `none` |
| `motion.spring` | `ease` | `cubic-bezier(0.34,1.56,0.64,1)` | `ease` |
| `motion.durationScale` | `1.0` | `1.1` | `0.9` |
| `densityScale` | `1.0` | `1.05` | `1.0` |

### Layer 3: Product Profile

Product profiles tune the visual personality for a specific product domain. They override engine tokens and personality tokens.

### Layer 4: Tenant Config

The final layer. Tenant branding, token overrides, and personality overrides take highest precedence.

---

## Product Profiles

Product profiles sit between the engine and the tenant. They express product mood and interaction density without encoding per-page behavior.

Source: `src/theme/product-profiles/index.ts`

### Registered Profiles

| Key | Label | Description |
|-----|-------|-------------|
| `generic.default` | Generic Default | Safe baseline for products without a domain-specific tone |
| `events.organizer` | Events Organizer | Expressive, media-first, spacious for event operations |
| `recruiting.operator` | Recruiting Operator | Compact, controlled, information-dense for recruiting workflows |
| `platform.admin` | Platform Admin | Neutral admin profile for operational dashboards |

The type `ProductProfileKey` is an open union, so product teams can add local profiles without a DS release:

```ts
type ProductProfileKey =
  | 'generic.default'
  | 'events.organizer'
  | 'recruiting.operator'
  | 'platform.admin'
  | (string & {});  // open for extension
```

### Profile Structure

```ts
interface ProductProfile {
  key: ProductProfileKey;
  label: string;
  description?: string;
  personality?: Partial<PersonalityTokens>;   // Visual personality overrides
  tokenOverrides?: TenantTokenOverrides;       // borderRadius, shadows, surface, motion, density
  surfaceDefaults?: ProductProfileSurfaceDefaults;  // listView, density, schedulerView
}
```

### Profile Comparison

| Property | generic.default | events.organizer | recruiting.operator | platform.admin |
|----------|----------------|-----------------|--------------------| ---------------|
| animation.intensity | 0.45 | 1.05 | 0.35 | 0.4 |
| animation.entrance | fade | slideUp | fade | fade |
| animation.entranceDuration | 220ms | 280ms | 160ms | 180ms |
| animation.hoverLift | 1px | 3px | 0px | 1px |
| animation.useSpring | false | true | false | false |
| animation.pulseSpeed | normal | fast | slow | normal |
| animation.skeletonStyle | shimmer | shimmer | pulse | shimmer |
| animation.countUpEnabled | true | true | false | true |
| chart.lineStyle | sharp | smooth | sharp | sharp |
| chart.useGradientFill | false | true | false | false |
| chart.tooltipStyle | detailed | glass | detailed | detailed |
| typography.headingWeightBias | normal | heavier | heavier | normal |
| typography.labelStyle | sentence | capitalize | uppercase | sentence |
| accent.barPosition | top | top | left | top |
| accent.barStyle | solid | gradient | solid | solid |
| accent.iconContainerShape | rounded | circle | square | rounded |
| accent.badgeShape | rounded | pill | pill | rounded |
| card.defaultElevation | sm | md | sm | sm |
| card.hoverElevation | lift-one | lift-two | none | lift-one |
| card.showBorder | true | false | true | true |
| card.hoverTint | false | true | false | false |
| card.paddingDensity | normal | spacious | compact | normal |
| surfaceDefaults.listView | table | cards | table | table |
| surfaceDefaults.density | comfortable | spacious | compact | comfortable |
| surfaceDefaults.schedulerView | month | week | week | month |
| tokenOverrides.densityScale | - | 1.05 | 0.95 | - |
| tokenOverrides.borderRadius | - | 10/14/20/28px | - | - |

### Using a Profile

```tsx
<DesignSystemProvider productProfile="events.organizer">
  <App />
</DesignSystemProvider>
```

Or pass an inline profile object:

```tsx
<DesignSystemProvider productProfile={{
  key: 'my-custom-profile',
  label: 'My Custom',
  personality: {
    animation: { intensity: 0.8, entrance: 'spring' },
    card: { showBorder: false, hoverTint: true },
  },
}}>
  <App />
</DesignSystemProvider>
```

---

## PersonalityTokens

Personality tokens drive visual differentiation without engine coupling. Components read personality tokens (never the engine name) to produce distinct visual experiences.

Source: `src/core/types/tokens/personality.ts`

### Structure (5 dimensions, 32 properties)

```ts
interface PersonalityTokens {
  animation: AnimationPersonalityTokens;   // 12 properties
  chart: ChartPersonalityTokens;           // 7 properties
  typography: TypographyPersonalityTokens; // 3 properties
  accent: AccentPersonalityTokens;         // 5 properties
  card: CardPersonalityTokens;             // 5 properties
}
```

### animation (12 properties)

| Property | Type | Values | Description |
|----------|------|--------|-------------|
| `intensity` | `number` | `0` (none) to `1.5` (exaggerated) | General animation intensity multiplier |
| `staggerDelay` | `number` | milliseconds (e.g. `20`-`55`) | Delay between sequential list items |
| `staggerMax` | `number` | milliseconds (e.g. `120`-`320`) | Maximum total stagger duration |
| `entrance` | `string` | `'none'`, `'fade'`, `'slideUp'`, `'spring'`, `'bounce'` | Entrance animation style |
| `entranceDuration` | `number` | milliseconds (e.g. `160`-`280`) | Duration of entrance animation |
| `hoverLift` | `number` | pixels (e.g. `0`-`3`) | Hover translateY lift distance |
| `hoverScale` | `number` | scale factor (e.g. `1.0`-`1.015`) | Hover scale transform |
| `useSpring` | `boolean` | `true`/`false` | Use spring physics for transitions |
| `springTension` | `number` | e.g. `170`-`200` | Spring tension for react-spring |
| `springFriction` | `number` | e.g. `20`-`24` | Spring friction for react-spring |
| `pulseSpeed` | `string` | `'none'`, `'slow'`, `'normal'`, `'fast'` | Pulse speed for live indicators |
| `skeletonStyle` | `string` | `'pulse'`, `'shimmer'`, `'wave'` | Skeleton loading animation style |
| `countUpEnabled` | `boolean` | `true`/`false` | Enable KPI count-up animation |

### chart (7 properties)

| Property | Type | Values | Description |
|----------|------|--------|-------------|
| `animateOnMount` | `boolean` | `true`/`false` | Animate charts when first rendered |
| `mountDuration` | `number` | milliseconds (e.g. `600`-`950`) | Mount animation duration |
| `lineStyle` | `string` | `'sharp'`, `'smooth'`, `'step'` | Line interpolation style |
| `showDots` | `boolean` | `true`/`false` | Show data point markers |
| `useGradientFill` | `boolean` | `true`/`false` | Use gradient fills in area charts |
| `tooltipStyle` | `string` | `'minimal'`, `'detailed'`, `'glass'` | Tooltip appearance |
| `colorScheme` | `string` | `'default'`, `'pastel'`, `'vibrant'`, `'monochrome'`, `'accessible'` | Chart color palette |

### typography (3 properties)

| Property | Type | Values | Description |
|----------|------|--------|-------------|
| `headingWeightBias` | `string` | `'lighter'` (500), `'normal'` (600), `'heavier'` (700) | Heading font weight |
| `headingLetterSpacing` | `string` | CSS value (e.g. `'-0.01em'`, `'-0.02em'`) | Heading letter spacing |
| `labelStyle` | `string` | `'uppercase'`, `'sentence'`, `'capitalize'` | Label text transform |

### accent (5 properties)

| Property | Type | Values | Description |
|----------|------|--------|-------------|
| `barPosition` | `string` | `'top'`, `'left'`, `'none'` | Accent bar position on cards |
| `barThickness` | `number` | pixels (e.g. `3`-`4`) | Accent bar thickness |
| `barStyle` | `string` | `'solid'`, `'gradient'`, `'animated'` | Accent bar style |
| `iconContainerShape` | `string` | `'square'`, `'rounded'`, `'circle'`, `'none'` | Icon container shape |
| `badgeShape` | `string` | `'rounded'`, `'pill'`, `'square'` | Badge border-radius style |
| `dividerStyle` | `string` | `'solid'`, `'dashed'`, `'dotted'`, `'none'` | Divider line style |

### card (5 properties)

| Property | Type | Values | Description |
|----------|------|--------|-------------|
| `defaultElevation` | `string` | `'sm'`, `'md'`, `'lg'` | Card shadow at rest |
| `hoverElevation` | `string` | `'none'`, `'lift-one'`, `'lift-two'` | Card shadow change on hover |
| `showBorder` | `boolean` | `true`/`false` | Show card border at rest |
| `hoverTint` | `boolean` | `true`/`false` | Apply color tint on hover |
| `paddingDensity` | `string` | `'compact'`, `'normal'`, `'spacious'` | Card internal padding scale |

---

## Tenant Customization

Source: `src/core/types/tenants/index.ts`

### TenantConfig

```ts
interface TenantConfig {
  slug: string;                              // Unique identifier
  name: string;                              // Display name
  domain?: string;                           // Custom domain
  engine: EngineName;                        // Default engine
  theme: string;                             // Theme variant ('base', 'dark', etc.)
  locale?: SupportedLocale;                  // Default locale
  fallbackLocale?: SupportedLocale;          // Fallback locale
  plan: TenantPlan;                          // 'starter' | 'pro' | 'enterprise'
  features: string[];                        // Enabled feature flags
  branding: TenantBranding;                  // Visual branding
  personality?: Partial<PersonalityTokens>;  // Personality overrides
  tokenOverrides?: TenantTokenOverrides;     // Direct token overrides
  customTranslations?: Partial<LocaleTranslations>;  // Copy overrides
}
```

### TenantBranding

```ts
interface TenantBranding {
  logo?: string;           // Full logo URL
  logoMark?: string;       // Icon/mark logo URL
  favicon?: string;        // Favicon URL
  companyName: string;     // Company display name (required)
  primaryColor?: string;   // Primary brand color (hex)
  secondaryColor?: string; // Secondary brand color (hex)
  accentColor?: string;    // Accent color (hex)
}
```

When `primaryColor` is set, the DS generates a full 10-step color scale (50-900) using color mixing algorithms. The same happens for `secondaryColor` and `accentColor`.

### TenantTokenOverrides

```ts
interface TenantTokenOverrides {
  surface?: Partial<SurfaceTokens>;                        // borderWidth, borderStyle, useGradients, useGlass
  motion?: Partial<MotionTokens>;                          // hover, transform, spring, durationScale
  borderRadius?: Partial<Record<'sm'|'md'|'lg'|'xl', string>>;  // Override corner radii
  shadows?: Partial<Record<'sm'|'md'|'lg'|'xl', string>>;       // Override shadow values
  densityScale?: number;                                    // Spacing multiplier
}
```

---

## CSS Variable System

The design system uses CSS custom properties as the bridge between JS token resolution and CSS styling.

### How it works

1. The `DesignSystemProvider` renders a `<SystemCssVariablesBridge />` component
2. This bridge reads resolved tokens from `useTokens()` (which merges engine + profile + tenant)
3. It calls `resolvePersonalityCssVariables(tokens)` to compute CSS variable values
4. These are injected into `document.documentElement.style`
5. Components consume them via `var(--ds-*)` in their CSS

Source: `src/core/providers/root/system-css-variables-bridge.tsx`

### Key CSS Variables

**Personality animation:**
- `--ds-personality-animation-intensity`
- `--ds-personality-animation-stagger-delay`
- `--ds-personality-animation-entrance`
- `--ds-personality-animation-entrance-duration`
- `--ds-personality-animation-hover-lift`
- `--ds-personality-animation-hover-scale`

**Card:**
- `--ds-card-shadow`, `--ds-card-shadow-hover`
- `--ds-card-border`, `--ds-card-border-hover`
- `--ds-card-bg-hover`, `--ds-card-hover-transform`
- `--ds-card-header-padding`, `--ds-card-body-padding`, `--ds-card-footer-padding`

**Badge:**
- `--ds-badge-radius`, `--ds-badge-hover-transform`

**Typography:**
- `--ds-typography-heading-letter-spacing`
- `--ds-typography-heading-font-weight`
- `--ds-typography-label-transform`

**Button:**
- `--ds-button-transition`
- `--ds-button-hover-transform`, `--ds-button-active-transform`

**Divider:**
- `--ds-divider-style`, `--ds-divider-color`

**Skeleton:**
- `--ds-skeleton-animation-duration`

**Feedback (toast/message/notification/modal):**
- `--ds-toast-enter-duration`, `--ds-toast-exit-duration`
- `--ds-message-enter-duration`, `--ds-message-exit-duration`
- `--ds-notification-enter-duration`, `--ds-notification-exit-duration`
- `--ds-modal-animation-duration`, `--ds-modal-animation-timing`

**Transitions:**
- `--ds-duration-fast`, `--ds-duration-normal`, `--ds-duration-slow`

### Personality resolvers

The file `src/core/personality/primitives.ts` exports functions that components call directly:

| Function | Returns |
|----------|---------|
| `resolvePersonalityCssVariables(tokens)` | Full CSS variable map |
| `resolveCardPersonalityDefaults(tokens)` | `{ bordered, hoverable, padding }` |
| `resolveBadgePersonalityDefaults(tokens)` | `{ radius }` |
| `resolveButtonPersonalityStyle(tokens)` | CSSProperties for button |
| `resolveSkeletonPersonalityDefaults(tokens)` | `{ animation, style }` |
| `resolveDividerPersonalityDefaults(tokens)` | `{ variant, style }` |
| `resolveTypographyHeadingStyle(tokens)` | CSSProperties for headings |
| `resolveTypographyTextStyle(tokens, isLabel)` | CSSProperties for text/labels |
| `resolveStatisticPersonalityStyle(tokens)` | CSSProperties for statistics |

---

## Dark Mode

### Enabling dark mode

1. **Provider prop**: `<DesignSystemProvider forceTheme="dark">`
2. **Tenant config**: `{ theme: 'dark' }`
3. **System preference**: `@media (prefers-color-scheme: dark)` (automatic when no explicit theme)

### What changes in dark mode

The CSS generator (`src/theme/tenants/storage/static/generator/index.ts`) produces dark-mode CSS that includes:

- **Backgrounds**: `#FFFFFF` inverts to `#0A0A0A` (and intermediate grays)
- **Text**: `#0A0A0A` inverts to `#FAFAFA`
- **Borders**: `rgba(0,0,0,0.08)` becomes `rgba(255,255,255,0.12)`
- **Brand colors**: Full dark-adapted color scales (lighter tints become darker)
- **Shadows**: Increased opacity for dark backgrounds
- **Surfaces**: Cards, modals, drawers get dark backgrounds (`#111827`)
- **Inputs**: Dark background (`#0f172a`), light text, adjusted borders
- **Card hover tint**: Mixes with `primary-800` instead of `primary-100`

### Dark mode selectors

Generated CSS targets three selectors:

```css
/* Explicit dark theme */
html[data-tenant='acme'][data-theme='dark'] { ... }
html[data-tenant='acme'].dark { ... }

/* System preference (only when no explicit theme is set) */
@media (prefers-color-scheme: dark) {
  html[data-tenant='acme']:not([data-theme]):not(.light):not(.dark) { ... }
}
```

---

## Creating a New Tenant

### Step 1: Define the TenantConfig

```ts
const myTenant: TenantConfig = {
  slug: 'my-company',
  name: 'My Company',
  engine: 'classic',
  theme: 'base',
  plan: 'pro',
  features: ['analytics'],
  branding: {
    companyName: 'My Company',
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
  },
  personality: {
    animation: { intensity: 0.6, entrance: 'fade' },
    card: { showBorder: true, paddingDensity: 'normal' },
    typography: { labelStyle: 'sentence' },
  },
};
```

### Step 2: Use inline or register it

**Inline** (simplest):
```tsx
<DesignSystemProvider tenantConfig={myTenant}>
  <App />
</DesignSystemProvider>
```

**Registered** (for multi-tenant apps): Add the tenant to the known registry or serve it via the remote API endpoint. Then resolve by slug:
```tsx
<DesignSystemProvider tenantSlug="my-company">
  <App />
</DesignSystemProvider>
```

### Step 3: Pre-generate CSS (optional)

Use the CSS generator to produce static CSS files for build-time optimization:

```ts
import { generateTenantCss } from '@rottay/design-system';

const css = generateTenantCss(myTenant, {
  includeDarkSelector: true,
  includeSystemDarkSelector: true,
});

// Write to file: my-company/index.css
```

The generated CSS includes branding color scales, token overrides, personality variables, and full dark mode support.

### Tenant resolution priority

When `getTenantConfig(slug)` is called:

1. Memory cache
2. localStorage cache (1-hour TTL)
3. Known tenants registry (built-in configs)
4. Static files
5. Remote API
6. Default tenant (`rottay`)

---

## Creating a Tenant Programmatically

Source: `src/core/hooks/tenant/create-tenant.ts`, `src/core/hooks/tenant/personality-presets.ts`, `src/core/hooks/tenant/useCreateTenant.ts`

The tenant creation utilities eliminate the need for manual CSS file creation and registry updates when onboarding new tenants. A complete `TenantConfig` can be generated from just 3 required fields: `slug`, `name`, and `primaryColor`.

### TenantCreationConfig

```ts
interface TenantCreationConfig {
  slug: string;           // Required - unique identifier
  name: string;           // Required - display name
  primaryColor: string;   // Required - hex color (e.g. '#3B82F6')
  secondaryColor?: string;
  logo?: string;
  engine?: 'classic' | 'modern' | 'rustic';
  personality?: 'formal' | 'neutral' | 'playful' | 'expressive';
  density?: 'compact' | 'comfortable' | 'spacious';
  plan?: 'starter' | 'pro' | 'enterprise';
  features?: string[];
  domain?: string;
}
```

### Personality Presets

Instead of manually configuring 32+ personality token properties, choose a preset:

| Preset | Based On | Animation | Card Style | Labels | Use Case |
|--------|----------|-----------|------------|--------|----------|
| `formal` | recruiting.operator / BitHire | Subtle fade, no lift | Bordered, compact | UPPERCASE | B2B, corporate, recruiting |
| `neutral` | generic.default / platform.admin | Balanced fade | Bordered, normal | Sentence case | General purpose |
| `playful` | events.organizer / Evnto | Bounce, high lift | Borderless, spacious | Capitalize | Consumer, events, social |
| `expressive` | Rottay tenant | Spring, medium lift | Borderless, glass tooltips | Sentence case | Creative, tech, startup |

### Generating a Config

```ts
import { createTenantConfig } from '@rottay/design-system';

const config = createTenantConfig({
  slug: 'acme',
  name: 'ACME Corp',
  primaryColor: '#3B82F6',
  personality: 'formal',
  density: 'compact',
});
// Returns a complete TenantConfig with personality tokens,
// token overrides, branding, and all defaults filled in.
```

### Runtime CSS Injection (React Hook)

```tsx
import { useCreateTenant } from '@rottay/design-system';

function TenantOnboarding() {
  const { createTenant, injectTenantCss, removeTenantCss } = useCreateTenant();

  const handleCreate = () => {
    const config = createTenant({
      slug: 'acme',
      name: 'ACME Corp',
      primaryColor: '#3B82F6',
      personality: 'formal',
    });

    // Injects a <style data-tenant-css="acme"> tag into <head>
    injectTenantCss(config);
  };

  const handleRemove = () => {
    removeTenantCss('acme');
  };

  return (
    <div>
      <button onClick={handleCreate}>Create & Apply</button>
      <button onClick={handleRemove}>Remove Theme</button>
    </div>
  );
}
```

### Live Preview Pattern

The `PatternTenantPreview` component renders a visual preview of how components will look with a tenant config:

```tsx
import { PatternTenantPreview } from '@rottay/design-system';

<PatternTenantPreview
  config={{
    slug: 'acme',
    name: 'ACME Corp',
    primaryColor: '#3B82F6',
    personality: 'formal',
  }}
  components={['button', 'card', 'input', 'badge', 'table']}
  showColorPalette
  showPersonalityInfo
/>
```

The preview shows:
- Auto-generated color palette (10-step scale from the primary color)
- Sample Button, Card, Input, Badge, and Table components with the tenant's branding
- Personality information panel (animation style, card elevation, badge shape, etc.)

All 3 engines (classic, modern, rustic) are supported.

### Resolving Personality Presets Directly

```ts
import { resolvePersonalityPreset } from '@rottay/design-system';

const tokens = resolvePersonalityPreset('playful');
// Returns full PersonalityTokens: animation, chart, typography, accent, card
```
