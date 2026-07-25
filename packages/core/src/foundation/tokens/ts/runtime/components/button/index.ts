/**
 * @fileoverview Button component token mirrors.
 *
 * Covers 5 size tiers (xs-xl), the complete visual/AI variant matrix,
 * 4 semantic variants (success/warning/error/info), disabled/loading/focus states,
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
    colorHover: 'var(--ds-button-primary-color-hover)',
    colorActive: 'var(--ds-button-primary-color-active)',
    borderColor: 'var(--ds-button-primary-border)',
    borderHover: 'var(--ds-button-primary-border-hover)',
    borderActive: 'var(--ds-button-primary-border-active)',
    shadow: 'var(--ds-button-primary-shadow)',
    shadowHover: 'var(--ds-button-primary-shadow-hover)',
    shadowActive: 'var(--ds-button-primary-shadow-active)',
  },
  secondary: {
    bg: 'var(--ds-button-secondary-bg)',
    bgHover: 'var(--ds-button-secondary-bg-hover)',
    bgActive: 'var(--ds-button-secondary-bg-active)',
    color: 'var(--ds-button-secondary-color)',
    colorHover: 'var(--ds-button-secondary-color-hover)',
    colorActive: 'var(--ds-button-secondary-color-active)',
    borderColor: 'var(--ds-button-secondary-border)',
    borderHover: 'var(--ds-button-secondary-border-hover)',
    borderActive: 'var(--ds-button-secondary-border-active)',
    shadow: 'var(--ds-button-secondary-shadow)',
    shadowHover: 'var(--ds-button-secondary-shadow-hover)',
    shadowActive: 'var(--ds-button-secondary-shadow-active)',
  },
  default: {
    bg: 'var(--ds-button-default-bg)',
    bgHover: 'var(--ds-button-default-bg-hover)',
    bgActive: 'var(--ds-button-default-bg-active)',
    color: 'var(--ds-button-default-color)',
    colorHover: 'var(--ds-button-default-color-hover)',
    colorActive: 'var(--ds-button-default-color-active)',
    borderColor: 'var(--ds-button-default-border)',
    borderHover: 'var(--ds-button-default-border-hover)',
    borderActive: 'var(--ds-button-default-border-active)',
    shadow: 'var(--ds-button-default-shadow)',
    shadowHover: 'var(--ds-button-default-shadow-hover)',
    shadowActive: 'var(--ds-button-default-shadow-active)',
  },
  ghost: {
    bg: 'var(--ds-button-ghost-bg)',
    bgHover: 'var(--ds-button-ghost-bg-hover)',
    bgActive: 'var(--ds-button-ghost-bg-active)',
    color: 'var(--ds-button-ghost-color)',
    colorHover: 'var(--ds-button-ghost-color-hover)',
    colorActive: 'var(--ds-button-ghost-color-active)',
    borderColor: 'var(--ds-button-ghost-border)',
    borderHover: 'var(--ds-button-ghost-border-hover)',
    borderActive: 'var(--ds-button-ghost-border-active)',
    shadow: 'var(--ds-button-ghost-shadow)',
    shadowHover: 'var(--ds-button-ghost-shadow-hover)',
    shadowActive: 'var(--ds-button-ghost-shadow-active)',
  },
  dashed: {
    bg: 'var(--ds-button-dashed-bg)',
    bgHover: 'var(--ds-button-dashed-bg-hover)',
    bgActive: 'var(--ds-button-dashed-bg-active)',
    color: 'var(--ds-button-dashed-color)',
    colorHover: 'var(--ds-button-dashed-color-hover)',
    colorActive: 'var(--ds-button-dashed-color-active)',
    borderColor: 'var(--ds-button-dashed-border)',
    borderHover: 'var(--ds-button-dashed-border-hover)',
    borderActive: 'var(--ds-button-dashed-border-active)',
    borderStyle: 'var(--ds-button-dashed-border-style)',
    shadow: 'var(--ds-button-dashed-shadow)',
    shadowHover: 'var(--ds-button-dashed-shadow-hover)',
    shadowActive: 'var(--ds-button-dashed-shadow-active)',
  },
  text: {
    bg: 'var(--ds-button-text-bg)',
    bgHover: 'var(--ds-button-text-bg-hover)',
    bgActive: 'var(--ds-button-text-bg-active)',
    color: 'var(--ds-button-text-color)',
    colorHover: 'var(--ds-button-text-color-hover)',
    colorActive: 'var(--ds-button-text-color-active)',
    borderColor: 'var(--ds-button-text-border)',
    borderHover: 'var(--ds-button-text-border-hover)',
    borderActive: 'var(--ds-button-text-border-active)',
    shadow: 'var(--ds-button-text-shadow)',
    shadowHover: 'var(--ds-button-text-shadow-hover)',
    shadowActive: 'var(--ds-button-text-shadow-active)',
  },
  link: {
    bg: 'var(--ds-button-link-bg)',
    bgHover: 'var(--ds-button-link-bg-hover)',
    bgActive: 'var(--ds-button-link-bg-active)',
    color: 'var(--ds-button-link-color)',
    colorHover: 'var(--ds-button-link-color-hover)',
    colorActive: 'var(--ds-button-link-color-active)',
    borderColor: 'var(--ds-button-link-border)',
    borderHover: 'var(--ds-button-link-border-hover)',
    borderActive: 'var(--ds-button-link-border-active)',
    textDecoration: 'var(--ds-button-link-text-decoration)',
    textDecorationHover: 'var(--ds-button-link-text-decoration-hover)',
    shadow: 'var(--ds-button-link-shadow)',
    shadowHover: 'var(--ds-button-link-shadow-hover)',
    shadowActive: 'var(--ds-button-link-shadow-active)',
  },
} as const;

// Semantic Button Variants
export const buttonSemanticVariant = {
  success: {
    bg: 'var(--ds-button-success-bg)',
    bgHover: 'var(--ds-button-success-bg-hover)',
    bgActive: 'var(--ds-button-success-bg-active)',
    color: 'var(--ds-button-success-color)',
    colorHover: 'var(--ds-button-success-color-hover)',
    colorActive: 'var(--ds-button-success-color-active)',
    borderColor: 'var(--ds-button-success-border)',
    borderHover: 'var(--ds-button-success-border-hover)',
    borderActive: 'var(--ds-button-success-border-active)',
    shadow: 'var(--ds-button-success-shadow)',
    shadowHover: 'var(--ds-button-success-shadow-hover)',
    shadowActive: 'var(--ds-button-success-shadow-active)',
  },
  warning: {
    bg: 'var(--ds-button-warning-bg)',
    bgHover: 'var(--ds-button-warning-bg-hover)',
    bgActive: 'var(--ds-button-warning-bg-active)',
    color: 'var(--ds-button-warning-color)',
    colorHover: 'var(--ds-button-warning-color-hover)',
    colorActive: 'var(--ds-button-warning-color-active)',
    borderColor: 'var(--ds-button-warning-border)',
    borderHover: 'var(--ds-button-warning-border-hover)',
    borderActive: 'var(--ds-button-warning-border-active)',
    shadow: 'var(--ds-button-warning-shadow)',
    shadowHover: 'var(--ds-button-warning-shadow-hover)',
    shadowActive: 'var(--ds-button-warning-shadow-active)',
  },
  error: {
    bg: 'var(--ds-button-error-bg)',
    bgHover: 'var(--ds-button-error-bg-hover)',
    bgActive: 'var(--ds-button-error-bg-active)',
    color: 'var(--ds-button-error-color)',
    colorHover: 'var(--ds-button-error-color-hover)',
    colorActive: 'var(--ds-button-error-color-active)',
    borderColor: 'var(--ds-button-error-border)',
    borderHover: 'var(--ds-button-error-border-hover)',
    borderActive: 'var(--ds-button-error-border-active)',
    shadow: 'var(--ds-button-error-shadow)',
    shadowHover: 'var(--ds-button-error-shadow-hover)',
    shadowActive: 'var(--ds-button-error-shadow-active)',
  },
  info: {
    bg: 'var(--ds-button-info-bg)',
    bgHover: 'var(--ds-button-info-bg-hover)',
    bgActive: 'var(--ds-button-info-bg-active)',
    color: 'var(--ds-button-info-color)',
    colorHover: 'var(--ds-button-info-color-hover)',
    colorActive: 'var(--ds-button-info-color-active)',
    borderColor: 'var(--ds-button-info-border)',
    borderHover: 'var(--ds-button-info-border-hover)',
    borderActive: 'var(--ds-button-info-border-active)',
    shadow: 'var(--ds-button-info-shadow)',
    shadowHover: 'var(--ds-button-info-shadow-hover)',
    shadowActive: 'var(--ds-button-info-shadow-active)',
  },
} as const;

export const buttonAIVariant = {
  bg: 'var(--ds-button-ai-bg)',
  bgHover: 'var(--ds-button-ai-bg-hover)',
  bgActive: 'var(--ds-button-ai-bg-active)',
  color: 'var(--ds-button-ai-color)',
  colorHover: 'var(--ds-button-ai-color-hover)',
  colorActive: 'var(--ds-button-ai-color-active)',
  borderColor: 'var(--ds-button-ai-border)',
  borderHover: 'var(--ds-button-ai-border-hover)',
  borderActive: 'var(--ds-button-ai-border-active)',
  shadow: 'var(--ds-button-ai-shadow)',
  shadowHover: 'var(--ds-button-ai-shadow-hover)',
  shadowActive: 'var(--ds-button-ai-shadow-active)',
  texture: 'var(--ds-button-ai-texture)',
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
  aiVariant: buttonAIVariant,
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
