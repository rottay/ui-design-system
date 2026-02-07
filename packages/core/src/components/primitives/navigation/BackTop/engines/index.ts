'use client';

/**
 * @fileoverview BackTop Engine Exports - Rottay Design System
 * @description Barrel export file for all BackTop engine implementations.
 * Provides unified access to Classic, Modern, and Rustic engine variants.
 *
 * @remarks
 * This file enables the engine factory to dynamically load the appropriate
 * implementation based on the current engine context or explicit override.
 *
 * Available engines:
 * - **Classic**: Ant Design implementation with FloatButton.BackTop
 * - **Modern**: DaisyUI/Tailwind implementation with utility classes
 * - **Rustic**: Vanilla HTML/CSS implementation with zero dependencies
 *
 * @example Dynamic Import (used by engine factory)
 * ```tsx
 * const ClassicBackTop = await import('./engines/classic');
 * const ModernBackTop = await import('./engines/modern');
 * const RusticBackTop = await import('./engines/rustic');
 * ```
 *
 * @example Direct Import
 * ```tsx
 * import { classic, modern, rustic } from './engines';
 *
 * // Use specific engine directly
 * const BackTopComponent = classic;
 * ```
 *
 * @see {@link BackTop} for the main component
 * @see {@link createEngineComponent} for the engine factory
 *
 * @module BackTop/Engines
 * @category Navigation
 * @package @rottay/design-system
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
