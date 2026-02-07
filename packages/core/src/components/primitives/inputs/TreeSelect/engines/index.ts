/**
 * @fileoverview TreeSelect Engine Exports - Rottay Design System
 * @description Barrel exports for all TreeSelect engine implementations.
 *
 * @remarks
 * Available engines:
 * - **Classic**: Ant Design TreeSelect with full feature support
 * - **Modern**: DaisyUI/Tailwind CSS implementation
 * - **Rustic**: Pure vanilla HTML/CSS tree select
 *
 * All engines implement:
 * - Hierarchical tree dropdown display
 * - Single and multiple selection modes
 * - Checkable nodes with cascading
 * - Search filtering
 * - Tree lines and expand/collapse
 *
 * @example Engine Import
 * ```tsx
 * // Direct engine import (internal use)
 * import { classic, modern, rustic } from './engines';
 *
 * // Component automatically selects engine
 * <TreeSelect engine="modern" treeData={data} treeCheckable />
 * ```
 *
 * @see {@link TreeSelect} - Main component with engine switching
 * @module TreeSelect/Engines
 * @category Inputs
 * @package @rottay/design-system
 */
export { default as classic } from './classic';
export { default as modern } from './modern';
export { default as rustic } from './rustic';
