/**
 * @fileoverview Radio Engine Implementations - Rottay Design System
 * @description Engine-specific radio implementations for multi-library support.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * This module provides the barrel export for all Radio engine implementations.
 * Each engine renders the Radio using a different underlying UI library while
 * maintaining consistent props and behavior.
 *
 * **Available Engines:**
 * - **Titan**: Ant Design implementation with button style support
 * - **Hermes**: DaisyUI/Tailwind CSS implementation
 * - **Apollo**: Pure HTML/CSS implementation with full a11y
 *
 * The engine is selected via the `engine` prop or inherited from the nearest
 * `EngineProvider`. If no engine is specified, Titan is used by default.
 *
 * @example Engine Selection
 * ```tsx
 * import { Radio, EngineProvider } from '@rottay/design-system';
 *
 * // Per-component engine override
 * <Radio engine="hermes" name="opt" value="a" label="DaisyUI Radio" />
 *
 * // Global engine via provider
 * <EngineProvider engine="apollo">
 *   <Radio name="opt" value="b" label="Apollo Radio" />
 * </EngineProvider>
 * ```
 *
 * @see {@link TitanRadio} for Ant Design implementation
 * @see {@link HermesRadio} for DaisyUI implementation
 * @see {@link ApolloRadio} for vanilla implementation
 * @module RadioEngines
 * @category Inputs
 * @package @rottay/design-system
 */

// ============================================================================
// ENGINE EXPORTS
// ============================================================================

export { default as titan } from './titan';
export { default as hermes } from './hermes';
export { default as apollo } from './apollo';
