/**
 * Tag Component Tokens - TypeScript Mirror
 *
 * TypeScript representation of Tag CSS custom properties.
 * Use these for type-safe Tag token references.
 */

// Tag Sizes
export const tagSize = {
  xs: {
    padding: 'var(--tag-xs-padding)',
    fontSize: 'var(--tag-xs-font-size)',
    height: 'var(--tag-xs-height)',
  },
  sm: {
    padding: 'var(--tag-sm-padding)',
    fontSize: 'var(--tag-sm-font-size)',
    height: 'var(--tag-sm-height)',
  },
  md: {
    padding: 'var(--tag-md-padding)',
    fontSize: 'var(--tag-md-font-size)',
    height: 'var(--tag-md-height)',
  },
  lg: {
    padding: 'var(--tag-lg-padding)',
    fontSize: 'var(--tag-lg-font-size)',
    height: 'var(--tag-lg-height)',
  },
  xl: {
    padding: 'var(--tag-xl-padding)',
    fontSize: 'var(--tag-xl-font-size)',
    height: 'var(--tag-xl-height)',
  },
} as const;

// Tag Radius
export const tagRadius = {
  none: 'var(--tag-radius-none)',
  sm: 'var(--tag-radius-sm)',
  md: 'var(--tag-radius-md)',
  lg: 'var(--tag-radius-lg)',
  full: 'var(--tag-radius-full)',
} as const;

// Tag Spacing
export const tagSpacing = {
  iconGap: 'var(--tag-icon-gap)',
  closeGap: 'var(--tag-close-gap)',
} as const;

// Tag Border
export const tagBorder = {
  width: 'var(--tag-border-width)',
} as const;

// Tag Transition
export const tagTransition = {
  duration: 'var(--tag-transition-duration)',
  timing: 'var(--tag-transition-timing)',
  all: 'var(--tag-transition)',
} as const;

// Tag Typography
export const tagTypography = {
  fontWeight: 'var(--tag-font-weight)',
  lineHeight: 'var(--tag-line-height)',
} as const;

// Combined tag tokens
export const tagTokens = {
  size: tagSize,
  radius: tagRadius,
  spacing: tagSpacing,
  border: tagBorder,
  transition: tagTransition,
  typography: tagTypography,
} as const;

// Type exports
export type TagSizeToken = keyof typeof tagSize;
export type TagRadiusToken = keyof typeof tagRadius;
