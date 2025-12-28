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
 * - **Titan**: Ant Design Switch with enterprise features
 * - **Hermes**: DaisyUI/Tailwind CSS toggle classes
 * - **Apollo**: Pure CSS with comprehensive accessibility
 *
 * **Engine Selection:**
 * The engine is selected via the `engine` prop or inherited from the
 * nearest EngineProvider context. All engines provide identical props API.
 *
 * @example Engine Override
 * ```tsx
 * // Use Hermes engine for lightweight styling
 * <Toggle engine="hermes" label="Enable" />
 *
 * // Use Titan engine for enterprise features
 * <Toggle engine="titan" loading label="Processing" />
 * ```
 *
 * @see {@link TitanToggle} for Ant Design implementation
 * @see {@link HermesToggle} for DaisyUI implementation
 * @see {@link ApolloToggle} for vanilla implementation
 * @module ToggleEngines
 * @category Inputs
 * @package @rottay/design-system
 */

export { default as titan } from './titan';
export { default as hermes } from './hermes';
export { default as apollo } from './apollo';
