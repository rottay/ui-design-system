/**
 * @fileoverview Transfer Engine Exports - Rottay Design System
 * @description Barrel exports for all Transfer engine implementations.
 *
 * @remarks
 * Available engines:
 * - **Titan**: Ant Design Transfer with full feature support
 * - **Hermes**: DaisyUI/Tailwind CSS implementation
 * - **Apollo**: Pure vanilla HTML/CSS transfer
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
 * import { titan, hermes, apollo } from './engines';
 *
 * // Component automatically selects engine
 * <Transfer engine="hermes" dataSource={items} showSearch />
 * ```
 *
 * @see {@link Transfer} - Main component with engine switching
 * @module Transfer/Engines
 * @category Inputs
 * @package @rottay/design-system
 */
export { default as titan } from './titan';
export { default as hermes } from './hermes';
export { default as apollo } from './apollo';
