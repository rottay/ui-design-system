/**
 * @fileoverview Image Engine Implementations - Rottay Design System
 * @description Engine-specific image implementations for multi-library support.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module provides the barrel export for all Image engine implementations.
 * Each engine provides the same image functionality with different features.
 *
 * **Available Engines:**
 * - **Titan**: Ant Design Image with preview/lightbox
 * - **Hermes**: Tailwind utilities with hover effects
 * - **Apollo**: Pure CSS with custom zoom modal
 *
 * **Feature Comparison:**
 * | Feature | Titan | Hermes | Apollo |
 * |---------|-------|--------|--------|
 * | Loading skeleton | ✅ | ✅ | ✅ |
 * | Error fallback | ✅ | ✅ | ✅ |
 * | Lazy loading | ✅ | ✅ | ✅ |
 * | Zoom/preview | ✅ | ✅ | ✅ |
 * | Built-in preview | ✅ | ❌ | ❌ |
 * | Hover overlay | ❌ | ✅ | ✅ |
 *
 * @example Engine Override
 * ```tsx
 * // Use Hermes for Tailwind styling
 * <Image engine="hermes" src="/photo.jpg" shadow />
 *
 * // Use Apollo for custom zoom
 * <Image engine="apollo" src="/photo.jpg" zoomable />
 * ```
 *
 * @see {@link TitanImage} for Ant Design implementation
 * @see {@link HermesImage} for DaisyUI implementation
 * @see {@link ApolloImage} for vanilla implementation
 * @module ImageEngines
 * @category Display
 * @package @rottay/design-system
 */

export { default as titan } from './titan';
export { default as hermes } from './hermes';
export { default as apollo } from './apollo';
