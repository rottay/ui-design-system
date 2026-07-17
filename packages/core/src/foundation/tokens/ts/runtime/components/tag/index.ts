/**
 * @fileoverview Tag component token mirrors.
 *
 * Covers 5 size tiers, radius options, icon/close spacing, border width,
 * typography (weight, lineHeight), and transition tokens.
 */

// Tag Sizes
export const tagSize = {
  xs: {
    padding: 'var(--ds-tag-xs-padding)',
    fontSize: 'var(--ds-tag-xs-font-size)',
    height: 'var(--ds-tag-xs-height)',
  },
  sm: {
    padding: 'var(--ds-tag-sm-padding)',
    fontSize: 'var(--ds-tag-sm-font-size)',
    height: 'var(--ds-tag-sm-height)',
  },
  md: {
    padding: 'var(--ds-tag-md-padding)',
    fontSize: 'var(--ds-tag-md-font-size)',
    height: 'var(--ds-tag-md-height)',
  },
  lg: {
    padding: 'var(--ds-tag-lg-padding)',
    fontSize: 'var(--ds-tag-lg-font-size)',
    height: 'var(--ds-tag-lg-height)',
  },
  xl: {
    padding: 'var(--ds-tag-xl-padding)',
    fontSize: 'var(--ds-tag-xl-font-size)',
    height: 'var(--ds-tag-xl-height)',
  },
} as const;

// Tag Radius
export const tagRadius = {
  none: 'var(--ds-tag-radius-none)',
  sm: 'var(--ds-tag-radius-sm)',
  md: 'var(--ds-tag-radius-md)',
  lg: 'var(--ds-tag-radius-lg)',
  full: 'var(--ds-tag-radius-full)',
} as const;

// Tag Spacing
export const tagSpacing = {
  iconGap: 'var(--ds-tag-icon-gap)',
  closeGap: 'var(--ds-tag-close-gap)',
} as const;

// Tag Border
export const tagBorder = {
  width: 'var(--ds-tag-border-width)',
} as const;

// Tag Transition
export const tagTransition = {
  duration: 'var(--ds-tag-transition-duration)',
  timing: 'var(--ds-tag-transition-timing)',
  all: 'var(--ds-tag-transition)',
} as const;

// Tag Typography
export const tagTypography = {
  fontWeight: 'var(--ds-tag-font-weight)',
  lineHeight: 'var(--ds-tag-line-height)',
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
