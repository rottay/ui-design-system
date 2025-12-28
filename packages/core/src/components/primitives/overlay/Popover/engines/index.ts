/**
 * @fileoverview Popover Engine Exports - Rottay Design System
 * @description Barrel exports for all Popover engine implementations.
 *
 * @remarks
 * Available engines:
 * - **Titan**: Ant Design Popover with full theming support
 * - **Hermes**: DaisyUI/Tailwind CSS implementation
 * - **Apollo**: Pure vanilla HTML/CSS with portal rendering
 *
 * @example Engine Import
 * ```tsx
 * // Direct engine import (internal use)
 * import { titan, hermes, apollo } from './engines';
 *
 * // Component automatically selects engine
 * <Popover engine="hermes" content="Tailwind styled">
 *   <Button>Open</Button>
 * </Popover>
 * ```
 *
 * @see {@link Popover} - Main component with engine switching
 * @module Popover/Engines
 * @category Overlay
 * @package @rottay/design-system
 */
export { default as titan } from './titan';
export { default as hermes } from './hermes';
export { default as apollo } from './apollo';
