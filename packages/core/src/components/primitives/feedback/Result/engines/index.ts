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
 * - **Classic**: Ant Design - Full-featured with native Result component
 * - **Modern**: DaisyUI/Tailwind - Utility-first CSS styling
 * - **Rustic**: Vanilla HTML/CSS - Zero external dependencies
 *
 * **Usage Note:**
 * These exports are primarily used internally by the engine factory.
 * Application code should import from the main Result module instead.
 *
 * @example Internal Engine Factory Usage
 * ```tsx
 * import { classic, modern, rustic } from './engines';
 *
 * const engines = { classic, modern, rustic };
 * ```
 *
 * @example Application Usage (Recommended)
 * ```tsx
 * import { Result } from '@rottay/design-system';
 *
 * // Engine is selected automatically or via prop
 * <Result engine="classic" status="success" title="Done!" />
 * ```
 *
 * @see {@link ClassicResult} - Ant Design implementation
 * @see {@link ModernResult} - DaisyUI implementation
 * @see {@link RusticResult} - Vanilla implementation
 * @module Result/Engines
 * @category Feedback
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
