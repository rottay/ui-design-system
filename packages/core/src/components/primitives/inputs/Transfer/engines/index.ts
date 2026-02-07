/**
 * @fileoverview Transfer Engine Exports - Rottay Design System
 * @description Barrel exports for all Transfer engine implementations.
 *
 * @remarks
 * Available engines:
 * - **Classic**: Ant Design Transfer with full feature support
 * - **Modern**: DaisyUI/Tailwind CSS implementation
 * - **Rustic**: Pure vanilla HTML/CSS transfer
 *
 * All engines implement:
 * - Dual-list with move operations
 * - Search filtering in each list
 * - One-way transfer mode
 * - Select all functionality
 * - Custom item rendering
 *
 * @example Engine Import
 * ```tsx
 * // Direct engine import (internal use)
 * import { classic, modern, rustic } from './engines';
 *
 * // Component automatically selects engine
 * <Transfer engine="modern" dataSource={items} showSearch />
 * ```
 *
 * @see {@link Transfer} - Main component with engine switching
 * @module Transfer/Engines
 * @category Inputs
 * @package @rottay/design-system
 */
export { default as classic } from './classic';
export { default as modern } from './modern';
export { default as rustic } from './rustic';
