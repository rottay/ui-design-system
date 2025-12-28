/**
 * @fileoverview Input Engine Implementations - Rottay Design System
 * @description Engine-specific input implementations for multi-library support.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * This module provides the barrel export for all Input engine implementations.
 * Each engine renders the Input using a different underlying UI library while
 * maintaining consistent props and behavior.
 *
 * **Available Engines:**
 * - **Titan**: Ant Design implementation with rich validation states
 * - **Hermes**: DaisyUI/Tailwind CSS implementation for utility-first styling
 * - **Apollo**: Pure HTML/CSS implementation for maximum customization
 *
 * The engine is selected via the `engine` prop or inherited from the nearest
 * `EngineProvider`. If no engine is specified, Titan is used by default.
 *
 * @example Engine Selection
 * ```tsx
 * import { Input, EngineProvider } from '@rottay/design-system';
 *
 * // Per-component engine override
 * <Input engine="hermes" placeholder="DaisyUI Input" />
 *
 * // Global engine via provider
 * <EngineProvider engine="apollo">
 *   <Input placeholder="All inputs use Apollo" />
 * </EngineProvider>
 * ```
 *
 * @see {@link TitanInput} for Ant Design implementation
 * @see {@link HermesInput} for DaisyUI implementation
 * @see {@link ApolloInput} for vanilla implementation
 * @module InputEngines
 * @category Inputs
 * @package @rottay/design-system
 */

// ============================================================================
// ENGINE EXPORTS
// Each engine provides a default export of the Input component
// ============================================================================

export { default as titan } from './titan';
export { default as hermes } from './hermes';
export { default as apollo } from './apollo';
