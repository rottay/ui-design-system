/**
 * @fileoverview Carousel Engine Implementations - Rottay Design System
 * @description Engine-specific carousel implementations for multi-library support.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module provides the barrel export for all Carousel engine implementations.
 * Each engine renders consistent carousels with different underlying technologies.
 *
 * **Available Engines:**
 * - **Classic**: Ant Design Carousel with slick.js
 * - **Modern**: DaisyUI carousel with Tailwind utilities
 * - **Rustic**: Pure CSS carousel with inline styles
 *
 * **Feature Comparison:**
 * | Feature | Classic | Modern | Rustic |
 * |---------|-------|--------|--------|
 * | Autoplay | ✅ | ✅ | ✅ |
 * | Dots | ✅ | ✅ | ✅ |
 * | Arrows | ✅ | ✅ | ✅ |
 * | Fade effect | ✅ | ✅ | ✅ |
 * | Vertical mode | ✅ | ✅ | ✅ |
 * | Infinite loop | ✅ | ✅ | ✅ |
 * | Touch/swipe | ✅ | ✅ | ⚠️ |
 * | Custom arrows | ✅ | ❌ | ❌ |
 * | Zero deps | ❌ | ❌ | ✅ |
 *
 * @example Engine Override
 * ```tsx
 * // Use Classic for slick.js features
 * <Carousel engine="classic" autoplay dots />
 *
 * // Use Modern for DaisyUI styling
 * <Carousel engine="modern" arrows />
 *
 * // Use Rustic for zero dependencies
 * <Carousel engine="rustic" dots />
 * ```
 *
 * @module Carousel/engines
 * @category Display
 * @package @rottay/design-system
 */

export { default as classic } from './classic';
export { default as modern } from './modern';
export { default as rustic } from './rustic';
