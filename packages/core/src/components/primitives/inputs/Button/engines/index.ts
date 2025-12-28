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
 * - **Titan**: Ant Design implementation with enterprise-grade features
 * - **Hermes**: DaisyUI/Tailwind CSS implementation for utility-first styling
 * - **Apollo**: Pure HTML/CSS implementation for maximum customization
 *
 * The engine is selected via the `engine` prop or inherited from the nearest
 * `EngineProvider`. If no engine is specified, Titan is used by default.
 *
 * @example Engine Selection
 * ```tsx
 * import { Button, EngineProvider } from '@rottay/design-system';
 *
 * // Per-component engine override
 * <Button engine="hermes">DaisyUI Button</Button>
 *
 * // Global engine via provider
 * <EngineProvider engine="apollo">
 *   <Button>All buttons use Apollo</Button>
 * </EngineProvider>
 * ```
 *
 * @see {@link TitanButton} for Ant Design implementation
 * @see {@link HermesButton} for DaisyUI implementation
 * @see {@link ApolloButton} for vanilla implementation
 * @module ButtonEngines
 * @category Inputs
 * @package @rottay/design-system
 */

// ============================================================================
// ENGINE EXPORTS
// Each engine provides a default export of the Button component
// ============================================================================

export { default as titan } from './titan';
export { default as hermes } from './hermes';
export { default as apollo } from './apollo';
