'use client';

import { createEngineComponent, lazyEngine } from '../../../engine/createEngineComponent';
import type { TreeSelectProps } from './types';
import TitanTreeSelect from './engines/titan';

/**
 * TreeSelect Component
 *
 * Multi-engine tree select that automatically uses the correct implementation
 * based on the current engine context.
 *
 * Engines:
 * - titan: Ant Design TreeSelect (default, full featured)
 * - hermes: DaisyUI-based tree select (lazy loaded)
 * - apollo: Native HTML + Tailwind tree select (lazy loaded)
 * - athena: Re-exports apollo implementation
 *
 * @example
 * ```tsx
 * // Basic usage
 * <TreeSelect
 *   treeData={[
 *     {
 *       value: 'parent',
 *       title: 'Parent',
 *       children: [
 *         { value: 'child1', title: 'Child 1' },
 *         { value: 'child2', title: 'Child 2' },
 *       ],
 *     },
 *   ]}
 *   placeholder="Select..."
 *   onChange={(value) => console.log(value)}
 * />
 *
 * // Multiple selection with checkboxes
 * <TreeSelect
 *   treeData={data}
 *   treeCheckable
 *   showCheckedStrategy="SHOW_PARENT"
 *   onChange={(values) => console.log(values)}
 * />
 *
 * // With search
 * <TreeSelect
 *   treeData={data}
 *   showSearch
 *   treeDefaultExpandAll
 * />
 * ```
 */
export const TreeSelect = createEngineComponent<TreeSelectProps>(
  {
    titan: TitanTreeSelect,
    hermes: lazyEngine(() =>
      import('./engines/hermes').then((m) => ({
        default: m.default,
      }))
    ),
    apollo: lazyEngine(() =>
      import('./engines/apollo').then((m) => ({
        default: m.default,
      }))
    ),
    athena: lazyEngine(() =>
      import('./engines/athena').then((m) => ({
        default: m.default,
      }))
    ),
  },
  { displayName: 'TreeSelect' }
);
