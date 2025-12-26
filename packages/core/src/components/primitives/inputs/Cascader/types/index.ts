/**
 * Cascader Types
 */
import type { ReactNode, CSSProperties } from 'react';

export type CascaderSize = 'small' | 'middle' | 'large';
export type CascaderExpandTrigger = 'click' | 'hover';

export interface CascaderOption {
  value: string | number;
  label: ReactNode;
  disabled?: boolean;
  children?: CascaderOption[];
  isLeaf?: boolean;
  [key: string]: unknown;
}

export type CascaderValue = (string | number)[];

export interface CascaderProps {
  /** Options data */
  options: CascaderOption[];
  /** Selected value */
  value?: CascaderValue | CascaderValue[];
  /** Default selected value */
  defaultValue?: CascaderValue | CascaderValue[];
  /** Callback when value changes */
  onChange?: (value: CascaderValue | CascaderValue[], selectedOptions: CascaderOption[] | CascaderOption[][]) => void;
  /** Custom display render */
  displayRender?: (labels: string[], selectedOptions?: CascaderOption[]) => ReactNode;
  /** Expand trigger */
  expandTrigger?: CascaderExpandTrigger;
  /** Support multiple selection */
  multiple?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Whether disabled */
  disabled?: boolean;
  /** Show search input */
  showSearch?: boolean;
  /** Allow clear */
  allowClear?: boolean;
  /** Size of input */
  size?: CascaderSize;
  /** Not found content */
  notFoundContent?: ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Status */
  status?: 'error' | 'warning';
  /** Open state (controlled) */
  open?: boolean;
  /** Callback when dropdown visibility changes */
  onDropdownVisibleChange?: (open: boolean) => void;
  /** Max tag count (multiple mode) */
  maxTagCount?: number | 'responsive';
  /** Field names mapping */
  fieldNames?: {
    label?: string;
    value?: string;
    children?: string;
  };
  /** Additional class name */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
  /** Popup class name */
  popupClassName?: string;
}

export const CASCADER_DEFAULTS: Partial<CascaderProps> = {
  expandTrigger: 'click',
  multiple: false,
  disabled: false,
  showSearch: false,
  allowClear: true,
  size: 'middle',
  placeholder: 'Please select',
};
