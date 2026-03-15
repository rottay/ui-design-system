/**
 * @fileoverview Select Types - Rottay Design System
 * @description Type definitions, interfaces, and constants for the Select component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * This module provides comprehensive type definitions for the Select component,
 * including all props, option structures, sizes, variants, and state interfaces.
 *
 * **Available Types:**
 * - `SelectProps` - Main component props interface
 * - `SelectSize` - Size variants (xs, sm, md, lg, xl)
 * - `SelectVariant` - Visual style variants (outline, filled, flushed, default)
 * - `SelectStatus` - Validation states (default, error, warning, success)
 * - `SelectMode` - Selection modes (single, multiple, tags)
 * - `SelectOption` - Individual option structure with value, label, icon, etc.
 * - `SelectOptionGroup` - Grouped options structure
 * - `SelectOptionProps` - Props for Select.Option compound component
 * - `SelectOptGroupProps` - Props for Select.OptGroup compound component
 * - `SelectSearchState` - Search state interface
 * - `SelectDropdownState` - Dropdown state interface
 *
 * **CSS Custom Properties:**
 * The type definitions include mappings to CSS variables for consistent theming:
 * - Size: `--ds-select-{size}-height`, `--ds-select-{size}-font-size`, `--ds-select-{size}-padding`
 * - Appearance: `--ds-select-bg`, `--ds-select-border-color`, `--ds-select-border-radius`
 * - Dropdown: `--ds-select-dropdown-bg`, `--ds-select-dropdown-shadow`
 * - Options: `--ds-select-option-hover-bg`, `--ds-select-option-selected-bg`
 *
 * @example Using Types
 * ```tsx
 * import type { SelectProps, SelectOption, SelectSize } from '@rottay/design-system';
 *
 * // Typed options array
 * const options: SelectOption[] = [
 *   { value: '1', label: 'Option 1' },
 *   { value: '2', label: 'Option 2', disabled: true },
 * ];
 *
 * // Custom select wrapper with typed props
 * const MySelect: React.FC<SelectProps> = (props) => {
 *   return <Select {...props} />;
 * };
 * ```
 *
 * @example Using Constants
 * ```tsx
 * import { SELECT_DEFAULTS, SIZE_MAP, SELECT_CSS_VARS } from '@rottay/design-system';
 *
 * // Access default values
 * console.log(SELECT_DEFAULTS.size);     // 'md'
 * console.log(SELECT_DEFAULTS.variant);  // 'outline'
 * console.log(SELECT_DEFAULTS.multiple); // false
 *
 * // Access CSS variable mappings
 * console.log(SIZE_MAP.lg.height); // 'var(--ds-select-lg-height)'
 * ```
 *
 * @see {@link Select} for the main component
 * @see {@link SelectOption} for option component
 * @see {@link SelectOptGroup} for grouping options
 * @module SelectTypes
 * @category Inputs
 * @package @rottay/design-system
 */

import type { ReactNode, CSSProperties, FocusEvent } from 'react';
import type { EngineAwareProps } from '../../../../contracts/engine';

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
  /**
   * Option groups. When provided, options are rendered under group headers
   * with visual separators. Takes precedence over flat `options` when both
   * are supplied.
   */
  optionGroups?: SelectOptionGroup[];
  /**
   * Enable virtual scrolling for large option lists. Only visible options
   * plus a small buffer are rendered. The dropdown uses a fixed-height
   * container and translates items based on scroll position.
   *
   * - `true`: enable with default item height (32px) and 300px container
   * - `{ itemHeight, containerHeight }`: custom dimensions
   */
  virtual?:
    | boolean
    | { itemHeight?: number; containerHeight?: number };
  /**
   * Token separators for tags mode. When the user types one of these
   * characters, the current search text is converted into a tag
   * (if it matches an existing option or if in tags/multiple mode).
   *
   * @example `[',', ' ', ';']`
   */
  tokenSeparators?: string[];
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
  xs: { height: 'var(--ds-select-xs-height)', fontSize: 'var(--ds-select-xs-font-size)', padding: 'var(--ds-select-xs-padding)' },
  sm: { height: 'var(--ds-select-sm-height)', fontSize: 'var(--ds-select-sm-font-size)', padding: 'var(--ds-select-sm-padding)' },
  md: { height: 'var(--ds-select-md-height)', fontSize: 'var(--ds-select-md-font-size)', padding: 'var(--ds-select-md-padding)' },
  lg: { height: 'var(--ds-select-lg-height)', fontSize: 'var(--ds-select-lg-font-size)', padding: 'var(--ds-select-lg-padding)' },
  xl: { height: 'var(--ds-select-xl-height)', fontSize: 'var(--ds-select-xl-font-size)', padding: 'var(--ds-select-xl-padding)' },
};

/**
 * CSS Variable prefix for Select
 */
export const SELECT_CSS_PREFIX = '--ds-select';

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
