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
 * - **Classic**: Ant Design Image with preview/lightbox
 * - **Modern**: Tailwind utilities with hover effects
 * - **Rustic**: Pure CSS with custom zoom modal
 *
 * **Feature Comparison:**
 * | Feature | Classic | Modern | Rustic |
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
 * // Use Modern for Tailwind styling
 * <Image engine="modern" src="/photo.jpg" shadow />
 *
 * // Use Rustic for custom zoom
 * <Image engine="rustic" src="/photo.jpg" zoomable />
 * ```
 *
 * @see {@link ClassicImage} for Ant Design implementation
 * @see {@link ModernImage} for DaisyUI implementation
 * @see {@link RusticImage} for vanilla implementation
 * @module ImageEngines
 * @category Display
 * @package @rottay/design-system
 */

export { default as classic } from './classic';
export { default as modern } from './modern';
export { default as rustic } from './rustic';
