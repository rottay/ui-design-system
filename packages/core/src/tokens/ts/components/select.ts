/**
 * Select Component Tokens - TypeScript Mirror
 *
 * TypeScript representation of Select CSS custom properties.
 * Use these for type-safe Select token references.
 */

// Select Sizes
export const selectSize = {
  xs: {
    height: 'var(--select-xs-height)',
    fontSize: 'var(--select-xs-font-size)',
    padding: 'var(--select-xs-padding)',
    paddingX: 'var(--select-xs-padding-x)',
    iconSize: 'var(--select-xs-icon-size)',
    borderRadius: 'var(--select-xs-border-radius)',
  },
  sm: {
    height: 'var(--select-sm-height)',
    fontSize: 'var(--select-sm-font-size)',
    padding: 'var(--select-sm-padding)',
    paddingX: 'var(--select-sm-padding-x)',
    iconSize: 'var(--select-sm-icon-size)',
    borderRadius: 'var(--select-sm-border-radius)',
  },
  md: {
    height: 'var(--select-md-height)',
    fontSize: 'var(--select-md-font-size)',
    padding: 'var(--select-md-padding)',
    paddingX: 'var(--select-md-padding-x)',
    iconSize: 'var(--select-md-icon-size)',
    borderRadius: 'var(--select-md-border-radius)',
  },
  lg: {
    height: 'var(--select-lg-height)',
    fontSize: 'var(--select-lg-font-size)',
    padding: 'var(--select-lg-padding)',
    paddingX: 'var(--select-lg-padding-x)',
    iconSize: 'var(--select-lg-icon-size)',
    borderRadius: 'var(--select-lg-border-radius)',
  },
  xl: {
    height: 'var(--select-xl-height)',
    fontSize: 'var(--select-xl-font-size)',
    padding: 'var(--select-xl-padding)',
    paddingX: 'var(--select-xl-padding-x)',
    iconSize: 'var(--select-xl-icon-size)',
    borderRadius: 'var(--select-xl-border-radius)',
  },
} as const;

// Select Default State
export const selectDefault = {
  bg: 'var(--select-bg)',
  bgHover: 'var(--select-bg-hover)',
  bgFocus: 'var(--select-bg-focus)',
  bgDisabled: 'var(--select-bg-disabled)',
  color: 'var(--select-color)',
  colorPlaceholder: 'var(--select-color-placeholder)',
  colorDisabled: 'var(--select-color-disabled)',
  borderColor: 'var(--select-border-color)',
  borderColorHover: 'var(--select-border-color-hover)',
  borderColorFocus: 'var(--select-border-color-focus)',
  borderColorDisabled: 'var(--select-border-color-disabled)',
  borderWidth: 'var(--select-border-width)',
  borderStyle: 'var(--select-border-style)',
} as const;

// Select Variants
export const selectVariant = {
  outline: {
    bg: 'var(--select-outline-bg)',
    borderColor: 'var(--select-outline-border-color)',
  },
  filled: {
    bg: 'var(--select-filled-bg)',
    bgHover: 'var(--select-filled-bg-hover)',
    borderColor: 'var(--select-filled-border-color)',
  },
  flushed: {
    borderRadius: 'var(--select-flushed-border-radius)',
    borderWidth: 'var(--select-flushed-border-width)',
  },
} as const;

// Select Status
export const selectStatus = {
  success: {
    borderColor: 'var(--select-success-border-color)',
    borderColorFocus: 'var(--select-success-border-color-focus)',
    shadowFocus: 'var(--select-success-shadow-focus)',
  },
  warning: {
    borderColor: 'var(--select-warning-border-color)',
    borderColorFocus: 'var(--select-warning-border-color-focus)',
    shadowFocus: 'var(--select-warning-shadow-focus)',
  },
  error: {
    borderColor: 'var(--select-error-border-color)',
    borderColorFocus: 'var(--select-error-border-color-focus)',
    shadowFocus: 'var(--select-error-shadow-focus)',
  },
} as const;

// Select Dropdown
export const selectDropdown = {
  bg: 'var(--select-dropdown-bg)',
  borderColor: 'var(--select-dropdown-border-color)',
  borderRadius: 'var(--select-dropdown-border-radius)',
  shadow: 'var(--select-dropdown-shadow)',
  maxHeight: 'var(--select-dropdown-max-height)',
  padding: 'var(--select-dropdown-padding)',
  zIndex: 'var(--select-dropdown-z-index)',
} as const;

// Select Option
export const selectOption = {
  height: 'var(--select-option-height)',
  padding: 'var(--select-option-padding)',
  fontSize: 'var(--select-option-font-size)',
  borderRadius: 'var(--select-option-border-radius)',
  bg: 'var(--select-option-bg)',
  bgHover: 'var(--select-option-bg-hover)',
  bgSelected: 'var(--select-option-bg-selected)',
  bgFocused: 'var(--select-option-bg-focused)',
  bgDisabled: 'var(--select-option-bg-disabled)',
  color: 'var(--select-option-color)',
  colorSelected: 'var(--select-option-color-selected)',
  colorDisabled: 'var(--select-option-color-disabled)',
} as const;

// Select Icons
export const selectIcon = {
  arrow: {
    color: 'var(--select-arrow-color)',
    colorHover: 'var(--select-arrow-color-hover)',
    size: 'var(--select-arrow-size)',
    transition: 'var(--select-arrow-transition)',
  },
  clear: {
    color: 'var(--select-clear-color)',
    colorHover: 'var(--select-clear-color-hover)',
    size: 'var(--select-clear-size)',
    bgHover: 'var(--select-clear-bg-hover)',
    radius: 'var(--select-clear-radius)',
  },
} as const;

// Select Tags (Multi-select)
export const selectTag = {
  height: 'var(--select-tag-height)',
  padding: 'var(--select-tag-padding)',
  fontSize: 'var(--select-tag-font-size)',
  borderRadius: 'var(--select-tag-border-radius)',
  bg: 'var(--select-tag-bg)',
  color: 'var(--select-tag-color)',
  gap: 'var(--select-tag-gap)',
  close: {
    size: 'var(--select-tag-close-size)',
    color: 'var(--select-tag-close-color)',
    colorHover: 'var(--select-tag-close-color-hover)',
  },
} as const;

// Select Search
export const selectSearch = {
  bg: 'var(--select-search-bg)',
  borderColor: 'var(--select-search-border-color)',
  padding: 'var(--select-search-padding)',
  margin: 'var(--select-search-margin)',
} as const;

// Select Loading
export const selectLoading = {
  size: 'var(--select-loading-size)',
  color: 'var(--select-loading-color)',
} as const;

// Select Empty
export const selectEmpty = {
  padding: 'var(--select-empty-padding)',
  color: 'var(--select-empty-color)',
  fontSize: 'var(--select-empty-font-size)',
} as const;

// Select Group
export const selectGroup = {
  labelPadding: 'var(--select-group-label-padding)',
  labelFontSize: 'var(--select-group-label-font-size)',
  labelFontWeight: 'var(--select-group-label-font-weight)',
  labelColor: 'var(--select-group-label-color)',
  labelTextTransform: 'var(--select-group-label-text-transform)',
  dividerColor: 'var(--select-group-divider-color)',
} as const;

// Select Transition
export const selectTransition = {
  duration: 'var(--select-transition-duration)',
  timing: 'var(--select-transition-timing)',
  all: 'var(--select-transition)',
} as const;

// Select Disabled
export const selectDisabled = {
  opacity: 'var(--select-disabled-opacity)',
  cursor: 'var(--select-disabled-cursor)',
} as const;

// Combined select tokens
export const selectTokens = {
  size: selectSize,
  default: selectDefault,
  variant: selectVariant,
  status: selectStatus,
  dropdown: selectDropdown,
  option: selectOption,
  icon: selectIcon,
  tag: selectTag,
  search: selectSearch,
  loading: selectLoading,
  empty: selectEmpty,
  group: selectGroup,
  transition: selectTransition,
  disabled: selectDisabled,
} as const;

// Type exports
export type SelectSize = keyof typeof selectSize;
export type SelectVariant = keyof typeof selectVariant;
export type SelectStatus = keyof typeof selectStatus;
