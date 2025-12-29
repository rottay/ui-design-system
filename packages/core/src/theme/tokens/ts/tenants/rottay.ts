/**
 * Rottay Tenant Tokens - TypeScript Mirror
 *
 * TypeScript representation of Rottay-specific CSS custom properties.
 * Use these for type-safe Rottay tenant token references.
 */

// Rottay Accent Colors - Teal
export const accentTeal = {
  50: 'var(--color-accent-teal-50)',
  100: 'var(--color-accent-teal-100)',
  200: 'var(--color-accent-teal-200)',
  300: 'var(--color-accent-teal-300)',
  400: 'var(--color-accent-teal-400)',
  500: 'var(--color-accent-teal-500)',
  600: 'var(--color-accent-teal-600)',
  700: 'var(--color-accent-teal-700)',
  800: 'var(--color-accent-teal-800)',
  900: 'var(--color-accent-teal-900)',
} as const;

// Rottay Accent Colors - Orange
export const accentOrange = {
  50: 'var(--color-accent-orange-50)',
  100: 'var(--color-accent-orange-100)',
  200: 'var(--color-accent-orange-200)',
  300: 'var(--color-accent-orange-300)',
  400: 'var(--color-accent-orange-400)',
  500: 'var(--color-accent-orange-500)',
  600: 'var(--color-accent-orange-600)',
  700: 'var(--color-accent-orange-700)',
  800: 'var(--color-accent-orange-800)',
  900: 'var(--color-accent-orange-900)',
} as const;

// Rottay Background Colors
export const background = {
  primary: 'var(--color-background-primary)',
  secondary: 'var(--color-background-secondary)',
  tertiary: 'var(--color-background-tertiary)',
  inverse: 'var(--color-background-inverse)',
  primarySubtle: 'var(--color-background-primary-subtle)',
  secondarySubtle: 'var(--color-background-secondary-subtle)',
} as const;

// Rottay Text Colors
export const text = {
  primary: 'var(--color-text-primary)',
  secondary: 'var(--color-text-secondary)',
  tertiary: 'var(--color-text-tertiary)',
  disabled: 'var(--color-text-disabled)',
  inverse: 'var(--color-text-inverse)',
  brand: 'var(--color-text-brand)',
  link: 'var(--color-text-link)',
  linkHover: 'var(--color-text-link-hover)',
} as const;

// Rottay Border Colors
export const rottayBorder = {
  default: 'var(--color-border-default)',
  muted: 'var(--color-border-muted)',
  strong: 'var(--color-border-strong)',
  brand: 'var(--color-border-brand)',
} as const;

// Rottay Surface Colors
export const surface = {
  default: 'var(--color-surface-default)',
  elevated: 'var(--color-surface-elevated)',
  overlay: 'var(--color-surface-overlay)',
  brand: 'var(--color-surface-brand)',
  brandStrong: 'var(--color-surface-brand-strong)',
} as const;

// Rottay Gradients
export const gradient = {
  brandPrimary: 'var(--gradient-brand-primary)',
  brandSecondary: 'var(--gradient-brand-secondary)',
  brandAccent: 'var(--gradient-brand-accent)',
  brandVibrant: 'var(--gradient-brand-vibrant)',
  subtlePrimary: 'var(--gradient-subtle-primary)',
  subtleSecondary: 'var(--gradient-subtle-secondary)',
} as const;

// Rottay Shadow Colors
export const shadowColor = {
  primary: 'var(--shadow-color-primary)',
  secondary: 'var(--shadow-color-secondary)',
  neutral: 'var(--shadow-color-neutral)',
} as const;

// Rottay State Colors
export const state = {
  hover: {
    primary: 'var(--color-hover-primary)',
    secondary: 'var(--color-hover-secondary)',
    neutral: 'var(--color-hover-neutral)',
  },
  active: {
    primary: 'var(--color-active-primary)',
    secondary: 'var(--color-active-secondary)',
    neutral: 'var(--color-active-neutral)',
  },
  focus: {
    ring: 'var(--color-focus-ring)',
    ringOffset: 'var(--color-focus-ring-offset)',
  },
} as const;

// Combined Rottay tenant tokens
export const rottayTokens = {
  accent: {
    teal: accentTeal,
    orange: accentOrange,
  },
  background,
  text,
  border: rottayBorder,
  surface,
  gradient,
  shadowColor,
  state,
} as const;

// Type exports
export type AccentTealScale = keyof typeof accentTeal;
export type AccentOrangeScale = keyof typeof accentOrange;
