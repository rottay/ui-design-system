/**
 * TreeView - Type Definitions
 *
 * Interactive tree hierarchy with expand/collapse, checkboxes, drag, and search.
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../../types';

export interface TreeNode {
  /** Unique key */
  key: string;
  /** Display label */
  label: ReactNode;
  /** Optional icon */
  icon?: ReactNode;
  /** Child nodes */
  children?: TreeNode[];
  /** Whether this node is disabled */
  disabled?: boolean;
  /** Arbitrary data payload */
  data?: unknown;
}

export interface TreeViewProps extends PatternBaseProps {
  /** Tree data */
  data: TreeNode[];
  /** Custom node renderer */
  renderNode?: (node: TreeNode, depth: number) => ReactNode;
  /** Callback when a node is selected */
  onSelect?: (keys: string[]) => void;
  /** Callback when a node is expanded/collapsed */
  onExpand?: (keys: string[]) => void;
  /** Currently expanded node keys (controlled) */
  expandedKeys?: string[];
  /** Currently selected node keys (controlled) */
  selectedKeys?: string[];
  /** Default expanded keys (uncontrolled) */
  defaultExpandedKeys?: string[];
  /** Show checkboxes on nodes */
  checkable?: boolean;
  /** Checked node keys (controlled, only with checkable) */
  checkedKeys?: string[];
  /** Callback when check state changes */
  onCheck?: (keys: string[]) => void;
  /** Enable drag-and-drop reordering */
  draggable?: boolean;
  /** Callback when a node is dropped */
  onDrop?: (info: { dragKey: string; dropKey: string; position: 'before' | 'after' | 'inside' }) => void;
  /** Enable search/filter input */
  searchable?: boolean;
  /** Placeholder text for search input */
  searchPlaceholder?: string;
  /** Whether to allow multiple selection */
  multiple?: boolean;
}
