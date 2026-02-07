/**
 * @fileoverview Textarea Engine Implementations - Rottay Design System
 * @description Engine-specific textarea implementations for multi-library support.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * This module provides the barrel export for all Textarea engine implementations.
 * Each engine provides multi-line text input with different underlying libraries.
 *
 * **Available Engines:**
 * - **Classic**: Ant Design TextArea with autoSize and showCount
 * - **Modern**: DaisyUI/Tailwind CSS textarea classes
 * - **Rustic**: Pure HTML textarea with custom character count
 *
 * **Feature Comparison:**
 * | Feature | Classic | Modern | Rustic |
 * |---------|-------|--------|--------|
 * | autoSize | ✅ | ❌ | ❌ |
 * | showCount | ✅ | ❌ | ✅ |
 * | allowClear | ✅ | ❌ | ❌ |
 * | onResize | ✅ | ❌ | ❌ |
 *
 * @example Engine Override
 * ```tsx
 * // Use Classic for advanced auto-sizing
 * <Textarea engine="classic" autoSize={{ minRows: 2, maxRows: 6 }} />
 *
 * // Use Modern for lightweight styling
 * <Textarea engine="modern" rows={4} />
 * ```
 *
 * @see {@link ClassicTextarea} for Ant Design implementation
 * @see {@link ModernTextarea} for DaisyUI implementation
 * @see {@link RusticTextarea} for vanilla implementation
 * @module TextareaEngines
 * @category Inputs
 * @package @rottay/design-system
 */

export { default as classic } from './classic';
export { default as modern } from './modern';
export { default as rustic } from './rustic';
