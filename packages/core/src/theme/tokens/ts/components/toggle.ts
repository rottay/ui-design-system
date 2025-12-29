/**
 * Toggle Component Tokens - TypeScript Mirror
 *
 * TypeScript representation of Toggle CSS custom properties.
 * Use these for type-safe Toggle token references.
 */

// Toggle Sizes
export const toggleSize = {
  xs: {
    width: 'var(--toggle-xs-width)',
    height: 'var(--toggle-xs-height)',
    dot: 'var(--toggle-xs-dot)',
    dotOffset: 'var(--toggle-xs-dot-offset)',
    labelFontSize: 'var(--toggle-xs-label-font-size)',
  },
  sm: {
    width: 'var(--toggle-sm-width)',
    height: 'var(--toggle-sm-height)',
    dot: 'var(--toggle-sm-dot)',
    dotOffset: 'var(--toggle-sm-dot-offset)',
    labelFontSize: 'var(--toggle-sm-label-font-size)',
  },
  md: {
    width: 'var(--toggle-md-width)',
    height: 'var(--toggle-md-height)',
    dot: 'var(--toggle-md-dot)',
    dotOffset: 'var(--toggle-md-dot-offset)',
    labelFontSize: 'var(--toggle-md-label-font-size)',
  },
  lg: {
    width: 'var(--toggle-lg-width)',
    height: 'var(--toggle-lg-height)',
    dot: 'var(--toggle-lg-dot)',
    dotOffset: 'var(--toggle-lg-dot-offset)',
    labelFontSize: 'var(--toggle-lg-label-font-size)',
  },
  xl: {
    width: 'var(--toggle-xl-width)',
    height: 'var(--toggle-xl-height)',
    dot: 'var(--toggle-xl-dot)',
    dotOffset: 'var(--toggle-xl-dot-offset)',
    labelFontSize: 'var(--toggle-xl-label-font-size)',
  },
} as const;

// Toggle Color Variants
export const toggleColor = {
  default: {
    bg: 'var(--toggle-default-bg)',
    bgChecked: 'var(--toggle-default-bg-checked)',
    border: 'var(--toggle-default-border)',
  },
  primary: {
    bg: 'var(--toggle-primary-bg)',
    bgChecked: 'var(--toggle-primary-bg-checked)',
    border: 'var(--toggle-primary-border)',
  },
  secondary: {
    bg: 'var(--toggle-secondary-bg)',
    bgChecked: 'var(--toggle-secondary-bg-checked)',
    border: 'var(--toggle-secondary-border)',
  },
  success: {
    bg: 'var(--toggle-success-bg)',
    bgChecked: 'var(--toggle-success-bg-checked)',
    border: 'var(--toggle-success-border)',
  },
  warning: {
    bg: 'var(--toggle-warning-bg)',
    bgChecked: 'var(--toggle-warning-bg-checked)',
    border: 'var(--toggle-warning-border)',
  },
  error: {
    bg: 'var(--toggle-error-bg)',
    bgChecked: 'var(--toggle-error-bg-checked)',
    border: 'var(--toggle-error-border)',
  },
} as const;

// Toggle Dot/Handle
export const toggleDot = {
  bg: 'var(--toggle-dot-bg)',
  shadow: 'var(--toggle-dot-shadow)',
  borderRadius: 'var(--toggle-dot-border-radius)',
} as const;

// Toggle Track
export const toggleTrack = {
  borderRadius: 'var(--toggle-track-border-radius)',
  borderWidth: 'var(--toggle-track-border-width)',
  borderStyle: 'var(--toggle-track-border-style)',
} as const;

// Toggle Label
export const toggleLabel = {
  color: 'var(--toggle-label-color)',
  colorDisabled: 'var(--toggle-label-color-disabled)',
  fontWeight: 'var(--toggle-label-font-weight)',
  gap: 'var(--toggle-label-gap)',
  description: {
    color: 'var(--toggle-description-color)',
    fontSize: 'var(--toggle-description-font-size)',
    marginTop: 'var(--toggle-description-margin-top)',
  },
} as const;

// Toggle Inner Labels
export const toggleInner = {
  fontSize: 'var(--toggle-inner-font-size)',
  color: 'var(--toggle-inner-color)',
  padding: 'var(--toggle-inner-padding)',
} as const;

// Toggle Helper Text
export const toggleHelper = {
  color: 'var(--toggle-helper-color)',
  fontSize: 'var(--toggle-helper-font-size)',
  marginTop: 'var(--toggle-helper-margin-top)',
} as const;

// Toggle Error State
export const toggleError = {
  borderColor: 'var(--toggle-error-border-color)',
  messageColor: 'var(--toggle-error-message-color)',
  messageFontSize: 'var(--toggle-error-message-font-size)',
  messageMarginTop: 'var(--toggle-error-message-margin-top)',
} as const;

// Toggle Focus State
export const toggleFocus = {
  ringColor: 'var(--toggle-focus-ring-color)',
  ringWidth: 'var(--toggle-focus-ring-width)',
  ringOffset: 'var(--toggle-focus-ring-offset)',
  shadow: 'var(--toggle-focus-shadow)',
} as const;

// Toggle Loading State
export const toggleLoading = {
  color: 'var(--toggle-loading-color)',
  size: 'var(--toggle-loading-size)',
} as const;

// Toggle Transition
export const toggleTransition = {
  duration: 'var(--toggle-transition-duration)',
  timing: 'var(--toggle-transition-timing)',
  all: 'var(--toggle-transition)',
  dot: 'var(--toggle-dot-transition)',
} as const;

// Toggle Disabled
export const toggleDisabled = {
  opacity: 'var(--toggle-disabled-opacity)',
  cursor: 'var(--toggle-disabled-cursor)',
  bg: 'var(--toggle-disabled-bg)',
  dotBg: 'var(--toggle-disabled-dot-bg)',
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
