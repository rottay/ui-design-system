/**
 * AutoComplete Component Types
 *
 * Unified type definitions for the AutoComplete component.
 * Works with titan (AntD), hermes (DaisyUI), and apollo (HTML+Tailwind).
 */

import type { ReactNode, CSSProperties } from 'react';

/**
 * Option type for autocomplete suggestions
 */
export interface AutoCompleteOption {
  /** Value to be submitted */
  value: string | number;
  /** Display label (defaults to value if not provided) */
  label?: ReactNode;
  /** Whether option is disabled */
  disabled?: boolean;
  /** Additional data to pass with the option */
  data?: Record<string, unknown>;
}

/**
 * Grouped options for autocomplete
 */
export interface AutoCompleteOptionGroup {
  /** Group label */
  label: ReactNode;
  /** Options in this group */
  options: AutoCompleteOption[];
}

/**
 * Size variants for AutoComplete
 */
export type AutoCompleteSize = 'small' | 'middle' | 'large';

/**
 * Status variants for AutoComplete
 */
export type AutoCompleteStatus = 'error' | 'warning';

/**
 * Placement for the dropdown
 */
export type AutoCompletePlacement = 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';

/**
 * Base props shared by all AutoComplete implementations
 */
export interface AutoCompleteBaseProps {
  // ─────────────────────────────────────────────────────────────────────────────
  // Core Props
  // ─────────────────────────────────────────────────────────────────────────────

  /** Current input value (controlled) */
  value?: string;

  /** Default input value (uncontrolled) */
  defaultValue?: string;

  /** Autocomplete options */
  options?: (AutoCompleteOption | AutoCompleteOptionGroup | string)[];

  /** Placeholder text */
  placeholder?: string;

  /** Whether the input is disabled */
  disabled?: boolean;

  // ─────────────────────────────────────────────────────────────────────────────
  // Appearance
  // ─────────────────────────────────────────────────────────────────────────────

  /** Size of the input */
  size?: AutoCompleteSize;

  /** Status of the input (error/warning styling) */
  status?: AutoCompleteStatus;

  /** Allow clearing the input */
  allowClear?: boolean | { clearIcon?: ReactNode };

  /** Whether the input has a border */
  bordered?: boolean;

  /** Variant style */
  variant?: 'outlined' | 'borderless' | 'filled';

  // ─────────────────────────────────────────────────────────────────────────────
  // Dropdown Props
  // ─────────────────────────────────────────────────────────────────────────────

  /** Whether the dropdown is open (controlled) */
  open?: boolean;

  /** Default open state (uncontrolled) */
  defaultOpen?: boolean;

  /** Placement of dropdown */
  popupPlacement?: AutoCompletePlacement;

  /** Class name for dropdown */
  popupClassName?: string;

  /** Match input width or set min-width */
  popupMatchSelectWidth?: boolean | number;

  /** Content to show when no matches */
  notFoundContent?: ReactNode;

  /** Get popup container */
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;

  // ─────────────────────────────────────────────────────────────────────────────
  // Filtering & Selection
  // ─────────────────────────────────────────────────────────────────────────────

  /** Auto focus on mount */
  autoFocus?: boolean;

  /** Whether to highlight first option automatically */
  defaultActiveFirstOption?: boolean;

  /** Back fill selected value into input */
  backfill?: boolean;

  /** Custom filter function */
  filterOption?: boolean | ((inputValue: string, option: AutoCompleteOption) => boolean);

  // ─────────────────────────────────────────────────────────────────────────────
  // Events
  // ─────────────────────────────────────────────────────────────────────────────

  /** Callback when input value changes */
  onChange?: (value: string) => void;

  /** Callback when an option is selected */
  onSelect?: (value: string | number, option: AutoCompleteOption) => void;

  /** Callback when dropdown visibility changes */
  onDropdownVisibleChange?: (open: boolean) => void;

  /** Callback when input is focused */
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;

  /** Callback when input loses focus */
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;

  /** Callback when searching (typing) */
  onSearch?: (value: string) => void;

  /** Callback when input is cleared */
  onClear?: () => void;

  /** Callback on keyboard events */
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;

  // ─────────────────────────────────────────────────────────────────────────────
  // Styling
  // ─────────────────────────────────────────────────────────────────────────────

  /** Additional CSS class */
  className?: string;

  /** Inline styles */
  style?: CSSProperties;

  /** ID for the input */
  id?: string;
}

/**
 * Full AutoComplete props including HTML input attributes
 */
export interface AutoCompleteProps extends AutoCompleteBaseProps {
  /** Virtual list height (for large datasets) */
  listHeight?: number;

  /** Children for custom input */
  children?: ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// Type Guards & Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check if option is a group
 */
export function isOptionGroup(
  option: AutoCompleteOption | AutoCompleteOptionGroup | string
): option is AutoCompleteOptionGroup {
  return typeof option === 'object' && 'options' in option && Array.isArray(option.options);
}

/**
 * Check if option is a simple string
 */
export function isStringOption(
  option: AutoCompleteOption | AutoCompleteOptionGroup | string
): option is string {
  return typeof option === 'string';
}

/**
 * Normalize options to AutoCompleteOption format
 */
export function normalizeOptions(
  options?: (AutoCompleteOption | AutoCompleteOptionGroup | string)[]
): (AutoCompleteOption | AutoCompleteOptionGroup)[] {
  if (!options) return [];

  return options.map((opt) => {
    if (isStringOption(opt)) {
      return { value: opt, label: opt };
    }
    return opt;
  });
}

/**
 * Flatten grouped options into a single array
 */
export function flattenOptions(
  options: (AutoCompleteOption | AutoCompleteOptionGroup)[]
): AutoCompleteOption[] {
  return options.flatMap((opt) => {
    if (isOptionGroup(opt)) {
      return opt.options;
    }
    return [opt];
  });
}

/**
 * Default filter function for autocomplete
 */
export function defaultFilterOption(
  inputValue: string,
  option: AutoCompleteOption
): boolean {
  const label = String(option.label ?? option.value);
  return label.toLowerCase().includes(inputValue.toLowerCase());
}
