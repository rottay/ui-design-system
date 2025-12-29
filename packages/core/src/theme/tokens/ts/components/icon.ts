/**
 * Icon Component Tokens - TypeScript Mirror
 *
 * TypeScript representation of Icon CSS custom properties.
 * Use these for type-safe Icon token references.
 */

// Icon Sizes
export const iconSize = {
  xs: 'var(--icon-xs-size)',
  sm: 'var(--icon-sm-size)',
  md: 'var(--icon-md-size)',
  lg: 'var(--icon-lg-size)',
  xl: 'var(--icon-xl-size)',
  '2xl': 'var(--icon-2xl-size)',
} as const;

// Icon Stroke
export const iconStroke = {
  width: 'var(--icon-stroke-width)',
  linecap: 'var(--icon-stroke-linecap)',
  linejoin: 'var(--icon-stroke-linejoin)',
} as const;

// Icon Transition
export const iconTransition = {
  duration: 'var(--icon-transition-duration)',
  timing: 'var(--icon-transition-timing)',
  all: 'var(--icon-transition)',
} as const;

// Combined icon tokens
export const iconTokens = {
  size: iconSize,
  stroke: iconStroke,
  transition: iconTransition,
  defaultColor: 'var(--icon-default-color)',
  defaultSize: 'var(--icon-default-size)',
} as const;

// Type exports
export type IconSize = keyof typeof iconSize;
