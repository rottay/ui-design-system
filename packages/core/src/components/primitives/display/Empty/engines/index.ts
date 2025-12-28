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
 * - **Titan**: Ant Design Empty with built-in image presets
 * - **Hermes**: DaisyUI empty with theme-aware colors
 * - **Apollo**: Pure CSS empty with inline styles
 *
 * **Feature Comparison:**
 * | Feature | Titan | Hermes | Apollo |
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
 * // Use Titan for Ant Design ecosystem
 * <Empty engine="titan" />
 *
 * // Use Hermes for DaisyUI theming
 * <Empty engine="hermes" />
 *
 * // Use Apollo for zero dependencies
 * <Empty engine="apollo" />
 * ```
 *
 * @module Empty/engines
 * @category Display
 * @package @rottay/design-system
 */

export { default as titan } from './titan';
export { default as hermes } from './hermes';
export { default as apollo } from './apollo';
