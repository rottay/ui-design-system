/**
 * @fileoverview Spinner (loading indicator) component token mirrors.
 *
 * Covers 4 size tiers, default/track colors, and animation properties
 * (duration, timing function, stroke width).
 */

// Spinner Sizes
export const spinnerSize = {
  sm: 'var(--ds-spinner-sm-size)',
  md: 'var(--ds-spinner-md-size)',
  lg: 'var(--ds-spinner-lg-size)',
  xl: 'var(--ds-spinner-xl-size)',
} as const;

// Spinner Colors
export const spinnerColor = {
  default: 'var(--ds-spinner-default-color)',
  track: 'var(--ds-spinner-track-color)',
} as const;

// Spinner Animation
export const spinnerAnimation = {
  duration: 'var(--ds-spinner-animation-duration)',
  timing: 'var(--ds-spinner-animation-timing)',
  strokeWidth: 'var(--ds-spinner-stroke-width)',
} as const;

// Combined spinner tokens
export const spinnerTokens = {
  size: spinnerSize,
  color: spinnerColor,
  animation: spinnerAnimation,
  defaultSize: 'var(--ds-spinner-default-size)',
} as const;

// Type exports
export type SpinnerSize = keyof typeof spinnerSize;
