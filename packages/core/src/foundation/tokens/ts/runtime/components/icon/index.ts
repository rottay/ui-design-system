/**
 * @fileoverview Icon component token mirrors.
 *
 * Covers 6 size tiers (xs-2xl), stroke configuration (width, linecap, linejoin),
 * transition tokens, and default color/size values.
 */

// Icon Sizes
export const iconSize = {
  xs: 'var(--ds-icon-xs-size)',
  sm: 'var(--ds-icon-sm-size)',
  md: 'var(--ds-icon-md-size)',
  lg: 'var(--ds-icon-lg-size)',
  xl: 'var(--ds-icon-xl-size)',
  '2xl': 'var(--ds-icon-2xl-size)',
} as const;

// Icon Stroke
export const iconStroke = {
  width: 'var(--ds-icon-stroke-width)',
  linecap: 'var(--ds-icon-stroke-linecap)',
  linejoin: 'var(--ds-icon-stroke-linejoin)',
} as const;

// Icon Transition
export const iconTransition = {
  duration: 'var(--ds-icon-transition-duration)',
  timing: 'var(--ds-icon-transition-timing)',
} as const;

// Combined icon tokens
export const iconTokens = {
  size: iconSize,
  stroke: iconStroke,
  transition: iconTransition,
  defaultColor: 'var(--ds-icon-default-color)',
  defaultSize: 'var(--ds-icon-default-size)',
} as const;

// Type exports
export type IconSize = keyof typeof iconSize;
