/**
 * Toggle Component Tokens - TypeScript Mirror
 *
 * TypeScript representation of Toggle CSS custom properties.
 * Use these for type-safe Toggle token references.
 */

// Toggle Sizes
export const toggleSize = {
  xs: {
    width: 'var(--ds-toggle-xs-width)',
    height: 'var(--ds-toggle-xs-height)',
    dot: 'var(--ds-toggle-xs-dot)',
    dotOffset: 'var(--ds-toggle-xs-dot-offset)',
    labelFontSize: 'var(--ds-toggle-xs-label-font-size)',
  },
  sm: {
    width: 'var(--ds-toggle-sm-width)',
    height: 'var(--ds-toggle-sm-height)',
    dot: 'var(--ds-toggle-sm-dot)',
    dotOffset: 'var(--ds-toggle-sm-dot-offset)',
    labelFontSize: 'var(--ds-toggle-sm-label-font-size)',
  },
  md: {
    width: 'var(--ds-toggle-md-width)',
    height: 'var(--ds-toggle-md-height)',
    dot: 'var(--ds-toggle-md-dot)',
    dotOffset: 'var(--ds-toggle-md-dot-offset)',
    labelFontSize: 'var(--ds-toggle-md-label-font-size)',
  },
  lg: {
    width: 'var(--ds-toggle-lg-width)',
    height: 'var(--ds-toggle-lg-height)',
    dot: 'var(--ds-toggle-lg-dot)',
    dotOffset: 'var(--ds-toggle-lg-dot-offset)',
    labelFontSize: 'var(--ds-toggle-lg-label-font-size)',
  },
  xl: {
    width: 'var(--ds-toggle-xl-width)',
    height: 'var(--ds-toggle-xl-height)',
    dot: 'var(--ds-toggle-xl-dot)',
    dotOffset: 'var(--ds-toggle-xl-dot-offset)',
    labelFontSize: 'var(--ds-toggle-xl-label-font-size)',
  },
} as const;

// Toggle Color Variants
export const toggleColor = {
  default: {
    bg: 'var(--ds-toggle-default-bg)',
    bgChecked: 'var(--ds-toggle-default-bg-checked)',
    border: 'var(--ds-toggle-default-border)',
  },
  primary: {
    bg: 'var(--ds-toggle-primary-bg)',
    bgChecked: 'var(--ds-toggle-primary-bg-checked)',
    border: 'var(--ds-toggle-primary-border)',
  },
  secondary: {
    bg: 'var(--ds-toggle-secondary-bg)',
    bgChecked: 'var(--ds-toggle-secondary-bg-checked)',
    border: 'var(--ds-toggle-secondary-border)',
  },
  success: {
    bg: 'var(--ds-toggle-success-bg)',
    bgChecked: 'var(--ds-toggle-success-bg-checked)',
    border: 'var(--ds-toggle-success-border)',
  },
  warning: {
    bg: 'var(--ds-toggle-warning-bg)',
    bgChecked: 'var(--ds-toggle-warning-bg-checked)',
    border: 'var(--ds-toggle-warning-border)',
  },
  error: {
    bg: 'var(--ds-toggle-error-bg)',
    bgChecked: 'var(--ds-toggle-error-bg-checked)',
    border: 'var(--ds-toggle-error-border)',
  },
} as const;

// Toggle Dot/Handle
export const toggleDot = {
  bg: 'var(--ds-toggle-dot-bg)',
  shadow: 'var(--ds-toggle-dot-shadow)',
  borderRadius: 'var(--ds-toggle-dot-border-radius)',
} as const;

// Toggle Track
export const toggleTrack = {
  borderRadius: 'var(--ds-toggle-track-border-radius)',
  borderWidth: 'var(--ds-toggle-track-border-width)',
  borderStyle: 'var(--ds-toggle-track-border-style)',
} as const;

// Toggle Label
export const toggleLabel = {
  color: 'var(--ds-toggle-label-color)',
  colorDisabled: 'var(--ds-toggle-label-color-disabled)',
  fontWeight: 'var(--ds-toggle-label-font-weight)',
  gap: 'var(--ds-toggle-label-gap)',
  description: {
    color: 'var(--ds-toggle-description-color)',
    fontSize: 'var(--ds-toggle-description-font-size)',
    marginTop: 'var(--ds-toggle-description-margin-top)',
  },
} as const;

// Toggle Inner Labels
export const toggleInner = {
  fontSize: 'var(--ds-toggle-inner-font-size)',
  color: 'var(--ds-toggle-inner-color)',
  padding: 'var(--ds-toggle-inner-padding)',
} as const;

// Toggle Helper Text
export const toggleHelper = {
  color: 'var(--ds-toggle-helper-color)',
  fontSize: 'var(--ds-toggle-helper-font-size)',
  marginTop: 'var(--ds-toggle-helper-margin-top)',
} as const;

// Toggle Error State
export const toggleError = {
  borderColor: 'var(--ds-toggle-error-border-color)',
  messageColor: 'var(--ds-toggle-error-message-color)',
  messageFontSize: 'var(--ds-toggle-error-message-font-size)',
  messageMarginTop: 'var(--ds-toggle-error-message-margin-top)',
} as const;

// Toggle Focus State
export const toggleFocus = {
  ringColor: 'var(--ds-toggle-focus-ring-color)',
  ringWidth: 'var(--ds-toggle-focus-ring-width)',
  ringOffset: 'var(--ds-toggle-focus-ring-offset)',
  shadow: 'var(--ds-toggle-focus-shadow)',
} as const;

// Toggle Loading State
export const toggleLoading = {
  color: 'var(--ds-toggle-loading-color)',
  size: 'var(--ds-toggle-loading-size)',
} as const;

// Toggle Transition
export const toggleTransition = {
  duration: 'var(--ds-toggle-transition-duration)',
  timing: 'var(--ds-toggle-transition-timing)',
  all: 'var(--ds-toggle-transition)',
  dot: 'var(--ds-toggle-dot-transition)',
} as const;

// Toggle Disabled
export const toggleDisabled = {
  opacity: 'var(--ds-toggle-disabled-opacity)',
  cursor: 'var(--ds-toggle-disabled-cursor)',
  bg: 'var(--ds-toggle-disabled-bg)',
  dotBg: 'var(--ds-toggle-disabled-dot-bg)',
} as const;

// Combined toggle tokens
export const toggleTokens = {
  size: toggleSize,
  color: toggleColor,
  dot: toggleDot,
  track: toggleTrack,
  label: toggleLabel,
  inner: toggleInner,
  helper: toggleHelper,
  error: toggleError,
  focus: toggleFocus,
  loading: toggleLoading,
  transition: toggleTransition,
  disabled: toggleDisabled,
} as const;

// Type exports
export type ToggleSize = keyof typeof toggleSize;
export type ToggleColor = keyof typeof toggleColor;
