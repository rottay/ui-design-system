/**
 * @fileoverview Spinner Engine Implementations - Rottay Design System
 * @description Barrel export for all Spinner engine implementations.
 * Provides unified access to Classic, Modern, and Rustic engine variants.
 *
 * @remarks
 * Each engine provides a distinct implementation:
 * - **Classic**: Leverages Ant Design's Spin component for enterprise features
 * - **Modern**: Uses DaisyUI/Tailwind CSS for utility-first styling
 * - **Rustic**: Pure HTML/CSS implementation for zero-dependency scenarios
 *
 * The engine factory automatically selects the appropriate implementation
 * based on the global engine context or component-level override.
 *
 * @example Engine selection via context
 * ```tsx
 * // Global engine selection
 * <EngineProvider engine="modern">
 *   <Spinner /> {/* Uses ModernSpinner *\/}
 * </EngineProvider>
 * ```
 *
 * @example Engine selection via prop
 * ```tsx
 * // Component-level override
 * <Spinner engine="rustic" size="lg" />
 * ```
 *
 * @module Spinner/Engines
 * @category Feedback
 * @package @rottay/design-system
 */

// ============================================================================
// Engine Exports
// ============================================================================

/** Classic engine - Ant Design implementation with Spin component */
export { default as classic } from './classic';

/** Modern engine - DaisyUI/Tailwind implementation with utility classes */
export { default as modern } from './modern';

/** Rustic engine - Pure HTML/CSS implementation with keyframe animations */
export { default as rustic } from './rustic';
