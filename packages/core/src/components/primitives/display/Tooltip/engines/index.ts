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
 * - **Titan**: Ant Design Tooltip with collision detection
 * - **Hermes**: DaisyUI tooltip classes with Tailwind utilities
 * - **Apollo**: Pure CSS with CSS variables
 *
 * **Feature Comparison:**
 * | Feature | Titan | Hermes | Apollo |
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
 * // Use Titan for advanced positioning
 * <Tooltip engine="titan" content="Smart positioning" />
 *
 * // Use Hermes for DaisyUI styling
 * <Tooltip engine="hermes" color="primary" />
 *
 * // Use Apollo for zero dependencies
 * <Tooltip engine="apollo" content="Lightweight" />
 * ```
 *
 * @see {@link TitanTooltip} for Ant Design implementation
 * @see {@link HermesTooltip} for DaisyUI implementation
 * @see {@link ApolloTooltip} for vanilla implementation
 * @module Tooltip/engines
 * @category Display
 * @package @rottay/design-system
 */

export { default as titan } from './titan';
export { default as hermes } from './hermes';
export { default as apollo } from './apollo';
