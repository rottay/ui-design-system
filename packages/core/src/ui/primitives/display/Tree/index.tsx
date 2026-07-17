'use client';

/**
 * @fileoverview Tree - Hierarchical data display with expand/collapse.
 * Supports selection (single, multi, checkbox), drag-and-drop, virtual
 * scrolling, connecting lines, and a declarative `Tree.TreeNode` API.
 *
 * @example
 * ```tsx
 * import { Tree } from '@rottay/design-system';
 *
 * <Tree treeData={data} checkable showLine defaultExpandedKeys={['1']} />
 *
 * // Declarative alternative
 * <Tree showLine>
 *   <Tree.TreeNode key="1" title="Root">
 *     <Tree.TreeNode key="1-1" title="Child" />
 *   </Tree.TreeNode>
 * </Tree>
 * ```
 *
 * @module Tree
 * @category Display
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { TreeProps } from './contracts';
import { TreeNode } from './compound';

export type { TreeProps, TreeNodeProps, TreeDataNode, TreeSize, TreeDropInfo, TreeDragStartInfo } from './contracts';
export { TREE_DEFAULTS } from './contracts';

export { TreeNode };
export type { TreeNodeProps as TreeNodeComponentProps } from './compound';

/**
 * Tree with compound TreeNode sub-component.
 * TreeNode enables a declarative JSX tree structure as an alternative to the
 * data-driven `treeData` prop -- useful for static or template-defined trees.
 */
export const Tree = Object.assign(
  createEngineComponent<TreeProps>('Tree', {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }),
  {
    /** Declarative node for building tree hierarchies in JSX instead of `treeData`. */
    TreeNode,
  }
);

export default Tree;
