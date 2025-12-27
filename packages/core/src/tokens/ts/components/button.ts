/**
 * Button Component Tokens - TypeScript Mirror
 *
 * TypeScript representation of Button CSS custom properties.
 * Use these for type-safe Button token references.
 */

// Button Sizes
export const buttonSize = {
  xs: {
    height: 'var(--button-xs-height)',
    paddingX: 'var(--button-xs-padding-x)',
    paddingY: 'var(--button-xs-padding-y)',
    padding: 'var(--button-xs-padding)',
    fontSize: 'var(--button-xs-font-size)',
    lineHeight: 'var(--button-xs-line-height)',
    iconSize: 'var(--button-xs-icon-size)',
    gap: 'var(--button-xs-gap)',
    borderRadius: 'var(--button-xs-border-radius)',
  },
  sm: {
    height: 'var(--button-sm-height)',
    paddingX: 'var(--button-sm-padding-x)',
    paddingY: 'var(--button-sm-padding-y)',
    padding: 'var(--button-sm-padding)',
    fontSize: 'var(--button-sm-font-size)',
    lineHeight: 'var(--button-sm-line-height)',
    iconSize: 'var(--button-sm-icon-size)',
    gap: 'var(--button-sm-gap)',
    borderRadius: 'var(--button-sm-border-radius)',
  },
  md: {
    height: 'var(--button-md-height)',
    paddingX: 'var(--button-md-padding-x)',
    paddingY: 'var(--button-md-padding-y)',
    padding: 'var(--button-md-padding)',
    fontSize: 'var(--button-md-font-size)',
    lineHeight: 'var(--button-md-line-height)',
    iconSize: 'var(--button-md-icon-size)',
    gap: 'var(--button-md-gap)',
    borderRadius: 'var(--button-md-border-radius)',
  },
  lg: {
    height: 'var(--button-lg-height)',
    paddingX: 'var(--button-lg-padding-x)',
    paddingY: 'var(--button-lg-padding-y)',
    padding: 'var(--button-lg-padding)',
    fontSize: 'var(--button-lg-font-size)',
    lineHeight: 'var(--button-lg-line-height)',
    iconSize: 'var(--button-lg-icon-size)',
    gap: 'var(--button-lg-gap)',
    borderRadius: 'var(--button-lg-border-radius)',
  },
  xl: {
    height: 'var(--button-xl-height)',
    paddingX: 'var(--button-xl-padding-x)',
    paddingY: 'var(--button-xl-padding-y)',
    padding: 'var(--button-xl-padding)',
    fontSize: 'var(--button-xl-font-size)',
    lineHeight: 'var(--button-xl-line-height)',
    iconSize: 'var(--button-xl-icon-size)',
    gap: 'var(--button-xl-gap)',
    borderRadius: 'var(--button-xl-border-radius)',
  },
} as const;

// Button Variants
export const buttonVariant = {
  primary: {
    bg: 'var(--button-primary-bg)',
    bgHover: 'var(--button-primary-bg-hover)',
    bgActive: 'var(--button-primary-bg-active)',
    color: 'var(--button-primary-color)',
    borderColor: 'var(--button-primary-border-color)',
    shadow: 'var(--button-primary-shadow)',
    shadowHover: 'var(--button-primary-shadow-hover)',
  },
  secondary: {
    bg: 'var(--button-secondary-bg)',
    bgHover: 'var(--button-secondary-bg-hover)',
    bgActive: 'var(--button-secondary-bg-active)',
    color: 'var(--button-secondary-color)',
    borderColor: 'var(--button-secondary-border-color)',
    shadow: 'var(--button-secondary-shadow)',
    shadowHover: 'var(--button-secondary-shadow-hover)',
  },
  default: {
    bg: 'var(--button-default-bg)',
    bgHover: 'var(--button-default-bg-hover)',
    bgActive: 'var(--button-default-bg-active)',
    color: 'var(--button-default-color)',
    borderColor: 'var(--button-default-border-color)',
    shadow: 'var(--button-default-shadow)',
    shadowHover: 'var(--button-default-shadow-hover)',
  },
  ghost: {
    bg: 'var(--button-ghost-bg)',
    bgHover: 'var(--button-ghost-bg-hover)',
    bgActive: 'var(--button-ghost-bg-active)',
    color: 'var(--button-ghost-color)',
    borderColor: 'var(--button-ghost-border-color)',
    shadow: 'var(--button-ghost-shadow)',
  },
  dashed: {
    bg: 'var(--button-dashed-bg)',
    bgHover: 'var(--button-dashed-bg-hover)',
    bgActive: 'var(--button-dashed-bg-active)',
    color: 'var(--button-dashed-color)',
    borderColor: 'var(--button-dashed-border-color)',
    borderStyle: 'var(--button-dashed-border-style)',
    shadow: 'var(--button-dashed-shadow)',
  },
  text: {
    bg: 'var(--button-text-bg)',
    bgHover: 'var(--button-text-bg-hover)',
    bgActive: 'var(--button-text-bg-active)',
    color: 'var(--button-text-color)',
    colorHover: 'var(--button-text-color-hover)',
    borderColor: 'var(--button-text-border-color)',
    shadow: 'var(--button-text-shadow)',
  },
  link: {
    bg: 'var(--button-link-bg)',
    bgHover: 'var(--button-link-bg-hover)',
    color: 'var(--button-link-color)',
    colorHover: 'var(--button-link-color-hover)',
    borderColor: 'var(--button-link-border-color)',
    textDecoration: 'var(--button-link-text-decoration)',
    textDecorationHover: 'var(--button-link-text-decoration-hover)',
    shadow: 'var(--button-link-shadow)',
  },
} as const;

// Semantic Button Variants
export const buttonSemanticVariant = {
  success: {
    bg: 'var(--button-success-bg)',
    bgHover: 'var(--button-success-bg-hover)',
    bgActive: 'var(--button-success-bg-active)',
    color: 'var(--button-success-color)',
    borderColor: 'var(--button-success-border-color)',
    shadow: 'var(--button-success-shadow)',
  },
  warning: {
    bg: 'var(--button-warning-bg)',
    bgHover: 'var(--button-warning-bg-hover)',
    bgActive: 'var(--button-warning-bg-active)',
    color: 'var(--button-warning-color)',
    borderColor: 'var(--button-warning-border-color)',
    shadow: 'var(--button-warning-shadow)',
  },
  error: {
    bg: 'var(--button-error-bg)',
    bgHover: 'var(--button-error-bg-hover)',
    bgActive: 'var(--button-error-bg-active)',
    color: 'var(--button-error-color)',
    borderColor: 'var(--button-error-border-color)',
    shadow: 'var(--button-error-shadow)',
  },
} as const;

// Button States
export const buttonState = {
  disabled: {
    bg: 'var(--button-disabled-bg)',
    color: 'var(--button-disabled-color)',
    borderColor: 'var(--button-disabled-border-color)',
    opacity: 'var(--button-disabled-opacity)',
    cursor: 'var(--button-disabled-cursor)',
    shadow: 'var(--button-disabled-shadow)',
  },
  loading: {
    opacity: 'var(--button-loading-opacity)',
    cursor: 'var(--button-loading-cursor)',
  },
  focus: {
    ring: 'var(--button-focus-ring)',
    ringOffset: 'var(--button-focus-ring-offset)',
    outline: 'var(--button-focus-outline)',
  },
} as const;

// Button Shapes
export const buttonShape = {
  square: 'var(--button-shape-square)',
  rounded: 'var(--button-shape-rounded)',
  pill: 'var(--button-shape-pill)',
  circle: 'var(--button-shape-circle)',
} as const;

// Icon Button
export const buttonIconOnly = {
  padding: 'var(--button-icon-only-padding)',
  xs: 'var(--button-icon-only-xs-size)',
  sm: 'var(--button-icon-only-sm-size)',
  md: 'var(--button-icon-only-md-size)',
  lg: 'var(--button-icon-only-lg-size)',
  xl: 'var(--button-icon-only-xl-size)',
} as const;

// Button Group
export const buttonGroup = {
  gap: 'var(--button-group-gap)',
  borderRadiusFirst: 'var(--button-group-border-radius-first)',
  borderRadiusLast: 'var(--button-group-border-radius-last)',
  borderRadiusMiddle: 'var(--button-group-border-radius-middle)',
  dividerColor: 'var(--button-group-divider-color)',
} as const;

// Button Spinner
export const buttonSpinner = {
  xs: 'var(--button-spinner-size-xs)',
  sm: 'var(--button-spinner-size-sm)',
  md: 'var(--button-spinner-size-md)',
  lg: 'var(--button-spinner-size-lg)',
  xl: 'var(--button-spinner-size-xl)',
  color: 'var(--button-spinner-color)',
} as const;

// Button Transition
export const buttonTransition = {
  duration: 'var(--button-transition-duration)',
  timing: 'var(--button-transition-timing)',
  all: 'var(--button-transition)',
} as const;

// Combined button tokens
export const buttonTokens = {
  size: buttonSize,
  variant: buttonVariant,
  semanticVariant: buttonSemanticVariant,
  state: buttonState,
  shape: buttonShape,
  iconOnly: buttonIconOnly,
  group: buttonGroup,
  spinner: buttonSpinner,
  transition: buttonTransition,
  fontFamily: 'var(--button-font-family)',
  fontWeight: 'var(--button-font-weight)',
  letterSpacing: 'var(--button-letter-spacing)',
  textTransform: 'var(--button-text-transform)',
  touchTargetMin: 'var(--button-touch-target-min)',
  borderWidth: 'var(--button-border-width)',
  borderWidthFocus: 'var(--button-border-width-focus)',
} as const;

// Type exports
export type ButtonSize = keyof typeof buttonSize;
export type ButtonVariant = keyof typeof buttonVariant;
export type ButtonSemanticVariant = keyof typeof buttonSemanticVariant;
export type ButtonShape = keyof typeof buttonShape;
