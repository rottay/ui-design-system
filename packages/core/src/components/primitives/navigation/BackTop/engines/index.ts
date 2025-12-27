/**
 * @fileoverview BackTop Engine Exports - Rottay Design System
 * @description Barrel export file for all BackTop engine implementations.
 * Provides unified access to Titan, Hermes, and Apollo engine variants.
 *
 * @remarks
 * This file enables the engine factory to dynamically load the appropriate
 * implementation based on the current engine context or explicit override.
 *
 * Available engines:
 * - **Titan**: Ant Design implementation with FloatButton.BackTop
 * - **Hermes**: DaisyUI/Tailwind implementation with utility classes
 * - **Apollo**: Vanilla HTML/CSS implementation with zero dependencies
 *
 * @example Dynamic Import (used by engine factory)
 * ```tsx
 * const TitanBackTop = await import('./engines/titan');
 * const HermesBackTop = await import('./engines/hermes');
 * const ApolloBackTop = await import('./engines/apollo');
 * ```
 *
 * @example Direct Import
 * ```tsx
 * import { titan, hermes, apollo } from './engines';
 *
 * // Use specific engine directly
 * const BackTopComponent = titan;
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

/** Titan engine - Ant Design implementation */
export { default as titan } from './titan';

/** Hermes engine - DaisyUI/Tailwind implementation */
export { default as hermes } from './hermes';

/** Apollo engine - Vanilla HTML/CSS implementation */
export { default as apollo } from './apollo';
