/**
 * Input Component Tokens - TypeScript Mirror
 *
 * TypeScript representation of Input CSS custom properties.
 * Use these for type-safe Input token references.
 */

// Input Sizes
export const inputSize = {
  xs: {
    height: 'var(--input-xs-height)',
    paddingX: 'var(--input-xs-padding-x)',
    paddingY: 'var(--input-xs-padding-y)',
    fontSize: 'var(--input-xs-font-size)',
    lineHeight: 'var(--input-xs-line-height)',
    iconSize: 'var(--input-xs-icon-size)',
    borderRadius: 'var(--input-xs-border-radius)',
  },
  sm: {
    height: 'var(--input-sm-height)',
    paddingX: 'var(--input-sm-padding-x)',
    paddingY: 'var(--input-sm-padding-y)',
    fontSize: 'var(--input-sm-font-size)',
    lineHeight: 'var(--input-sm-line-height)',
    iconSize: 'var(--input-sm-icon-size)',
    borderRadius: 'var(--input-sm-border-radius)',
  },
  md: {
    height: 'var(--input-md-height)',
    paddingX: 'var(--input-md-padding-x)',
    paddingY: 'var(--input-md-padding-y)',
    fontSize: 'var(--input-md-font-size)',
    lineHeight: 'var(--input-md-line-height)',
    iconSize: 'var(--input-md-icon-size)',
    borderRadius: 'var(--input-md-border-radius)',
  },
  lg: {
    height: 'var(--input-lg-height)',
    paddingX: 'var(--input-lg-padding-x)',
    paddingY: 'var(--input-lg-padding-y)',
    fontSize: 'var(--input-lg-font-size)',
    lineHeight: 'var(--input-lg-line-height)',
    iconSize: 'var(--input-lg-icon-size)',
    borderRadius: 'var(--input-lg-border-radius)',
  },
  xl: {
    height: 'var(--input-xl-height)',
    paddingX: 'var(--input-xl-padding-x)',
    paddingY: 'var(--input-xl-padding-y)',
    fontSize: 'var(--input-xl-font-size)',
    lineHeight: 'var(--input-xl-line-height)',
    iconSize: 'var(--input-xl-icon-size)',
    borderRadius: 'var(--input-xl-border-radius)',
  },
} as const;

// Input Default State
export const inputDefault = {
  bg: 'var(--input-bg)',
  bgHover: 'var(--input-bg-hover)',
  bgFocus: 'var(--input-bg-focus)',
  bgDisabled: 'var(--input-bg-disabled)',
  color: 'var(--input-color)',
  colorPlaceholder: 'var(--input-color-placeholder)',
  colorDisabled: 'var(--input-color-disabled)',
  borderColor: 'var(--input-border-color)',
  borderColorHover: 'var(--input-border-color-hover)',
  borderColorFocus: 'var(--input-border-color-focus)',
  borderColorDisabled: 'var(--input-border-color-disabled)',
  borderWidth: 'var(--input-border-width)',
  borderWidthFocus: 'var(--input-border-width-focus)',
  borderStyle: 'var(--input-border-style)',
} as const;

// Input Variants
export const inputVariant = {
  success: {
    borderColor: 'var(--input-success-border-color)',
    borderColorFocus: 'var(--input-success-border-color-focus)',
    shadowFocus: 'var(--input-success-shadow-focus)',
    iconColor: 'var(--input-success-icon-color)',
  },
  warning: {
    borderColor: 'var(--input-warning-border-color)',
    borderColorFocus: 'var(--input-warning-border-color-focus)',
    shadowFocus: 'var(--input-warning-shadow-focus)',
    iconColor: 'var(--input-warning-icon-color)',
  },
  error: {
    borderColor: 'var(--input-error-border-color)',
    borderColorFocus: 'var(--input-error-border-color-focus)',
    shadowFocus: 'var(--input-error-shadow-focus)',
    iconColor: 'var(--input-error-icon-color)',
  },
} as const;

// Input Shadows
export const inputShadow = {
  rest: 'var(--input-shadow-rest)',
  focus: 'var(--input-shadow-focus)',
  errorFocus: 'var(--input-shadow-error-focus)',
} as const;

// Input Addons
export const inputAddon = {
  bg: 'var(--input-addon-bg)',
  color: 'var(--input-addon-color)',
  borderColor: 'var(--input-addon-border-color)',
  paddingX: 'var(--input-addon-padding-x)',
  affixGap: 'var(--input-affix-gap)',
  affixColor: 'var(--input-affix-color)',
} as const;

// Input Icons
export const inputIcon = {
  color: 'var(--input-icon-color)',
  colorHover: 'var(--input-icon-color-hover)',
  gap: 'var(--input-icon-gap)',
} as const;

// Input Clear Button
export const inputClear = {
  size: 'var(--input-clear-size)',
  color: 'var(--input-clear-color)',
  colorHover: 'var(--input-clear-color-hover)',
  bgHover: 'var(--input-clear-bg-hover)',
  radius: 'var(--input-clear-radius)',
} as const;

// Input Label
export const inputLabel = {
  color: 'var(--input-label-color)',
  colorDisabled: 'var(--input-label-color-disabled)',
  fontSize: 'var(--input-label-font-size)',
  fontWeight: 'var(--input-label-font-weight)',
  marginBottom: 'var(--input-label-margin-bottom)',
  requiredColor: 'var(--input-label-required-color)',
} as const;

// Input Helper Text
export const inputHelper = {
  color: 'var(--input-helper-color)',
  fontSize: 'var(--input-helper-font-size)',
  marginTop: 'var(--input-helper-margin-top)',
  lineHeight: 'var(--input-helper-line-height)',
} as const;

// Input Error Message
export const inputErrorMessage = {
  color: 'var(--input-error-message-color)',
  fontSize: 'var(--input-error-message-font-size)',
  marginTop: 'var(--input-error-message-margin-top)',
  iconSize: 'var(--input-error-message-icon-size)',
} as const;

// Input Group
export const inputGroup = {
  gap: 'var(--input-group-gap)',
  borderRadiusFirst: 'var(--input-group-border-radius-first)',
  borderRadiusLast: 'var(--input-group-border-radius-last)',
  borderRadiusMiddle: 'var(--input-group-border-radius-middle)',
} as const;

// Input Textarea
export const inputTextarea = {
  minHeight: 'var(--textarea-min-height)',
  maxHeight: 'var(--textarea-max-height)',
} as const;

// Input Transition
export const inputTransition = {
  duration: 'var(--input-transition-duration)',
  timing: 'var(--input-transition-timing)',
  all: 'var(--input-transition)',
} as const;

// Input Disabled
export const inputDisabled = {
  opacity: 'var(--input-disabled-opacity)',
  cursor: 'var(--input-disabled-cursor)',
} as const;

// Input Readonly
export const inputReadonly = {
  bg: 'var(--input-readonly-bg)',
  cursor: 'var(--input-readonly-cursor)',
  borderStyle: 'var(--input-readonly-border-style)',
} as const;

// Combined input tokens
export const inputTokens = {
  size: inputSize,
  default: inputDefault,
  variant: inputVariant,
  shadow: inputShadow,
  addon: inputAddon,
  icon: inputIcon,
  clear: inputClear,
  label: inputLabel,
  helper: inputHelper,
  errorMessage: inputErrorMessage,
  group: inputGroup,
  textarea: inputTextarea,
  transition: inputTransition,
  disabled: inputDisabled,
  readonly: inputReadonly,
  fontFamily: 'var(--input-font-family)',
  fontWeight: 'var(--input-font-weight)',
  letterSpacing: 'var(--input-letter-spacing)',
  autofillBg: 'var(--input-autofill-bg)',
  autofillColor: 'var(--input-autofill-color)',
} as const;

// Type exports
export type InputSize = keyof typeof inputSize;
export type InputVariant = keyof typeof inputVariant;
