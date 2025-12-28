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
 * - **Titan**: Ant Design InputNumber with full features
 * - **Hermes**: DaisyUI input with custom controls
 * - **Apollo**: Pure HTML number input with styling
 *
 * **Feature Comparison:**
 * | Feature | Titan | Hermes | Apollo |
 * |---------|-------|--------|--------|
 * | formatter/parser | ✅ | ❌ | ❌ |
 * | stringMode | ✅ | ❌ | ❌ |
 * | decimalSeparator | ✅ | ❌ | ❌ |
 * | Step controls | ✅ | ✅ | ✅ |
 * | Keyboard nav | ✅ | ✅ | ✅ |
 *
 * @example Engine Override
 * ```tsx
 * // Use Titan for advanced formatting
 * <InputNumber engine="titan" formatter={(v) => `$ ${v}`} />
 *
 * // Use Hermes for lightweight bundle
 * <InputNumber engine="hermes" min={0} max={100} />
 * ```
 *
 * @see {@link TitanInputNumber} for Ant Design implementation
 * @see {@link HermesInputNumber} for DaisyUI implementation
 * @see {@link ApolloInputNumber} for vanilla implementation
 * @module InputNumberEngines
 * @category Inputs
 * @package @rottay/design-system
 */

export { InputNumber as TitanInputNumber } from './titan';
export { InputNumber as HermesInputNumber } from './hermes';
export { InputNumber as ApolloInputNumber } from './apollo';
