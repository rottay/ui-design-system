/**
 * @fileoverview InputNumber Engine Implementations - Rottay Design System
 * @description Engine-specific numeric input implementations.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * This module provides the barrel export for all InputNumber engines.
 * Each engine provides numeric input with step controls using different
 * underlying libraries.
 *
 * **Available Engines:**
 * - **Classic**: Ant Design InputNumber with full features
 * - **Modern**: DaisyUI input with custom controls
 * - **Rustic**: Pure HTML number input with styling
 *
 * **Feature Comparison:**
 * | Feature | Classic | Modern | Rustic |
 * |---------|-------|--------|--------|
 * | formatter/parser | ✅ | ❌ | ❌ |
 * | stringMode | ✅ | ❌ | ❌ |
 * | decimalSeparator | ✅ | ❌ | ❌ |
 * | Step controls | ✅ | ✅ | ✅ |
 * | Keyboard nav | ✅ | ✅ | ✅ |
 *
 * @example Engine Override
 * ```tsx
 * // Use Classic for advanced formatting
 * <InputNumber engine="classic" formatter={(v) => `$ ${v}`} />
 *
 * // Use Modern for lightweight bundle
 * <InputNumber engine="modern" min={0} max={100} />
 * ```
 *
 * @see {@link ClassicInputNumber} for Ant Design implementation
 * @see {@link ModernInputNumber} for DaisyUI implementation
 * @see {@link RusticInputNumber} for vanilla implementation
 * @module InputNumberEngines
 * @category Inputs
 * @package @rottay/design-system
 */

export { InputNumber as ClassicInputNumber } from './classic';
export { InputNumber as ModernInputNumber } from './modern';
export { InputNumber as RusticInputNumber } from './rustic';
