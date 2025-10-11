import type { SelectProps } from 'antd';
import type { ReactNode } from 'react';

export interface SearchableSelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
  [key: string]: any;
}

export interface SearchableSelectProps extends Omit<SelectProps, 'showSearch' | 'filterOption' | 'onSearch'> {
  /** Options for the select */
  options: SearchableSelectOption[];

  /** Callback when search input changes (with debouncing) */
  onSearch?: (query: string) => void | Promise<SearchableSelectOption[]>;

  /** Debounce time in milliseconds */
  debounceTime?: number;

  /** Loading state */
  loading?: boolean;

  /** Minimum characters to trigger search */
  minSearchLength?: number;

  /** Custom empty state content */
  emptyContent?: ReactNode;

  /** Show search icon in placeholder */
  showSearchIcon?: boolean;

  /** Case sensitive search */
  caseSensitive?: boolean;

  /** Custom filter function (overrides default) */
  filterOption?: (input: string, option: SearchableSelectOption | undefined) => boolean;
}
