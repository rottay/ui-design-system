/**
 * @fileoverview TreeSelect Engine Exports - Rottay Design System
 * @description Barrel exports for all TreeSelect engine implementations.
 *
 * @remarks
 * Available engines:
 * - **Titan**: Ant Design TreeSelect with full feature support
 * - **Hermes**: DaisyUI/Tailwind CSS implementation
 * - **Apollo**: Pure vanilla HTML/CSS tree select
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
 * import { titan, hermes, apollo } from './engines';
 *
 * // Component automatically selects engine
 * <TreeSelect engine="hermes" treeData={data} treeCheckable />
 * ```
 *
 * @see {@link TreeSelect} - Main component with engine switching
 * @module TreeSelect/Engines
 * @category Inputs
 * @package @rottay/design-system
 */
export { default as titan } from './titan';
export { default as hermes } from './hermes';
export { default as apollo } from './apollo';
