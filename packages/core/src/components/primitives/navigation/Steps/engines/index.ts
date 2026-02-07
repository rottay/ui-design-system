/**
 * @fileoverview Steps Engine Exports - Rottay Design System
 * @description Barrel export file for all Steps engine implementations.
 * Provides access to Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla)
 * engine-specific implementations.
 *
 * @remarks
 * This file enables the multi-engine architecture by providing a consistent
 * export interface for the engine factory. Each engine is lazily loaded
 * to optimize bundle size.
 *
 * @example Direct Engine Import (Advanced)
 * ```tsx
 * // Direct imports are typically not needed - use the main Steps component
 * import { classic, modern, rustic } from './engines';
 *
 * // The main component handles engine selection automatically
 * import { Steps } from '@rottay/design-system';
 * ```
 *
 * @see {@link classic} for Ant Design implementation
 * @see {@link modern} for DaisyUI/Tailwind implementation
 * @see {@link rustic} for Vanilla HTML/CSS implementation
 *
 * @module Steps/Engines
 * @category Navigation
 * @package @rottay/design-system
 * @internal
 */

// ============================================================================
// Engine Exports
// ============================================================================

/** Classic engine - Ant Design implementation */
export { default as classic } from './classic';

/** Modern engine - DaisyUI/Tailwind implementation */
export { default as modern } from './modern';

/** Rustic engine - Vanilla HTML/CSS implementation */
export { default as rustic } from './rustic';
