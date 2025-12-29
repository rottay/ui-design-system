/**
 * Spinner Component Tokens - TypeScript Mirror
 *
 * TypeScript representation of Spinner CSS custom properties.
 * Use these for type-safe Spinner token references.
 */

// Spinner Sizes
export const spinnerSize = {
  sm: 'var(--spinner-sm-size)',
  md: 'var(--spinner-md-size)',
  lg: 'var(--spinner-lg-size)',
  xl: 'var(--spinner-xl-size)',
} as const;

// Spinner Colors
export const spinnerColor = {
  default: 'var(--spinner-default-color)',
  track: 'var(--spinner-track-color)',
} as const;

// Spinner Animation
export const spinnerAnimation = {
  duration: 'var(--spinner-animation-duration)',
  timing: 'var(--spinner-animation-timing)',
  strokeWidth: 'var(--spinner-stroke-width)',
} as const;

// Combined spinner tokens
export const spinnerTokens = {
  size: spinnerSize,
  color: spinnerColor,
  animation: spinnerAnimation,
  defaultSize: 'var(--spinner-default-size)',
} as const;

// Type exports
export type SpinnerSize = keyof typeof spinnerSize;
