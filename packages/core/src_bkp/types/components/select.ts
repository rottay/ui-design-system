/**
 * Select Component Types
 *
 * Unified type definitions for Select component across all engines.
 * These types are implemented by titan (AntD), hermes (DaisyUI), and apollo (HTML+Tailwind).
 */

import type { CSSProperties, ReactNode } from 'react';

/**
 * Select Option
 *
 * Defines a single option in the select dropdown.
 * Supported by all engines.
 */
export interface SelectOption<T = string | number> {
  /** Option value */
  value: T;

  /** Display label */
  label: string;

  /** Disabled state */
  disabled?: boolean;

  /** Option title (tooltip) */
  title?: string;
}

/**
 * Select Option Group
 *
 * Groups options under a label.
 * - titan: full support
 * - hermes: custom rendering
 * - apollo: custom rendering
 */
export interface SelectOptionGroup<T = string | number> {
  /** Group label */
  label: string;

  /** Options in this group */
  options: SelectOption<T>[];

  /** Optional key for group */
  key?: string;
}

/**
 * Base Select Props
 *
 * Common properties supported by ALL engines.
 * All engines MUST implement these props.
 */
export interface SelectBaseProps<T = string | number> {
  /** Selected value (controlled) */
  value?: T | T[];

  /** Default value (uncontrolled) */
  defaultValue?: T | T[];

  /** Options array */
  options?: SelectOption<T>[];

  /** Placeholder text */
  placeholder?: string;

  /** Disabled state */
  disabled?: boolean;

  /** Change handler (value is undefined when clearing) */
  onChange?: (value: T | T[] | undefined, option?: SelectOption<T> | SelectOption<T>[]) => void;

  /** Custom CSS classes */
  className?: string;

  /** Inline styles */
  style?: CSSProperties;

  /** Select ID */
  id?: string;

  /** Select name */
  name?: string;
}

/**
 * Select Props
 *
 * Extended properties with engine-specific features.
 * Some props may be ignored by certain engines.
 */
export interface SelectProps<T = string | number> extends SelectBaseProps<T> {
  /**
   * Select size
   * - titan: large, middle, small
   * - hermes: xs, sm, md, lg (mapped)
   * - apollo: small, middle, large
   */
  size?: 'small' | 'middle' | 'large';

  /**
   * Loading state
   * - titan: shows loading spinner
   * - hermes: shows loading spinner
   * - apollo: shows loading spinner
   */
  loading?: boolean;

  /**
   * Show clear button
   * - titan: full support
   * - hermes: custom implementation
   * - apollo: full support
   */
  allowClear?: boolean;

  /**
   * Enable search/filter
   * - titan: full support with built-in filtering
   * - hermes: custom implementation
   * - apollo: custom implementation
   * @engine-specific May have different UX in some engines
   */
  showSearch?: boolean;

  /**
   * Custom filter function
   * - titan: full support
   * - hermes: custom implementation
   * - apollo: custom implementation
   * @engine-specific May be ignored in some engines
   */
  filterOption?: boolean | ((input: string, option?: SelectOption<T>) => boolean);

  /**
   * Search value (controlled search)
   * - titan: full support
   * - hermes: custom implementation
   * - apollo: custom implementation
   * @engine-specific May be ignored in some engines
   */
  searchValue?: string;

  /**
   * Search change handler
   * - titan: full support
   * - hermes: custom implementation
   * - apollo: custom implementation
   * @engine-specific May be ignored in some engines
   */
  onSearch?: (value: string) => void;

  /**
   * Validation status
   * - titan: full support with styling
   * - hermes: maps to color variants
   * - apollo: full support with border colors
   */
  status?: 'error' | 'warning';

  /**
   * Multiple selection mode
   * - titan: full support
   * - hermes: custom implementation
   * - apollo: custom implementation
   * @engine-specific May have different UX in some engines
   */
  mode?: 'multiple' | 'tags';

  /**
   * Max tag count (for multiple mode)
   * - titan: full support
   * - hermes: custom implementation
   * - apollo: custom implementation
   * @engine-specific May be ignored in some engines
   */
  maxTagCount?: number | 'responsive';

  /**
   * Custom tag render
   * - titan: full support
   * - hermes: limited support
   * - apollo: limited support
   * @engine-specific May be ignored in some engines
   */
  tagRender?: (props: { label: ReactNode; value: T; disabled?: boolean; onClose: () => void }) => ReactNode;

  /**
   * Dropdown render override
   * - titan: full support
   * - hermes: limited support
   * - apollo: limited support
   * @engine-specific May be ignored in some engines
   */
  dropdownRender?: (menu: ReactNode) => ReactNode;

  /**
   * Dropdown class name
   * - titan: full support
   * - hermes: custom implementation
   * - apollo: custom implementation
   */
  popupClassName?: string;

  /**
   * Dropdown match select width
   * - titan: full support
   * - hermes: custom implementation
   * - apollo: custom implementation
   * @engine-specific May be ignored in some engines
   */
  dropdownMatchSelectWidth?: boolean | number;

  /**
   * Focus handler
   */
  onFocus?: () => void;

  /**
   * Blur handler
   */
  onBlur?: () => void;

  /**
   * Dropdown visible change handler
   * - titan: full support
   * - hermes: custom implementation
   * - apollo: custom implementation
   */
  onDropdownVisibleChange?: (open: boolean) => void;

  /**
   * Auto focus on mount
   */
  autoFocus?: boolean;

  /**
   * Not found content
   * - titan: full support
   * - hermes: custom implementation
   * - apollo: shows "No options" by default
   */
  notFoundContent?: ReactNode;

  /**
   * Virtual scrolling (performance for large lists)
   * - titan: full support
   * - hermes: not supported
   * - apollo: not supported
   * @engine-specific Titan only
   */
  virtual?: boolean;

  /**
   * Option groups
   * Alternative to flat options array
   */
  optionGroups?: SelectOptionGroup<T>[];
}

/**
 * Type guard to check if options are grouped
 */
export function isOptionGroups<T>(
  input: SelectOption<T>[] | SelectOptionGroup<T>[] | undefined
): input is SelectOptionGroup<T>[] {
  if (!input || input.length === 0) return false;
  return 'options' in input[0];
}

/**
 * Flatten option groups to flat array
 */
export function flattenOptionGroups<T>(
  groups: SelectOptionGroup<T>[]
): SelectOption<T>[] {
  return groups.flatMap((group) => group.options);
}
