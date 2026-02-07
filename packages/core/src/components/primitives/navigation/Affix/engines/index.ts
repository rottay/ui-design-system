/**
 * @fileoverview Affix Engine Exports - Rottay Design System
 * @description Barrel export file for all Affix engine implementations.
 *
 * @remarks
 * This file provides a unified export point for all three engine
 * implementations of the Affix component:
 * - **Classic**: Ant Design-based, full-featured implementation
 * - **Modern**: DaisyUI/Tailwind-based, utility-first implementation
 * - **Rustic**: Vanilla HTML/CSS, zero-dependency implementation
 *
 * These exports are consumed by the engine factory to dynamically
 * load the appropriate implementation based on context.
 *
 * @example Engine Factory Usage
 * ```tsx
 * import { classic, modern, rustic } from './engines';
 *
 * const engines = { classic, modern, rustic };
 * ```
 *
 * @see {@link ClassicAffix} for Ant Design implementation
 * @see {@link ModernAffix} for DaisyUI implementation
 * @see {@link RusticAffix} for Vanilla implementation
 *
 * @module Affix/Engines
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
