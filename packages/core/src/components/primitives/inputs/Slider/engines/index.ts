/**
 * @fileoverview Slider Engine Implementations - Rottay Design System
 * @description Engine-specific slider implementations for multi-library support.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * This module provides the barrel export for all Slider engine implementations.
 * Each engine provides range selection with different underlying approaches.
 *
 * **Available Engines:**
 * - **Titan**: Ant Design Slider with full tooltip/marks support
 * - **Hermes**: DaisyUI range with custom track overlay
 * - **Apollo**: Pure CSS with hidden inputs and custom visuals
 *
 * **Feature Comparison:**
 * | Feature | Titan | Hermes | Apollo |
 * |---------|-------|--------|--------|
 * | Range mode | ✅ | ✅ | ✅ |
 * | Marks | ✅ | ✅ | ✅ |
 * | Tooltip | ✅ | ❌ | ❌ |
 * | Vertical | ✅ | ✅ | ✅ |
 * | Reverse | ✅ | ❌ | ❌ |
 * | Dots | ✅ | ❌ | ❌ |
 *
 * @example Engine Override
 * ```tsx
 * // Use Titan for full features
 * <Slider engine="titan" tooltip={{ formatter: (v) => `${v}%` }} />
 *
 * // Use Hermes for Tailwind styling
 * <Slider engine="hermes" range className="w-64" />
 * ```
 *
 * @see {@link TitanSlider} for Ant Design implementation
 * @see {@link HermesSlider} for DaisyUI implementation
 * @see {@link ApolloSlider} for vanilla implementation
 * @module SliderEngines
 * @category Inputs
 * @package @rottay/design-system
 */

export { default as titan } from './titan';
export { default as hermes } from './hermes';
export { default as apollo } from './apollo';
