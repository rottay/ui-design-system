/**
 * Select - Core Interface
 * Shared types and defaults for all engine implementations
 */

import type { EngineAwareProps } from '../../../../../types';
import type { ReactNode } from 'react';

export type SelectSize = 'sm' | 'md' | 'lg';
export type SelectVariant = 'outlined' | 'filled' | 'borderless';
export type SelectStatus = 'default' | 'error' | 'warning' | 'success';

export interface SelectOption {
  /** Option value */
  value: string | number;
  /** Option label */
  label: ReactNode;
  /** Disabled state */
  disabled?: boolean;
  /** Group label for option groups */
  group?: string;
}

export interface SelectProps extends EngineAwareProps {
  /** Select size */
  size?: SelectSize;
  /** Visual variant */
  variant?: SelectVariant;
  /** Validation status */
  status?: SelectStatus;
  /** Placeholder text */
  placeholder?: string;
  /** Current value (controlled) */
  value?: string | number | (string | number)[];
  /** Default value (uncontrolled) */
  defaultValue?: string | number | (string | number)[];
  /** Options array */
  options?: SelectOption[];
  /** Disabled state */
  disabled?: boolean;
  /** Read-only state */
  readOnly?: boolean;
  /** Required field */
  required?: boolean;
  /** Allow multiple selection */
  multiple?: boolean;
  /** Allow clear button */
  allowClear?: boolean;
  /** Show search input */
  showSearch?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Custom filter function for search */
  filterOption?: (input: string, option?: SelectOption) => boolean;
  /** Change handler */
  onChange?: (value: string | number | (string | number)[], option: SelectOption | SelectOption[]) => void;
  /** Focus handler */
  onFocus?: (event: React.FocusEvent<HTMLSelectElement>) => void;
  /** Blur handler */
  onBlur?: (event: React.FocusEvent<HTMLSelectElement>) => void;
  /** Search handler */
  onSearch?: (value: string) => void;
  /** Clear handler */
  onClear?: () => void;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
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
}

export const SELECT_DEFAULTS: Partial<SelectProps> = {
  size: 'md',
  variant: 'outlined',
  status: 'default',
  disabled: false,
  readOnly: false,
  required: false,
  multiple: false,
  allowClear: false,
  showSearch: false,
  loading: false,
};
