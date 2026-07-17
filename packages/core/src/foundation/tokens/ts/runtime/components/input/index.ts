/**
 * @fileoverview Input component token mirrors.
 *
 * Covers 5 size tiers, default/hover/focus/disabled states, validation variants
 * (success/warning/error), addon/prefix/suffix styling, label and helper text,
 * clear button, input groups, textarea, readonly, and transition tokens.
 */

// Input Sizes
export const inputSize = {
  xs: {
    height: 'var(--ds-input-xs-height)',
    paddingX: 'var(--ds-input-xs-padding-x)',
    paddingY: 'var(--ds-input-xs-padding-y)',
    fontSize: 'var(--ds-input-xs-font-size)',
    lineHeight: 'var(--ds-input-xs-line-height)',
    iconSize: 'var(--ds-input-xs-icon-size)',
    borderRadius: 'var(--ds-input-xs-border-radius)',
  },
  sm: {
    height: 'var(--ds-input-sm-height)',
    paddingX: 'var(--ds-input-sm-padding-x)',
    paddingY: 'var(--ds-input-sm-padding-y)',
    fontSize: 'var(--ds-input-sm-font-size)',
    lineHeight: 'var(--ds-input-sm-line-height)',
    iconSize: 'var(--ds-input-sm-icon-size)',
    borderRadius: 'var(--ds-input-sm-border-radius)',
  },
  md: {
    height: 'var(--ds-input-md-height)',
    paddingX: 'var(--ds-input-md-padding-x)',
    paddingY: 'var(--ds-input-md-padding-y)',
    fontSize: 'var(--ds-input-md-font-size)',
    lineHeight: 'var(--ds-input-md-line-height)',
    iconSize: 'var(--ds-input-md-icon-size)',
    borderRadius: 'var(--ds-input-md-border-radius)',
  },
  lg: {
    height: 'var(--ds-input-lg-height)',
    paddingX: 'var(--ds-input-lg-padding-x)',
    paddingY: 'var(--ds-input-lg-padding-y)',
    fontSize: 'var(--ds-input-lg-font-size)',
    lineHeight: 'var(--ds-input-lg-line-height)',
    iconSize: 'var(--ds-input-lg-icon-size)',
    borderRadius: 'var(--ds-input-lg-border-radius)',
  },
  xl: {
    height: 'var(--ds-input-xl-height)',
    paddingX: 'var(--ds-input-xl-padding-x)',
    paddingY: 'var(--ds-input-xl-padding-y)',
    fontSize: 'var(--ds-input-xl-font-size)',
    lineHeight: 'var(--ds-input-xl-line-height)',
    iconSize: 'var(--ds-input-xl-icon-size)',
    borderRadius: 'var(--ds-input-xl-border-radius)',
  },
} as const;

// Input Default State
export const inputDefault = {
  bg: 'var(--ds-input-bg)',
  bgHover: 'var(--ds-input-bg-hover)',
  bgFocus: 'var(--ds-input-bg-focus)',
  bgDisabled: 'var(--ds-input-bg-disabled)',
  color: 'var(--ds-input-color)',
  colorPlaceholder: 'var(--ds-input-color-placeholder)',
  colorDisabled: 'var(--ds-input-color-disabled)',
  borderColor: 'var(--ds-input-border-color)',
  borderColorHover: 'var(--ds-input-border-color-hover)',
  borderColorFocus: 'var(--ds-input-border-color-focus)',
  borderColorDisabled: 'var(--ds-input-border-color-disabled)',
  borderWidth: 'var(--ds-input-border-width)',
  borderWidthFocus: 'var(--ds-input-border-width-focus)',
  borderStyle: 'var(--ds-input-border-style)',
} as const;

// Input Variants
export const inputVariant = {
  success: {
    borderColor: 'var(--ds-input-success-border-color)',
    borderColorFocus: 'var(--ds-input-success-border-color-focus)',
    shadowFocus: 'var(--ds-input-success-shadow-focus)',
    iconColor: 'var(--ds-input-success-icon-color)',
  },
  warning: {
    borderColor: 'var(--ds-input-warning-border-color)',
    borderColorFocus: 'var(--ds-input-warning-border-color-focus)',
    shadowFocus: 'var(--ds-input-warning-shadow-focus)',
    iconColor: 'var(--ds-input-warning-icon-color)',
  },
  error: {
    borderColor: 'var(--ds-input-error-border-color)',
    borderColorFocus: 'var(--ds-input-error-border-color-focus)',
    shadowFocus: 'var(--ds-input-error-shadow-focus)',
    iconColor: 'var(--ds-input-error-icon-color)',
  },
} as const;

// Input Shadows
export const inputShadow = {
  rest: 'var(--ds-input-shadow-rest)',
  focus: 'var(--ds-input-shadow-focus)',
  errorFocus: 'var(--ds-input-shadow-error-focus)',
} as const;

// Input Addons
export const inputAddon = {
  bg: 'var(--ds-input-addon-bg)',
  color: 'var(--ds-input-addon-color)',
  borderColor: 'var(--ds-input-addon-border-color)',
  paddingX: 'var(--ds-input-addon-padding-x)',
  affixGap: 'var(--ds-input-affix-gap)',
  affixColor: 'var(--ds-input-affix-color)',
} as const;

// Input Icons
export const inputIcon = {
  color: 'var(--ds-input-icon-color)',
  colorHover: 'var(--ds-input-icon-color-hover)',
  gap: 'var(--ds-input-icon-gap)',
} as const;

// Input Clear Button
export const inputClear = {
  size: 'var(--ds-input-clear-size)',
  color: 'var(--ds-input-clear-color)',
  colorHover: 'var(--ds-input-clear-color-hover)',
  bgHover: 'var(--ds-input-clear-bg-hover)',
  radius: 'var(--ds-input-clear-radius)',
} as const;

// Input Label
export const inputLabel = {
  color: 'var(--ds-input-label-color)',
  colorDisabled: 'var(--ds-input-label-color-disabled)',
  fontSize: 'var(--ds-input-label-font-size)',
  fontWeight: 'var(--ds-input-label-font-weight)',
  marginBottom: 'var(--ds-input-label-margin-bottom)',
  requiredColor: 'var(--ds-input-label-required-color)',
} as const;

// Input Helper Text
export const inputHelper = {
  color: 'var(--ds-input-helper-color)',
  fontSize: 'var(--ds-input-helper-font-size)',
  marginTop: 'var(--ds-input-helper-margin-top)',
  lineHeight: 'var(--ds-input-helper-line-height)',
} as const;

// Input Error Message
export const inputErrorMessage = {
  color: 'var(--ds-input-error-message-color)',
  fontSize: 'var(--ds-input-error-message-font-size)',
  marginTop: 'var(--ds-input-error-message-margin-top)',
  iconSize: 'var(--ds-input-error-message-icon-size)',
} as const;

// Input Group
export const inputGroup = {
  gap: 'var(--ds-input-group-gap)',
  borderRadiusFirst: 'var(--ds-input-group-border-radius-first)',
  borderRadiusLast: 'var(--ds-input-group-border-radius-last)',
  borderRadiusMiddle: 'var(--ds-input-group-border-radius-middle)',
} as const;

// Input Textarea
export const inputTextarea = {
  minHeight: 'var(--ds-textarea-min-height)',
  maxHeight: 'var(--ds-textarea-max-height, var(--textarea-max-height))',
} as const;

// Input Transition
export const inputTransition = {
  duration: 'var(--ds-input-transition-duration)',
  timing: 'var(--ds-input-transition-timing)',
  all: 'var(--ds-input-transition)',
} as const;

// Input Disabled
export const inputDisabled = {
  opacity: 'var(--ds-input-disabled-opacity)',
  cursor: 'var(--ds-input-disabled-cursor)',
} as const;

// Input Readonly
export const inputReadonly = {
  bg: 'var(--ds-input-readonly-bg)',
  cursor: 'var(--ds-input-readonly-cursor)',
  borderStyle: 'var(--ds-input-readonly-border-style)',
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
  fontFamily: 'var(--ds-input-font-family)',
  fontWeight: 'var(--ds-input-font-weight)',
  letterSpacing: 'var(--ds-input-letter-spacing)',
  autofillBg: 'var(--ds-input-autofill-bg)',
  autofillColor: 'var(--ds-input-autofill-color)',
} as const;

// Type exports
export type InputSize = keyof typeof inputSize;
export type InputVariant = keyof typeof inputVariant;
