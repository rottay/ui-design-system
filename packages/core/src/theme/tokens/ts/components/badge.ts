/**
 * Badge Component Tokens - TypeScript Mirror
 *
 * TypeScript representation of Badge CSS custom properties.
 * Use these for type-safe Badge token references.
 */

// Badge Sizes
export const badgeSize = {
  xs: {
    minWidth: 'var(--badge-xs-min-width)',
    height: 'var(--badge-xs-height)',
    fontSize: 'var(--badge-xs-font-size)',
  },
  sm: {
    minWidth: 'var(--badge-sm-min-width)',
    height: 'var(--badge-sm-height)',
    fontSize: 'var(--badge-sm-font-size)',
  },
  md: {
    minWidth: 'var(--badge-md-min-width)',
    height: 'var(--badge-md-height)',
    fontSize: 'var(--badge-md-font-size)',
  },
  lg: {
    minWidth: 'var(--badge-lg-min-width)',
    height: 'var(--badge-lg-height)',
    fontSize: 'var(--badge-lg-font-size)',
  },
  xl: {
    minWidth: 'var(--badge-xl-min-width)',
    height: 'var(--badge-xl-height)',
    fontSize: 'var(--badge-xl-font-size)',
  },
} as const;

// Badge Dot Sizes
export const badgeDotSize = {
  xs: 'var(--badge-dot-xs-size)',
  sm: 'var(--badge-dot-sm-size)',
  md: 'var(--badge-dot-md-size)',
  lg: 'var(--badge-dot-lg-size)',
  xl: 'var(--badge-dot-xl-size)',
} as const;

// Badge Variants
export const badgeVariant = {
  default: {
    bg: 'var(--badge-default-bg)',
    color: 'var(--badge-default-color)',
  },
  primary: {
    bg: 'var(--badge-primary-bg)',
    color: 'var(--badge-primary-color)',
  },
  secondary: {
    bg: 'var(--badge-secondary-bg)',
    color: 'var(--badge-secondary-color)',
  },
  success: {
    bg: 'var(--badge-success-bg)',
    color: 'var(--badge-success-color)',
  },
  warning: {
    bg: 'var(--badge-warning-bg)',
    color: 'var(--badge-warning-color)',
  },
  error: {
    bg: 'var(--badge-error-bg)',
    color: 'var(--badge-error-color)',
  },
  info: {
    bg: 'var(--badge-info-bg)',
    color: 'var(--badge-info-color)',
  },
} as const;

// Badge Status
export const badgeStatus = {
  processing: 'var(--badge-status-processing-color)',
  default: 'var(--badge-status-default-color)',
  success: 'var(--badge-status-success-color)',
  error: 'var(--badge-status-error-color)',
  warning: 'var(--badge-status-warning-color)',
} as const;

// Badge Radius
export const badgeRadius = {
  none: 'var(--badge-radius-none)',
  sm: 'var(--badge-radius-sm)',
  md: 'var(--badge-radius-md)',
  lg: 'var(--badge-radius-lg)',
  full: 'var(--badge-radius-full)',
} as const;

// Badge Spacing
export const badgeSpacing = {
  paddingX: 'var(--badge-padding-x)',
  paddingY: 'var(--badge-padding-y)',
  iconGap: 'var(--badge-icon-gap)',
  closeGap: 'var(--badge-close-gap)',
} as const;

// Badge Border
export const badgeBorder = {
  width: 'var(--badge-border-width)',
  color: 'var(--badge-border-color)',
} as const;

// Badge Transition
export const badgeTransition = {
  duration: 'var(--badge-transition-duration)',
  timing: 'var(--badge-transition-timing)',
  all: 'var(--badge-transition)',
} as const;

// Badge Typography
export const badgeTypography = {
  fontWeight: 'var(--badge-font-weight)',
  lineHeight: 'var(--badge-line-height)',
} as const;

// Combined badge tokens
export const badgeTokens = {
  size: badgeSize,
  dotSize: badgeDotSize,
  variant: badgeVariant,
  status: badgeStatus,
  radius: badgeRadius,
  spacing: badgeSpacing,
  border: badgeBorder,
  transition: badgeTransition,
  typography: badgeTypography,
  zIndex: 'var(--badge-z-index)',
} as const;

// Type exports
export type BadgeSizeToken = keyof typeof badgeSize;
export type BadgeVariantToken = keyof typeof badgeVariant;
export type BadgeStatusToken = keyof typeof badgeStatus;
export type BadgeRadiusToken = keyof typeof badgeRadius;
