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
 * - **Classic**: Ant Design implementation with native styling
 * - **Modern**: DaisyUI/Tailwind CSS implementation
 * - **Rustic**: Pure HTML/CSS implementation with full a11y
 *
 * The engine is selected via the `engine` prop or inherited from the nearest
 * `EngineProvider`. If no engine is specified, Classic is used by default.
 *
 * @example Engine Selection
 * ```tsx
 * import { Checkbox, EngineProvider } from '@rottay/design-system';
 *
 * // Per-component engine override
 * <Checkbox engine="modern" label="DaisyUI Checkbox" />
 *
 * // Global engine via provider
 * <EngineProvider engine="rustic">
 *   <Checkbox label="All checkboxes use Rustic" />
 * </EngineProvider>
 * ```
 *
 * @see {@link ClassicCheckbox} for Ant Design implementation
 * @see {@link ModernCheckbox} for DaisyUI implementation
 * @see {@link RusticCheckbox} for vanilla implementation
 * @module CheckboxEngines
 * @category Inputs
 * @package @rottay/design-system
 */

// ============================================================================
// ENGINE EXPORTS
// ============================================================================

export { default as classic } from './classic';
export { default as modern } from './modern';
export { default as rustic } from './rustic';
