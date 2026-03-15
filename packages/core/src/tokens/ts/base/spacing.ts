/**
 * Spacing Tokens - TypeScript Mirror
 *
 * TypeScript representation of spacing CSS custom properties.
 * Use these for type-safe spacing references in JavaScript/TypeScript.
 */

// Spacing Scale - 4px Grid System
export const spacingScale = {
  0: 'var(--ds-spacing-0)',
  1: 'var(--ds-spacing-1)',
  2: 'var(--ds-spacing-2)',
  3: 'var(--ds-spacing-3)',
  4: 'var(--ds-spacing-4)',
  5: 'var(--ds-spacing-5)',
  6: 'var(--ds-spacing-6)',
  7: 'var(--ds-spacing-7)',
  8: 'var(--ds-spacing-8)',
  9: 'var(--ds-spacing-9)',
  10: 'var(--ds-spacing-10)',
  11: 'var(--ds-spacing-11)',
  12: 'var(--ds-spacing-12)',
  14: 'var(--ds-spacing-14)',
  16: 'var(--ds-spacing-16)',
  20: 'var(--ds-spacing-20)',
  24: 'var(--ds-spacing-24)',
  28: 'var(--ds-spacing-28)',
  32: 'var(--ds-spacing-32)',
  36: 'var(--ds-spacing-36)',
  40: 'var(--ds-spacing-40)',
  44: 'var(--ds-spacing-44)',
  48: 'var(--ds-spacing-48)',
  52: 'var(--ds-spacing-52)',
  56: 'var(--ds-spacing-56)',
  60: 'var(--ds-spacing-60)',
  64: 'var(--ds-spacing-64)',
  72: 'var(--ds-spacing-72)',
  80: 'var(--ds-spacing-80)',
  96: 'var(--ds-spacing-96)',
} as const;

// Named Spacing - Semantic Aliases
export const spacingNamed = {
  xxxs: 'var(--ds-spacing-xxxs)',
  xxs: 'var(--ds-spacing-xxs)',
  xs: 'var(--ds-spacing-xs)',
  sm: 'var(--ds-spacing-sm)',
  md: 'var(--ds-spacing-md)',
  lg: 'var(--ds-spacing-lg)',
  xl: 'var(--ds-spacing-xl)',
  '2xl': 'var(--ds-spacing-2xl)',
  '3xl': 'var(--ds-spacing-3xl)',
  '4xl': 'var(--ds-spacing-4xl)',
  '5xl': 'var(--ds-spacing-5xl)',
} as const;

// Layout Spacing - Page/Section Level
export const spacingGutter = {
  default: 'var(--ds-spacing-gutter)',
  sm: 'var(--ds-spacing-gutter-sm)',
  md: 'var(--ds-spacing-gutter-md)',
  lg: 'var(--ds-spacing-gutter-lg)',
  xl: 'var(--ds-spacing-gutter-xl)',
} as const;

export const spacingSection = {
  default: 'var(--ds-spacing-section)',
  sm: 'var(--ds-spacing-section-sm)',
  lg: 'var(--ds-spacing-section-lg)',
} as const;

export const spacingContainer = {
  default: 'var(--ds-spacing-container)',
  sm: 'var(--ds-spacing-container-sm)',
  lg: 'var(--ds-spacing-container-lg)',
} as const;

// Component Spacing
export const spacingComponent = {
  gap: {
    default: 'var(--ds-spacing-component-gap)',
    sm: 'var(--ds-spacing-component-gap-sm)',
    lg: 'var(--ds-spacing-component-gap-lg)',
  },
  padding: {
    default: 'var(--ds-spacing-component-padding)',
    sm: 'var(--ds-spacing-component-padding-sm)',
    lg: 'var(--ds-spacing-component-padding-lg)',
  },
  margin: {
    default: 'var(--ds-spacing-component-margin)',
    sm: 'var(--ds-spacing-component-margin-sm)',
    lg: 'var(--ds-spacing-component-margin-lg)',
  },
} as const;

// Combined spacing export
export const spacing = {
  scale: spacingScale,
  named: spacingNamed,
  gutter: spacingGutter,
  section: spacingSection,
  container: spacingContainer,
  component: spacingComponent,
} as const;

// Type exports
export type SpacingScaleKey = keyof typeof spacingScale;
export type SpacingNamedKey = keyof typeof spacingNamed;
export type SpacingSize = 'xxxs' | 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
