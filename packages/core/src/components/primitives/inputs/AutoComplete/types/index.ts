/**
 * AutoComplete Types
 */
import type { ReactNode, CSSProperties } from 'react';

export type AutoCompleteSize = 'small' | 'middle' | 'large';

export interface AutoCompleteOption {
  value: string;
  label?: ReactNode;
  disabled?: boolean;
  [key: string]: unknown;
}

export interface AutoCompleteProps {
  /** Options list */
  options?: AutoCompleteOption[];
  /** Current value */
  value?: string;
  /** Default value */
  defaultValue?: string;
  /** Callback when value changes */
  onChange?: (value: string) => void;
  /** Callback when search */
  onSearch?: (value: string) => void;
  /** Callback when option is selected */
  onSelect?: (value: string, option: AutoCompleteOption) => void;
  /** Custom filter function */
  filterOption?: boolean | ((inputValue: string, option: AutoCompleteOption) => boolean);
  /** Placeholder text */
  placeholder?: string;
  /** Whether disabled */
  disabled?: boolean;
  /** Whether to allow clear */
  allowClear?: boolean;
  /** Auto focus */
  autoFocus?: boolean;
  /** Default open state */
  defaultOpen?: boolean;
  /** Open state (controlled) */
  open?: boolean;
  /** Callback when dropdown visibility changes */
  onDropdownVisibleChange?: (open: boolean) => void;
  /** Size of input */
  size?: AutoCompleteSize;
  /** Status */
  status?: 'error' | 'warning';
  /** Not found content */
  notFoundContent?: ReactNode;
  /** Dropdown class name */
  popupClassName?: string;
  /** Dropdown match select width */
  popupMatchSelectWidth?: boolean | number;
  /** Additional class name */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
}

export const AUTOCOMPLETE_DEFAULTS: Partial<AutoCompleteProps> = {
  disabled: false,
  allowClear: false,
  autoFocus: false,
  size: 'middle',
  popupMatchSelectWidth: true,
  filterOption: true,
};
