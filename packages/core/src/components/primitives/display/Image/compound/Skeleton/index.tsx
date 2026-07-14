/**
 * @fileoverview Image.Skeleton compound component.
 * Displays a loading skeleton placeholder while an image is loading.
 * Can be used standalone or as part of the Image component.
 */

'use client';

import React, { forwardRef } from 'react';
import type { ImageSkeletonProps } from '../../Image.types';
import { RADIUS_MAP } from '../../Image.types';

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
 * @returns A div with pulsing skeleton animation and inline keyframe styles
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

    // The `radius` prop publishes no attribute, so image-compounds.css reads the
    // resolved value as a custom property.
    const skeletonStyles: React.CSSProperties = {
      width: typeof width === 'number' ? `${width}px` : width || '100%',
      height: typeof height === 'number' ? `${height}px` : height || '100%',
      '--ds-image-resolved-radius': radiusValue,
      animation: animate ? 'ds-image-skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
      ...style,
    } as React.CSSProperties;

    return (
      <div
        ref={ref}
        className={`rottay-image-skeleton ${className}`}
        data-part="skeleton"
        style={skeletonStyles}
        aria-hidden="true"
        {...props}
      />
    );
  }
);

ImageSkeleton.displayName = 'ImageSkeleton';
