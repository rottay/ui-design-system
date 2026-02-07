/**
 * @fileoverview Link Engine Implementations - Rottay Design System
 * @description Barrel export for all Link engine implementations.
 * Provides unified access to Classic, Modern, and Rustic engine components.
 *
 * @remarks
 * This module aggregates all engine-specific implementations of the Link
 * component, enabling the engine factory to dynamically load the appropriate
 * implementation based on the current engine context.
 *
 * Engine implementations:
 * - **Classic**: Ant Design Typography.Link - full-featured with Ant styling
 * - **Modern**: DaisyUI link classes - utility-first Tailwind approach
 * - **Rustic**: Pure HTML/CSS - zero dependencies, inline styles
 *
 * @example Dynamic Import (used by engine factory)
 * ```tsx
 * // The engine factory uses dynamic imports for code splitting
 * const engineModules = {
 *   classic: () => import('./engines/classic'),
 *   modern: () => import('./engines/modern'),
 *   rustic: () => import('./engines/rustic'),
 * };
 * ```
 *
 * @example Direct Import (for testing or specialized use)
 * ```tsx
 * import { classic, modern, rustic } from './engines';
 *
 * // Use a specific engine directly
 * const ClassicLink = classic.default;
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
 * Classic engine implementation (Ant Design)
 * @see {@link ClassicLink}
 */
export { default as classic } from './classic';

/**
 * Modern engine implementation (DaisyUI/Tailwind)
 * @see {@link ModernLink}
 */
export { default as modern } from './modern';

/**
 * Rustic engine implementation (Vanilla HTML/CSS)
 * @see {@link RusticLink}
 */
export { default as rustic } from './rustic';
