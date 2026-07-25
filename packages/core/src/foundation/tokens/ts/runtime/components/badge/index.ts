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
    paddingX: 'var(--ds-badge-xs-padding-x)',
  },
  sm: {
    minWidth: 'var(--ds-badge-sm-min-width)',
    height: 'var(--ds-badge-sm-height)',
    fontSize: 'var(--ds-badge-sm-font-size)',
    paddingX: 'var(--ds-badge-sm-padding-x)',
  },
  md: {
    minWidth: 'var(--ds-badge-md-min-width)',
    height: 'var(--ds-badge-md-height)',
    fontSize: 'var(--ds-badge-md-font-size)',
    paddingX: 'var(--ds-badge-md-padding-x)',
  },
  lg: {
    minWidth: 'var(--ds-badge-lg-min-width)',
    height: 'var(--ds-badge-lg-height)',
    fontSize: 'var(--ds-badge-lg-font-size)',
    paddingX: 'var(--ds-badge-lg-padding-x)',
  },
  xl: {
    minWidth: 'var(--ds-badge-xl-min-width)',
    height: 'var(--ds-badge-xl-height)',
    fontSize: 'var(--ds-badge-xl-font-size)',
    paddingX: 'var(--ds-badge-xl-padding-x)',
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
  fontFamily: 'var(--ds-badge-font-family)',
  fontWeight: 'var(--ds-badge-font-weight)',
  lineHeight: 'var(--ds-badge-line-height)',
  letterSpacing: 'var(--ds-badge-letter-spacing)',
} as const;

export const badgeAnatomy = {
  gap: 'var(--ds-badge-gap)',
  maxInlineSize: 'var(--ds-badge-max-inline-size)',
  chipMaxInlineSize: 'var(--ds-badge-chip-max-inline-size)',
  pillMaxInlineSize: 'var(--ds-badge-pill-max-inline-size)',
  frameWidth: 'var(--ds-badge-frame-width)',
  iconSize: 'var(--ds-badge-icon-size)',
  avatarBleed: 'var(--ds-badge-avatar-bleed)',
  countMinSize: 'var(--ds-badge-count-min-size)',
  countSize: 'var(--ds-badge-count-size)',
  removeSize: 'var(--ds-badge-remove-size)',
  touchTarget: 'var(--ds-badge-touch-target)',
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
  anatomy: badgeAnatomy,
  zIndex: 'var(--ds-badge-z-index)',
} as const;

// Type exports
export type BadgeSizeToken = keyof typeof badgeSize;
export type BadgeVariantToken = keyof typeof badgeVariant;
export type BadgeStatusToken = keyof typeof badgeStatus;
export type BadgeRadiusToken = keyof typeof badgeRadius;
