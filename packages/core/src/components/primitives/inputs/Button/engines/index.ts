/**
 * @fileoverview Button Engine Implementations - Rottay Design System
 * @description Engine-specific button implementations for multi-library support.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * This module provides the barrel export for all Button engine implementations.
 * Each engine renders the Button using a different underlying UI library while
 * maintaining consistent props and behavior.
 *
 * **Available Engines:**
 * - **Classic**: Ant Design implementation with enterprise-grade features
 * - **Modern**: DaisyUI/Tailwind CSS implementation for utility-first styling
 * - **Rustic**: Pure HTML/CSS implementation for maximum customization
 *
 * The engine is selected via the `engine` prop or inherited from the nearest
 * `EngineProvider`. If no engine is specified, Classic is used by default.
 *
 * @example Engine Selection
 * ```tsx
 * import { Button, EngineProvider } from '@rottay/design-system';
 *
 * // Per-component engine override
 * <Button engine="modern">DaisyUI Button</Button>
 *
 * // Global engine via provider
 * <EngineProvider engine="rustic">
 *   <Button>All buttons use Rustic</Button>
 * </EngineProvider>
 * ```
 *
 * @see {@link ClassicButton} for Ant Design implementation
 * @see {@link ModernButton} for DaisyUI implementation
 * @see {@link RusticButton} for vanilla implementation
 * @module ButtonEngines
 * @category Inputs
 * @package @rottay/design-system
 */

// ============================================================================
// ENGINE EXPORTS
// Each engine provides a default export of the Button component
// ============================================================================

export { default as classic } from './classic';
export { default as modern } from './modern';
export { default as rustic } from './rustic';
