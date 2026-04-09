/**
 * @fileoverview Type definitions for the TreeView pattern component.
 * Defines the recursive {@link TreeNode} shape and {@link TreeViewProps}
 * controlling expand/collapse, single and multi-selection, checkbox mode,
 * drag-and-drop reordering, and search filtering.
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../../foundation/types';

/**
 * Represents a single node in the tree hierarchy.
 *
 * Nodes are recursive -- each node may contain `children` forming an
 * arbitrarily deep tree. The `data` field allows attaching domain-specific
 * payloads without extending the interface.
 */
export interface TreeNode {
  /** Unique key identifying this node within the tree. */
  key: string;

  /**
   * Display label for this node. Accepts ReactNode for rich content
   * (e.g., inline badges or formatted text).
   */
  label: ReactNode;

  /** Optional icon rendered before the node label. */
  icon?: ReactNode;

  /**
   * Child nodes nested under this node.
   * Omit or pass an empty array for leaf nodes.
   */
  children?: TreeNode[];

  /** Whether this node is disabled (non-selectable, non-checkable). */
  disabled?: boolean;

  /**
   * Arbitrary data payload attached to this node.
   * Typed as `unknown` to allow any domain-specific shape; consumers
   * should narrow the type at the call site.
   */
  data?: unknown;
}

/**
 * Props for the TreeView pattern component.
 *
 * Supports both controlled (`expandedKeys`/`selectedKeys`) and uncontrolled
 * (`defaultExpandedKeys`) usage. Features include multi-selection, checkboxes,
 * drag-and-drop reordering, and an integrated search input.
 *
 * @example
 * ```tsx
 * <TreeView
 *   data={[
 *     { key: 'src', label: 'src', children: [
 *       { key: 'components', label: 'components', children: [
 *         { key: 'button', label: 'Button.tsx' },
 *       ]},
 *       { key: 'utils', label: 'utils' },
 *     ]},
 *   ]}
 *   expandedKeys={expanded}
 *   selectedKeys={selected}
 *   onExpand={(keys) => setExpanded(keys)}
 *   onSelect={(keys) => setSelected(keys)}
 *   checkable
 *   searchable
 *   searchPlaceholder="Filter files..."
 *   draggable
 *   onDrop={(info) => handleReorder(info)}
 * />
 * ```
 */
export interface TreeViewProps extends PatternBaseProps {
  /** Root-level tree nodes. Each node may contain nested `children`. */
  data: TreeNode[];

  /**
   * Custom renderer for individual tree nodes. Receives the node and
   * its depth (zero-based) for indentation-aware rendering.
   */
  renderNode?: (node: TreeNode, depth: number) => ReactNode;

  /**
   * Callback fired when the selected node(s) change.
   * Receives the full set of currently selected keys.
   */
  onSelect?: (keys: string[]) => void;

  /**
   * Callback fired when nodes are expanded or collapsed.
   * Receives the full set of currently expanded keys.
   */
  onExpand?: (keys: string[]) => void;

  /** Currently expanded node keys (controlled mode). */
  expandedKeys?: string[];

  /** Currently selected node keys (controlled mode). */
  selectedKeys?: string[];

  /**
   * Keys of nodes expanded on initial render (uncontrolled mode).
   * Ignored when `expandedKeys` is provided.
   */
  defaultExpandedKeys?: string[];

  /**
   * Whether to render checkboxes alongside each node.
   * Enables a tri-state checked/unchecked/indeterminate model.
   */
  checkable?: boolean;

  /**
   * Keys of currently checked nodes (controlled mode).
   * Only effective when `checkable` is `true`.
   */
  checkedKeys?: string[];

  /**
   * Callback fired when the checked state of any node changes.
   * Only effective when `checkable` is `true`.
   */
  onCheck?: (keys: string[]) => void;

  /** Whether nodes can be reordered via drag-and-drop. */
  draggable?: boolean;

  /**
   * Callback fired when a node is dropped after a drag operation.
   * The `position` field indicates placement relative to the drop target:
   * - `'before'`: Insert before the target node.
   * - `'after'`: Insert after the target node.
   * - `'inside'`: Nest as a child of the target node.
   */
  onDrop?: (info: { dragKey: string; dropKey: string; position: 'before' | 'after' | 'inside' }) => void;

  /** Whether to display an integrated search/filter input above the tree. */
  searchable?: boolean;

  /** Placeholder text for the search input (requires `searchable`). */
  searchPlaceholder?: string;

  /**
   * Whether to allow selecting multiple nodes simultaneously.
   * When `false`, only one node can be selected at a time.
   */
  multiple?: boolean;
}
