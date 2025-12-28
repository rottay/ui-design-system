/**
 * @fileoverview Cascader Engine Exports - Rottay Design System
 * @description Barrel exports for all Cascader engine implementations.
 *
 * @remarks
 * Available engines:
 * - **Titan**: Ant Design Cascader with full feature support
 * - **Hermes**: DaisyUI/Tailwind CSS implementation
 * - **Apollo**: Pure vanilla HTML/CSS cascader
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
 * import { titan, hermes, apollo } from './engines';
 *
 * // Component automatically selects engine
 * <Cascader engine="hermes" options={options} expandTrigger="hover" />
 * ```
 *
 * @see {@link Cascader} - Main component with engine switching
 * @module Cascader/Engines
 * @category Inputs
 * @package @rottay/design-system
 */
export { default as titan } from './titan';
export { default as hermes } from './hermes';
export { default as apollo } from './apollo';
