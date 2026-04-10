# Design Tokens - Rottay Design System

Complete CSS tokens system for the Rottay Design System. This system provides foundational design values as CSS custom properties (variables) for consistent styling across the entire application.

> **Public API note.** As of the 2026-04-08 audit, the only public surface of
> `@rottay/design-system` is the package root, plus the `./server`, `./icons`,
> and `./styles*` subpaths. There is **no** `@rottay/design-system/tokens`
> entry point. Earlier versions of this README advertised one — that was
> aspirational, not real. Token *values* (`colors`, `spacing`,
> `buttonTokens`, etc.) currently live inside the package as implementation
> detail; consumers should reach them through CSS variables (preferred) or
> the `useTokens()` React hook re-exported from the package root. The CSS
> bundle that ships every `--ds-*` variable is `@rottay/design-system/styles.css`
> (or a per-vertical bundle like `@rottay/design-system/styles/platform`).

## 📋 Table of Contents

- [Overview](#overview)
- [Structure](#structure)
- [Usage](#usage)
- [Token Categories](#token-categories)
- [Naming Conventions](#naming-conventions)
- [Responsive Tokens](#responsive-tokens)
- [Tenant Customization](#tenant-customization)
- [Contributing](#contributing)

## 🎯 Overview

The token system is built on CSS custom properties (CSS variables) organized in a hierarchical structure. All tokens follow a consistent naming pattern and are designed to be:

- **Scalable**: Easy to add new tokens and values
- **Maintainable**: Clear organization and naming
- **Themeable**: Support for tenant-specific overrides
- **Responsive**: Automatic adjustments for different screen sizes
- **Accessible**: Built with WCAG guidelines in mind

## 📁 Structure

```
/tokens/
├── css/
│   ├── foundation/            # Authored source: base + themes + animations + responsive
│   │   ├── base/              # Foundational tokens (colors, spacing, typography, etc.)
│   │   ├── themes/            # Default theme + dark mode
│   │   ├── animations/        # Keyframes, transitions, premium motion
│   │   ├── responsive/        # Breakpoint-specific overrides
│   │   └── base.css           # Tenant-free foundation import
│   ├── components/            # Per-component CSS variables
│   ├── engines/               # Engine-specific bridging (classic/modern/rustic)
│   ├── artifacts/             # Generated snapshots: per-tenant CSS
│   │   ├── rottay/index.css
│   │   ├── bithire/index.css
│   │   └── evnto/index.css
│   ├── entrypoints/           # Public package export sources
│   │   ├── styles.css         # -> ./styles (full bundle)
│   │   ├── platform.css       # -> ./styles/platform
│   │   ├── bithire.css        # -> ./styles/bithire
│   │   └── evnto.css          # -> ./styles/evnto
│   └── legacy/                # Non-first-party bundled content
│       └── themanagementmiami/index.css
│
├── ts/
│   ├── base/                  # Foundational TS token values
│   ├── components/            # Per-component token objects
│   ├── brand-themes/          # CANONICAL authored premium sources
│   │   ├── rottay.ts
│   │   ├── bithire.ts
│   │   ├── evnto.ts
│   │   └── index.ts
│   ├── mirrors/               # Reference mirrors (typed var(--ds-*) catalogs)
│   │   ├── rottay.ts
│   │   └── index.ts
│   └── index.ts               # Aggregator
├── compat/
│   └── typography-scale.ts    # @deprecated Geist-based scale
├── index.ts                   # Main entry point
└── README.md                  # (moved to docs/reference/tokens/)
```

## 🚀 Usage

### Import the CSS bundle

The full token CSS layer ships as a single bundle. There is no per-category
subpath in the public API; consumers should import one bundle and rely on
the CSS cascade.

```css
/* Full CSS bundle (all verticals, suitable for dev / Storybook) */
@import '@rottay/design-system/styles.css';
```

```css
/* Per-vertical bundles (smaller, prefer in production apps) */
@import '@rottay/design-system/styles/platform';   /* Rottay platform */
@import '@rottay/design-system/styles/bithire';    /* BitHire */
@import '@rottay/design-system/styles/evnto';      /* Evnto */
@import '@rottay/design-system/styles/modern';     /* Modern engine only */
```

The selectors and CSS variables are unchanged across bundles — they only
differ in which tenant overrides are pre-baked.

### Read tokens from React

For typed access from React, use the `useTokens()` hook re-exported from
the package root.

```typescript
import { useTokens } from '@rottay/design-system';

function MyComponent() {
  const tokens = useTokens();
  return (
    <div
      style={{
        backgroundColor: tokens.colors.primary[500],
        padding: tokens.spacing.md,
      }}
    />
  );
}
```

`useTokens()` resolves the four-layer merge chain (engine defaults, product
profile, vertical preset, tenant overrides) so the values it returns reflect
the active runtime configuration.

> **Internal note.** The `colors`, `spacing`, `buttonTokens`, ... value
> objects under `src/tokens/ts/` are package-internal. They are not exported
> from the package root and should not be imported by consumers. If you need
> a value object outside React (test fixtures, codegen, build tooling),
> open a request — we will export the specific shape from a real public
> entry point rather than encouraging deep-import workarounds.

### Using Tokens in CSS

```css
.my-component {
  /* Colors */
  color: var(--ds-color-primary-600);
  background-color: var(--ds-color-neutral-50);

  /* Spacing */
  padding: var(--ds-spacing-4);
  margin-bottom: var(--ds-spacing-6);

  /* Typography */
  font-size: var(--ds-font-size-base);
  font-weight: var(--ds-font-weight-medium);
  line-height: var(--ds-line-height-normal);

  /* Borders */
  border-radius: var(--ds-radius-md);
  border: var(--ds-border-default);

  /* Shadows */
  box-shadow: var(--ds-shadow-sm);

  /* Transitions */
  transition: var(--ds-transition-normal);
}
```

### Using Tokens in JavaScript/React

```jsx
import styles from './MyComponent.module.css';

// CSS Module with tokens
const MyComponent = () => (
  <div className={styles.container}>
    <h1 className={styles.title}>Hello</h1>
  </div>
);

// MyComponent.module.css
.container {
  padding: var(--ds-spacing-8);
  background: var(--ds-color-white);
  border-radius: var(--ds-radius-lg);
}

.title {
  font-size: var(--ds-font-size-2xl);
  color: var(--ds-color-primary-700);
}
```

## 🎨 Token Categories

### Base Tokens

#### Colors (`themes/default.css` + `tenants/*.css`)
- **Primary**: Canonical primary palette (9 shades)
- **Secondary**: Canonical secondary palette (9 shades)
- **Neutral**: Gray scale (9 shades)
- **Semantic**: Success, warning, error, info (9 shades each)
- **Alpha**: Transparency overlays and semantic alpha helpers

```css
var(--ds-color-primary-500)    /* primary scale */
var(--ds-color-success-600)    /* success scale */
var(--ds-color-neutral-700)    /* neutral scale */
var(--ds-color-alpha-black-50) /* rgba(0, 0, 0, 0.5) */
```

#### Spacing (`base/spacing.css`)
4px grid system with semantic names:
```css
var(--ds-spacing-4)      /* 16px */
var(--ds-spacing-md)     /* 24px - alias for spacing-6 */
var(--ds-spacing-gutter) /* 16px - layout spacing */
```

#### Typography (`base/typography.css`)
Font families, sizes, weights, and line heights:
```css
var(--ds-font-family-base)
var(--ds-font-size-lg)        /* 18px */
var(--ds-font-weight-medium)  /* 500 */
var(--ds-line-height-normal)  /* 1.5 */
```

#### Shadows (`base/shadows.css`)
Elevation scale from xs to 3xl:
```css
var(--ds-shadow-sm)
var(--ds-shadow-primary-md)
var(--ds-shadow-focus-ring)
```

#### Borders (`base/borders.css`)
Border widths, radii, and styles:
```css
var(--ds-radius-md)           /* 8px */
var(--ds-border-default)      /* 1px solid neutral-200 */
var(--ds-border-color-focus)
```

#### Z-Index (`base/z-index.css`)
Layering system for stacking:
```css
var(--ds-z-index-modal)       /* 1500 */
var(--ds-z-index-tooltip)     /* 1700 */
var(--ds-z-index-dropdown)    /* 1000 */
```

### Component Tokens

#### Avatar (`components/avatar.css`)
- 7 sizes (xs to 3xl)
- 3 shapes (circle, square, rounded)
- 7 variants (default, primary, secondary, success, warning, error, gradient)
- Status indicators
- Group settings

#### Button (`components/button.css`)
- 5 sizes (xs to xl)
- 8 variants (primary, secondary, default, ghost, dashed, text, link)
- Semantic variants (success, warning, error)
- Icon button settings

#### Input (`components/input.css`)
- 3 sizes (sm, md, lg)
- State variants (success, warning, error)
- Addons and affixes
- Helper text and validation

#### Card (`components/card.css`)
- 4 padding sizes
- 5 shadow elevations
- Header, body, footer sections
- Media/image settings
- Interactive states

#### Modal (`components/modal.css`)
- 6 width sizes
- Overlay/backdrop settings
- Header, body, footer sections
- Animation settings
- Drawer and bottom sheet variants

### Animation Tokens

#### Transitions (`animations/transitions.css`)
Durations, easing functions, and property-specific transitions:
```css
var(--duration-normal)      /* 0.3s */
var(--easing-standard)      /* cubic-bezier(0.4, 0, 0.2, 1) */
var(--transition-fade)
var(--transition-button)
```

#### Keyframes (`animations/keyframes.css`)
Reusable @keyframes for common animations:
- Fade (in, out, up, down, left, right)
- Scale (in, out, up, down, zoom)
- Slide (all directions)
- Rotate, bounce, shake, pulse
- Shimmer, loading, ripple, glow

### Responsive Tokens

Automatic adjustments for different screen sizes:
- Mobile (< 640px)
- Tablet (640px - 1023px)
- Desktop (>= 1024px)
- Touch devices
- Reduced motion preferences

### Tenant Tokens

#### Rottay Tenant (`artifacts/rottay/`)
Default tenant with Rottay-specific customizations:
- Brand color overrides
- Component styling adjustments
- Accent colors (teal, orange)
- Gradient backgrounds
- Dark mode support

## 📐 Naming Conventions

### General Pattern
```
--ds-{category}-{element}-{property}-{variant}-{state}
```

### Examples
```css
/* Color tokens */
--ds-color-primary-500
--ds-color-success-100
--ds-color-alpha-black-50

/* Spacing tokens */
--ds-spacing-4
--ds-spacing-md
--ds-spacing-gutter-lg

/* Typography tokens */
--ds-font-size-lg
--ds-font-weight-semibold
--ds-line-height-normal

/* Component tokens */
--ds-button-md-height
--ds-avatar-primary-bg
--ds-card-shadow-hover

/* Animation tokens */
--ds-transition-fast
--ds-transition-normal
--ds-transition-spring
```

## 📱 Responsive Tokens

Tokens automatically adjust based on:

### Screen Size
```css
/* Mobile */
@media (max-width: 639px) {
  --ds-button-default-height: var(--ds-button-lg-height);
}

/* Desktop */
@media (min-width: 1024px) {
  --ds-avatar-hover-enabled: 1;
}
```

### Input Method
```css
/* Touch devices */
@media (hover: none) and (pointer: coarse) {
  --ds-button-touch-target-min: 2.75rem; /* 44px */
}
```

### User Preferences
```css
/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  --duration-normal: 0.01s;
}

/* High contrast */
@media (prefers-contrast: high) {
  --ds-button-border-width: 2px;
}
```

## 🎭 Tenant Customization

### Authoring Flow (canonical)

New tenant visual identity is authored as a `BrandTheme` object in
`tokens/ts/brand-themes/`. The CSS in `tokens/css/artifacts/` is a
**generated output** from that authored source — do not hand-edit
artifact CSS as the primary authoring path.

```
1. Author a BrandTheme in tokens/ts/brand-themes/<tenant>.ts
2. The brand compiler + generator produce CSS artifacts
3. CSS artifacts in tokens/css/artifacts/<tenant>/ are outputs
```

For DB-backed tenants, the same BrandTheme shape is stored in the
database and compiled at runtime by DesignSystemProvider.

> **Note:** The legacy workflow of hand-authoring CSS directly in
> `tokens/css/artifacts/` is deprecated. Existing first-party CSS
> files are generated snapshots that will converge with the shared
> pipeline as the brand compiler matures (see Wave I4-I6).

## 🤝 Contributing

When adding new tokens:

1. **Follow naming conventions**: Use the established pattern
2. **Document inline**: Add clear comments in CSS
3. **Provide semantic aliases**: Create named variants for common use cases
4. **Consider responsive**: Add responsive overrides if needed
5. **Update README**: Document new tokens in this file

### Example: Adding a New Component

```css
/* components/new-component.css */
/**
 * NewComponent Tokens - Rottay Design System
 *
 * Design tokens for the NewComponent.
 */

:root {
  /* SIZES */
  --new-component-sm-size: 2rem;
  --new-component-md-size: 3rem;
  --new-component-lg-size: 4rem;

  /* COLORS */
  --new-component-bg: var(--ds-color-neutral-50);
  --new-component-color: var(--ds-color-neutral-900);

  /* VARIANTS */
  --new-component-primary-bg: var(--ds-color-primary-100);
  --new-component-primary-color: var(--ds-color-primary-700);
}
```

## 📚 Resources

- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [Design Tokens Specification](https://design-tokens.github.io/community-group/format/)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## 📄 License

MIT License - See LICENSE file for details

---

**Version**: 1.0.0
**Last Updated**: 2025-12-25
**Maintained by**: Rottay Design Team
