/**
 * @fileoverview Switch Engine Implementations - Rottay Design System
 * @description Engine-specific switch implementations for multi-library support.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * This module provides the barrel export for all Switch engine implementations.
 * Each engine provides the same switch functionality with different underlying
 * libraries and styling approaches.
 *
 * **Available Engines:**
 * - **Titan**: Ant Design Switch with all built-in features
 * - **Hermes**: DaisyUI/Tailwind CSS toggle with custom labels
 * - **Apollo**: Pure CSS with inline styles and sliding animation
 *
 * **Feature Comparison:**
 * | Feature | Titan | Hermes | Apollo |
 * |---------|-------|--------|--------|
 * | Loading spinner | ✅ | ✅ | ✅ |
 * | Size variants | ✅ | ✅ | ✅ |
 * | Children labels | ✅ | ✅ | ✅ |
 * | Keyboard support | ✅ | ✅ | ✅ |
 *
 * @example Engine Override
 * ```tsx
 * // Use Titan for enterprise apps
 * <Switch engine="titan" loading={isSaving} />
 *
 * // Use Hermes for Tailwind projects
 * <Switch engine="hermes" className="toggle-primary" />
 * ```
 *
 * @see {@link TitanSwitch} for Ant Design implementation
 * @see {@link HermesSwitch} for DaisyUI implementation
 * @see {@link ApolloSwitch} for vanilla implementation
 * @module SwitchEngines
 * @category Inputs
 * @package @rottay/design-system
 */

export { Switch as TitanSwitch } from './titan';
export { Switch as HermesSwitch } from './hermes';
export { Switch as ApolloSwitch } from './apollo';
