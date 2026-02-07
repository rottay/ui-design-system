/**
 * @fileoverview Cascader Engine Exports - Rottay Design System
 * @description Barrel exports for all Cascader engine implementations.
 *
 * @remarks
 * Available engines:
 * - **Classic**: Ant Design Cascader with full feature support
 * - **Modern**: DaisyUI/Tailwind CSS implementation
 * - **Rustic**: Pure vanilla HTML/CSS cascader
 *
 * All engines implement:
 * - Hierarchical multi-level dropdown panels
 * - Click and hover expand triggers
 * - Single and multiple selection modes
 * - Search filtering
 * - Custom display rendering
 *
 * @example Engine Import
 * ```tsx
 * // Direct engine import (internal use)
 * import { classic, modern, rustic } from './engines';
 *
 * // Component automatically selects engine
 * <Cascader engine="modern" options={options} expandTrigger="hover" />
 * ```
 *
 * @see {@link Cascader} - Main component with engine switching
 * @module Cascader/Engines
 * @category Inputs
 * @package @rottay/design-system
 */
export { default as classic } from './classic';
export { default as modern } from './modern';
export { default as rustic } from './rustic';
