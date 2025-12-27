/**
 * @fileoverview Result Engines Barrel Export - Rottay Design System
 * @description Exports all Result engine implementations.
 * Part of the Rottay Design System's feedback primitives collection.
 *
 * @remarks
 * This module provides a centralized export for all three Result engine
 * implementations. Each engine renders the same component API but uses
 * different underlying technologies:
 *
 * - **Titan**: Ant Design - Full-featured with native Result component
 * - **Hermes**: DaisyUI/Tailwind - Utility-first CSS styling
 * - **Apollo**: Vanilla HTML/CSS - Zero external dependencies
 *
 * **Usage Note:**
 * These exports are primarily used internally by the engine factory.
 * Application code should import from the main Result module instead.
 *
 * @example Internal Engine Factory Usage
 * ```tsx
 * import { titan, hermes, apollo } from './engines';
 *
 * const engines = { titan, hermes, apollo };
 * ```
 *
 * @example Application Usage (Recommended)
 * ```tsx
 * import { Result } from '@rottay/design-system';
 *
 * // Engine is selected automatically or via prop
 * <Result engine="titan" status="success" title="Done!" />
 * ```
 *
 * @see {@link TitanResult} - Ant Design implementation
 * @see {@link HermesResult} - DaisyUI implementation
 * @see {@link ApolloResult} - Vanilla implementation
 * @module Result/Engines
 * @category Feedback
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
