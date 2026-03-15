/**
 * @fileoverview TreeSelect Component Types - Rottay Design System
 * @description Type definitions for the TreeSelect component including tree nodes,
 * selection modes, checkable configuration, and search filtering.
 *
 * @remarks
 * The TreeSelect types provide comprehensive configuration for:
 * - Tree nodes: Hierarchical structure with value, title, children
 * - Selection modes: Single, multiple, or checkbox selection
 * - Search filtering: Built-in or custom filter functions
 * - Customization: Field names, tree lines, expand behavior
 *
 * @example Type Usage
 * ```tsx
 * import type {
 *   TreeSelectProps,
 *   TreeSelectNode,
 *   TreeSelectValue,
 * } from '@rottay/design-system';
 *
 * const treeData: TreeSelectNode[] = [
 *   {
 *     value: 'parent',
 *     title: 'Parent Node',
 *     children: [
 *       { value: 'child', title: 'Child Node', isLeaf: true },
 *     ],
 *   },
 * ];
 *
 * const config: TreeSelectProps = {
 *   treeData,
 *   treeCheckable: true,
 *   showSearch: true,
 * };
 * ```
 *
 * @module TreeSelect/Types
 * @category Inputs
 * @package @rottay/design-system
 */
import type { ReactNode, CSSProperties } from 'react';

/**
 * Size variants for the TreeSelect input.
 */
export type TreeSelectSize = 'small' | 'middle' | 'large';

/**
 * Structure for a tree select node with hierarchical children.
 *
 * @example
 * ```tsx
 * const node: TreeSelectNode = {
 *   value: 'engineering',
 *   title: 'Engineering Department',
 *   children: [
 *     { value: 'frontend', title: 'Frontend Team', isLeaf: true },
 *     { value: 'backend', title: 'Backend Team', isLeaf: true },
 *   ],
 * };
 * ```
 */
export interface TreeSelectNode {
  /** Optional unique key (defaults to value) */
  key?: string;
  /** Unique value for this node */
  value: string | number;
  /** Display content for this node */
  title: ReactNode;
  /** Whether this node is disabled */
  disabled?: boolean;
  /** Whether the checkbox is disabled (when treeCheckable) */
  disableCheckbox?: boolean;
  /** Whether this node is selectable */
  selectable?: boolean;
  /** Whether to show checkbox for this node */
  checkable?: boolean;
  /** Child nodes (nested hierarchy) */
  children?: TreeSelectNode[];
  /** Whether this is a leaf node (no children) */
  isLeaf?: boolean;
  /** Additional custom properties */
  [key: string]: unknown;
}

/**
 * Selected value type - single value or array for multiple selection.
 *
 * @example
 * ```tsx
 * // Single selection
 * const value: TreeSelectValue = 'engineering';
 *
 * // Multiple selection
 * const values: TreeSelectValue = ['frontend', 'backend'];
 * ```
 */
export type TreeSelectValue = string | number | (string | number)[];

/**
 * Props for the TreeSelect component.
 *
 * @example Basic usage
 * ```tsx
 * <TreeSelect
 *   treeData={data}
 *   placeholder="Select..."
 *   onChange={(value) => handleChange(value)}
 * />
 * ```
 *
 * @example Checkable with search
 * ```tsx
 * <TreeSelect
 *   treeData={data}
 *   treeCheckable
 *   showSearch
 *   treeDefaultExpandAll
 * />
 * ```
 */
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
  /**
   * When true, parent/child checkbox selections are independent.
   * Checking a parent does NOT auto-check children, unchecking a child
   * does NOT uncheck its parent.
   */
  treeCheckStrictly?: boolean;
  /** Show search input */
  showSearch?: boolean;
  /**
   * Custom filter function for search.
   * - `true` uses default title-match filter
   * - `false` disables filtering
   * - A function receives (inputValue, treeNode) and returns boolean
   *
   * When filtering is active, matching parent nodes are auto-expanded.
   */
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
  /**
   * Custom field name mapping for tree data.
   * Allows using data with non-standard property names without transformation.
   *
   * @example
   * ```tsx
   * <TreeSelect
   *   treeData={[{ name: 'Dept', id: '1', subItems: [] }]}
   *   fieldNames={{ title: 'name', value: 'id', children: 'subItems' }}
   * />
   * ```
   */
  fieldNames?: {
    title?: string;
    value?: string;
    children?: string;
  };
  /** Show tree line connector between nodes */
  treeLine?: boolean;
  /**
   * Lazy load children for a node. Return a Promise that resolves with
   * child nodes. A loading spinner is shown on the node while loading.
   *
   * @example
   * ```tsx
   * <TreeSelect
   *   loadData={(node) => fetchChildren(node.value).then(children => {
   *     setTreeData(prev => appendChildren(prev, node.value, children));
   *   })}
   * />
   * ```
   */
  loadData?: (node: TreeSelectNode) => Promise<void>;
  /** Additional class name */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
  /** Popup class name */
  popupClassName?: string;
  /** Rendering engine override */
  engine?: 'classic' | 'modern' | 'rustic';
}

/**
 * Default values for TreeSelect props.
 * Used across all engine implementations for consistency.
 */
export const TREESELECT_DEFAULTS: Partial<TreeSelectProps> = {
  /** Single selection by default */
  multiple: false,
  /** Checkboxes hidden by default */
  treeCheckable: false,
  /** Parent-child check cascading enabled */
  treeCheckStrictly: false,
  /** Search hidden by default */
  showSearch: false,
  /** Tree collapsed by default */
  treeDefaultExpandAll: false,
  /** Not disabled by default */
  disabled: false,
  /** Clear button enabled */
  allowClear: true,
  /** Default size variant */
  size: 'middle',
  /** Default placeholder text */
  placeholder: 'Please select',
  /** Tree lines hidden by default */
  treeLine: false,
};
