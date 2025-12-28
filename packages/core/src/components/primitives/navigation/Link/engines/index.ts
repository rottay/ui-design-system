/**
 * @fileoverview Link Engine Implementations - Rottay Design System
 * @description Barrel export for all Link engine implementations.
 * Provides unified access to Titan, Hermes, and Apollo engine components.
 *
 * @remarks
 * This module aggregates all engine-specific implementations of the Link
 * component, enabling the engine factory to dynamically load the appropriate
 * implementation based on the current engine context.
 *
 * Engine implementations:
 * - **Titan**: Ant Design Typography.Link - full-featured with Ant styling
 * - **Hermes**: DaisyUI link classes - utility-first Tailwind approach
 * - **Apollo**: Pure HTML/CSS - zero dependencies, inline styles
 *
 * @example Dynamic Import (used by engine factory)
 * ```tsx
 * // The engine factory uses dynamic imports for code splitting
 * const engineModules = {
 *   titan: () => import('./engines/titan'),
 *   hermes: () => import('./engines/hermes'),
 *   apollo: () => import('./engines/apollo'),
 * };
 * ```
 *
 * @example Direct Import (for testing or specialized use)
 * ```tsx
 * import { titan, hermes, apollo } from './engines';
 *
 * // Use a specific engine directly
 * const TitanLink = titan.default;
 * ```
 *
 * @module Link/engines
 * @category Navigation
 * @package @rottay/design-system
 */

// ============================================================================
// Engine Exports
// ============================================================================

/**
 * Titan engine implementation (Ant Design)
 * @see {@link TitanLink}
 */
export { default as titan } from './titan';

/**
 * Hermes engine implementation (DaisyUI/Tailwind)
 * @see {@link HermesLink}
 */
export { default as hermes } from './hermes';

/**
 * Apollo engine implementation (Vanilla HTML/CSS)
 * @see {@link ApolloLink}
 */
export { default as apollo } from './apollo';
