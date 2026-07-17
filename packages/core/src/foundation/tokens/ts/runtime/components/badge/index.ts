/**
 * @fileoverview Badge component token mirrors.
 *
 * Covers 5 size tiers, dot indicator sizes, 7 color variants, processing/status
 * animations, radius options, spacing, border, typography, and transition tokens.
 */

// Badge Sizes
export const badgeSize = {
  xs: {
    minWidth: 'var(--ds-badge-xs-min-width)',
    height: 'var(--ds-badge-xs-height)',
    fontSize: 'var(--ds-badge-xs-font-size)',
  },
  sm: {
    minWidth: 'var(--ds-badge-sm-min-width)',
    height: 'var(--ds-badge-sm-height)',
    fontSize: 'var(--ds-badge-sm-font-size)',
  },
  md: {
    minWidth: 'var(--ds-badge-md-min-width)',
    height: 'var(--ds-badge-md-height)',
    fontSize: 'var(--ds-badge-md-font-size)',
  },
  lg: {
    minWidth: 'var(--ds-badge-lg-min-width)',
    height: 'var(--ds-badge-lg-height)',
    fontSize: 'var(--ds-badge-lg-font-size)',
  },
  xl: {
    minWidth: 'var(--ds-badge-xl-min-width)',
    height: 'var(--ds-badge-xl-height)',
    fontSize: 'var(--ds-badge-xl-font-size)',
  },
} as const;

// Badge Dot Sizes
export const badgeDotSize = {
  xs: 'var(--ds-badge-dot-xs-size)',
  sm: 'var(--ds-badge-dot-sm-size)',
  md: 'var(--ds-badge-dot-md-size)',
  lg: 'var(--ds-badge-dot-lg-size)',
  xl: 'var(--ds-badge-dot-xl-size)',
} as const;

// Badge Variants
export const badgeVariant = {
  default: {
    bg: 'var(--ds-badge-default-bg)',
    color: 'var(--ds-badge-default-color)',
  },
  primary: {
    bg: 'var(--ds-badge-primary-bg)',
    color: 'var(--ds-badge-primary-color)',
  },
  secondary: {
    bg: 'var(--ds-badge-secondary-bg)',
    color: 'var(--ds-badge-secondary-color)',
  },
  success: {
    bg: 'var(--ds-badge-success-bg)',
    color: 'var(--ds-badge-success-color)',
  },
  warning: {
    bg: 'var(--ds-badge-warning-bg)',
    color: 'var(--ds-badge-warning-color)',
  },
  error: {
    bg: 'var(--ds-badge-error-bg)',
    color: 'var(--ds-badge-error-color)',
  },
  info: {
    bg: 'var(--ds-badge-info-bg)',
    color: 'var(--ds-badge-info-color)',
  },
} as const;

// Badge Status
export const badgeStatus = {
  processing: 'var(--ds-badge-status-processing-color)',
  default: 'var(--ds-badge-status-default-color)',
  success: 'var(--ds-badge-status-success-color)',
  error: 'var(--ds-badge-status-error-color)',
  warning: 'var(--ds-badge-status-warning-color)',
} as const;

// Badge Radius
export const badgeRadius = {
  none: 'var(--ds-badge-radius-none)',
  sm: 'var(--ds-badge-radius-sm)',
  md: 'var(--ds-badge-radius-md)',
  lg: 'var(--ds-badge-radius-lg)',
  full: 'var(--ds-badge-radius-full)',
} as const;

// Badge Spacing
export const badgeSpacing = {
  paddingX: 'var(--ds-badge-padding-x)',
  paddingY: 'var(--ds-badge-padding-y)',
  iconGap: 'var(--ds-badge-icon-gap)',
  closeGap: 'var(--ds-badge-close-gap)',
} as const;

// Badge Border
export const badgeBorder = {
  width: 'var(--ds-badge-border-width)',
  color: 'var(--ds-badge-border-color)',
} as const;

// Badge Transition
export const badgeTransition = {
  duration: 'var(--ds-badge-transition-duration)',
  timing: 'var(--ds-badge-transition-timing)',
  all: 'var(--ds-badge-transition)',
} as const;

// Badge Typography
export const badgeTypography = {
  fontWeight: 'var(--ds-badge-font-weight)',
  lineHeight: 'var(--ds-badge-line-height)',
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
  zIndex: 'var(--ds-badge-z-index)',
} as const;

// Type exports
export type BadgeSizeToken = keyof typeof badgeSize;
export type BadgeVariantToken = keyof typeof badgeVariant;
export type BadgeStatusToken = keyof typeof badgeStatus;
export type BadgeRadiusToken = keyof typeof badgeRadius;
