'use client';

/**
 * @fileoverview Image - Rottay Design System
 * @description Enhanced image component with loading states and zoom support.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * The Image component provides enhanced image display with automatic loading
 * states, error fallbacks, lazy loading, and optional zoom/lightbox functionality.
 *
 * **Multi-Engine Architecture:**
 * - **Classic**: Ant Design Image with built-in preview
 * - **Modern**: Tailwind utilities with DaisyUI patterns
 * - **Rustic**: Pure CSS with custom zoom overlay
 *
 * **Key Features:**
 * - Automatic loading skeleton placeholder
 * - Error fallback content
 * - Lazy loading support (native)
 * - Multiple object-fit modes
 * - Border radius options
 * - Zoom/lightbox functionality
 * - Hover overlay support
 *
 * **Compound Components:**
 * - `Image.Fallback` - Custom error fallback content
 * - `Image.Skeleton` - Custom loading placeholder
 *
 * **CSS Custom Properties:**
 * - `--image-width` - Image width
 * - `--image-height` - Image height
 * - `--image-radius` - Border radius
 * - `--image-object-fit` - Object fit mode
 *
 * @example Basic Image
 * ```tsx
 * import { Image } from '@rottay/design-system';
 *
 * <Image
 *   src="/photo.jpg"
 *   alt="Description"
 *   width={400}
 *   height={300}
 * />
 * ```
 *
 * @example With Styling Options
 * ```tsx
 * <Image
 *   src="/photo.jpg"
 *   alt="Description"
 *   radius="lg"
 *   bordered
 *   shadow
 *   zoomable
 * />
 * ```
 *
 * @example Engine Override
 * ```tsx
 * <Image engine="modern" src="/photo.jpg" alt="Photo" />
 * ```
 *
 * @see {@link ImageProps} for available props
 * @see {@link ImageFallback} for error handling
 * @module Image
 * @category Display
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../core/engines/factory';
import type { ImageProps } from './Image.types';
import { ImageFallback, ImageSkeleton } from './compound';

// Export types
export type {
  ImageProps,
  ImageFit,
  ImageGroupProps,
  ImageLoadState,
  ImageFallbackProps,
  ImageSkeletonProps,
  ImageRadius,
  ImageStatus,
} from './Image.types';
export { IMAGE_DEFAULTS, RADIUS_MAP } from './Image.types';

// Export compound components
export { ImageFallback, ImageSkeleton };

// Export base component

/**
 * Image component with engine-aware rendering.
 *
 * Automatically selects the appropriate engine implementation based on
 * the engine prop or EngineProvider context.
 *
 * Features:
 * - Loading states with skeleton placeholder
 * - Error handling with fallback content
 * - Multiple object-fit modes
 * - Lazy loading support
 * - Border radius options
 * - Zoom/lightbox functionality
 * - Hover overlay support
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Image
 *   src="/photo.jpg"
 *   alt="Description"
 *   width={400}
 *   height={300}
 * />
 *
 * // With styling options
 * <Image
 *   src="/photo.jpg"
 *   alt="Description"
 *   width={400}
 *   height={300}
 *   radius="lg"
 *   bordered
 *   shadow
 *   zoomable
 * />
 *
 * // With specific engine
 * <Image
 *   engine="modern"
 *   src="/photo.jpg"
 *   alt="Description"
 * />
 * ```
 */
export const Image = Object.assign(
  createEngineComponent<ImageProps>('Image', {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }),
  {
    /**
     * Compound component for displaying fallback content when image fails to load.
     */
    Fallback: ImageFallback,
    /**
     * Compound component for displaying loading skeleton placeholder.
     */
    Skeleton: ImageSkeleton,
  }
);
