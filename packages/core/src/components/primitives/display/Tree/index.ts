/**
 * Tree - Engine Router
 *
 * A hierarchical list structure component that displays data in a tree format.
 * Supports selection, checkboxes, drag-and-drop, and virtual scrolling.
 *
 * @example
 * ```tsx
 * import { Tree } from '@es-rottay/designsystem-core';
 *
 * const treeData = [
 *   {
 *     key: '1',
 *     title: 'Parent',
 *     children: [
 *       { key: '1-1', title: 'Child 1' },
 *       { key: '1-2', title: 'Child 2' },
 *     ],
 *   },
 * ];
 *
 * <Tree
 *   treeData={treeData}
 *   checkable
 *   defaultExpandedKeys={['1']}
 *   onSelect={(keys) => console.log('Selected:', keys)}
 * />
 * ```
 *
 * @module Tree
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { TreeProps } from './types';
import { TreeNode } from './compound';

// Export types
export type { TreeProps, TreeNodeProps, TreeDataNode, TreeSize } from './types';
export { TREE_DEFAULTS } from './types';

// Export compound components
export { TreeNode };
export type { TreeNodeProps as TreeNodeComponentProps } from './compound';

// Export base component for custom implementations
export { BaseTree } from './base';

/**
 * Create engine-aware Tree component.
 *
 * The Tree component automatically selects the appropriate rendering engine
 * based on the current context or explicit engine prop.
 *
 * Engines:
 * - **titan**: Full-featured implementation using Ant Design (default)
 * - **hermes**: Lightweight implementation using DaisyUI/Tailwind
 * - **apollo**: Headless implementation using vanilla HTML/CSS
 */
export const Tree = Object.assign(
  createEngineComponent<TreeProps>('Tree', {
    titan: () => import('./engines/titan'),
    hermes: () => import('./engines/hermes'),
    apollo: () => import('./engines/apollo'),
  }),
  {
    /**
     * TreeNode compound component for declarative tree building.
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
    TreeNode,
  }
);

export default Tree;
