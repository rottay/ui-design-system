/**
 * @fileoverview Rate Engines Barrel Export - Rottay Design System
 * @description Aggregates all Rate engine implementations for the factory system.
 * Part of the Rottay Design System's feedback primitives collection.
 *
 * @remarks
 * This module exports all three engine implementations of the Rate component:
 * - **Classic**: Ant Design-based, full-featured implementation
 * - **Modern**: DaisyUI/Tailwind-based, utility-first implementation
 * - **Rustic**: Vanilla HTML/CSS, zero-dependency implementation
 *
 * The engine factory uses these exports to dynamically load the appropriate
 * implementation based on the configured or requested engine.
 *
 * @example Engine Factory Usage
 * ```tsx
 * // The factory automatically resolves engines
 * import { Rate } from '@rottay/design-system';
 *
 * // Uses default engine (Classic)
 * <Rate defaultValue={3} />
 *
 * // Override with specific engine
 * <Rate engine="modern" defaultValue={3} />
 * ```
 *
 * @example Direct Engine Import (Advanced)
 * ```tsx
 * // Import specific engine directly (not recommended for most cases)
 * import { classic as ClassicRate } from './engines';
 *
 * // Use directly without factory
 * <ClassicRate defaultValue={3} />
 * ```
 *
 * @see {@link ClassicRate} - Ant Design implementation
 * @see {@link ModernRate} - DaisyUI implementation
 * @see {@link RusticRate} - Vanilla implementation
 * @module Rate/Engines
 * @category Feedback
 * @package @rottay/design-system
 */

// ============================================================================
// Engine Exports
// ============================================================================

/**
 * Classic Engine - Ant Design implementation.
 * @see {@link ./classic/index.tsx}
 */
export { default as classic } from './classic';

/**
 * Modern Engine - DaisyUI/Tailwind implementation.
 * @see {@link ./modern/index.tsx}
 */
export { default as modern } from './modern';

/**
 * Rustic Engine - Vanilla HTML/CSS implementation.
 * @see {@link ./rustic/index.tsx}
 */
export { default as rustic } from './rustic';
