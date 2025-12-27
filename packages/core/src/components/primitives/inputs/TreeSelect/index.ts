/**
 * TreeSelect - Engine Router
 *
 * This module exports the TreeSelect component with multi-engine support.
 * TreeSelect provides selection from hierarchical tree-structured data.
 *
 * @module TreeSelect
 * @example
 * ```tsx
 * import { TreeSelect } from '@rottay/design-system';
 *
 * // Basic usage
 * <TreeSelect
 *   treeData={[
 *     {
 *       value: 'parent',
 *       title: 'Parent',
 *       children: [
 *         { value: 'child', title: 'Child' },
 *       ],
 *     },
 *   ]}
 *   placeholder="Select a node"
 * />
 *
 * // With checkable nodes
 * <TreeSelect treeData={data} treeCheckable />
 *
 * // Multiple selection
 * <TreeSelect treeData={data} multiple />
 *
 * // With search
 * <TreeSelect treeData={data} showSearch />
 * ```
 */
import { createEngineComponent } from '../../../../system/engines/factory';
import type { TreeSelectProps } from './types';

export {
  type TreeSelectProps,
  type TreeSelectNode,
  type TreeSelectValue,
  type TreeSelectSize,
  TREESELECT_DEFAULTS,
} from './types';

export const TreeSelect = createEngineComponent<TreeSelectProps>('TreeSelect', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

export default TreeSelect;
