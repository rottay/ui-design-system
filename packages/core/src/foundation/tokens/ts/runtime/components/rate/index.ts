/**
 * @fileoverview Rate (star rating) component token mirrors.
 *
 * Covers 5 size tiers, active/inactive/hover colors, hover scale interaction,
 * focus ring, gap, and transition tokens.
 */

// Rate Sizes
export const rateSize = {
  xs: 'var(--ds-rate-xs-size)',
  sm: 'var(--ds-rate-sm-size)',
  md: 'var(--ds-rate-md-size)',
  lg: 'var(--ds-rate-lg-size)',
  xl: 'var(--ds-rate-xl-size)',
} as const;

// Rate Colors
export const rateColor = {
  active: 'var(--ds-rate-active-color)',
  inactive: 'var(--ds-rate-inactive-color)',
  hover: 'var(--ds-rate-hover-color)',
} as const;

// Rate Interactions
export const rateInteraction = {
  hoverScale: 'var(--ds-rate-hover-scale)',
  focusRingWidth: 'var(--ds-rate-focus-ring-width)',
  focusRingColor: 'var(--ds-rate-focus-ring-color)',
  focusRingOffset: 'var(--ds-rate-focus-ring-offset)',
} as const;

// Rate Transition
export const rateTransition = {
  duration: 'var(--ds-rate-transition-duration)',
  timing: 'var(--ds-rate-transition-timing)',
  all: 'var(--ds-rate-transition)',
} as const;

// Combined rate tokens
export const rateTokens = {
  size: rateSize,
  color: rateColor,
  interaction: rateInteraction,
  transition: rateTransition,
  defaultSize: 'var(--ds-rate-default-size)',
  gap: 'var(--ds-rate-gap)',
} as const;

// Type exports
export type RateSize = keyof typeof rateSize;
