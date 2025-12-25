# Design Tokens - Rottay Design System

Complete CSS tokens system for the Rottay Design System. This system provides foundational design values as CSS custom properties (variables) for consistent styling across the entire application.

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
├── src/
│   ├── base/                  # Foundational tokens
│   │   ├── colors.css         # Color palette
│   │   ├── spacing.css        # Spacing scale
│   │   ├── typography.css     # Font system
│   │   ├── shadows.css        # Shadow scale
│   │   ├── borders.css        # Border styles
│   │   ├── z-index.css        # Layering system
│   │   └── index.css
│   │
│   ├── components/            # Component-specific tokens
│   │   ├── avatar.css
│   │   ├── button.css
│   │   ├── input.css
│   │   ├── card.css
│   │   ├── modal.css
│   │   └── index.css
│   │
│   ├── responsive/            # Responsive overrides
│   │   ├── avatar.css
│   │   ├── button.css
│   │   └── index.css
│   │
│   ├── animations/            # Animation tokens
│   │   ├── transitions.css
│   │   ├── keyframes.css
│   │   └── index.css
│   │
│   ├── tenants/               # Tenant customizations
│   │   ├── rottay/
│   │   │   ├── colors.css
│   │   │   ├── components.css
│   │   │   └── index.css
│   │   └── index.css
│   │
│   └── index.css              # Main entry point
│
└── README.md
```

## 🚀 Usage

### Import All Tokens

```css
/* Import the complete token system */
@import '@es-rottay/designsystem-core/tokens/src/index.css';
```

### Import Specific Categories

```css
/* Import only base tokens */
@import '@es-rottay/designsystem-core/tokens/src/base/index.css';

/* Import only component tokens */
@import '@es-rottay/designsystem-core/tokens/src/components/index.css';

/* Import only animations */
@import '@es-rottay/designsystem-core/tokens/src/animations/index.css';
```

### Using Tokens in CSS

```css
.my-component {
  /* Colors */
  color: var(--color-primary-600);
  background-color: var(--color-neutral-50);

  /* Spacing */
  padding: var(--spacing-4);
  margin-bottom: var(--spacing-6);

  /* Typography */
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-normal);

  /* Borders */
  border-radius: var(--radius-md);
  border: var(--border-default);

  /* Shadows */
  box-shadow: var(--shadow-sm);

  /* Transitions */
  transition: var(--transition-all);
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
  padding: var(--spacing-8);
  background: var(--color-white);
  border-radius: var(--radius-lg);
}

.title {
  font-size: var(--font-size-2xl);
  color: var(--color-primary-700);
}
```

## 🎨 Token Categories

### Base Tokens

#### Colors (`base/colors.css`)
- **Primary**: Rottay brand blue (9 shades)
- **Secondary**: Rottay accent purple (9 shades)
- **Neutral**: Gray scale (9 shades)
- **Semantic**: Success, warning, error, info (9 shades each)
- **Alpha**: Transparency overlays

```css
var(--color-primary-500)    /* #0066CC */
var(--color-success-600)    /* #16A34A */
var(--color-neutral-700)    /* #404040 */
var(--color-alpha-black-50) /* rgba(0, 0, 0, 0.5) */
```

#### Spacing (`base/spacing.css`)
4px grid system with semantic names:
```css
var(--spacing-4)      /* 16px */
var(--spacing-md)     /* 24px - alias for spacing-6 */
var(--spacing-gutter) /* 16px - layout spacing */
```

#### Typography (`base/typography.css`)
Font families, sizes, weights, and line heights:
```css
var(--font-family-base)
var(--font-size-lg)        /* 18px */
var(--font-weight-medium)  /* 500 */
var(--line-height-normal)  /* 1.5 */
```

#### Shadows (`base/shadows.css`)
Elevation scale from xs to 3xl:
```css
var(--shadow-sm)
var(--shadow-primary-md)
var(--shadow-focus-ring)
```

#### Borders (`base/borders.css`)
Border widths, radii, and styles:
```css
var(--radius-md)           /* 8px */
var(--border-default)      /* 1px solid neutral-200 */
var(--border-color-focus)
```

#### Z-Index (`base/z-index.css`)
Layering system for stacking:
```css
var(--z-index-modal)       /* 1500 */
var(--z-index-tooltip)     /* 1700 */
var(--z-index-dropdown)    /* 1000 */
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

#### Rottay Tenant (`tenants/rottay/`)
Default tenant with Rottay-specific customizations:
- Brand color overrides
- Component styling adjustments
- Accent colors (teal, orange)
- Gradient backgrounds
- Dark mode support

## 📐 Naming Conventions

### General Pattern
```
--{category}-{element}-{property}-{variant}-{state}
```

### Examples
```css
/* Color tokens */
--color-primary-500
--color-success-100
--color-alpha-black-50

/* Spacing tokens */
--spacing-4
--spacing-md
--spacing-gutter-lg

/* Typography tokens */
--font-size-lg
--font-weight-semibold
--line-height-normal

/* Component tokens */
--button-md-height
--avatar-primary-bg
--card-shadow-hover

/* Animation tokens */
--duration-normal
--easing-standard
--transition-fade
```

## 📱 Responsive Tokens

Tokens automatically adjust based on:

### Screen Size
```css
/* Mobile */
@media (max-width: 639px) {
  --button-default-height: var(--button-lg-height);
}

/* Desktop */
@media (min-width: 1024px) {
  --avatar-hover-enabled: 1;
}
```

### Input Method
```css
/* Touch devices */
@media (hover: none) and (pointer: coarse) {
  --button-touch-target-min: 2.75rem; /* 44px */
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
  --button-border-width: 2px;
}
```

## 🎭 Tenant Customization

### Creating a New Tenant

1. Create tenant directory:
```bash
mkdir -p src/tokens/src/tenants/my-tenant
```

2. Create color overrides (`my-tenant/colors.css`):
```css
:root {
  --color-primary-500: #YOUR_BRAND_COLOR;
  --color-secondary-500: #YOUR_ACCENT_COLOR;
}
```

3. Create component overrides (`my-tenant/components.css`):
```css
:root {
  --button-primary-bg: var(--color-primary-500);
  --card-border-radius: var(--radius-2xl);
}
```

4. Create tenant index (`my-tenant/index.css`):
```css
@import './colors.css';
@import './components.css';
```

5. Import in tenants index (`tenants/index.css`):
```css
@import './my-tenant/index.css';
```

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
  --new-component-bg: var(--color-neutral-50);
  --new-component-color: var(--color-neutral-900);

  /* VARIANTS */
  --new-component-primary-bg: var(--color-primary-100);
  --new-component-primary-color: var(--color-primary-700);
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
