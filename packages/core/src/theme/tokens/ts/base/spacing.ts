/**
 * Spacing Tokens - TypeScript Mirror
 *
 * TypeScript representation of spacing CSS custom properties.
 * Use these for type-safe spacing references in JavaScript/TypeScript.
 */

// Spacing Scale - 4px Grid System
export const spacingScale = {
  0: 'var(--spacing-0)',
  1: 'var(--spacing-1)',
  2: 'var(--spacing-2)',
  3: 'var(--spacing-3)',
  4: 'var(--spacing-4)',
  5: 'var(--spacing-5)',
  6: 'var(--spacing-6)',
  7: 'var(--spacing-7)',
  8: 'var(--spacing-8)',
  9: 'var(--spacing-9)',
  10: 'var(--spacing-10)',
  11: 'var(--spacing-11)',
  12: 'var(--spacing-12)',
  14: 'var(--spacing-14)',
  16: 'var(--spacing-16)',
  20: 'var(--spacing-20)',
  24: 'var(--spacing-24)',
  28: 'var(--spacing-28)',
  32: 'var(--spacing-32)',
  36: 'var(--spacing-36)',
  40: 'var(--spacing-40)',
  44: 'var(--spacing-44)',
  48: 'var(--spacing-48)',
  52: 'var(--spacing-52)',
  56: 'var(--spacing-56)',
  60: 'var(--spacing-60)',
  64: 'var(--spacing-64)',
  72: 'var(--spacing-72)',
  80: 'var(--spacing-80)',
  96: 'var(--spacing-96)',
} as const;

// Named Spacing - Semantic Aliases
export const spacingNamed = {
  xxxs: 'var(--spacing-xxxs)',
  xxs: 'var(--spacing-xxs)',
  xs: 'var(--spacing-xs)',
  sm: 'var(--spacing-sm)',
  md: 'var(--spacing-md)',
  lg: 'var(--spacing-lg)',
  xl: 'var(--spacing-xl)',
  '2xl': 'var(--spacing-2xl)',
  '3xl': 'var(--spacing-3xl)',
  '4xl': 'var(--spacing-4xl)',
  '5xl': 'var(--spacing-5xl)',
} as const;

// Layout Spacing - Page/Section Level
export const spacingGutter = {
  default: 'var(--spacing-gutter)',
  sm: 'var(--spacing-gutter-sm)',
  md: 'var(--spacing-gutter-md)',
  lg: 'var(--spacing-gutter-lg)',
  xl: 'var(--spacing-gutter-xl)',
} as const;

export const spacingSection = {
  default: 'var(--spacing-section)',
  sm: 'var(--spacing-section-sm)',
  lg: 'var(--spacing-section-lg)',
} as const;

export const spacingContainer = {
  default: 'var(--spacing-container)',
  sm: 'var(--spacing-container-sm)',
  lg: 'var(--spacing-container-lg)',
} as const;

// Component Spacing
export const spacingComponent = {
  gap: {
    default: 'var(--spacing-component-gap)',
    sm: 'var(--spacing-component-gap-sm)',
    lg: 'var(--spacing-component-gap-lg)',
  },
  padding: {
    default: 'var(--spacing-component-padding)',
    sm: 'var(--spacing-component-padding-sm)',
    lg: 'var(--spacing-component-padding-lg)',
  },
  margin: {
    default: 'var(--spacing-component-margin)',
    sm: 'var(--spacing-component-margin-sm)',
    lg: 'var(--spacing-component-margin-lg)',
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
