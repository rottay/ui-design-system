/**
 * TreeSelect Component Types
 *
 * Unified type definitions for the TreeSelect component.
 * Works with titan (AntD), hermes (DaisyUI), and apollo (HTML+Tailwind).
 */

import type { ReactNode, CSSProperties } from 'react';

/**
 * Tree node data
 */
export interface TreeSelectNode {
  /** Unique key/value for the node */
  value: string | number;
  /** Display title */
  title: ReactNode;
  /** Child nodes */
  children?: TreeSelectNode[];
  /** Whether this node is disabled */
  disabled?: boolean;
  /** Whether this node is selectable */
  selectable?: boolean;
  /** Whether this node can be checked (for multiple mode) */
  checkable?: boolean;
  /** Whether this is a leaf node */
  isLeaf?: boolean;
  /** Icon for the node */
  icon?: ReactNode;
  /** Additional data */
  [key: string]: unknown;
}

/**
 * Field names for custom data structure
 */
export interface TreeSelectFieldNames {
  value?: string;
  label?: string;
  children?: string;
}

/**
 * Size variants for TreeSelect
 */
export type TreeSelectSize = 'small' | 'middle' | 'large';

/**
 * Status variants for TreeSelect
 */
export type TreeSelectStatus = 'error' | 'warning';

/**
 * Placement for the dropdown
 */
export type TreeSelectPlacement = 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';

/**
 * Show checked strategy for multiple/treeCheckable mode
 */
export type TreeSelectShowCheckedStrategy = 'SHOW_ALL' | 'SHOW_PARENT' | 'SHOW_CHILD';

/**
 * Single value type
 */
export type TreeSelectSingleValue = string | number;

/**
 * Multiple value type
 */
export type TreeSelectMultipleValue = TreeSelectSingleValue[];

/**
 * Value type (single or multiple)
 */
export type TreeSelectValue = TreeSelectSingleValue | TreeSelectMultipleValue;

/**
 * Label in value mode
 */
export interface TreeSelectLabeledValue {
  value: TreeSelectSingleValue;
  label: ReactNode;
}

/**
 * Base props shared by all TreeSelect implementations
 */
export interface TreeSelectBaseProps {
  // ─────────────────────────────────────────────────────────────────────────────
  // Core Props
  // ─────────────────────────────────────────────────────────────────────────────

  /** Tree data */
  treeData?: TreeSelectNode[];

  /** Current value (controlled) */
  value?: TreeSelectValue;

  /** Default value (uncontrolled) */
  defaultValue?: TreeSelectValue;

  /** Placeholder text */
  placeholder?: string;

  /** Whether the input is disabled */
  disabled?: boolean;

  // ─────────────────────────────────────────────────────────────────────────────
  // Selection Mode
  // ─────────────────────────────────────────────────────────────────────────────

  /** Enable multiple selection */
  multiple?: boolean;

  /** Show checkboxes for tree nodes */
  treeCheckable?: boolean;

  /** Show checked strategy */
  showCheckedStrategy?: TreeSelectShowCheckedStrategy;

  /** Strictly check node (not affect parent/children) */
  treeCheckStrictly?: boolean;

  /** Allow clearing the selection */
  allowClear?: boolean;

  // ─────────────────────────────────────────────────────────────────────────────
  // Appearance
  // ─────────────────────────────────────────────────────────────────────────────

  /** Size of the input */
  size?: TreeSelectSize;

  /** Status of the input (error/warning styling) */
  status?: TreeSelectStatus;

  /** Whether the input has a border */
  bordered?: boolean;

  /** Variant style */
  variant?: 'outlined' | 'borderless' | 'filled';

  /** Show search input */
  showSearch?: boolean;

  /** Search value (controlled) */
  searchValue?: string;

  /** Tree default expanded keys */
  treeDefaultExpandAll?: boolean;

  /** Tree default expanded keys */
  treeDefaultExpandedKeys?: (string | number)[];

  /** Tree expanded keys (controlled) */
  treeExpandedKeys?: (string | number)[];

  /** Custom suffix icon */
  suffixIcon?: ReactNode;

  /** Show tree line */
  treeLine?: boolean;

  /** Show tree icon */
  treeIcon?: boolean;

  /** Tree node filter prop */
  treeNodeFilterProp?: string;

  /** Tree node label prop */
  treeNodeLabelProp?: string;

  /** Max tag count (for multiple mode) */
  maxTagCount?: number | 'responsive';

  /** Max tag placeholder */
  maxTagPlaceholder?: ReactNode | ((omittedValues: TreeSelectLabeledValue[]) => ReactNode);

  /** Max tag text length */
  maxTagTextLength?: number;

  // ─────────────────────────────────────────────────────────────────────────────
  // Field Names
  // ─────────────────────────────────────────────────────────────────────────────

  /** Custom field names */
  fieldNames?: TreeSelectFieldNames;

  // ─────────────────────────────────────────────────────────────────────────────
  // Dropdown Props
  // ─────────────────────────────────────────────────────────────────────────────

  /** Whether the dropdown is open (controlled) */
  open?: boolean;

  /** Placement of dropdown */
  placement?: TreeSelectPlacement;

  /** Class name for dropdown */
  popupClassName?: string;

  /** Dropdown match select width */
  popupMatchSelectWidth?: boolean | number;

  /** Get popup container */
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;

  /** Content to show when no options */
  notFoundContent?: ReactNode;

  /** Dropdown render */
  dropdownRender?: (menu: ReactNode) => ReactNode;

  /** Dropdown style */
  dropdownStyle?: CSSProperties;

  // ─────────────────────────────────────────────────────────────────────────────
  // Async Loading
  // ─────────────────────────────────────────────────────────────────────────────

  /** Load data asynchronously */
  loadData?: (node: TreeSelectNode) => Promise<void>;

  // ─────────────────────────────────────────────────────────────────────────────
  // Filtering
  // ─────────────────────────────────────────────────────────────────────────────

  /** Filter tree nodes */
  filterTreeNode?: boolean | ((inputValue: string, treeNode: TreeSelectNode) => boolean);

  /** Highlight matched text */
  treeDataSimpleMode?: boolean | { id: string; pId: string; rootPId: string | number | null };

  // ─────────────────────────────────────────────────────────────────────────────
  // Events
  // ─────────────────────────────────────────────────────────────────────────────

  /** Callback when value changes */
  onChange?: (
    value: TreeSelectValue,
    labelList: ReactNode[],
    extra: { triggerValue: TreeSelectSingleValue; triggerNode: TreeSelectNode }
  ) => void;

  /** Callback when search value changes */
  onSearch?: (value: string) => void;

  /** Callback when dropdown opens/closes */
  onDropdownVisibleChange?: (open: boolean) => void;

  /** Callback when tree node is selected */
  onSelect?: (value: TreeSelectSingleValue, node: TreeSelectNode) => void;

  /** Callback when tree is expanded */
  onTreeExpand?: (expandedKeys: (string | number)[]) => void;

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
 * Full TreeSelect props
 */
export interface TreeSelectProps extends TreeSelectBaseProps {
  /** Label in value mode */
  labelInValue?: boolean;

  /** Virtual scroll */
  virtual?: boolean;

  /** Tree title render */
  treeTitleRender?: (node: TreeSelectNode) => ReactNode;

  /** Tag render for multiple mode */
  tagRender?: (props: {
    label: ReactNode;
    value: TreeSelectSingleValue;
    closable: boolean;
    onClose: () => void;
  }) => ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get node value
 */
export function getNodeValue(
  node: TreeSelectNode,
  fieldNames?: TreeSelectFieldNames
): string | number {
  const valueField = fieldNames?.value ?? 'value';
  return node[valueField] as string | number;
}

/**
 * Get node label/title
 */
export function getNodeLabel(
  node: TreeSelectNode,
  fieldNames?: TreeSelectFieldNames
): ReactNode {
  const labelField = fieldNames?.label ?? 'title';
  return node[labelField] as ReactNode;
}

/**
 * Get node children
 */
export function getNodeChildren(
  node: TreeSelectNode,
  fieldNames?: TreeSelectFieldNames
): TreeSelectNode[] | undefined {
  const childrenField = fieldNames?.children ?? 'children';
  return node[childrenField] as TreeSelectNode[] | undefined;
}

/**
 * Find node by value in tree
 */
export function findTreeNode(
  treeData: TreeSelectNode[],
  value: TreeSelectSingleValue,
  fieldNames?: TreeSelectFieldNames
): TreeSelectNode | null {
  for (const node of treeData) {
    if (getNodeValue(node, fieldNames) === value) {
      return node;
    }
    const children = getNodeChildren(node, fieldNames);
    if (children) {
      const found = findTreeNode(children, value, fieldNames);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Flatten tree data
 */
export function flattenTreeData(
  treeData: TreeSelectNode[],
  fieldNames?: TreeSelectFieldNames
): TreeSelectNode[] {
  const result: TreeSelectNode[] = [];

  function traverse(nodes: TreeSelectNode[]) {
    for (const node of nodes) {
      result.push(node);
      const children = getNodeChildren(node, fieldNames);
      if (children) {
        traverse(children);
      }
    }
  }

  traverse(treeData);
  return result;
}

/**
 * Default filter function for tree nodes
 */
export function defaultTreeFilter(
  inputValue: string,
  treeNode: TreeSelectNode,
  fieldNames?: TreeSelectFieldNames
): boolean {
  const label = getNodeLabel(treeNode, fieldNames);
  const labelStr = typeof label === 'string' ? label : String(getNodeValue(treeNode, fieldNames));
  return labelStr.toLowerCase().includes(inputValue.toLowerCase());
}

/**
 * Check if value is multiple value
 */
export function isMultipleValue(value: TreeSelectValue): value is TreeSelectMultipleValue {
  return Array.isArray(value);
}
