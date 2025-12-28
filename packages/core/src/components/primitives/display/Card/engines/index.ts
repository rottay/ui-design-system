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
 * - **Titan**: Ant Design Card with skeleton loading
 * - **Hermes**: DaisyUI card classes with Tailwind
 * - **Apollo**: Pure CSS with inline styles
 *
 * **Feature Comparison:**
 * | Feature | Titan | Hermes | Apollo |
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
 * // Use Hermes for DaisyUI styling
 * <Card engine="hermes" variant="outlined" />
 *
 * // Use Apollo for accessibility focus
 * <Card engine="apollo" clickable onClick={handle} />
 * ```
 *
 * @see {@link TitanCard} for Ant Design implementation
 * @see {@link HermesCard} for DaisyUI implementation
 * @see {@link ApolloCard} for vanilla implementation
 * @module CardEngines
 * @category Display
 * @package @rottay/design-system
 */

export { default as titan } from './titan';
export { default as hermes } from './hermes';
export { default as apollo } from './apollo';
