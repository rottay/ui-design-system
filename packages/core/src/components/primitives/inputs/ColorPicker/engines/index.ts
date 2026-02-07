/**
 * @fileoverview ColorPicker Engine Exports - Rottay Design System
 * @description Barrel exports for all ColorPicker engine implementations.
 *
 * @remarks
 * Available engines:
 * - **Classic**: Ant Design ColorPicker with full feature support
 * - **Modern**: DaisyUI/Tailwind CSS implementation
 * - **Rustic**: Pure vanilla HTML/CSS color picker
 *
 * All engines implement:
 * - Color selection panel with gradient picker
 * - Multiple format support (HEX, RGB, HSB)
 * - Preset color palettes
 * - Alpha/transparency control
 * - Text display option
 *
 * @example Engine Import
 * ```tsx
 * // Direct engine import (internal use)
 * import { classic, modern, rustic } from './engines';
 *
 * // Component automatically selects engine
 * <ColorPicker engine="modern" defaultValue="#1677ff" showText />
 * ```
 *
 * @see {@link ColorPicker} - Main component with engine switching
 * @module ColorPicker/Engines
 * @category Inputs
 * @package @rottay/design-system
 */
export { default as classic } from './classic';
export { default as modern } from './modern';
export { default as rustic } from './rustic';
