/**
 * @fileoverview Watermark Engine Exports - Rottay Design System
 * @description Barrel exports for all Watermark engine implementations.
 *
 * @remarks
 * Available engines:
 * - **Titan**: Ant Design Watermark with native theming
 * - **Hermes**: Tailwind CSS with canvas pattern generation
 * - **Apollo**: Pure vanilla HTML/CSS with canvas rendering
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
 * import { titan, hermes, apollo } from './engines';
 *
 * // Component automatically selects engine
 * <Watermark engine="hermes" content="Draft">
 *   <div>Content</div>
 * </Watermark>
 * ```
 *
 * @see {@link Watermark} - Main component with engine switching
 * @module Watermark/Engines
 * @category Overlay
 * @package @rottay/design-system
 */
export { default as titan } from './titan';
export { default as hermes } from './hermes';
export { default as apollo } from './apollo';
