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
 * - **Titan**: Ant Design TextArea with autoSize and showCount
 * - **Hermes**: DaisyUI/Tailwind CSS textarea classes
 * - **Apollo**: Pure HTML textarea with custom character count
 *
 * **Feature Comparison:**
 * | Feature | Titan | Hermes | Apollo |
 * |---------|-------|--------|--------|
 * | autoSize | ✅ | ❌ | ❌ |
 * | showCount | ✅ | ❌ | ✅ |
 * | allowClear | ✅ | ❌ | ❌ |
 * | onResize | ✅ | ❌ | ❌ |
 *
 * @example Engine Override
 * ```tsx
 * // Use Titan for advanced auto-sizing
 * <Textarea engine="titan" autoSize={{ minRows: 2, maxRows: 6 }} />
 *
 * // Use Hermes for lightweight styling
 * <Textarea engine="hermes" rows={4} />
 * ```
 *
 * @see {@link TitanTextarea} for Ant Design implementation
 * @see {@link HermesTextarea} for DaisyUI implementation
 * @see {@link ApolloTextarea} for vanilla implementation
 * @module TextareaEngines
 * @category Inputs
 * @package @rottay/design-system
 */

export { default as titan } from './titan';
export { default as hermes } from './hermes';
export { default as apollo } from './apollo';
