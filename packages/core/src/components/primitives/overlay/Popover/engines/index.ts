/**
 * @fileoverview Popover Engine Exports - Rottay Design System
 * @description Barrel exports for all Popover engine implementations.
 *
 * @remarks
 * Available engines:
 * - **Classic**: Ant Design Popover with full theming support
 * - **Modern**: DaisyUI/Tailwind CSS implementation
 * - **Rustic**: Pure vanilla HTML/CSS with portal rendering
 *
 * @example Engine Import
 * ```tsx
 * // Direct engine import (internal use)
 * import { classic, modern, rustic } from './engines';
 *
 * // Component automatically selects engine
 * <Popover engine="modern" content="Tailwind styled">
 *   <Button>Open</Button>
 * </Popover>
 * ```
 *
 * @see {@link Popover} - Main component with engine switching
 * @module Popover/Engines
 * @category Overlay
 * @package @rottay/design-system
 */
export { default as classic } from './classic';
export { default as modern } from './modern';
export { default as rustic } from './rustic';
