/**
 * @fileoverview Rate Engines Barrel Export - Rottay Design System
 * @description Aggregates all Rate engine implementations for the factory system.
 * Part of the Rottay Design System's feedback primitives collection.
 *
 * @remarks
 * This module exports all three engine implementations of the Rate component:
 * - **Titan**: Ant Design-based, full-featured implementation
 * - **Hermes**: DaisyUI/Tailwind-based, utility-first implementation
 * - **Apollo**: Vanilla HTML/CSS, zero-dependency implementation
 *
 * The engine factory uses these exports to dynamically load the appropriate
 * implementation based on the configured or requested engine.
 *
 * @example Engine Factory Usage
 * ```tsx
 * // The factory automatically resolves engines
 * import { Rate } from '@rottay/design-system';
 *
 * // Uses default engine (Titan)
 * <Rate defaultValue={3} />
 *
 * // Override with specific engine
 * <Rate engine="hermes" defaultValue={3} />
 * ```
 *
 * @example Direct Engine Import (Advanced)
 * ```tsx
 * // Import specific engine directly (not recommended for most cases)
 * import { titan as TitanRate } from './engines';
 *
 * // Use directly without factory
 * <TitanRate defaultValue={3} />
 * ```
 *
 * @see {@link TitanRate} - Ant Design implementation
 * @see {@link HermesRate} - DaisyUI implementation
 * @see {@link ApolloRate} - Vanilla implementation
 * @module Rate/Engines
 * @category Feedback
 * @package @rottay/design-system
 */

// ============================================================================
// Engine Exports
// ============================================================================

/**
 * Titan Engine - Ant Design implementation.
 * @see {@link ./titan/index.tsx}
 */
export { default as titan } from './titan';

/**
 * Hermes Engine - DaisyUI/Tailwind implementation.
 * @see {@link ./hermes/index.tsx}
 */
export { default as hermes } from './hermes';

/**
 * Apollo Engine - Vanilla HTML/CSS implementation.
 * @see {@link ./apollo/index.tsx}
 */
export { default as apollo } from './apollo';
