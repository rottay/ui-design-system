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
 * - **Classic**: Ant Design Switch with all built-in features
 * - **Modern**: DaisyUI/Tailwind CSS toggle with custom labels
 * - **Rustic**: Pure CSS with inline styles and sliding animation
 *
 * **Feature Comparison:**
 * | Feature | Classic | Modern | Rustic |
 * |---------|-------|--------|--------|
 * | Loading spinner | ✅ | ✅ | ✅ |
 * | Size variants | ✅ | ✅ | ✅ |
 * | Children labels | ✅ | ✅ | ✅ |
 * | Keyboard support | ✅ | ✅ | ✅ |
 *
 * @example Engine Override
 * ```tsx
 * // Use Classic for enterprise apps
 * <Switch engine="classic" loading={isSaving} />
 *
 * // Use Modern for Tailwind projects
 * <Switch engine="modern" className="toggle-primary" />
 * ```
 *
 * @see {@link ClassicSwitch} for Ant Design implementation
 * @see {@link ModernSwitch} for DaisyUI implementation
 * @see {@link RusticSwitch} for vanilla implementation
 * @module SwitchEngines
 * @category Inputs
 * @package @rottay/design-system
 */

export { Switch as ClassicSwitch } from './classic';
export { Switch as ModernSwitch } from './modern';
export { Switch as RusticSwitch } from './rustic';
