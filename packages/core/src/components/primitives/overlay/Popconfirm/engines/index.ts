/**
 * @fileoverview Popconfirm Engine Exports - Rottay Design System
 * @description Barrel exports for all Popconfirm engine implementations.
 *
 * @remarks
 * Available engines:
 * - **Classic**: Ant Design Popconfirm with native theming
 * - **Modern**: DaisyUI/Tailwind CSS implementation with cards
 * - **Rustic**: Pure vanilla HTML/CSS with portal rendering
 *
 * @example Engine Import
 * ```tsx
 * // Direct engine import (internal use)
 * import { classic, modern, rustic } from './engines';
 *
 * // Component automatically selects engine
 * <Popconfirm engine="modern" title="Delete?" okType="danger">
 *   <Button>Delete</Button>
 * </Popconfirm>
 * ```
 *
 * @see {@link Popconfirm} - Main component with engine switching
 * @module Popconfirm/Engines
 * @category Overlay
 * @package @rottay/design-system
 */
export { default as classic } from './classic';
export { default as modern } from './modern';
export { default as rustic } from './rustic';
