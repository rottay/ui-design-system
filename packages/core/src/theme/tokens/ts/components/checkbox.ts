/**
 * Checkbox Component Tokens - TypeScript Mirror
 *
 * TypeScript representation of Checkbox CSS custom properties.
 * Use these for type-safe Checkbox token references.
 */

// Checkbox Sizes
export const checkboxSize = {
  xs: {
    size: 'var(--ds-checkbox-xs-size)',
    fontSize: 'var(--ds-checkbox-xs-font-size)',
    borderWidth: 'var(--ds-checkbox-xs-border-width)',
  },
  sm: {
    size: 'var(--ds-checkbox-sm-size)',
    fontSize: 'var(--ds-checkbox-sm-font-size)',
    borderWidth: 'var(--ds-checkbox-sm-border-width)',
  },
  md: {
    size: 'var(--ds-checkbox-md-size)',
    fontSize: 'var(--ds-checkbox-md-font-size)',
    borderWidth: 'var(--ds-checkbox-md-border-width)',
  },
  lg: {
    size: 'var(--ds-checkbox-lg-size)',
    fontSize: 'var(--ds-checkbox-lg-font-size)',
    borderWidth: 'var(--ds-checkbox-lg-border-width)',
  },
  xl: {
    size: 'var(--ds-checkbox-xl-size)',
    fontSize: 'var(--ds-checkbox-xl-font-size)',
    borderWidth: 'var(--ds-checkbox-xl-border-width)',
  },
} as const;

// Checkbox Radius
export const checkboxRadius = {
  none: 'var(--ds-checkbox-radius-none)',
  sm: 'var(--ds-checkbox-radius-sm)',
  md: 'var(--ds-checkbox-radius-md)',
  lg: 'var(--ds-checkbox-radius-lg)',
  full: 'var(--ds-checkbox-radius-full)',
} as const;

// Checkbox Variants
export const checkboxVariant = {
  default: {
    bg: 'var(--ds-checkbox-default-bg)',
    border: 'var(--ds-checkbox-default-border)',
    check: 'var(--ds-checkbox-default-check)',
  },
  primary: {
    bg: 'var(--ds-checkbox-primary-bg)',
    border: 'var(--ds-checkbox-primary-border)',
    check: 'var(--ds-checkbox-primary-check)',
  },
  secondary: {
    bg: 'var(--ds-checkbox-secondary-bg)',
    border: 'var(--ds-checkbox-secondary-border)',
    check: 'var(--ds-checkbox-secondary-check)',
  },
  success: {
    bg: 'var(--ds-checkbox-success-bg)',
    border: 'var(--ds-checkbox-success-border)',
    check: 'var(--ds-checkbox-success-check)',
  },
  warning: {
    bg: 'var(--ds-checkbox-warning-bg)',
    border: 'var(--ds-checkbox-warning-border)',
    check: 'var(--ds-checkbox-warning-check)',
  },
  error: {
    bg: 'var(--ds-checkbox-error-bg)',
    border: 'var(--ds-checkbox-error-border)',
    check: 'var(--ds-checkbox-error-check)',
  },
} as const;

// Checkbox States
export const checkboxState = {
  uncheckedBg: 'var(--ds-checkbox-unchecked-bg)',
  uncheckedBorder: 'var(--ds-checkbox-unchecked-border)',
  disabledOpacity: 'var(--ds-checkbox-disabled-opacity)',
} as const;

// Checkbox Transition
export const checkboxTransition = {
  duration: 'var(--ds-checkbox-transition-duration)',
  timing: 'var(--ds-checkbox-transition-timing)',
  all: 'var(--ds-checkbox-transition)',
} as const;

// Checkbox Focus
export const checkboxFocus = {
  ringWidth: 'var(--ds-checkbox-focus-ring-width)',
  ringOffset: 'var(--ds-checkbox-focus-ring-offset)',
  ringColor: 'var(--ds-checkbox-focus-ring-color)',
} as const;

// Combined checkbox tokens
export const checkboxTokens = {
  size: checkboxSize,
  radius: checkboxRadius,
  variant: checkboxVariant,
  state: checkboxState,
  transition: checkboxTransition,
  focus: checkboxFocus,
  labelGap: 'var(--ds-checkbox-label-gap)',
} as const;

// Type exports
export type CheckboxSize = keyof typeof checkboxSize;
export type CheckboxRadius = keyof typeof checkboxRadius;
export type CheckboxVariant = keyof typeof checkboxVariant;
