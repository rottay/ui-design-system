/**
 * @fileoverview Spinner Engine Implementations - Rottay Design System
 * @description Barrel export for all Spinner engine implementations.
 * Provides unified access to Titan, Hermes, and Apollo engine variants.
 *
 * @remarks
 * Each engine provides a distinct implementation:
 * - **Titan**: Leverages Ant Design's Spin component for enterprise features
 * - **Hermes**: Uses DaisyUI/Tailwind CSS for utility-first styling
 * - **Apollo**: Pure HTML/CSS implementation for zero-dependency scenarios
 *
 * The engine factory automatically selects the appropriate implementation
 * based on the global engine context or component-level override.
 *
 * @example Engine selection via context
 * ```tsx
 * // Global engine selection
 * <EngineProvider engine="hermes">
 *   <Spinner /> {/* Uses HermesSpinner *\/}
 * </EngineProvider>
 * ```
 *
 * @example Engine selection via prop
 * ```tsx
 * // Component-level override
 * <Spinner engine="apollo" size="lg" />
 * ```
 *
 * @module Spinner/Engines
 * @category Feedback
 * @package @rottay/design-system
 */

// ============================================================================
// Engine Exports
// ============================================================================

/** Titan engine - Ant Design implementation with Spin component */
export { default as titan } from './titan';

/** Hermes engine - DaisyUI/Tailwind implementation with utility classes */
export { default as hermes } from './hermes';

/** Apollo engine - Pure HTML/CSS implementation with keyframe animations */
export { default as apollo } from './apollo';
