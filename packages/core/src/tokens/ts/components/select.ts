/**
 * Select Component Tokens - TypeScript Mirror
 *
 * TypeScript representation of Select CSS custom properties.
 * Use these for type-safe Select token references.
 */

// Select Sizes
export const selectSize = {
  xs: {
    height: 'var(--ds-select-xs-height)',
    fontSize: 'var(--ds-select-xs-font-size)',
    padding: 'var(--ds-select-xs-padding)',
    paddingX: 'var(--ds-select-xs-padding-x)',
    iconSize: 'var(--ds-select-xs-icon-size)',
    borderRadius: 'var(--ds-select-xs-border-radius)',
  },
  sm: {
    height: 'var(--ds-select-sm-height)',
    fontSize: 'var(--ds-select-sm-font-size)',
    padding: 'var(--ds-select-sm-padding)',
    paddingX: 'var(--ds-select-sm-padding-x)',
    iconSize: 'var(--ds-select-sm-icon-size)',
    borderRadius: 'var(--ds-select-sm-border-radius)',
  },
  md: {
    height: 'var(--ds-select-md-height)',
    fontSize: 'var(--ds-select-md-font-size)',
    padding: 'var(--ds-select-md-padding)',
    paddingX: 'var(--ds-select-md-padding-x)',
    iconSize: 'var(--ds-select-md-icon-size)',
    borderRadius: 'var(--ds-select-md-border-radius)',
  },
  lg: {
    height: 'var(--ds-select-lg-height)',
    fontSize: 'var(--ds-select-lg-font-size)',
    padding: 'var(--ds-select-lg-padding)',
    paddingX: 'var(--ds-select-lg-padding-x)',
    iconSize: 'var(--ds-select-lg-icon-size)',
    borderRadius: 'var(--ds-select-lg-border-radius)',
  },
  xl: {
    height: 'var(--ds-select-xl-height)',
    fontSize: 'var(--ds-select-xl-font-size)',
    padding: 'var(--ds-select-xl-padding)',
    paddingX: 'var(--ds-select-xl-padding-x)',
    iconSize: 'var(--ds-select-xl-icon-size)',
    borderRadius: 'var(--ds-select-xl-border-radius)',
  },
} as const;

// Select Default State
export const selectDefault = {
  bg: 'var(--ds-select-bg)',
  bgHover: 'var(--ds-select-bg-hover)',
  bgFocus: 'var(--ds-select-bg-focus)',
  bgDisabled: 'var(--ds-select-bg-disabled)',
  color: 'var(--ds-select-color)',
  colorPlaceholder: 'var(--ds-select-color-placeholder)',
  colorDisabled: 'var(--ds-select-color-disabled)',
  borderColor: 'var(--ds-select-border-color)',
  borderColorHover: 'var(--ds-select-border-color-hover)',
  borderColorFocus: 'var(--ds-select-border-color-focus)',
  borderColorDisabled: 'var(--ds-select-border-color-disabled)',
  borderWidth: 'var(--ds-select-border-width)',
  borderStyle: 'var(--ds-select-border-style)',
} as const;

// Select Variants
export const selectVariant = {
  outline: {
    bg: 'var(--ds-select-outline-bg)',
    borderColor: 'var(--ds-select-outline-border-color)',
  },
  filled: {
    bg: 'var(--ds-select-filled-bg)',
    bgHover: 'var(--ds-select-filled-bg-hover)',
    borderColor: 'var(--ds-select-filled-border-color)',
  },
  flushed: {
    borderRadius: 'var(--ds-select-flushed-border-radius)',
    borderWidth: 'var(--ds-select-flushed-border-width)',
  },
} as const;

// Select Status
export const selectStatus = {
  success: {
    borderColor: 'var(--ds-select-success-border-color)',
    borderColorFocus: 'var(--ds-select-success-border-color-focus)',
    shadowFocus: 'var(--ds-select-success-shadow-focus)',
  },
  warning: {
    borderColor: 'var(--ds-select-warning-border-color)',
    borderColorFocus: 'var(--ds-select-warning-border-color-focus)',
    shadowFocus: 'var(--ds-select-warning-shadow-focus)',
  },
  error: {
    borderColor: 'var(--ds-select-error-border-color)',
    borderColorFocus: 'var(--ds-select-error-border-color-focus)',
    shadowFocus: 'var(--ds-select-error-shadow-focus)',
  },
} as const;

// Select Dropdown
export const selectDropdown = {
  bg: 'var(--ds-select-dropdown-bg)',
  borderColor: 'var(--ds-select-dropdown-border-color)',
  borderRadius: 'var(--ds-select-dropdown-border-radius)',
  shadow: 'var(--ds-select-dropdown-shadow)',
  maxHeight: 'var(--ds-select-dropdown-max-height)',
  padding: 'var(--ds-select-dropdown-padding)',
  zIndex: 'var(--ds-select-dropdown-z-index)',
} as const;

// Select Option
export const selectOption = {
  height: 'var(--ds-select-option-height)',
  padding: 'var(--ds-select-option-padding)',
  fontSize: 'var(--ds-select-option-font-size)',
  borderRadius: 'var(--ds-select-option-border-radius)',
  bg: 'var(--ds-select-option-bg)',
  bgHover: 'var(--ds-select-option-bg-hover)',
  bgSelected: 'var(--ds-select-option-bg-selected)',
  bgFocused: 'var(--ds-select-option-bg-focused)',
  bgDisabled: 'var(--ds-select-option-bg-disabled)',
  color: 'var(--ds-select-option-color)',
  colorSelected: 'var(--ds-select-option-color-selected)',
  colorDisabled: 'var(--ds-select-option-color-disabled)',
} as const;

// Select Icons
export const selectIcon = {
  arrow: {
    color: 'var(--ds-select-arrow-color)',
    colorHover: 'var(--ds-select-arrow-color-hover)',
    size: 'var(--ds-select-arrow-size)',
    transition: 'var(--ds-select-arrow-transition)',
  },
  clear: {
    color: 'var(--ds-select-clear-color)',
    colorHover: 'var(--ds-select-clear-color-hover)',
    size: 'var(--ds-select-clear-size)',
    bgHover: 'var(--ds-select-clear-bg-hover)',
    radius: 'var(--ds-select-clear-radius)',
  },
} as const;

// Select Tags (Multi-select)
export const selectTag = {
  height: 'var(--ds-select-tag-height)',
  padding: 'var(--ds-select-tag-padding)',
  fontSize: 'var(--ds-select-tag-font-size)',
  borderRadius: 'var(--ds-select-tag-border-radius)',
  bg: 'var(--ds-select-tag-bg)',
  color: 'var(--ds-select-tag-color)',
  gap: 'var(--ds-select-tag-gap)',
  close: {
    size: 'var(--ds-select-tag-close-size)',
    color: 'var(--ds-select-tag-close-color)',
    colorHover: 'var(--ds-select-tag-close-color-hover)',
  },
} as const;

// Select Search
export const selectSearch = {
  bg: 'var(--ds-select-search-bg)',
  borderColor: 'var(--ds-select-search-border-color)',
  padding: 'var(--ds-select-search-padding)',
  margin: 'var(--ds-select-search-margin)',
} as const;

// Select Loading
export const selectLoading = {
  size: 'var(--ds-select-loading-size)',
  color: 'var(--ds-select-loading-color)',
} as const;

// Select Empty
export const selectEmpty = {
  padding: 'var(--ds-select-empty-padding)',
  color: 'var(--ds-select-empty-color)',
  fontSize: 'var(--ds-select-empty-font-size)',
} as const;

// Select Group
export const selectGroup = {
  labelPadding: 'var(--ds-select-group-label-padding)',
  labelFontSize: 'var(--ds-select-group-label-font-size)',
  labelFontWeight: 'var(--ds-select-group-label-font-weight)',
  labelColor: 'var(--ds-select-group-label-color)',
  labelTextTransform: 'var(--ds-select-group-label-text-transform)',
  dividerColor: 'var(--ds-select-group-divider-color)',
} as const;

// Select Transition
export const selectTransition = {
  duration: 'var(--ds-select-transition-duration)',
  timing: 'var(--ds-select-transition-timing)',
  all: 'var(--ds-select-transition)',
} as const;

// Select Disabled
export const selectDisabled = {
  opacity: 'var(--ds-select-disabled-opacity)',
  cursor: 'var(--ds-select-disabled-cursor)',
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
