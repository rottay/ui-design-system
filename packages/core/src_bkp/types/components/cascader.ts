/**
 * Cascader Component Types
 *
 * Unified type definitions for the Cascader component.
 * Works with titan (AntD), hermes (DaisyUI), and apollo (HTML+Tailwind).
 */

import type { ReactNode, CSSProperties } from 'react';

/**
 * Single cascader option
 */
export interface CascaderOption {
  /** Value of this option */
  value: string | number;
  /** Display label */
  label: ReactNode;
  /** Whether this option is disabled */
  disabled?: boolean;
  /** Child options (nested) */
  children?: CascaderOption[];
  /** Whether this is a leaf node (no children) */
  isLeaf?: boolean;
  /** Custom data */
  [key: string]: unknown;
}

/**
 * Field names configuration for custom data structure
 */
export interface CascaderFieldNames {
  label?: string;
  value?: string;
  children?: string;
}

/**
 * Size variants for Cascader
 */
export type CascaderSize = 'small' | 'middle' | 'large';

/**
 * Status variants for Cascader
 */
export type CascaderStatus = 'error' | 'warning';

/**
 * Expand trigger type
 */
export type CascaderExpandTrigger = 'click' | 'hover';

/**
 * Placement for the dropdown
 */
export type CascaderPlacement = 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';

/**
 * Show checked strategy for multiple mode
 */
export type CascaderShowCheckedStrategy = 'SHOW_PARENT' | 'SHOW_CHILD';

/**
 * Single value type
 */
export type CascaderSingleValue = (string | number)[];

/**
 * Multiple value type
 */
export type CascaderMultipleValue = CascaderSingleValue[];

/**
 * Value type (single or multiple)
 */
export type CascaderValue = CascaderSingleValue | CascaderMultipleValue;

/**
 * Base props shared by all Cascader implementations
 */
export interface CascaderBaseProps {
  // ─────────────────────────────────────────────────────────────────────────────
  // Core Props
  // ─────────────────────────────────────────────────────────────────────────────

  /** Options data */
  options: CascaderOption[];

  /** Current value (controlled) */
  value?: CascaderValue;

  /** Default value (uncontrolled) */
  defaultValue?: CascaderValue;

  /** Placeholder text */
  placeholder?: string;

  /** Whether the input is disabled */
  disabled?: boolean;

  // ─────────────────────────────────────────────────────────────────────────────
  // Selection Mode
  // ─────────────────────────────────────────────────────────────────────────────

  /** Enable multiple selection */
  multiple?: boolean;

  /** Show checked strategy for multiple mode */
  showCheckedStrategy?: CascaderShowCheckedStrategy;

  /** Allow selecting parent options */
  changeOnSelect?: boolean;

  // ─────────────────────────────────────────────────────────────────────────────
  // Appearance
  // ─────────────────────────────────────────────────────────────────────────────

  /** Size of the input */
  size?: CascaderSize;

  /** Status of the input (error/warning styling) */
  status?: CascaderStatus;

  /** Allow clearing the input */
  allowClear?: boolean;

  /** Whether the input has a border */
  bordered?: boolean;

  /** Variant style */
  variant?: 'outlined' | 'borderless' | 'filled';

  /** Show search input */
  showSearch?: boolean | {
    filter?: (inputValue: string, path: CascaderOption[]) => boolean;
    limit?: number | false;
    matchInputWidth?: boolean;
    render?: (inputValue: string, path: CascaderOption[]) => ReactNode;
    sort?: (a: CascaderOption[], b: CascaderOption[], inputValue: string) => number;
  };

  /** Custom suffix icon */
  suffixIcon?: ReactNode;

  /** Custom expand icon */
  expandIcon?: ReactNode;

  /** Max tag count (for multiple mode) */
  maxTagCount?: number | 'responsive';

  /** Max tag placeholder */
  maxTagPlaceholder?: ReactNode | ((omittedValues: CascaderOption[][]) => ReactNode);

  // ─────────────────────────────────────────────────────────────────────────────
  // Display
  // ─────────────────────────────────────────────────────────────────────────────

  /** Custom display render */
  displayRender?: (labels: string[], selectedOptions?: CascaderOption[]) => ReactNode;

  /** Separator between levels */
  separator?: string;

  /** Custom field names */
  fieldNames?: CascaderFieldNames;

  // ─────────────────────────────────────────────────────────────────────────────
  // Dropdown Props
  // ─────────────────────────────────────────────────────────────────────────────

  /** Whether the dropdown is open (controlled) */
  open?: boolean;

  /** Placement of dropdown */
  placement?: CascaderPlacement;

  /** Class name for dropdown */
  popupClassName?: string;

  /** Expand trigger */
  expandTrigger?: CascaderExpandTrigger;

  /** Get popup container */
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;

  /** Content to show when no options */
  notFoundContent?: ReactNode;

  // ─────────────────────────────────────────────────────────────────────────────
  // Async Loading
  // ─────────────────────────────────────────────────────────────────────────────

  /** Load options lazily */
  loadData?: (selectedOptions: CascaderOption[]) => void;

  // ─────────────────────────────────────────────────────────────────────────────
  // Events
  // ─────────────────────────────────────────────────────────────────────────────

  /** Callback when value changes */
  onChange?: (value: CascaderValue, selectedOptions: CascaderOption[] | CascaderOption[][]) => void;

  /** Callback when dropdown opens/closes */
  onDropdownVisibleChange?: (open: boolean) => void;

  /** Callback on search */
  onSearch?: (value: string) => void;

  /** Callback on focus */
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;

  /** Callback on blur */
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;

  // ─────────────────────────────────────────────────────────────────────────────
  // Styling
  // ─────────────────────────────────────────────────────────────────────────────

  /** Additional CSS class */
  className?: string;

  /** Inline styles */
  style?: CSSProperties;

  /** ID for the input */
  id?: string;

  /** Auto focus */
  autoFocus?: boolean;
}

/**
 * Full Cascader props
 */
export interface CascaderProps extends CascaderBaseProps {
  /** Dropdown render */
  dropdownRender?: (menus: ReactNode) => ReactNode;

  /** Tag render for multiple mode */
  tagRender?: (props: {
    label: ReactNode;
    value: CascaderSingleValue;
    closable: boolean;
    onClose: () => void;
  }) => ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get label from option
 */
export function getOptionLabel(option: CascaderOption, fieldNames?: CascaderFieldNames): ReactNode {
  const labelField = fieldNames?.label ?? 'label';
  return option[labelField] as ReactNode;
}

/**
 * Get value from option
 */
export function getOptionValue(option: CascaderOption, fieldNames?: CascaderFieldNames): string | number {
  const valueField = fieldNames?.value ?? 'value';
  return option[valueField] as string | number;
}

/**
 * Get children from option
 */
export function getOptionChildren(option: CascaderOption, fieldNames?: CascaderFieldNames): CascaderOption[] | undefined {
  const childrenField = fieldNames?.children ?? 'children';
  return option[childrenField] as CascaderOption[] | undefined;
}

/**
 * Find option path by value
 */
export function findOptionPath(
  options: CascaderOption[],
  value: CascaderSingleValue,
  fieldNames?: CascaderFieldNames
): CascaderOption[] | null {
  const path: CascaderOption[] = [];

  function find(opts: CascaderOption[], targetValue: (string | number)[], depth: number): boolean {
    for (const opt of opts) {
      const optValue = getOptionValue(opt, fieldNames);
      if (optValue === targetValue[depth]) {
        path.push(opt);
        if (depth === targetValue.length - 1) {
          return true;
        }
        const children = getOptionChildren(opt, fieldNames);
        if (children && find(children, targetValue, depth + 1)) {
          return true;
        }
        path.pop();
      }
    }
    return false;
  }

  return find(options, value, 0) ? path : null;
}

/**
 * Format display labels
 */
export function formatDisplayLabels(
  path: CascaderOption[],
  separator: string = ' / ',
  fieldNames?: CascaderFieldNames
): string {
  return path.map((opt) => {
    const label = getOptionLabel(opt, fieldNames);
    return typeof label === 'string' ? label : String(getOptionValue(opt, fieldNames));
  }).join(separator);
}

/**
 * Default filter function for search
 */
export function defaultSearchFilter(
  inputValue: string,
  path: CascaderOption[],
  fieldNames?: CascaderFieldNames
): boolean {
  return path.some((opt) => {
    const label = getOptionLabel(opt, fieldNames);
    const labelStr = typeof label === 'string' ? label : String(getOptionValue(opt, fieldNames));
    return labelStr.toLowerCase().includes(inputValue.toLowerCase());
  });
}

/**
 * Check if value is multiple value
 */
export function isMultipleValue(value: CascaderValue): value is CascaderMultipleValue {
  return Array.isArray(value) && Array.isArray(value[0]);
}
