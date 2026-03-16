'use client';

/**
 * @fileoverview Image - Enhanced image display with loading states and zoom.
 * Provides automatic skeleton placeholders, error fallback content, lazy
 * loading, and optional lightbox zoom. Compound sub-components: Fallback, Skeleton.
 *
 * @example
 * ```tsx
 * import { Image } from '@rottay/design-system';
 *
 * <Image src="/photo.jpg" alt="Description" radius="lg" bordered zoomable />
 * ```
 *
 * @module Image
 * @category Display
 */

import { createEngineComponent } from '../../../../engines/factory';
import type { ImageProps } from './Image.types';
import { ImageFallback, ImageSkeleton } from './compound';

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

export { ImageFallback, ImageSkeleton };

/**
 * Image component with Fallback and Skeleton compound sub-components.
 * Sub-components let consumers customise the error and loading states
 * declaratively instead of relying on engine defaults.
 */
export const Image = Object.assign(
  createEngineComponent<ImageProps>('Image', {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }),
  {
    /** Rendered in place of the image when `src` fails to load (e.g. broken URL). */
    Fallback: ImageFallback,
    /** Rendered while the image is still loading (replaces default skeleton). */
    Skeleton: ImageSkeleton,
  }
);
