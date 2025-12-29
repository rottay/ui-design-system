/**
 * Checkbox Component Tokens - TypeScript Mirror
 *
 * TypeScript representation of Checkbox CSS custom properties.
 * Use these for type-safe Checkbox token references.
 */

// Checkbox Sizes
export const checkboxSize = {
  xs: {
    size: 'var(--checkbox-xs-size)',
    fontSize: 'var(--checkbox-xs-font-size)',
    borderWidth: 'var(--checkbox-xs-border-width)',
  },
  sm: {
    size: 'var(--checkbox-sm-size)',
    fontSize: 'var(--checkbox-sm-font-size)',
    borderWidth: 'var(--checkbox-sm-border-width)',
  },
  md: {
    size: 'var(--checkbox-md-size)',
    fontSize: 'var(--checkbox-md-font-size)',
    borderWidth: 'var(--checkbox-md-border-width)',
  },
  lg: {
    size: 'var(--checkbox-lg-size)',
    fontSize: 'var(--checkbox-lg-font-size)',
    borderWidth: 'var(--checkbox-lg-border-width)',
  },
  xl: {
    size: 'var(--checkbox-xl-size)',
    fontSize: 'var(--checkbox-xl-font-size)',
    borderWidth: 'var(--checkbox-xl-border-width)',
  },
} as const;

// Checkbox Radius
export const checkboxRadius = {
  none: 'var(--checkbox-radius-none)',
  sm: 'var(--checkbox-radius-sm)',
  md: 'var(--checkbox-radius-md)',
  lg: 'var(--checkbox-radius-lg)',
  full: 'var(--checkbox-radius-full)',
} as const;

// Checkbox Variants
export const checkboxVariant = {
  default: {
    bg: 'var(--checkbox-default-bg)',
    border: 'var(--checkbox-default-border)',
    check: 'var(--checkbox-default-check)',
  },
  primary: {
    bg: 'var(--checkbox-primary-bg)',
    border: 'var(--checkbox-primary-border)',
    check: 'var(--checkbox-primary-check)',
  },
  secondary: {
    bg: 'var(--checkbox-secondary-bg)',
    border: 'var(--checkbox-secondary-border)',
    check: 'var(--checkbox-secondary-check)',
  },
  success: {
    bg: 'var(--checkbox-success-bg)',
    border: 'var(--checkbox-success-border)',
    check: 'var(--checkbox-success-check)',
  },
  warning: {
    bg: 'var(--checkbox-warning-bg)',
    border: 'var(--checkbox-warning-border)',
    check: 'var(--checkbox-warning-check)',
  },
  error: {
    bg: 'var(--checkbox-error-bg)',
    border: 'var(--checkbox-error-border)',
    check: 'var(--checkbox-error-check)',
  },
} as const;

// Checkbox States
export const checkboxState = {
  uncheckedBg: 'var(--checkbox-unchecked-bg)',
  uncheckedBorder: 'var(--checkbox-unchecked-border)',
  disabledOpacity: 'var(--checkbox-disabled-opacity)',
} as const;

// Checkbox Transition
export const checkboxTransition = {
  duration: 'var(--checkbox-transition-duration)',
  timing: 'var(--checkbox-transition-timing)',
  all: 'var(--checkbox-transition)',
} as const;

// Checkbox Focus
export const checkboxFocus = {
  ringWidth: 'var(--checkbox-focus-ring-width)',
  ringOffset: 'var(--checkbox-focus-ring-offset)',
  ringColor: 'var(--checkbox-focus-ring-color)',
} as const;

// Combined checkbox tokens
export const checkboxTokens = {
  size: checkboxSize,
  radius: checkboxRadius,
  variant: checkboxVariant,
  state: checkboxState,
  transition: checkboxTransition,
  focus: checkboxFocus,
  labelGap: 'var(--checkbox-label-gap)',
} as const;

// Type exports
export type CheckboxSize = keyof typeof checkboxSize;
export type CheckboxRadius = keyof typeof checkboxRadius;
export type CheckboxVariant = keyof typeof checkboxVariant;
