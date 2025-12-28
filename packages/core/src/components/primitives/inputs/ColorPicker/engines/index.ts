/**
 * @fileoverview ColorPicker Engine Exports - Rottay Design System
 * @description Barrel exports for all ColorPicker engine implementations.
 *
 * @remarks
 * Available engines:
 * - **Titan**: Ant Design ColorPicker with full feature support
 * - **Hermes**: DaisyUI/Tailwind CSS implementation
 * - **Apollo**: Pure vanilla HTML/CSS color picker
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
 * import { titan, hermes, apollo } from './engines';
 *
 * // Component automatically selects engine
 * <ColorPicker engine="hermes" defaultValue="#1677ff" showText />
 * ```
 *
 * @see {@link ColorPicker} - Main component with engine switching
 * @module ColorPicker/Engines
 * @category Inputs
 * @package @rottay/design-system
 */
export { default as titan } from './titan';
export { default as hermes } from './hermes';
export { default as apollo } from './apollo';
