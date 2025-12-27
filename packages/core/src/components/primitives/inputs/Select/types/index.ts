/**
 * Select - Core Interface
 * Local types for the Select primitive component
 */

import type { ReactNode, CSSProperties, FocusEvent } from 'react';
import type { EngineAwareProps } from '../../../../../types/engine';

// Size types - extended to include xs and xl
export type SelectSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Variant types for visual appearance
export type SelectVariant = 'outline' | 'filled' | 'flushed' | 'default';

// Status types for validation feedback
export type SelectStatus = 'default' | 'error' | 'warning' | 'success';

// Mode types
export type SelectMode = 'single' | 'multiple' | 'tags';

/**
 * Select option interface
 */
export interface SelectOption<T = string | number> {
  /** Option value */
  value: T;
  /** Option label (displayed text) */
  label: ReactNode;
  /** Whether the option is disabled */
  disabled?: boolean;
  /** Optional icon to display before the label */
  icon?: ReactNode;
  /** Group name for grouping options */
  group?: string;
  /** Additional description */
  description?: ReactNode;
}

/**
 * Select option group interface
 */
export interface SelectOptionGroup<T = string | number> {
  /** Group label */
  label: ReactNode;
  /** Options within this group */
  options: SelectOption<T>[];
  /** Whether the entire group is disabled */
  disabled?: boolean;
}

/**
 * Select component props
 */
export interface SelectProps<T = string | number> extends EngineAwareProps {
  /** Current value (controlled) */
  value?: T | T[];
  /** Default value (uncontrolled) */
  defaultValue?: T | T[];
  /** Options array */
  options?: SelectOption<T>[];
  /** Placeholder text */
  placeholder?: string;
  /** Select size */
  size?: SelectSize;
  /** Visual variant */
  variant?: SelectVariant;
  /** Allow multiple selection */
  multiple?: boolean;
  /** Enable search functionality */
  searchable?: boolean;
  /** Show clear button */
  clearable?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Error state (shorthand for status='error') */
  error?: boolean;
  /** Maximum number of tags to show in multiple mode */
  maxTagCount?: number;
  /** Validation status */
  status?: SelectStatus;
  /** Read-only state */
  readOnly?: boolean;
  /** Required field */
  required?: boolean;
  /** Custom filter function for search */
  filterOption?: (input: string, option?: SelectOption<T>) => boolean;
  /** Change handler */
  onChange?: (value: T | T[], option?: SelectOption<T> | SelectOption<T>[]) => void;
  /** Search handler */
  onSearch?: (value: string) => void;
  /** Focus handler */
  onFocus?: (event?: FocusEvent<HTMLElement>) => void;
  /** Blur handler */
  onBlur?: (event?: FocusEvent<HTMLElement>) => void;
  /** Clear handler */
  onClear?: () => void;
  /** Children for Option-based usage */
  children?: ReactNode;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Name attribute for forms */
  name?: string;
  /** ID attribute */
  id?: string;
  /** Autofocus attribute */
  autoFocus?: boolean;
  /** Prefix element */
  prefix?: ReactNode;
  /** Suffix element */
  suffix?: ReactNode;
  /** Allow clear button (alias for clearable) */
  allowClear?: boolean;
  /** Show search input (alias for searchable) */
  showSearch?: boolean;
}

/**
 * Select.Option props
 */
export interface SelectOptionProps<T = string | number> {
  /** Option value */
  value: T;
  /** Option content/label */
  children?: ReactNode;
  /** Option label (alternative to children) */
  label?: ReactNode;
  /** Whether the option is disabled */
  disabled?: boolean;
  /** Optional icon */
  icon?: ReactNode;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

/**
 * Select.OptGroup props
 */
export interface SelectOptGroupProps {
  /** Group label */
  label: ReactNode;
  /** Children (Option components) */
  children?: ReactNode;
  /** Whether the group is disabled */
  disabled?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

/**
 * Select search state
 */
export interface SelectSearchState {
  /** Current search text */
  searchValue: string;
  /** Whether searching */
  searching: boolean;
  /** Filtered options */
  filteredOptions: SelectOption[];
}

/**
 * Select dropdown state
 */
export interface SelectDropdownState {
  /** Whether the dropdown is open */
  open: boolean;
  /** Focused option index */
  focusedIndex: number;
}

/**
 * Default values for Select
 */
export const SELECT_DEFAULTS = {
  size: 'md' as SelectSize,
  variant: 'outline' as SelectVariant,
  status: 'default' as SelectStatus,
  multiple: false,
  searchable: false,
  clearable: false,
  disabled: false,
  loading: false,
  error: false,
  readOnly: false,
  required: false,
} as const;

/**
 * Size mapping to CSS variable values (matches CSS tokens)
 */
export const SIZE_MAP: Record<SelectSize, { height: string; fontSize: string; padding: string }> = {
  xs: { height: 'var(--select-xs-height)', fontSize: 'var(--select-xs-font-size)', padding: 'var(--select-xs-padding)' },
  sm: { height: 'var(--select-sm-height)', fontSize: 'var(--select-sm-font-size)', padding: 'var(--select-sm-padding)' },
  md: { height: 'var(--select-md-height)', fontSize: 'var(--select-md-font-size)', padding: 'var(--select-md-padding)' },
  lg: { height: 'var(--select-lg-height)', fontSize: 'var(--select-lg-font-size)', padding: 'var(--select-lg-padding)' },
  xl: { height: 'var(--select-xl-height)', fontSize: 'var(--select-xl-font-size)', padding: 'var(--select-xl-padding)' },
};

/**
 * CSS Variable prefix for Select
 */
export const SELECT_CSS_PREFIX = '--select';

/**
 * CSS Variables for Select component
 */
export const SELECT_CSS_VARS = {
  // Size variables
  height: `${SELECT_CSS_PREFIX}-height`,
  fontSize: `${SELECT_CSS_PREFIX}-font-size`,
  padding: `${SELECT_CSS_PREFIX}-padding`,

  // Variant variables
  bg: `${SELECT_CSS_PREFIX}-bg`,
  borderColor: `${SELECT_CSS_PREFIX}-border-color`,
  borderRadius: `${SELECT_CSS_PREFIX}-border-radius`,

  // Dropdown variables
  dropdownBg: `${SELECT_CSS_PREFIX}-dropdown-bg`,
  dropdownShadow: `${SELECT_CSS_PREFIX}-dropdown-shadow`,

  // Option variables
  optionHoverBg: `${SELECT_CSS_PREFIX}-option-hover-bg`,
  optionSelectedBg: `${SELECT_CSS_PREFIX}-option-selected-bg`,

  // Transition
  transition: `${SELECT_CSS_PREFIX}-transition`,
} as const;
