/**
 * @fileoverview Tree compound components barrel export.
 * Re-exports TreeNode for use as Tree.TreeNode in the compound pattern.
 *
 * @remarks
 * This module exports compound components for the Tree component:
 *
 * **TreeNode:**
 * Declarative node definition for building tree structures in JSX.
 * Supports icons, disabled state, and arbitrary nesting depth.
 *
 * @example
 * ```tsx
 * import { Tree } from '@rottay/design-system';
 *
 * <Tree>
 *   <Tree.TreeNode key="1" title="Parent">
 *     <Tree.TreeNode key="1-1" title="Child" />
 *   </Tree.TreeNode>
 * </Tree>
 * ```
 *
 * @see {@link Tree} for the parent component
 * @module Tree/compound
 * @category Display
 * @package @rottay/design-system
 */

export { TreeNode } from './TreeNode';
export type { TreeNodeProps } from './TreeNode';
