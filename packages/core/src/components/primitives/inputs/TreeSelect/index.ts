'use client';

/**
 * @fileoverview TreeSelect Component - Rottay Design System
 * @description A dropdown selection component that displays hierarchical tree data,
 * combining the features of Select and Tree components for nested data selection.
 *
 * @remarks
 * The TreeSelect component provides hierarchical dropdown selection for:
 * - **Organization structures**: Departments, teams, roles
 * - **Category selection**: Nested product categories, taxonomies
 * - **Location hierarchy**: Countries, states, cities
 * - **Permission systems**: Role-based access with nested permissions
 *
 * Key features:
 * - **Multi-engine support**: Titan (Ant Design), Hermes (DaisyUI), Apollo (Vanilla)
 * - **Multiple selection**: Select multiple nodes with tags
 * - **Checkable nodes**: Checkbox mode with parent-child cascading
 * - **Search filtering**: Filter tree nodes by text search
 * - **Tree lines**: Visual connecting lines between nodes
 * - **Async loading**: Load children dynamically
 * - **Controlled/uncontrolled**: Full state management flexibility
 *
 * @example Basic tree select
 * ```tsx
 * import { TreeSelect } from '@rottay/design-system';
 *
 * const treeData = [
 *   {
 *     value: 'engineering',
 *     title: 'Engineering',
 *     children: [
 *       { value: 'frontend', title: 'Frontend' },
 *       { value: 'backend', title: 'Backend' },
 *     ],
 *   },
 * ];
 *
 * <TreeSelect
 *   treeData={treeData}
 *   placeholder="Select department"
 *   onChange={(value) => setDepartment(value)}
 * />
 * ```
 *
 * @example Multiple selection with checkboxes
 * ```tsx
 * <TreeSelect
 *   treeData={treeData}
 *   treeCheckable
 *   multiple
 *   maxTagCount={3}
 *   placeholder="Select teams"
 * />
 * ```
 *
 * @example With search functionality
 * ```tsx
 * <TreeSelect
 *   treeData={treeData}
 *   showSearch
 *   filterTreeNode={(input, node) =>
 *     node.title.toLowerCase().includes(input.toLowerCase())
 *   }
 * />
 * ```
 *
 * @example Tree with connecting lines
 * ```tsx
 * <TreeSelect
 *   treeData={treeData}
 *   treeLine
 *   treeDefaultExpandAll
 * />
 * ```
 *
 * @example Multi-engine usage
 * ```tsx
 * // Titan engine (Ant Design - default)
 * <TreeSelect engine="titan" treeData={data} treeCheckable />
 *
 * // Hermes engine (DaisyUI/Tailwind)
 * <TreeSelect engine="hermes" treeData={data} size="large" />
 *
 * // Apollo engine (Pure HTML/CSS)
 * <TreeSelect engine="apollo" treeData={data} />
 * ```
 *
 * @see {@link TreeSelectProps} for component props
 * @see {@link TreeSelectNode} for node structure
 * @module TreeSelect
 * @category Inputs
 * @package @rottay/design-system
 */
import { createEngineComponent } from '../../../../core/engines/factory';
import type { TreeSelectProps } from './types';

// Export types
export {
  type TreeSelectProps,
  type TreeSelectNode,
  type TreeSelectValue,
  type TreeSelectSize,
  TREESELECT_DEFAULTS,
} from './types';

/**
 * Create engine-aware TreeSelect component.
 *
 * The TreeSelect component automatically selects the appropriate rendering engine
 * based on the current context or explicit engine prop.
 *
 * Engines:
 * - **titan**: Full-featured implementation using Ant Design (default)
 * - **hermes**: Lightweight implementation using DaisyUI/Tailwind
 * - **apollo**: Headless implementation using vanilla HTML/CSS
 */
export const TreeSelect = createEngineComponent<TreeSelectProps>('TreeSelect', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

export default TreeSelect;
