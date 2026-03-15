/**
 * Radio Component Tokens - TypeScript Mirror
 *
 * TypeScript representation of Radio CSS custom properties.
 * Use these for type-safe Radio token references.
 */

// Radio Sizes
export const radioSize = {
  xs: {
    size: 'var(--ds-radio-xs-size)',
    fontSize: 'var(--ds-radio-xs-font-size)',
    borderWidth: 'var(--ds-radio-xs-border-width)',
  },
  sm: {
    size: 'var(--ds-radio-sm-size)',
    fontSize: 'var(--ds-radio-sm-font-size)',
    borderWidth: 'var(--ds-radio-sm-border-width)',
  },
  md: {
    size: 'var(--ds-radio-md-size)',
    fontSize: 'var(--ds-radio-md-font-size)',
    borderWidth: 'var(--ds-radio-md-border-width)',
  },
  lg: {
    size: 'var(--ds-radio-lg-size)',
    fontSize: 'var(--ds-radio-lg-font-size)',
    borderWidth: 'var(--ds-radio-lg-border-width)',
  },
  xl: {
    size: 'var(--ds-radio-xl-size)',
    fontSize: 'var(--ds-radio-xl-font-size)',
    borderWidth: 'var(--ds-radio-xl-border-width)',
  },
} as const;

// Radio Variants
export const radioVariant = {
  default: {
    bg: 'var(--ds-radio-default-bg)',
    border: 'var(--ds-radio-default-border)',
    dot: 'var(--ds-radio-default-dot)',
  },
  primary: {
    bg: 'var(--ds-radio-primary-bg)',
    border: 'var(--ds-radio-primary-border)',
    dot: 'var(--ds-radio-primary-dot)',
  },
  secondary: {
    bg: 'var(--ds-radio-secondary-bg)',
    border: 'var(--ds-radio-secondary-border)',
    dot: 'var(--ds-radio-secondary-dot)',
  },
  success: {
    bg: 'var(--ds-radio-success-bg)',
    border: 'var(--ds-radio-success-border)',
    dot: 'var(--ds-radio-success-dot)',
  },
  warning: {
    bg: 'var(--ds-radio-warning-bg)',
    border: 'var(--ds-radio-warning-border)',
    dot: 'var(--ds-radio-warning-dot)',
  },
  error: {
    bg: 'var(--ds-radio-error-bg)',
    border: 'var(--ds-radio-error-border)',
    dot: 'var(--ds-radio-error-dot)',
  },
} as const;

// Radio States
export const radioState = {
  uncheckedBg: 'var(--ds-radio-unchecked-bg)',
  uncheckedBorder: 'var(--ds-radio-unchecked-border)',
  disabledOpacity: 'var(--ds-radio-disabled-opacity)',
} as const;

// Radio Dot
export const radioDot = {
  scale: 'var(--ds-radio-dot-scale)',
} as const;

// Radio Transition
export const radioTransition = {
  duration: 'var(--ds-radio-transition-duration)',
  timing: 'var(--ds-radio-transition-timing)',
  all: 'var(--ds-radio-transition)',
} as const;

// Radio Focus
export const radioFocus = {
  ringWidth: 'var(--ds-radio-focus-ring-width)',
  ringOffset: 'var(--ds-radio-focus-ring-offset)',
  ringColor: 'var(--ds-radio-focus-ring-color)',
} as const;

// Combined radio tokens
export const radioTokens = {
  size: radioSize,
  variant: radioVariant,
  state: radioState,
  dot: radioDot,
  transition: radioTransition,
  focus: radioFocus,
  labelGap: 'var(--ds-radio-label-gap)',
} as const;

// Type exports
export type RadioSize = keyof typeof radioSize;
export type RadioVariant = keyof typeof radioVariant;
