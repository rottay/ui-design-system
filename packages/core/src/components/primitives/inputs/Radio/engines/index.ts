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
 * - **Classic**: Ant Design implementation with button style support
 * - **Modern**: DaisyUI/Tailwind CSS implementation
 * - **Rustic**: Pure HTML/CSS implementation with full a11y
 *
 * The engine is selected via the `engine` prop or inherited from the nearest
 * `EngineProvider`. If no engine is specified, Classic is used by default.
 *
 * @example Engine Selection
 * ```tsx
 * import { Radio, EngineProvider } from '@rottay/design-system';
 *
 * // Per-component engine override
 * <Radio engine="modern" name="opt" value="a" label="DaisyUI Radio" />
 *
 * // Global engine via provider
 * <EngineProvider engine="rustic">
 *   <Radio name="opt" value="b" label="Rustic Radio" />
 * </EngineProvider>
 * ```
 *
 * @see {@link ClassicRadio} for Ant Design implementation
 * @see {@link ModernRadio} for DaisyUI implementation
 * @see {@link RusticRadio} for vanilla implementation
 * @module RadioEngines
 * @category Inputs
 * @package @rottay/design-system
 */

// ============================================================================
// ENGINE EXPORTS
// ============================================================================

export { default as classic } from './classic';
export { default as modern } from './modern';
export { default as rustic } from './rustic';
