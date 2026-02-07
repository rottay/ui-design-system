/**
 * @fileoverview Stepper Engine Implementations - Rottay Design System
 * @description Exports all engine-specific implementations of the Stepper component.
 * Each engine provides the same API but with different underlying rendering.
 *
 * @remarks
 * The Rottay Design System supports three rendering engines:
 * - **Classic**: Built on Ant Design's Steps component, full-featured with animations
 * - **Modern**: Built on DaisyUI/Tailwind, utility-first and lightweight
 * - **Rustic**: Pure HTML/CSS with maximum accessibility and keyboard navigation
 *
 * The engine is selected automatically based on the EngineProvider context,
 * or can be overridden per-component using the `engine` prop.
 *
 * @example Engine Selection via Provider
 * ```tsx
 * import { EngineProvider, Stepper } from '@rottay/design-system';
 *
 * // All components use DaisyUI styling
 * <EngineProvider engine="modern">
 *   <Stepper items={steps} current={current} />
 * </EngineProvider>
 * ```
 *
 * @example Per-Component Engine Override
 * ```tsx
 * // This stepper uses Ant Design regardless of provider
 * <Stepper engine="classic" items={steps} current={current} />
 * ```
 *
 * @see {@link ClassicStepper} for Ant Design implementation
 * @see {@link ModernStepper} for DaisyUI implementation
 * @see {@link RusticStepper} for vanilla implementation
 *
 * @module Stepper/Engines
 * @category Navigation
 * @package @rottay/design-system
 */

// ============================================================================
// Engine Exports
// ============================================================================

/**
 * Classic engine implementation (Ant Design).
 * Full-featured stepper with rich animations and Ant Design styling.
 */
export { default as classic } from './classic';

/**
 * Modern engine implementation (DaisyUI/Tailwind).
 * Lightweight stepper with utility-first CSS styling.
 */
export { default as modern } from './modern';

/**
 * Rustic engine implementation (Pure HTML/CSS).
 * Zero-dependency stepper with full keyboard navigation and accessibility.
 */
export { default as rustic } from './rustic';
