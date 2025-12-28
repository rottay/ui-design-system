/**
 * @fileoverview Checkbox Engine Implementations - Rottay Design System
 * @description Engine-specific checkbox implementations for multi-library support.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * This module provides the barrel export for all Checkbox engine implementations.
 * Each engine renders the Checkbox using a different underlying UI library while
 * maintaining consistent props and behavior.
 *
 * **Available Engines:**
 * - **Titan**: Ant Design implementation with native styling
 * - **Hermes**: DaisyUI/Tailwind CSS implementation
 * - **Apollo**: Pure HTML/CSS implementation with full a11y
 *
 * The engine is selected via the `engine` prop or inherited from the nearest
 * `EngineProvider`. If no engine is specified, Titan is used by default.
 *
 * @example Engine Selection
 * ```tsx
 * import { Checkbox, EngineProvider } from '@rottay/design-system';
 *
 * // Per-component engine override
 * <Checkbox engine="hermes" label="DaisyUI Checkbox" />
 *
 * // Global engine via provider
 * <EngineProvider engine="apollo">
 *   <Checkbox label="All checkboxes use Apollo" />
 * </EngineProvider>
 * ```
 *
 * @see {@link TitanCheckbox} for Ant Design implementation
 * @see {@link HermesCheckbox} for DaisyUI implementation
 * @see {@link ApolloCheckbox} for vanilla implementation
 * @module CheckboxEngines
 * @category Inputs
 * @package @rottay/design-system
 */

// ============================================================================
// ENGINE EXPORTS
// ============================================================================

export { default as titan } from './titan';
export { default as hermes } from './hermes';
export { default as apollo } from './apollo';
