/**
 * TreeSelect Types
 */
import type { ReactNode, CSSProperties } from 'react';

export type TreeSelectSize = 'small' | 'middle' | 'large';

export interface TreeSelectNode {
  key?: string;
  value: string | number;
  title: ReactNode;
  disabled?: boolean;
  disableCheckbox?: boolean;
  selectable?: boolean;
  checkable?: boolean;
  children?: TreeSelectNode[];
  isLeaf?: boolean;
  [key: string]: unknown;
}

export type TreeSelectValue = string | number | (string | number)[];

export interface TreeSelectProps {
  /** Tree data */
  treeData: TreeSelectNode[];
  /** Selected value(s) */
  value?: TreeSelectValue;
  /** Default value */
  defaultValue?: TreeSelectValue;
  /** Callback when value changes */
  onChange?: (value: TreeSelectValue, labelList: ReactNode[], extra: { triggerValue: string | number }) => void;
  /** Support multiple selection */
  multiple?: boolean;
  /** Show checkbox before tree node */
  treeCheckable?: boolean;
  /** Check all children when parent is checked */
  treeCheckStrictly?: boolean;
  /** Show search input */
  showSearch?: boolean;
  /** Custom filter function */
  filterTreeNode?: boolean | ((inputValue: string, treeNode: TreeSelectNode) => boolean);
  /** Expand all tree nodes by default */
  treeDefaultExpandAll?: boolean;
  /** Default expanded keys */
  treeDefaultExpandedKeys?: (string | number)[];
  /** Expanded keys (controlled) */
  treeExpandedKeys?: (string | number)[];
  /** Callback when tree expands */
  onTreeExpand?: (expandedKeys: (string | number)[]) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether disabled */
  disabled?: boolean;
  /** Allow clear */
  allowClear?: boolean;
  /** Size of input */
  size?: TreeSelectSize;
  /** Max tag count (multiple mode) */
  maxTagCount?: number | 'responsive';
  /** Status */
  status?: 'error' | 'warning';
  /** Not found content */
  notFoundContent?: ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Open state (controlled) */
  open?: boolean;
  /** Callback when dropdown visibility changes */
  onDropdownVisibleChange?: (open: boolean) => void;
  /** Field names mapping */
  fieldNames?: {
    label?: string;
    value?: string;
    children?: string;
  };
  /** Show tree line */
  treeLine?: boolean;
  /** Additional class name */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
  /** Popup class name */
  popupClassName?: string;
  /** Rendering engine override */
  engine?: 'titan' | 'hermes' | 'apollo';
}

export const TREESELECT_DEFAULTS: Partial<TreeSelectProps> = {
  multiple: false,
  treeCheckable: false,
  treeCheckStrictly: false,
  showSearch: false,
  treeDefaultExpandAll: false,
  disabled: false,
  allowClear: true,
  size: 'middle',
  placeholder: 'Please select',
  treeLine: false,
};
