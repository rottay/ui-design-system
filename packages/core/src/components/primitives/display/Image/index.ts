/**
 * Image - Engine Router
 *
 * Provides an engine-aware Image component that dynamically loads
 * the appropriate implementation based on the engine context.
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { ImageProps } from './types';
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
} from './types';
export { IMAGE_DEFAULTS, RADIUS_MAP } from './types';

// Export compound components
export { ImageFallback, ImageSkeleton };

// Export base component
export { BaseImage } from './base';

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
 *   engine="hermes"
 *   src="/photo.jpg"
 *   alt="Description"
 * />
 * ```
 */
export const Image = Object.assign(
  createEngineComponent<ImageProps>('Image', {
    titan: () => import('./engines/titan'),
    hermes: () => import('./engines/hermes'),
    apollo: () => import('./engines/apollo'),
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
