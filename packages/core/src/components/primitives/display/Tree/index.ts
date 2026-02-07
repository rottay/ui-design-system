'use client';

/**
 * @fileoverview Tree Component - Rottay Design System
 * @description A hierarchical list structure component that displays data in a tree format.
 * Supports selection, checkboxes, drag-and-drop, virtual scrolling, and connecting lines.
 *
 * @remarks
 * The Tree component displays hierarchical data structures with expandable/collapsible
 * nodes. It's commonly used for:
 * - File system explorers and directory trees
 * - Organization charts and hierarchies
 * - Category and taxonomy displays
 * - Menu and navigation structures
 * - Nested data visualization
 *
 * Key features:
 * - **Multi-engine support**: Classic (Ant Design), Modern (DaisyUI), Rustic (Vanilla)
 * - **Selection modes**: Single select, multiple select, or checkbox selection
 * - **Drag and drop**: Reorganize tree structure with built-in DnD
 * - **Virtual scrolling**: Efficient rendering for large trees
 * - **Custom icons**: Per-node icon customization
 * - **Connecting lines**: Visual hierarchy with optional tree lines
 * - **Controlled/uncontrolled**: Full state control or automatic management
 *
 * @example Basic tree with data
 * ```tsx
 * import { Tree } from '@rottay/design-system';
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
 *   defaultExpandedKeys={['1']}
 *   onSelect={(keys) => console.log('Selected:', keys)}
 * />
 * ```
 *
 * @example Checkable tree with selection
 * ```tsx
 * <Tree
 *   treeData={treeData}
 *   checkable
 *   defaultCheckedKeys={['1-1']}
 *   onCheck={(keys, info) => console.log('Checked:', keys)}
 * />
 * ```
 *
 * @example Declarative tree with TreeNode
 * ```tsx
 * <Tree showLine>
 *   <Tree.TreeNode key="1" title="Root">
 *     <Tree.TreeNode key="1-1" title="Child A" />
 *     <Tree.TreeNode key="1-2" title="Child B" />
 *   </Tree.TreeNode>
 * </Tree>
 * ```
 *
 * @example Multi-engine usage
 * ```tsx
 * // Classic engine (Ant Design - default)
 * <Tree engine="classic" treeData={data} checkable showLine />
 *
 * // Modern engine (DaisyUI/Tailwind)
 * <Tree engine="modern" treeData={data} showIcon />
 *
 * // Rustic engine (Pure HTML/CSS)
 * <Tree engine="rustic" treeData={data} draggable />
 * ```
 *
 * @see {@link TreeProps} for component props
 * @see {@link TreeDataNode} for data structure
 * @see {@link TreeNodeProps} for compound component props
 * @module Tree
 * @category Display
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../core/engines/factory';
import type { TreeProps } from './types';
import { TreeNode } from './compound';

// Export types
export type { TreeProps, TreeNodeProps, TreeDataNode, TreeSize } from './types';
export { TREE_DEFAULTS } from './types';

// Export compound components
export { TreeNode };
export type { TreeNodeProps as TreeNodeComponentProps } from './compound';

// Export base component for custom implementations

/**
 * Create engine-aware Tree component.
 *
 * The Tree component automatically selects the appropriate rendering engine
 * based on the current context or explicit engine prop.
 *
 * Engines:
 * - **classic**: Full-featured implementation using Ant Design (default)
 * - **modern**: Lightweight implementation using DaisyUI/Tailwind
 * - **rustic**: Headless implementation using vanilla HTML/CSS
 */
export const Tree = Object.assign(
  createEngineComponent<TreeProps>('Tree', {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
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
