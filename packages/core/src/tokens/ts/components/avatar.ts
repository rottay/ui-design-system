/**
 * Avatar Component Tokens - TypeScript Mirror
 *
 * TypeScript representation of Avatar CSS custom properties.
 * Use these for type-safe Avatar token references.
 */

// Avatar Sizes
export const avatarSize = {
  xs: {
    size: 'var(--avatar-xs-size)',
    fontSize: 'var(--avatar-xs-font-size)',
    statusSize: 'var(--avatar-xs-status-size)',
    borderWidth: 'var(--avatar-xs-border-width)',
  },
  sm: {
    size: 'var(--avatar-sm-size)',
    fontSize: 'var(--avatar-sm-font-size)',
    statusSize: 'var(--avatar-sm-status-size)',
    borderWidth: 'var(--avatar-sm-border-width)',
  },
  md: {
    size: 'var(--avatar-md-size)',
    fontSize: 'var(--avatar-md-font-size)',
    statusSize: 'var(--avatar-md-status-size)',
    borderWidth: 'var(--avatar-md-border-width)',
  },
  lg: {
    size: 'var(--avatar-lg-size)',
    fontSize: 'var(--avatar-lg-font-size)',
    statusSize: 'var(--avatar-lg-status-size)',
    borderWidth: 'var(--avatar-lg-border-width)',
  },
  xl: {
    size: 'var(--avatar-xl-size)',
    fontSize: 'var(--avatar-xl-font-size)',
    statusSize: 'var(--avatar-xl-status-size)',
    borderWidth: 'var(--avatar-xl-border-width)',
  },
  '2xl': {
    size: 'var(--avatar-2xl-size)',
    fontSize: 'var(--avatar-2xl-font-size)',
    statusSize: 'var(--avatar-2xl-status-size)',
    borderWidth: 'var(--avatar-2xl-border-width)',
  },
  '3xl': {
    size: 'var(--avatar-3xl-size)',
    fontSize: 'var(--avatar-3xl-font-size)',
    statusSize: 'var(--avatar-3xl-status-size)',
    borderWidth: 'var(--avatar-3xl-border-width)',
  },
} as const;

// Avatar Shapes
export const avatarShape = {
  circle: 'var(--avatar-circle-radius)',
  square: 'var(--avatar-square-radius)',
  rounded: 'var(--avatar-rounded-radius)',
} as const;

// Avatar Variants
export const avatarVariant = {
  default: {
    bg: 'var(--avatar-default-bg)',
    color: 'var(--avatar-default-color)',
    borderColor: 'var(--avatar-default-border-color)',
    shadow: 'var(--avatar-default-shadow)',
  },
  primary: {
    bg: 'var(--avatar-primary-bg)',
    color: 'var(--avatar-primary-color)',
    borderColor: 'var(--avatar-primary-border-color)',
    shadow: 'var(--avatar-primary-shadow)',
  },
  secondary: {
    bg: 'var(--avatar-secondary-bg)',
    color: 'var(--avatar-secondary-color)',
    borderColor: 'var(--avatar-secondary-border-color)',
    shadow: 'var(--avatar-secondary-shadow)',
  },
  success: {
    bg: 'var(--avatar-success-bg)',
    color: 'var(--avatar-success-color)',
    borderColor: 'var(--avatar-success-border-color)',
    shadow: 'var(--avatar-success-shadow)',
  },
  warning: {
    bg: 'var(--avatar-warning-bg)',
    color: 'var(--avatar-warning-color)',
    borderColor: 'var(--avatar-warning-border-color)',
    shadow: 'var(--avatar-warning-shadow)',
  },
  error: {
    bg: 'var(--avatar-error-bg)',
    color: 'var(--avatar-error-color)',
    borderColor: 'var(--avatar-error-border-color)',
    shadow: 'var(--avatar-error-shadow)',
  },
  gradient: {
    bg: 'var(--avatar-gradient-bg)',
    color: 'var(--avatar-gradient-color)',
    borderColor: 'var(--avatar-gradient-border-color)',
    shadow: 'var(--avatar-gradient-shadow)',
  },
} as const;

// Avatar Status
export const avatarStatus = {
  online: 'var(--avatar-status-online-color)',
  offline: 'var(--avatar-status-offline-color)',
  away: 'var(--avatar-status-away-color)',
  busy: 'var(--avatar-status-busy-color)',
  offset: 'var(--avatar-status-offset)',
  borderWidth: 'var(--avatar-status-border-width)',
  borderColor: 'var(--avatar-status-border-color)',
} as const;

// Avatar Group
export const avatarGroup = {
  compactSpacing: 'var(--avatar-group-compact-spacing)',
  normalSpacing: 'var(--avatar-group-normal-spacing)',
  looseSpacing: 'var(--avatar-group-loose-spacing)',
  defaultSpacing: 'var(--avatar-group-default-spacing)',
  maxCount: 'var(--avatar-group-max-count)',
  overflowBg: 'var(--avatar-group-overflow-bg)',
  overflowColor: 'var(--avatar-group-overflow-color)',
  overflowFontWeight: 'var(--avatar-group-overflow-font-weight)',
} as const;

// Avatar Interactions
export const avatarInteraction = {
  hoverScale: 'var(--avatar-hover-scale)',
  hoverShadow: 'var(--avatar-hover-shadow)',
  hoverBorderColor: 'var(--avatar-hover-border-color)',
  focusRingWidth: 'var(--avatar-focus-ring-width)',
  focusRingColor: 'var(--avatar-focus-ring-color)',
  focusRingOffset: 'var(--avatar-focus-ring-offset)',
  activeScale: 'var(--avatar-active-scale)',
} as const;

// Avatar Badge
export const avatarBadge = {
  size: 'var(--avatar-badge-size)',
  fontSize: 'var(--avatar-badge-font-size)',
  bg: 'var(--avatar-badge-bg)',
  color: 'var(--avatar-badge-color)',
  borderWidth: 'var(--avatar-badge-border-width)',
  borderColor: 'var(--avatar-badge-border-color)',
  offsetTop: 'var(--avatar-badge-offset-top)',
  offsetRight: 'var(--avatar-badge-offset-right)',
} as const;

// Avatar Transition
export const avatarTransition = {
  duration: 'var(--avatar-transition-duration)',
  timing: 'var(--avatar-transition-timing)',
  all: 'var(--avatar-transition)',
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
  touchTargetMin: 'var(--avatar-touch-target-min)',
  fallbackIconSize: 'var(--avatar-fallback-icon-size)',
  fallbackIconColor: 'var(--avatar-fallback-icon-color)',
  imageObjectFit: 'var(--avatar-image-object-fit)',
  imageObjectPosition: 'var(--avatar-image-object-position)',
  loadingBg: 'var(--avatar-loading-bg)',
  loadingAnimation: 'var(--avatar-loading-animation)',
} as const;

// Type exports
export type AvatarSize = keyof typeof avatarSize;
export type AvatarShape = keyof typeof avatarShape;
export type AvatarVariant = keyof typeof avatarVariant;
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';
