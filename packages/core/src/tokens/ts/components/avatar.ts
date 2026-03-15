/**
 * Avatar Component Tokens - TypeScript Mirror
 *
 * TypeScript representation of Avatar CSS custom properties.
 * Use these for type-safe Avatar token references.
 */

// Avatar Sizes
export const avatarSize = {
  xs: {
    size: 'var(--ds-avatar-xs-size)',
    fontSize: 'var(--ds-avatar-xs-font-size)',
    statusSize: 'var(--ds-avatar-xs-status-size)',
    borderWidth: 'var(--ds-avatar-xs-border-width)',
  },
  sm: {
    size: 'var(--ds-avatar-sm-size)',
    fontSize: 'var(--ds-avatar-sm-font-size)',
    statusSize: 'var(--ds-avatar-sm-status-size)',
    borderWidth: 'var(--ds-avatar-sm-border-width)',
  },
  md: {
    size: 'var(--ds-avatar-md-size)',
    fontSize: 'var(--ds-avatar-md-font-size)',
    statusSize: 'var(--ds-avatar-md-status-size)',
    borderWidth: 'var(--ds-avatar-md-border-width)',
  },
  lg: {
    size: 'var(--ds-avatar-lg-size)',
    fontSize: 'var(--ds-avatar-lg-font-size)',
    statusSize: 'var(--ds-avatar-lg-status-size)',
    borderWidth: 'var(--ds-avatar-lg-border-width)',
  },
  xl: {
    size: 'var(--ds-avatar-xl-size)',
    fontSize: 'var(--ds-avatar-xl-font-size)',
    statusSize: 'var(--ds-avatar-xl-status-size)',
    borderWidth: 'var(--ds-avatar-xl-border-width)',
  },
  '2xl': {
    size: 'var(--ds-avatar-2xl-size)',
    fontSize: 'var(--ds-avatar-2xl-font-size)',
    statusSize: 'var(--ds-avatar-2xl-status-size)',
    borderWidth: 'var(--ds-avatar-2xl-border-width)',
  },
  '3xl': {
    size: 'var(--ds-avatar-3xl-size)',
    fontSize: 'var(--ds-avatar-3xl-font-size)',
    statusSize: 'var(--ds-avatar-3xl-status-size)',
    borderWidth: 'var(--ds-avatar-3xl-border-width)',
  },
} as const;

// Avatar Shapes
export const avatarShape = {
  circle: 'var(--ds-avatar-circle-radius)',
  square: 'var(--ds-avatar-square-radius)',
  rounded: 'var(--ds-avatar-rounded-radius)',
} as const;

// Avatar Variants
export const avatarVariant = {
  default: {
    bg: 'var(--ds-avatar-default-bg)',
    color: 'var(--ds-avatar-default-color)',
    borderColor: 'var(--ds-avatar-default-border-color)',
    shadow: 'var(--ds-avatar-default-shadow)',
  },
  primary: {
    bg: 'var(--ds-avatar-primary-bg)',
    color: 'var(--ds-avatar-primary-color)',
    borderColor: 'var(--ds-avatar-primary-border-color)',
    shadow: 'var(--ds-avatar-primary-shadow)',
  },
  secondary: {
    bg: 'var(--ds-avatar-secondary-bg)',
    color: 'var(--ds-avatar-secondary-color)',
    borderColor: 'var(--ds-avatar-secondary-border-color)',
    shadow: 'var(--ds-avatar-secondary-shadow)',
  },
  success: {
    bg: 'var(--ds-avatar-success-bg)',
    color: 'var(--ds-avatar-success-color)',
    borderColor: 'var(--ds-avatar-success-border-color)',
    shadow: 'var(--ds-avatar-success-shadow)',
  },
  warning: {
    bg: 'var(--ds-avatar-warning-bg)',
    color: 'var(--ds-avatar-warning-color)',
    borderColor: 'var(--ds-avatar-warning-border-color)',
    shadow: 'var(--ds-avatar-warning-shadow)',
  },
  error: {
    bg: 'var(--ds-avatar-error-bg)',
    color: 'var(--ds-avatar-error-color)',
    borderColor: 'var(--ds-avatar-error-border-color)',
    shadow: 'var(--ds-avatar-error-shadow)',
  },
  gradient: {
    bg: 'var(--ds-avatar-gradient-bg)',
    color: 'var(--ds-avatar-gradient-color)',
    borderColor: 'var(--ds-avatar-gradient-border-color)',
    shadow: 'var(--ds-avatar-gradient-shadow)',
  },
} as const;

// Avatar Status
export const avatarStatus = {
  online: 'var(--ds-avatar-status-online-color)',
  offline: 'var(--ds-avatar-status-offline-color)',
  away: 'var(--ds-avatar-status-away-color)',
  busy: 'var(--ds-avatar-status-busy-color)',
  offset: 'var(--ds-avatar-status-offset)',
  borderWidth: 'var(--ds-avatar-status-border-width)',
  borderColor: 'var(--ds-avatar-status-border-color)',
} as const;

// Avatar Group
export const avatarGroup = {
  compactSpacing: 'var(--ds-avatar-group-compact-spacing)',
  normalSpacing: 'var(--ds-avatar-group-normal-spacing)',
  looseSpacing: 'var(--ds-avatar-group-loose-spacing)',
  defaultSpacing: 'var(--ds-avatar-group-default-spacing)',
  maxCount: 'var(--ds-avatar-group-max-count)',
  overflowBg: 'var(--ds-avatar-group-overflow-bg)',
  overflowColor: 'var(--ds-avatar-group-overflow-color)',
  overflowFontWeight: 'var(--ds-avatar-group-overflow-font-weight)',
} as const;

// Avatar Interactions
export const avatarInteraction = {
  hoverScale: 'var(--ds-avatar-hover-scale)',
  hoverShadow: 'var(--ds-avatar-hover-shadow)',
  hoverBorderColor: 'var(--ds-avatar-hover-border-color)',
  focusRingWidth: 'var(--ds-avatar-focus-ring-width)',
  focusRingColor: 'var(--ds-avatar-focus-ring-color)',
  focusRingOffset: 'var(--ds-avatar-focus-ring-offset)',
  activeScale: 'var(--ds-avatar-active-scale)',
} as const;

// Avatar Badge
export const avatarBadge = {
  size: 'var(--ds-avatar-badge-size)',
  fontSize: 'var(--ds-avatar-badge-font-size)',
  bg: 'var(--ds-avatar-badge-bg)',
  color: 'var(--ds-avatar-badge-color)',
  borderWidth: 'var(--ds-avatar-badge-border-width)',
  borderColor: 'var(--ds-avatar-badge-border-color)',
  offsetTop: 'var(--ds-avatar-badge-offset-top)',
  offsetRight: 'var(--ds-avatar-badge-offset-right)',
} as const;

// Avatar Transition
export const avatarTransition = {
  duration: 'var(--ds-avatar-transition-duration)',
  timing: 'var(--ds-avatar-transition-timing)',
  all: 'var(--ds-avatar-transition)',
} as const;

// Combined avatar tokens
export const avatarTokens = {
  size: avatarSize,
  shape: avatarShape,
  variant: avatarVariant,
  status: avatarStatus,
  group: avatarGroup,
  interaction: avatarInteraction,
  badge: avatarBadge,
  transition: avatarTransition,
  touchTargetMin: 'var(--ds-avatar-touch-target-min)',
  fallbackIconSize: 'var(--ds-avatar-fallback-icon-size)',
  fallbackIconColor: 'var(--ds-avatar-fallback-icon-color)',
  imageObjectFit: 'var(--ds-avatar-image-object-fit)',
  imageObjectPosition: 'var(--ds-avatar-image-object-position)',
  loadingBg: 'var(--ds-avatar-loading-bg)',
  loadingAnimation: 'var(--ds-avatar-loading-animation)',
} as const;

// Type exports
export type AvatarSize = keyof typeof avatarSize;
export type AvatarShape = keyof typeof avatarShape;
export type AvatarVariant = keyof typeof avatarVariant;
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';
