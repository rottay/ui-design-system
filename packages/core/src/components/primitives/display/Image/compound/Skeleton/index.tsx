/**
 * Image.Skeleton - Compound Component
 *
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

    // Container styles
    const skeletonStyles: React.CSSProperties = {
      width: typeof width === 'number' ? `${width}px` : width || '100%',
      height: typeof height === 'number' ? `${height}px` : height || '100%',
      backgroundColor: 'var(--ds-color-neutral-200, #e5e5e5)',
      borderRadius: radiusValue,
      animation: animate ? 'rottayImageSkeletonPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
      ...style,
    };

    return (
      <>
        <div
          ref={ref}
          className={`rottay-image-skeleton ${className}`}
          style={skeletonStyles}
          aria-hidden="true"
          {...props}
        />
        {/* Inline keyframes for animation */}
        <style>
          {`
            @keyframes rottayImageSkeletonPulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `}
        </style>
      </>
    );
  }
);

ImageSkeleton.displayName = 'ImageSkeleton';
