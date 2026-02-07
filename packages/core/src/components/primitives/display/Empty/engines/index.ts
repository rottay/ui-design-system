/**
 * @fileoverview Empty Engine Implementations - Rottay Design System
 * @description Engine-specific empty state implementations for multi-library support.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module provides the barrel export for all Empty engine implementations.
 * Each engine renders consistent empty states with different underlying technologies.
 *
 * **Available Engines:**
 * - **Classic**: Ant Design Empty with built-in image presets
 * - **Modern**: DaisyUI empty with theme-aware colors
 * - **Rustic**: Pure CSS empty with inline styles
 *
 * **Feature Comparison:**
 * | Feature | Classic | Modern | Rustic |
 * |---------|-------|--------|--------|
 * | Default image | ✅ | ✅ | ✅ |
 * | Simple image | ✅ | ✅ | ✅ |
 * | Custom image | ✅ | ✅ | ✅ |
 * | Description | ✅ | ✅ | ✅ |
 * | Action slot | ✅ | ✅ | ✅ |
 * | Theme colors | ✅ | ✅ | ⚠️ |
 * | RTL support | ✅ | ✅ | ⚠️ |
 * | Zero deps | ❌ | ❌ | ✅ |
 *
 * @example Engine Override
 * ```tsx
 * // Use Classic for Ant Design ecosystem
 * <Empty engine="classic" />
 *
 * // Use Modern for DaisyUI theming
 * <Empty engine="modern" />
 *
 * // Use Rustic for zero dependencies
 * <Empty engine="rustic" />
 * ```
 *
 * @module Empty/engines
 * @category Display
 * @package @rottay/design-system
 */

export { default as classic } from './classic';
export { default as modern } from './modern';
export { default as rustic } from './rustic';
