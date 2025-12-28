/**
 * @fileoverview Select Engine Implementations - Rottay Design System
 * @description Engine-specific select implementations for multi-library support.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * This module provides the barrel export for all Select engine implementations.
 * Each engine renders the Select using a different underlying UI library while
 * maintaining consistent props and behavior.
 *
 * **Available Engines:**
 * - **Titan**: Ant Design implementation with advanced features
 * - **Hermes**: DaisyUI/Tailwind CSS implementation for utility-first styling
 * - **Apollo**: Pure HTML/CSS implementation with full keyboard navigation
 *
 * The engine is selected via the `engine` prop or inherited from the nearest
 * `EngineProvider`. If no engine is specified, Titan is used by default.
 *
 * @example Engine Selection
 * ```tsx
 * import { Select, EngineProvider } from '@rottay/design-system';
 *
 * // Per-component engine override
 * <Select engine="hermes" options={options} />
 *
 * // Global engine via provider
 * <EngineProvider engine="apollo">
 *   <Select options={options} />
 * </EngineProvider>
 * ```
 *
 * @see {@link TitanSelect} for Ant Design implementation
 * @see {@link HermesSelect} for DaisyUI implementation
 * @see {@link ApolloSelect} for vanilla implementation
 * @module SelectEngines
 * @category Inputs
 * @package @rottay/design-system
 */

// ============================================================================
// ENGINE EXPORTS
// Each engine provides a default export of the Select component
// ============================================================================

export { default as titan } from './titan';
export { default as hermes } from './hermes';
export { default as apollo } from './apollo';
