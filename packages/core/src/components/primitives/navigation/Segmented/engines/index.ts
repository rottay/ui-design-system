/**
 * @fileoverview Segmented Engines Barrel Export - Rottay Design System
 * @description Exports all engine implementations for the Segmented component.
 * Enables dynamic loading of engines based on configuration.
 *
 * @remarks
 * This module provides named exports for all three rendering engines:
 * - **Titan**: Ant Design implementation (full-featured)
 * - **Hermes**: DaisyUI/Tailwind implementation (utility-first)
 * - **Apollo**: Vanilla HTML/CSS implementation (zero-dependency)
 *
 * The engine factory uses these exports to dynamically load the
 * appropriate implementation based on the configured or specified engine.
 *
 * @example Dynamic Import (Used by Factory)
 * ```tsx
 * // The factory uses dynamic imports for code splitting
 * const TitanSegmented = await import('./engines/titan');
 * const HermesSegmented = await import('./engines/hermes');
 * const ApolloSegmented = await import('./engines/apollo');
 * ```
 *
 * @example Direct Engine Import (Advanced)
 * ```tsx
 * // For advanced use cases requiring direct engine access
 * import { titan, hermes, apollo } from './engines';
 * ```
 *
 * @see {@link TitanSegmented} - Ant Design implementation
 * @see {@link HermesSegmented} - DaisyUI implementation
 * @see {@link ApolloSegmented} - Vanilla implementation
 * @module Segmented/Engines
 * @category Navigation
 * @package @rottay/design-system
 */

// ============================================================================
// Engine Exports
// ============================================================================

/** Ant Design implementation - full-featured with animations */
export { default as titan } from './titan';

/** DaisyUI/Tailwind implementation - utility-first styling */
export { default as hermes } from './hermes';

/** Vanilla HTML/CSS implementation - zero dependencies */
export { default as apollo } from './apollo';
