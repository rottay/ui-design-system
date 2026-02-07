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
 * - **Classic**: Ant Design Slider with full tooltip/marks support
 * - **Modern**: DaisyUI range with custom track overlay
 * - **Rustic**: Pure CSS with hidden inputs and custom visuals
 *
 * **Feature Comparison:**
 * | Feature | Classic | Modern | Rustic |
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
 * // Use Classic for full features
 * <Slider engine="classic" tooltip={{ formatter: (v) => `${v}%` }} />
 *
 * // Use Modern for Tailwind styling
 * <Slider engine="modern" range className="w-64" />
 * ```
 *
 * @see {@link ClassicSlider} for Ant Design implementation
 * @see {@link ModernSlider} for DaisyUI implementation
 * @see {@link RusticSlider} for vanilla implementation
 * @module SliderEngines
 * @category Inputs
 * @package @rottay/design-system
 */

export { default as classic } from './classic';
export { default as modern } from './modern';
export { default as rustic } from './rustic';
