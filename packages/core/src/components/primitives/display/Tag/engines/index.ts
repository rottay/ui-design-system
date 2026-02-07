/**
 * @fileoverview Tag Engine Implementations - Rottay Design System
 * @description Engine-specific tag implementations for multi-library support.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module provides the barrel export for all Tag engine implementations.
 * Each engine provides the same tag functionality with different styling.
 *
 * **Available Engines:**
 * - **Classic**: Ant Design Tag with preset colors
 * - **Modern**: DaisyUI badge classes
 * - **Rustic**: Pure CSS with inline styles
 *
 * **Feature Comparison:**
 * | Feature | Classic | Modern | Rustic |
 * |---------|-------|--------|--------|
 * | Closable | ✅ | ✅ | ✅ |
 * | Icons | ✅ | ✅ | ✅ |
 * | Outlined | ✅ | ✅ | ✅ |
 * | Clickable | ✅ | ✅ | ✅ |
 * | Color presets | ✅ | ✅ | ✅ |
 *
 * @example Engine Override
 * ```tsx
 * // Use Modern for DaisyUI styling
 * <Tag engine="modern" variant="primary" />
 *
 * // Use Rustic for zero dependencies
 * <Tag engine="rustic" closable onClose={fn} />
 * ```
 *
 * @see {@link ClassicTag} for Ant Design implementation
 * @see {@link ModernTag} for DaisyUI implementation
 * @see {@link RusticTag} for vanilla implementation
 * @module TagEngines
 * @category Display
 * @package @rottay/design-system
 */

export { default as classic } from './classic';
export { default as modern } from './modern';
export { default as rustic } from './rustic';
