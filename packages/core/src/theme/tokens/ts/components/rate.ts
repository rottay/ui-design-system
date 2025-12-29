/**
 * Rate Component Tokens - TypeScript Mirror
 *
 * TypeScript representation of Rate CSS custom properties.
 * Use these for type-safe Rate token references.
 */

// Rate Sizes
export const rateSize = {
  xs: 'var(--rate-xs-size)',
  sm: 'var(--rate-sm-size)',
  md: 'var(--rate-md-size)',
  lg: 'var(--rate-lg-size)',
  xl: 'var(--rate-xl-size)',
} as const;

// Rate Colors
export const rateColor = {
  active: 'var(--rate-active-color)',
  inactive: 'var(--rate-inactive-color)',
  hover: 'var(--rate-hover-color)',
} as const;

// Rate Interactions
export const rateInteraction = {
  hoverScale: 'var(--rate-hover-scale)',
  focusRingWidth: 'var(--rate-focus-ring-width)',
  focusRingColor: 'var(--rate-focus-ring-color)',
  focusRingOffset: 'var(--rate-focus-ring-offset)',
} as const;

// Rate Transition
export const rateTransition = {
  duration: 'var(--rate-transition-duration)',
  timing: 'var(--rate-transition-timing)',
  all: 'var(--rate-transition)',
} as const;

// Combined rate tokens
export const rateTokens = {
  size: rateSize,
  color: rateColor,
  interaction: rateInteraction,
  transition: rateTransition,
  defaultSize: 'var(--rate-default-size)',
  gap: 'var(--rate-gap)',
} as const;

// Type exports
export type RateSize = keyof typeof rateSize;
