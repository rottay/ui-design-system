/**
 * Checkbox Component Types
 *
 * Unified type definitions for Checkbox component across all engines.
 * These types are implemented by titan (AntD), hermes (DaisyUI), and apollo (HTML+Tailwind).
 */

import type { CSSProperties, ChangeEvent, ReactNode } from 'react';

/**
 * Base Checkbox Props
 *
 * Common properties supported by ALL engines.
 * All engines MUST implement these props.
 */
export interface CheckboxBaseProps {
  /** Checked state (controlled) */
  checked?: boolean;

  /** Default checked state (uncontrolled) */
  defaultChecked?: boolean;

  /** Disabled state */
  disabled?: boolean;

  /** Change handler */
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;

  /** Checkbox label/content */
  children?: ReactNode;

  /** Custom CSS classes */
  className?: string;

  /** Inline styles */
  style?: CSSProperties;

  /** Checkbox ID */
  id?: string;

  /** Checkbox name */
  name?: string;

  /** Checkbox value (for checkbox groups) */
  value?: string | number | boolean;
}

/**
 * Checkbox Props
 *
 * Extended properties with engine-specific features.
 * Some props may be ignored by certain engines.
 */
export interface CheckboxProps extends CheckboxBaseProps {
  /**
   * Indeterminate state (partially checked)
   * - titan: full support
   * - hermes: full support
   * - apollo: full support
   * Cannot be set with checked at the same time
   */
  indeterminate?: boolean;

  /**
   * Auto focus on mount
   * Native HTML behavior, supported by all engines
   */
  autoFocus?: boolean;

  /**
   * Tab index
   * Native HTML behavior, supported by all engines
   */
  tabIndex?: number;

  /**
   * Size (hermes-specific)
   * - titan: uses default size
   * - hermes: xs, sm, md, lg
   * - apollo: uses default size
   * @engine-specific Primarily for hermes engine
   */
  size?: 'xs' | 'sm' | 'md' | 'lg';

  /**
   * Color variant (hermes-specific)
   * - titan: uses theme colors
   * - hermes: primary, secondary, accent, info, success, warning, error
   * - apollo: uses theme colors
   * @engine-specific Primarily for hermes engine
   */
  color?: 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error';
}

/**
 * Checkbox Group Option
 *
 * Defines a single checkbox in a checkbox group.
 */
export interface CheckboxGroupOption {
  /** Option label */
  label: ReactNode;

  /** Option value */
  value: string | number;

  /** Disabled state */
  disabled?: boolean;

  /** Additional styles */
  style?: CSSProperties;

  /** Additional classes */
  className?: string;
}

/**
 * Checkbox Group Props
 *
 * Properties for checkbox group component.
 * Allows multiple checkboxes to be managed together.
 */
export interface CheckboxGroupProps {
  /** Selected values (controlled) */
  value?: (string | number)[];

  /** Default selected values (uncontrolled) */
  defaultValue?: (string | number)[];

  /** Options array */
  options?: (CheckboxGroupOption | string | number)[];

  /** Disabled state for all checkboxes */
  disabled?: boolean;

  /** Change handler */
  onChange?: (checkedValues: (string | number)[]) => void;

  /** Custom CSS classes */
  className?: string;

  /** Inline styles */
  style?: CSSProperties;

  /** Checkbox group name */
  name?: string;

  /**
   * Layout direction (titan-specific)
   * - titan: horizontal, vertical
   * - hermes: custom CSS classes
   * - apollo: custom CSS classes
   * @engine-specific May be ignored in some engines
   */
  direction?: 'horizontal' | 'vertical';
}

/**
 * Type guard to check if option is CheckboxGroupOption object
 */
export function isCheckboxGroupOption(
  option: CheckboxGroupOption | string | number
): option is CheckboxGroupOption {
  return typeof option === 'object' && 'value' in option;
}

/**
 * Normalize checkbox group options
 *
 * Converts simple values to CheckboxGroupOption objects.
 */
export function normalizeCheckboxOptions(
  options: (CheckboxGroupOption | string | number)[]
): CheckboxGroupOption[] {
  return options.map((option) => {
    if (isCheckboxGroupOption(option)) {
      return option;
    }
    return {
      label: String(option),
      value: option,
    };
  });
}

/**
 * Toggle value in array
 *
 * Utility for checkbox group state management.
 * Adds value if not present, removes if present.
 */
export function toggleValueInArray<T>(array: T[], value: T): T[] {
  const index = array.indexOf(value);
  if (index === -1) {
    return [...array, value];
  }
  return array.filter((item) => item !== value);
}
