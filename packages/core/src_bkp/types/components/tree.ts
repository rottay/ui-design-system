/**
 * Tree Component Types
 *
 * Unified type definitions for the Tree component.
 * Works with titan (AntD), hermes (DaisyUI), and apollo (HTML+Tailwind).
 */

import type { ReactNode, CSSProperties, Key } from 'react';

/**
 * Tree Data Node
 */
export interface TreeDataNode {
  /** Unique key for the node */
  key: Key;

  /** Node title/label */
  title?: ReactNode;

  /** Child nodes */
  children?: TreeDataNode[];

  /** Whether node is disabled */
  disabled?: boolean;

  /** Whether node checkbox is disabled */
  disableCheckbox?: boolean;

  /** Whether node can be selected */
  selectable?: boolean;

  /** Whether node is a leaf (no children) */
  isLeaf?: boolean;

  /** Custom icon for the node */
  icon?: ReactNode;

  /** Whether node checkbox is checked */
  checkable?: boolean;

  /** Additional class name */
  className?: string;

  /** Inline styles */
  style?: CSSProperties;
}

/**
 * Tree Check Info
 */
export interface TreeCheckInfo {
  event: 'check';
  node: TreeDataNode;
  checked: boolean;
  nativeEvent: MouseEvent;
  checkedNodes: TreeDataNode[];
  checkedNodesPositions?: { node: TreeDataNode; pos: string }[];
  halfCheckedKeys?: Key[];
}

/**
 * Tree Select Info
 */
export interface TreeSelectInfo {
  event: 'select';
  selected: boolean;
  node: TreeDataNode;
  selectedNodes: TreeDataNode[];
  nativeEvent: MouseEvent;
}

/**
 * Tree Expand Info
 */
export interface TreeExpandInfo {
  node: TreeDataNode;
  expanded: boolean;
  nativeEvent: MouseEvent;
}

/**
 * Tree Props
 */
export interface TreeProps {
  /** Tree data nodes */
  treeData?: TreeDataNode[];

  /** Whether to show checkboxes */
  checkable?: boolean;

  /** Checked keys (controlled) */
  checkedKeys?: Key[] | { checked: Key[]; halfChecked: Key[] };

  /** Default checked keys (uncontrolled) */
  defaultCheckedKeys?: Key[];

  /** Whether check state is independent of parent/children */
  checkStrictly?: boolean;

  /** Selected keys (controlled) */
  selectedKeys?: Key[];

  /** Default selected keys (uncontrolled) */
  defaultSelectedKeys?: Key[];

  /** Whether to allow multiple selection */
  multiple?: boolean;

  /** Expanded keys (controlled) */
  expandedKeys?: Key[];

  /** Default expanded keys (uncontrolled) */
  defaultExpandedKeys?: Key[];

  /** Auto expand parent nodes */
  autoExpandParent?: boolean;

  /** Default expand all nodes */
  defaultExpandAll?: boolean;

  /** Whether to show connecting lines */
  showLine?: boolean | { showLeafIcon: boolean };

  /** Whether to show icons */
  showIcon?: boolean;

  /** Custom icon for nodes */
  icon?: ReactNode | ((props: TreeDataNode) => ReactNode);

  /** Custom switch icon (expand/collapse) */
  switcherIcon?: ReactNode | ((props: { expanded: boolean }) => ReactNode);

  /** Whether tree is draggable */
  draggable?: boolean;

  /** Whether to block nodes while dragging */
  blockNode?: boolean;

  /** Whether nodes are disabled */
  disabled?: boolean;

  /** Height for virtual scroll */
  height?: number;

  /** Enable virtual scroll */
  virtual?: boolean;

  /** Callback when node is checked */
  onCheck?: (
    checked: Key[] | { checked: Key[]; halfChecked: Key[] },
    info: TreeCheckInfo
  ) => void;

  /** Callback when node is selected */
  onSelect?: (selectedKeys: Key[], info: TreeSelectInfo) => void;

  /** Callback when node is expanded */
  onExpand?: (expandedKeys: Key[], info: TreeExpandInfo) => void;

  /** Callback when node is right-clicked */
  onRightClick?: (info: { event: MouseEvent; node: TreeDataNode }) => void;

  /** Filter tree nodes */
  filterTreeNode?: (node: TreeDataNode) => boolean;

  /** Load data asynchronously */
  loadData?: (node: TreeDataNode) => Promise<void>;

  /** Additional class name */
  className?: string;

  /** Inline styles */
  style?: CSSProperties;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Find a node in tree by key
 */
export function findTreeNode(
  nodes: TreeDataNode[],
  key: Key
): TreeDataNode | undefined {
  for (const node of nodes) {
    if (node.key === key) return node;
    if (node.children) {
      const found = findTreeNode(node.children, key);
      if (found) return found;
    }
  }
  return undefined;
}

/**
 * Flatten tree data to array
 */
export function flattenTreeData(
  nodes: TreeDataNode[],
  expandedKeys: Key[] = []
): TreeDataNode[] {
  const result: TreeDataNode[] = [];

  function traverse(nodeList: TreeDataNode[]) {
    for (const node of nodeList) {
      result.push(node);
      if (node.children && expandedKeys.includes(node.key)) {
        traverse(node.children);
      }
    }
  }

  traverse(nodes);
  return result;
}

/**
 * Get all parent keys for a node
 */
export function getParentKeys(
  nodes: TreeDataNode[],
  targetKey: Key,
  parentKeys: Key[] = []
): Key[] {
  for (const node of nodes) {
    if (node.key === targetKey) {
      return parentKeys;
    }
    if (node.children) {
      const result = getParentKeys(
        node.children,
        targetKey,
        [...parentKeys, node.key]
      );
      if (result.length > parentKeys.length) {
        return result;
      }
    }
  }
  return parentKeys;
}

/**
 * Get all child keys for a node
 */
export function getChildKeys(node: TreeDataNode): Key[] {
  const keys: Key[] = [];

  function traverse(n: TreeDataNode) {
    keys.push(n.key);
    if (n.children) {
      n.children.forEach(traverse);
    }
  }

  if (node.children) {
    node.children.forEach(traverse);
  }

  return keys;
}

/**
 * Filter tree data based on predicate
 */
export function filterTreeData(
  nodes: TreeDataNode[],
  predicate: (node: TreeDataNode) => boolean
): TreeDataNode[] {
  return nodes
    .map(node => {
      if (predicate(node)) {
        return {
          ...node,
          children: node.children
            ? filterTreeData(node.children, predicate)
            : undefined,
        };
      }
      if (node.children) {
        const filteredChildren = filterTreeData(node.children, predicate);
        if (filteredChildren.length > 0) {
          return { ...node, children: filteredChildren };
        }
      }
      return null;
    })
    .filter((n): n is TreeDataNode => n !== null);
}
