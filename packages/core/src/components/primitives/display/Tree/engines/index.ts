/**
 * @fileoverview Tree Engine Exports - Rottay Design System
 * @description Barrel exports for all Tree engine implementations.
 *
 * @remarks
 * Available engines:
 * - **Classic**: Ant Design Tree with full feature support
 * - **Modern**: DaisyUI/Tailwind CSS implementation
 * - **Rustic**: Pure vanilla HTML/CSS with recursive rendering
 *
 * All engines implement:
 * - Hierarchical data rendering with expand/collapse
 * - Selection and checkbox modes
 * - Drag and drop reordering (where supported)
 * - Custom icons and connecting lines
 *
 * @example Engine Import
 * ```tsx
 * // Direct engine import (internal use)
 * import { classic, modern, rustic } from './engines';
 *
 * // Component automatically selects engine
 * <Tree engine="modern" treeData={data} checkable>
 *   Tree content
 * </Tree>
 * ```
 *
 * @see {@link Tree} - Main component with engine switching
 * @module Tree/Engines
 * @category Display
 * @package @rottay/design-system
 */
export { default as classic } from './classic';
export { default as modern } from './modern';
export { default as rustic } from './rustic';
