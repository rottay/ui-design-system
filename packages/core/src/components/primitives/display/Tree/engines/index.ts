/**
 * @fileoverview Tree Engine Exports - Rottay Design System
 * @description Barrel exports for all Tree engine implementations.
 *
 * @remarks
 * Available engines:
 * - **Titan**: Ant Design Tree with full feature support
 * - **Hermes**: DaisyUI/Tailwind CSS implementation
 * - **Apollo**: Pure vanilla HTML/CSS with recursive rendering
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
 * import { titan, hermes, apollo } from './engines';
 *
 * // Component automatically selects engine
 * <Tree engine="hermes" treeData={data} checkable>
 *   Tree content
 * </Tree>
 * ```
 *
 * @see {@link Tree} - Main component with engine switching
 * @module Tree/Engines
 * @category Display
 * @package @rottay/design-system
 */
export { default as titan } from './titan';
export { default as hermes } from './hermes';
export { default as apollo } from './apollo';
