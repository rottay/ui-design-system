'use client';

import { forwardRef } from 'react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';
import type { ImageProps } from './types';
import { TitanImage, HermesImage, ApolloImage } from './engines';
import { ImageFallback, ImageSkeleton } from './compound';

/**
 * Image component with engine-aware rendering.
 *
 * Automatically selects the appropriate engine implementation based on the
 * engine prop or EngineProvider context.
 *
 * @example
 * ```tsx
 * <Image
 *   src="/photo.jpg"
 *   alt="Description"
 *   width={400}
 *   height={300}
 *   fit="cover"
 *   radius="md"
 * />
 * ```
 */
export const Image = forwardRef<HTMLImageElement, ImageProps>(
  ({ engine = 'titan', ...props }, ref) => {
    const engineMap: Record<string, ForwardRefExoticComponent<ImageProps & RefAttributes<HTMLImageElement>>> = {
      titan: TitanImage,
      hermes: HermesImage,
      apollo: ApolloImage,
    };

    const Component = engineMap[engine] || TitanImage;
    return <Component ref={ref} {...props} />;
  }
) as ForwardRefExoticComponent<ImageProps & RefAttributes<HTMLImageElement>> & {
  Fallback: typeof ImageFallback;
  Skeleton: typeof ImageSkeleton;
};

// Attach compound components
Image.Fallback = ImageFallback;
Image.Skeleton = ImageSkeleton;

Image.displayName = 'Image';

// Export types
export type { ImageProps, ImageFallbackProps, ImageSkeletonProps, ImageFit, ImageLoading, ImageRadius } from './types';
