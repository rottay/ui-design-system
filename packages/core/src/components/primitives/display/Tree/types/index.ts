/**
 * @fileoverview Tree Component Types - Rottay Design System
 * @description Type definitions for the Tree component including data structure,
 * selection modes, checkbox configuration, drag-and-drop, and virtual scrolling.
 *
 * @remarks
 * The Tree types provide comprehensive configuration for:
 * - TreeDataNode: Hierarchical data structure with key, title, children
 * - Selection: Single, multiple, or checkbox-based selection
 * - Expansion: Controlled/uncontrolled expand states
 * - Drag and drop: Reordering callbacks and position info
 * - Visual options: Lines, icons, block nodes
 *
 * @example Type Usage
 * ```tsx
 * import type {
 *   TreeProps,
 *   TreeDataNode,
 *   TreeNodeProps,
 * } from '@rottay/design-system';
 *
 * const data: TreeDataNode[] = [
 *   {
 *     key: '1',
 *     title: 'Parent',
 *     children: [
 *       { key: '1-1', title: 'Child', isLeaf: true },
 *     ],
 *   },
 * ];
 *
 * const props: TreeProps = {
 *   treeData: data,
 *   checkable: true,
 *   showLine: true,
 * };
 * ```
 *
 * @module Tree/Types
 * @category Display
 * @package @rottay/design-system
 */

import type { ReactNode, CSSProperties, Key } from 'react';

/**
 * Represents a single node in the tree data structure.
 *
 * @example
 * ```tsx
 * const treeData: TreeDataNode[] = [
 *   {
 *     key: '1',
 *     title: 'Parent',
 *     children: [
 *       { key: '1-1', title: 'Child 1' },
 *       { key: '1-2', title: 'Child 2' },
 *     ],
 *   },
 * ];
 * ```
 */
export interface TreeDataNode {
  /** Unique identifier for the node */
  key: Key;
  /** Display content of the node */
  title?: ReactNode;
  /** Child nodes */
  children?: TreeDataNode[];
  /** Whether the node is disabled */
  disabled?: boolean;
  /** Whether the checkbox is disabled (when checkable is true) */
  disableCheckbox?: boolean;
  /** Whether the node is a leaf node (no expand icon) */
  isLeaf?: boolean;
  /** Whether the node can be selected */
  selectable?: boolean;
  /** Whether the node shows a checkbox (overrides parent checkable) */
  checkable?: boolean;
  /** Custom icon for the node */
  icon?: ReactNode;
  /** Whether this node is draggable (overrides parent draggable) */
  draggable?: boolean;
}

/**
 * Info object provided to the onDrop callback.
 */
export interface TreeDropInfo {
  /** The node being dragged */
  dragNode: TreeDataNode;
  /** The drop target node */
  dropNode: TreeDataNode;
  /**
   * Position relative to the drop node:
   * -1 = before, 0 = as child, 1 = after
   */
  dropPosition: number;
}

/**
 * Info object provided to the onDragStart callback.
 */
export interface TreeDragStartInfo {
  /** The node being dragged */
  node: TreeDataNode;
}

/**
 * Props for the Tree component.
 *
 * @example
 * ```tsx
 * <Tree
 *   treeData={data}
 *   checkable
 *   defaultExpandedKeys={['1']}
 *   onSelect={(keys) => console.log('Selected:', keys)}
 * />
 * ```
 */
export interface TreeProps {
  /**
   * Tree data array - the hierarchical structure to display
   * @example
   * ```tsx
   * treeData={[
   *   { key: '1', title: 'Root', children: [...] }
   * ]}
   * ```
   */
  treeData?: TreeDataNode[];

  /**
   * Show checkbox for each node
   * @default false
   */
  checkable?: boolean;

  /**
   * Keys of nodes that are expanded by default (uncontrolled)
   * @example defaultExpandedKeys={['1', '2']}
   */
  defaultExpandedKeys?: Key[];

  /**
   * Keys of currently expanded nodes (controlled)
   * Use with onExpand for controlled behavior
   */
  expandedKeys?: Key[];

  /**
   * Keys of nodes that are selected by default (uncontrolled)
   * @example defaultSelectedKeys={['1']}
   */
  defaultSelectedKeys?: Key[];

  /**
   * Keys of currently selected nodes (controlled)
   * Use with onSelect for controlled behavior
   */
  selectedKeys?: Key[];

  /**
   * Keys of nodes that are checked by default (uncontrolled)
   * @example defaultCheckedKeys={['1', '2']}
   */
  defaultCheckedKeys?: Key[];

  /**
   * Keys of currently checked nodes (controlled)
   * Can be an array or object with checked and halfChecked keys
   */
  checkedKeys?: Key[] | { checked: Key[]; halfChecked: Key[] };

  /**
   * Allow multiple nodes to be selected
   * @default false
   */
  multiple?: boolean;

  /**
   * Auto expand parent nodes when child is selected/checked
   * @default true
   */
  autoExpandParent?: boolean;

  /**
   * Show connecting lines between nodes
   * @default false
   */
  showLine?: boolean | { showLeafIcon: boolean };

  /**
   * Show icons for each node
   * @default false
   */
  showIcon?: boolean;

  /**
   * Expand all nodes by default
   * @default false
   */
  defaultExpandAll?: boolean;

  /**
   * Default expand parent nodes
   */
  defaultExpandParent?: boolean;

  /**
   * Enable drag and drop functionality
   * @default false
   */
  draggable?: boolean;

  /**
   * Make node take full width for selection area
   * @default false
   */
  blockNode?: boolean;

  /**
   * Height for virtual scrolling (improves performance with large trees)
   */
  height?: number;

  /**
   * Custom expand/collapse icon
   * Can be a ReactNode or function that receives expanded state
   */
  switcherIcon?: ReactNode | ((props: { expanded: boolean }) => ReactNode);

  /**
   * Async data loading function.
   * Called when a non-leaf node is expanded for the first time.
   * Should return children to append to the node.
   */
  loadData?: (node: TreeDataNode) => Promise<TreeDataNode[]>;

  /**
   * Filter function for tree search.
   * Return true to show the node, false to hide it.
   * Parent nodes of matching nodes are automatically expanded.
   */
  filterTreeNode?: (searchValue: string, node: TreeDataNode) => boolean;

  /**
   * Current search value for tree filtering.
   * Used with filterTreeNode to highlight and filter nodes.
   */
  searchValue?: string;

  /**
   * Check nodes independently (no parent-child cascade).
   * When true, checking a parent does NOT check its children and vice versa.
   * @default false
   */
  treeCheckStrictly?: boolean;

  /**
   * Show connecting tree lines between nodes (CSS borders).
   * Alias for showLine kept for backward compat.
   * @default false
   */
  treeLine?: boolean;

  /**
   * Callback when a node is expanded/collapsed
   * @param expandedKeys - Array of currently expanded node keys
   * @param info - Object containing the node and expanded state
   */
  onExpand?: (expandedKeys: Key[], info: { node: TreeDataNode; expanded: boolean }) => void;

  /**
   * Callback when a node is selected
   * @param selectedKeys - Array of currently selected node keys
   * @param info - Object containing the node and selected state
   */
  onSelect?: (selectedKeys: Key[], info: { node: TreeDataNode; selected: boolean }) => void;

  /**
   * Callback when a node checkbox is checked/unchecked
   * @param checkedKeys - Array or object of currently checked node keys
   * @param info - Object containing the node and checked state
   */
  onCheck?: (
    checkedKeys: Key[] | { checked: Key[]; halfChecked: Key[] },
    info: { node: TreeDataNode; checked: boolean }
  ) => void;

  /**
   * Callback when drag operation starts
   * @param info - Object containing the dragged node
   */
  onDragStart?: (info: TreeDragStartInfo) => void;

  /**
   * Callback when a node is dropped
   * @param info - Object containing drag node, drop target, and position
   */
  onDrop?: (info: TreeDropInfo) => void;

  /**
   * Children elements (for Tree.TreeNode usage pattern)
   */
  children?: ReactNode;

  /**
   * Additional CSS class name
   */
  className?: string;

  /**
   * Inline styles
   */
  style?: CSSProperties;

  /**
   * Engine override for rendering
   * @example engine="modern"
   */
  engine?: 'classic' | 'modern' | 'rustic';
}

/**
 * Props for the TreeNode compound component.
 * Used when building tree structure declaratively with JSX.
 *
 * @example
 * ```tsx
 * <Tree>
 *   <Tree.TreeNode key="1" title="Parent">
 *     <Tree.TreeNode key="1-1" title="Child" />
 *   </Tree.TreeNode>
 * </Tree>
 * ```
 */
export interface TreeNodeProps {
  /** Display content of the node */
  title?: ReactNode;
  /** Unique identifier for the node */
  key?: Key;
  /** Whether the node is disabled */
  disabled?: boolean;
  /** Whether the checkbox is disabled */
  disableCheckbox?: boolean;
  /** Whether the node is a leaf node */
  isLeaf?: boolean;
  /** Whether the node can be selected */
  selectable?: boolean;
  /** Whether the node shows a checkbox */
  checkable?: boolean;
  /** Custom icon for the node */
  icon?: ReactNode;
  /** Child TreeNode elements */
  children?: ReactNode;
  /** Additional CSS class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

/**
 * Default values for Tree props.
 * Used across all engine implementations for consistency.
 */
export const TREE_DEFAULTS = {
  /** Default checkable state */
  checkable: false,
  /** Default multiple selection state */
  multiple: false,
  /** Default auto expand parent state */
  autoExpandParent: true,
  /** Default show line state */
  showLine: false,
  /** Default show icon state */
  showIcon: false,
  /** Default expand all state */
  defaultExpandAll: false,
  /** Default draggable state */
  draggable: false,
  /** Default block node state */
  blockNode: false,
  /** Default treeCheckStrictly state */
  treeCheckStrictly: false,
} as const;

/**
 * Type for Tree size variants
 */
export type TreeSize = 'sm' | 'md' | 'lg';
