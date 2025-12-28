/**
 * @fileoverview Affix Engine Exports - Rottay Design System
 * @description Barrel export file for all Affix engine implementations.
 *
 * @remarks
 * This file provides a unified export point for all three engine
 * implementations of the Affix component:
 * - **Titan**: Ant Design-based, full-featured implementation
 * - **Hermes**: DaisyUI/Tailwind-based, utility-first implementation
 * - **Apollo**: Vanilla HTML/CSS, zero-dependency implementation
 *
 * These exports are consumed by the engine factory to dynamically
 * load the appropriate implementation based on context.
 *
 * @example Engine Factory Usage
 * ```tsx
 * import { titan, hermes, apollo } from './engines';
 *
 * const engines = { titan, hermes, apollo };
 * ```
 *
 * @see {@link TitanAffix} for Ant Design implementation
 * @see {@link HermesAffix} for DaisyUI implementation
 * @see {@link ApolloAffix} for Vanilla implementation
 *
 * @module Affix/Engines
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
