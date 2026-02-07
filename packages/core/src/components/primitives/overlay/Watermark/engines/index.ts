/**
 * @fileoverview Watermark Engine Exports - Rottay Design System
 * @description Barrel exports for all Watermark engine implementations.
 *
 * @remarks
 * Available engines:
 * - **Classic**: Ant Design Watermark with native theming
 * - **Modern**: Tailwind CSS with canvas pattern generation
 * - **Rustic**: Pure vanilla HTML/CSS with canvas rendering
 *
 * All engines implement:
 * - Canvas-based watermark pattern generation
 * - Device pixel ratio support for retina displays
 * - Text and image watermark support
 * - Configurable rotation, gap, and offset
 *
 * @example Engine Import
 * ```tsx
 * // Direct engine import (internal use)
 * import { classic, modern, rustic } from './engines';
 *
 * // Component automatically selects engine
 * <Watermark engine="modern" content="Draft">
 *   <div>Content</div>
 * </Watermark>
 * ```
 *
 * @see {@link Watermark} - Main component with engine switching
 * @module Watermark/Engines
 * @category Overlay
 * @package @rottay/design-system
 */
export { default as classic } from './classic';
export { default as modern } from './modern';
export { default as rustic } from './rustic';
