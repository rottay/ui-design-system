/**
 * @fileoverview Popconfirm Engine Exports - Rottay Design System
 * @description Barrel exports for all Popconfirm engine implementations.
 *
 * @remarks
 * Available engines:
 * - **Titan**: Ant Design Popconfirm with native theming
 * - **Hermes**: DaisyUI/Tailwind CSS implementation with cards
 * - **Apollo**: Pure vanilla HTML/CSS with portal rendering
 *
 * @example Engine Import
 * ```tsx
 * // Direct engine import (internal use)
 * import { titan, hermes, apollo } from './engines';
 *
 * // Component automatically selects engine
 * <Popconfirm engine="hermes" title="Delete?" okType="danger">
 *   <Button>Delete</Button>
 * </Popconfirm>
 * ```
 *
 * @see {@link Popconfirm} - Main component with engine switching
 * @module Popconfirm/Engines
 * @category Overlay
 * @package @rottay/design-system
 */
export { default as titan } from './titan';
export { default as hermes } from './hermes';
export { default as apollo } from './apollo';
