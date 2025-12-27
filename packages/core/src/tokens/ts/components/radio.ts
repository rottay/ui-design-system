/**
 * Radio Component Tokens - TypeScript Mirror
 *
 * TypeScript representation of Radio CSS custom properties.
 * Use these for type-safe Radio token references.
 */

// Radio Sizes
export const radioSize = {
  xs: {
    size: 'var(--radio-xs-size)',
    fontSize: 'var(--radio-xs-font-size)',
    borderWidth: 'var(--radio-xs-border-width)',
  },
  sm: {
    size: 'var(--radio-sm-size)',
    fontSize: 'var(--radio-sm-font-size)',
    borderWidth: 'var(--radio-sm-border-width)',
  },
  md: {
    size: 'var(--radio-md-size)',
    fontSize: 'var(--radio-md-font-size)',
    borderWidth: 'var(--radio-md-border-width)',
  },
  lg: {
    size: 'var(--radio-lg-size)',
    fontSize: 'var(--radio-lg-font-size)',
    borderWidth: 'var(--radio-lg-border-width)',
  },
  xl: {
    size: 'var(--radio-xl-size)',
    fontSize: 'var(--radio-xl-font-size)',
    borderWidth: 'var(--radio-xl-border-width)',
  },
} as const;

// Radio Variants
export const radioVariant = {
  default: {
    bg: 'var(--radio-default-bg)',
    border: 'var(--radio-default-border)',
    dot: 'var(--radio-default-dot)',
  },
  primary: {
    bg: 'var(--radio-primary-bg)',
    border: 'var(--radio-primary-border)',
    dot: 'var(--radio-primary-dot)',
  },
  secondary: {
    bg: 'var(--radio-secondary-bg)',
    border: 'var(--radio-secondary-border)',
    dot: 'var(--radio-secondary-dot)',
  },
  success: {
    bg: 'var(--radio-success-bg)',
    border: 'var(--radio-success-border)',
    dot: 'var(--radio-success-dot)',
  },
  warning: {
    bg: 'var(--radio-warning-bg)',
    border: 'var(--radio-warning-border)',
    dot: 'var(--radio-warning-dot)',
  },
  error: {
    bg: 'var(--radio-error-bg)',
    border: 'var(--radio-error-border)',
    dot: 'var(--radio-error-dot)',
  },
} as const;

// Radio States
export const radioState = {
  uncheckedBg: 'var(--radio-unchecked-bg)',
  uncheckedBorder: 'var(--radio-unchecked-border)',
  disabledOpacity: 'var(--radio-disabled-opacity)',
} as const;

// Radio Dot
export const radioDot = {
  scale: 'var(--radio-dot-scale)',
} as const;

// Radio Transition
export const radioTransition = {
  duration: 'var(--radio-transition-duration)',
  timing: 'var(--radio-transition-timing)',
  all: 'var(--radio-transition)',
} as const;

// Radio Focus
export const radioFocus = {
  ringWidth: 'var(--radio-focus-ring-width)',
  ringOffset: 'var(--radio-focus-ring-offset)',
  ringColor: 'var(--radio-focus-ring-color)',
} as const;

// Combined radio tokens
export const radioTokens = {
  size: radioSize,
  variant: radioVariant,
  state: radioState,
  dot: radioDot,
  transition: radioTransition,
  focus: radioFocus,
  labelGap: 'var(--radio-label-gap)',
} as const;

// Type exports
export type RadioSize = keyof typeof radioSize;
export type RadioVariant = keyof typeof radioVariant;
