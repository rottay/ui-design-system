/**
 * Icon Component Tokens - TypeScript Mirror
 *
 * TypeScript representation of Icon CSS custom properties.
 * Use these for type-safe Icon token references.
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
  all: 'var(--ds-icon-transition)',
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
