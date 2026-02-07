/**
 * @fileoverview Card Engine Implementations - Rottay Design System
 * @description Engine-specific card implementations for multi-library support.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module provides the barrel export for all Card engine implementations.
 * Each engine provides the same card functionality with different styling.
 *
 * **Available Engines:**
 * - **Classic**: Ant Design Card with skeleton loading
 * - **Modern**: DaisyUI card classes with Tailwind
 * - **Rustic**: Pure CSS with inline styles
 *
 * **Feature Comparison:**
 * | Feature | Classic | Modern | Rustic |
 * |---------|-------|--------|--------|
 * | Skeleton loading | ✅ | ✅ | ❌ |
 * | Spinner loading | ❌ | ❌ | ✅ |
 * | Cover images | ✅ | ✅ | ✅ |
 * | Actions slot | ✅ | ✅ | ✅ |
 * | Hover effects | ✅ | ✅ | ✅ |
 * | ARIA attributes | ❌ | ❌ | ✅ |
 *
 * @example Engine Override
 * ```tsx
 * // Use Modern for DaisyUI styling
 * <Card engine="modern" variant="outlined" />
 *
 * // Use Rustic for accessibility focus
 * <Card engine="rustic" clickable onClick={handle} />
 * ```
 *
 * @see {@link ClassicCard} for Ant Design implementation
 * @see {@link ModernCard} for DaisyUI implementation
 * @see {@link RusticCard} for vanilla implementation
 * @module CardEngines
 * @category Display
 * @package @rottay/design-system
 */

export { default as classic } from './classic';
export { default as modern } from './modern';
export { default as rustic } from './rustic';
