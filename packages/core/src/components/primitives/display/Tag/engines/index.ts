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
 * - **Titan**: Ant Design Tag with preset colors
 * - **Hermes**: DaisyUI badge classes
 * - **Apollo**: Pure CSS with inline styles
 *
 * **Feature Comparison:**
 * | Feature | Titan | Hermes | Apollo |
 * |---------|-------|--------|--------|
 * | Closable | ✅ | ✅ | ✅ |
 * | Icons | ✅ | ✅ | ✅ |
 * | Outlined | ✅ | ✅ | ✅ |
 * | Clickable | ✅ | ✅ | ✅ |
 * | Color presets | ✅ | ✅ | ✅ |
 *
 * @example Engine Override
 * ```tsx
 * // Use Hermes for DaisyUI styling
 * <Tag engine="hermes" variant="primary" />
 *
 * // Use Apollo for zero dependencies
 * <Tag engine="apollo" closable onClose={fn} />
 * ```
 *
 * @see {@link TitanTag} for Ant Design implementation
 * @see {@link HermesTag} for DaisyUI implementation
 * @see {@link ApolloTag} for vanilla implementation
 * @module TagEngines
 * @category Display
 * @package @rottay/design-system
 */

export { default as titan } from './titan';
export { default as hermes } from './hermes';
export { default as apollo } from './apollo';
