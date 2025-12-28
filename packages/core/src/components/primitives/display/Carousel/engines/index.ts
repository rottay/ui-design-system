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
 * - **Titan**: Ant Design Carousel with slick.js
 * - **Hermes**: DaisyUI carousel with Tailwind utilities
 * - **Apollo**: Pure CSS carousel with inline styles
 *
 * **Feature Comparison:**
 * | Feature | Titan | Hermes | Apollo |
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
 * // Use Titan for slick.js features
 * <Carousel engine="titan" autoplay dots />
 *
 * // Use Hermes for DaisyUI styling
 * <Carousel engine="hermes" arrows />
 *
 * // Use Apollo for zero dependencies
 * <Carousel engine="apollo" dots />
 * ```
 *
 * @module Carousel/engines
 * @category Display
 * @package @rottay/design-system
 */

export { default as titan } from './titan';
export { default as hermes } from './hermes';
export { default as apollo } from './apollo';
