/**
 * @fileoverview Button component token mirrors.
 *
 * Covers 5 size tiers (xs-xl), 7 visual variants (primary through link),
 * 3 semantic variants (success/warning/error), disabled/loading/focus states,
 * shape options, icon-only sizing, button groups, and spinner/transition tokens.
 */

// Button Sizes
export const buttonSize = {
  xs: {
    height: 'var(--ds-button-xs-height)',
    paddingX: 'var(--ds-button-xs-padding-x)',
    paddingY: 'var(--ds-button-xs-padding-y)',
    padding: 'var(--ds-button-xs-padding)',
    fontSize: 'var(--ds-button-xs-font-size)',
    lineHeight: 'var(--ds-button-xs-line-height)',
    iconSize: 'var(--ds-button-xs-icon-size)',
    gap: 'var(--ds-button-xs-gap)',
    borderRadius: 'var(--ds-button-xs-border-radius)',
  },
  sm: {
    height: 'var(--ds-button-sm-height)',
    paddingX: 'var(--ds-button-sm-padding-x)',
    paddingY: 'var(--ds-button-sm-padding-y)',
    padding: 'var(--ds-button-sm-padding)',
    fontSize: 'var(--ds-button-sm-font-size)',
    lineHeight: 'var(--ds-button-sm-line-height)',
    iconSize: 'var(--ds-button-sm-icon-size)',
    gap: 'var(--ds-button-sm-gap)',
    borderRadius: 'var(--ds-button-sm-border-radius)',
  },
  md: {
    height: 'var(--ds-button-md-height)',
    paddingX: 'var(--ds-button-md-padding-x)',
    paddingY: 'var(--ds-button-md-padding-y)',
    padding: 'var(--ds-button-md-padding)',
    fontSize: 'var(--ds-button-md-font-size)',
    lineHeight: 'var(--ds-button-md-line-height)',
    iconSize: 'var(--ds-button-md-icon-size)',
    gap: 'var(--ds-button-md-gap)',
    borderRadius: 'var(--ds-button-md-border-radius)',
  },
  lg: {
    height: 'var(--ds-button-lg-height)',
    paddingX: 'var(--ds-button-lg-padding-x)',
    paddingY: 'var(--ds-button-lg-padding-y)',
    padding: 'var(--ds-button-lg-padding)',
    fontSize: 'var(--ds-button-lg-font-size)',
    lineHeight: 'var(--ds-button-lg-line-height)',
    iconSize: 'var(--ds-button-lg-icon-size)',
    gap: 'var(--ds-button-lg-gap)',
    borderRadius: 'var(--ds-button-lg-border-radius)',
  },
  xl: {
    height: 'var(--ds-button-xl-height)',
    paddingX: 'var(--ds-button-xl-padding-x)',
    paddingY: 'var(--ds-button-xl-padding-y)',
    padding: 'var(--ds-button-xl-padding)',
    fontSize: 'var(--ds-button-xl-font-size)',
    lineHeight: 'var(--ds-button-xl-line-height)',
    iconSize: 'var(--ds-button-xl-icon-size)',
    gap: 'var(--ds-button-xl-gap)',
    borderRadius: 'var(--ds-button-xl-border-radius)',
  },
} as const;

// Button Variants
export const buttonVariant = {
  primary: {
    bg: 'var(--ds-button-primary-bg)',
    bgHover: 'var(--ds-button-primary-bg-hover)',
    bgActive: 'var(--ds-button-primary-bg-active)',
    color: 'var(--ds-button-primary-color)',
    borderColor: 'var(--ds-button-primary-border-color)',
    shadow: 'var(--ds-button-primary-shadow)',
    shadowHover: 'var(--ds-button-primary-shadow-hover)',
  },
  secondary: {
    bg: 'var(--ds-button-secondary-bg)',
    bgHover: 'var(--ds-button-secondary-bg-hover)',
    bgActive: 'var(--ds-button-secondary-bg-active)',
    color: 'var(--ds-button-secondary-color)',
    borderColor: 'var(--ds-button-secondary-border-color)',
    shadow: 'var(--ds-button-secondary-shadow)',
    shadowHover: 'var(--ds-button-secondary-shadow-hover)',
  },
  default: {
    bg: 'var(--ds-button-default-bg)',
    bgHover: 'var(--ds-button-default-bg-hover)',
    bgActive: 'var(--ds-button-default-bg-active)',
    color: 'var(--ds-button-default-color)',
    borderColor: 'var(--ds-button-default-border-color)',
    shadow: 'var(--ds-button-default-shadow)',
    shadowHover: 'var(--ds-button-default-shadow-hover)',
  },
  ghost: {
    bg: 'var(--ds-button-ghost-bg)',
    bgHover: 'var(--ds-button-ghost-bg-hover)',
    bgActive: 'var(--ds-button-ghost-bg-active)',
    color: 'var(--ds-button-ghost-color)',
    borderColor: 'var(--ds-button-ghost-border-color)',
    shadow: 'var(--ds-button-ghost-shadow)',
  },
  dashed: {
    bg: 'var(--ds-button-dashed-bg)',
    bgHover: 'var(--ds-button-dashed-bg-hover)',
    bgActive: 'var(--ds-button-dashed-bg-active)',
    color: 'var(--ds-button-dashed-color)',
    borderColor: 'var(--ds-button-dashed-border-color)',
    borderStyle: 'var(--ds-button-dashed-border-style)',
    shadow: 'var(--ds-button-dashed-shadow)',
  },
  text: {
    bg: 'var(--ds-button-text-bg)',
    bgHover: 'var(--ds-button-text-bg-hover)',
    bgActive: 'var(--ds-button-text-bg-active)',
    color: 'var(--ds-button-text-color)',
    colorHover: 'var(--ds-button-text-color-hover)',
    borderColor: 'var(--ds-button-text-border-color)',
    shadow: 'var(--ds-button-text-shadow)',
  },
  link: {
    bg: 'var(--ds-button-link-bg)',
    bgHover: 'var(--ds-button-link-bg-hover)',
    color: 'var(--ds-button-link-color)',
    colorHover: 'var(--ds-button-link-color-hover)',
    borderColor: 'var(--ds-button-link-border-color)',
    textDecoration: 'var(--ds-button-link-text-decoration)',
    textDecorationHover: 'var(--ds-button-link-text-decoration-hover)',
    shadow: 'var(--ds-button-link-shadow)',
  },
} as const;

// Semantic Button Variants
export const buttonSemanticVariant = {
  success: {
    bg: 'var(--ds-button-success-bg)',
    bgHover: 'var(--ds-button-success-bg-hover)',
    bgActive: 'var(--ds-button-success-bg-active)',
    color: 'var(--ds-button-success-color)',
    borderColor: 'var(--ds-button-success-border-color)',
    shadow: 'var(--ds-button-success-shadow)',
  },
  warning: {
    bg: 'var(--ds-button-warning-bg)',
    bgHover: 'var(--ds-button-warning-bg-hover)',
    bgActive: 'var(--ds-button-warning-bg-active)',
    color: 'var(--ds-button-warning-color)',
    borderColor: 'var(--ds-button-warning-border-color)',
    shadow: 'var(--ds-button-warning-shadow)',
  },
  error: {
    bg: 'var(--ds-button-error-bg)',
    bgHover: 'var(--ds-button-error-bg-hover)',
    bgActive: 'var(--ds-button-error-bg-active)',
    color: 'var(--ds-button-error-color)',
    borderColor: 'var(--ds-button-error-border-color)',
    shadow: 'var(--ds-button-error-shadow)',
  },
} as const;

// Button States
export const buttonState = {
  disabled: {
    bg: 'var(--ds-button-disabled-bg)',
    color: 'var(--ds-button-disabled-color)',
    borderColor: 'var(--ds-button-disabled-border-color)',
    opacity: 'var(--ds-button-disabled-opacity)',
    cursor: 'var(--ds-button-disabled-cursor)',
    shadow: 'var(--ds-button-disabled-shadow)',
  },
  loading: {
    opacity: 'var(--ds-button-loading-opacity)',
    cursor: 'var(--ds-button-loading-cursor)',
  },
  focus: {
    ring: 'var(--ds-button-focus-ring)',
    ringOffset: 'var(--ds-button-focus-ring-offset)',
    outline: 'var(--ds-button-focus-outline)',
  },
} as const;

// Button Shapes
export const buttonShape = {
  square: 'var(--ds-button-shape-square)',
  rounded: 'var(--ds-button-shape-rounded)',
  pill: 'var(--ds-button-shape-pill)',
  circle: 'var(--ds-button-shape-circle)',
} as const;

// Icon Button
export const buttonIconOnly = {
  padding: 'var(--ds-button-icon-only-padding)',
  xs: 'var(--ds-button-icon-only-xs-size)',
  sm: 'var(--ds-button-icon-only-sm-size)',
  md: 'var(--ds-button-icon-only-md-size)',
  lg: 'var(--ds-button-icon-only-lg-size)',
  xl: 'var(--ds-button-icon-only-xl-size)',
} as const;

// Button Group
export const buttonGroup = {
  gap: 'var(--ds-button-group-gap)',
  borderRadiusFirst: 'var(--ds-button-group-border-radius-first)',
  borderRadiusLast: 'var(--ds-button-group-border-radius-last)',
  borderRadiusMiddle: 'var(--ds-button-group-border-radius-middle)',
  dividerColor: 'var(--ds-button-group-divider-color)',
} as const;

// Button Spinner
export const buttonSpinner = {
  xs: 'var(--ds-button-spinner-size-xs)',
  sm: 'var(--ds-button-spinner-size-sm)',
  md: 'var(--ds-button-spinner-size-md)',
  lg: 'var(--ds-button-spinner-size-lg)',
  xl: 'var(--ds-button-spinner-size-xl)',
  color: 'var(--ds-button-spinner-color)',
} as const;

// Button Transition
export const buttonTransition = {
  duration: 'var(--ds-button-transition-duration)',
  timing: 'var(--ds-button-transition-timing)',
  all: 'var(--ds-button-transition)',
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
  fontFamily: 'var(--ds-button-font-family)',
  fontWeight: 'var(--ds-button-font-weight)',
  letterSpacing: 'var(--ds-button-letter-spacing)',
  textTransform: 'var(--ds-button-text-transform)',
  touchTargetMin: 'var(--ds-button-touch-target-min)',
  borderWidth: 'var(--ds-button-border-width)',
  borderWidthFocus: 'var(--ds-button-border-width-focus)',
} as const;

// Type exports
//
// The canonical, publicly-exported Button size prop type is `ButtonSize` in
// `components/primitives/inputs/Button/Button.types.ts` (derived from the shared `Size`
// union). Tokens is the foundation layer components import FROM, never the reverse; this
// file's own size-key type -- the narrower set this token map defines entries for -- is
// named distinctly so the two do not share a name.
export type ButtonSizeToken = keyof typeof buttonSize;
export type ButtonVariant = keyof typeof buttonVariant;
export type ButtonSemanticVariant = keyof typeof buttonSemanticVariant;
export type ButtonShape = keyof typeof buttonShape;
