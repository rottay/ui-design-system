/**
 * @fileoverview Segmented Engines Barrel Export - Rottay Design System
 * @description Exports all engine implementations for the Segmented component.
 * Enables dynamic loading of engines based on configuration.
 *
 * @remarks
 * This module provides named exports for all three rendering engines:
 * - **Classic**: Ant Design implementation (full-featured)
 * - **Modern**: DaisyUI/Tailwind implementation (utility-first)
 * - **Rustic**: Vanilla HTML/CSS implementation (zero-dependency)
 *
 * The engine factory uses these exports to dynamically load the
 * appropriate implementation based on the configured or specified engine.
 *
 * @example Dynamic Import (Used by Factory)
 * ```tsx
 * // The factory uses dynamic imports for code splitting
 * const ClassicSegmented = await import('./engines/classic');
 * const ModernSegmented = await import('./engines/modern');
 * const RusticSegmented = await import('./engines/rustic');
 * ```
 *
 * @example Direct Engine Import (Advanced)
 * ```tsx
 * // For advanced use cases requiring direct engine access
 * import { classic, modern, rustic } from './engines';
 * ```
 *
 * @see {@link ClassicSegmented} - Ant Design implementation
 * @see {@link ModernSegmented} - DaisyUI implementation
 * @see {@link RusticSegmented} - Vanilla implementation
 * @module Segmented/Engines
 * @category Navigation
 * @package @rottay/design-system
 */

// ============================================================================
// Engine Exports
// ============================================================================

/** Ant Design implementation - full-featured with animations */
export { default as classic } from './classic';

/** DaisyUI/Tailwind implementation - utility-first styling */
export { default as modern } from './modern';

/** Vanilla HTML/CSS implementation - zero dependencies */
export { default as rustic } from './rustic';
