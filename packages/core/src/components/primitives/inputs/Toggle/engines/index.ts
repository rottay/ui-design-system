/**
 * @fileoverview Toggle Engine Implementations - Rottay Design System
 * @description Engine-specific toggle implementations for multi-library support.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * This module provides the barrel export for all Toggle engine implementations.
 * Each engine provides the same toggle functionality with different underlying
 * libraries and styling approaches.
 *
 * **Available Engines:**
 * - **Classic**: Ant Design Switch with enterprise features
 * - **Modern**: DaisyUI/Tailwind CSS toggle classes
 * - **Rustic**: Pure CSS with comprehensive accessibility
 *
 * **Engine Selection:**
 * The engine is selected via the `engine` prop or inherited from the
 * nearest EngineProvider context. All engines provide identical props API.
 *
 * @example Engine Override
 * ```tsx
 * // Use Modern engine for lightweight styling
 * <Toggle engine="modern" label="Enable" />
 *
 * // Use Classic engine for enterprise features
 * <Toggle engine="classic" loading label="Processing" />
 * ```
 *
 * @see {@link ClassicToggle} for Ant Design implementation
 * @see {@link ModernToggle} for DaisyUI implementation
 * @see {@link RusticToggle} for vanilla implementation
 * @module ToggleEngines
 * @category Inputs
 * @package @rottay/design-system
 */

export { default as classic } from './classic';
export { default as modern } from './modern';
export { default as rustic } from './rustic';
