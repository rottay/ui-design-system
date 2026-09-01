/**
 * @fileoverview Image.Skeleton compound component.
 * Displays a loading skeleton placeholder while an image is loading.
 * Can be used standalone or as part of the Image component.
 */

'use client';

import React, { forwardRef } from 'react';
import type { ImageSkeletonProps } from '../../contracts';
import { RADIUS_MAP } from '../../contracts';

/**
 * Image.Skeleton component for displaying loading state.
 *
 * Features:
 * - Animated pulse effect
 * - Customizable dimensions
 * - Border radius options
 * - Accessible (hidden from screen readers)
 *
 * @param props - ImageSkeletonProps including width, height, radius, and animate toggle
 * @param ref - Forwarded ref to the root div element
 * @returns A div whose pulse animation is owned by image-compounds.css,
 *          keyed on the data-animate stamp
 *
 * @example
 * ```tsx
 * <Image.Skeleton width={200} height={200} radius="md" />
 * ```
 */
export const ImageSkeleton = forwardRef<HTMLDivElement, ImageSkeletonProps>(
  (
    {
      width,
      height,
      radius = 'none',
      animate = true,
      className = '',
      style,
      ...props
    },
    ref
  ) => {
    // Get radius CSS value
    const radiusValue = RADIUS_MAP[radius] || RADIUS_MAP.none;

    // The `radius` and `animate` props publish no geometry of their own:
    // radius rides a custom property and the pulse rides the data-animate
    // stamp -- image-compounds.css owns both paints (no raw-duration
    // animation inline anymore).
    const skeletonStyles: React.CSSProperties = {
      width: typeof width === 'number' ? `${width}px` : width || '100%',
      height: typeof height === 'number' ? `${height}px` : height || '100%',
      '--ds-image-resolved-radius': radiusValue,
      ...style,
    } as React.CSSProperties;

    return (
      <div
        ref={ref}
        className={`rottay-image-skeleton ${className}`}
        data-part="skeleton"
        data-animate={animate ? 'true' : undefined}
        style={skeletonStyles}
        aria-hidden="true"
        {...props}
      />
    );
  }
);

ImageSkeleton.displayName = 'ImageSkeleton';
