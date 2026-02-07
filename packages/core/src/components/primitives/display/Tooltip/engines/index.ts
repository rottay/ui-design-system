/**
 * @fileoverview Tooltip Engine Implementations - Rottay Design System
 * @description Engine-specific tooltip implementations for multi-library support.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module provides the barrel export for all Tooltip engine implementations.
 * Each engine provides the same tooltip functionality with different styling.
 *
 * **Available Engines:**
 * - **Classic**: Ant Design Tooltip with collision detection
 * - **Modern**: DaisyUI tooltip classes with Tailwind utilities
 * - **Rustic**: Pure CSS with CSS variables
 *
 * **Feature Comparison:**
 * | Feature | Classic | Modern | Rustic |
 * |---------|-------|--------|--------|
 * | Placement (12) | ✅ | ✅ | ✅ |
 * | Triggers | ✅ | ✅ | ✅ |
 * | Delays | ✅ | ✅ | ✅ |
 * | Arrow | ✅ | ✅ | ✅ |
 * | Colors | ✅ | ✅ | ✅ |
 * | Portal | ✅ | ❌ | ❌ |
 * | Collision | ✅ | ❌ | ❌ |
 *
 * @example Engine Override
 * ```tsx
 * // Use Classic for advanced positioning
 * <Tooltip engine="classic" content="Smart positioning" />
 *
 * // Use Modern for DaisyUI styling
 * <Tooltip engine="modern" color="primary" />
 *
 * // Use Rustic for zero dependencies
 * <Tooltip engine="rustic" content="Lightweight" />
 * ```
 *
 * @see {@link ClassicTooltip} for Ant Design implementation
 * @see {@link ModernTooltip} for DaisyUI implementation
 * @see {@link RusticTooltip} for vanilla implementation
 * @module Tooltip/engines
 * @category Display
 * @package @rottay/design-system
 */

export { default as classic } from './classic';
export { default as modern } from './modern';
export { default as rustic } from './rustic';
