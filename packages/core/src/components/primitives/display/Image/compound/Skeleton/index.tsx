'use client';

import React, { forwardRef } from 'react';
import type { ImageSkeletonProps } from '../../types';

/**
 * Image.Skeleton component for loading state.
 *
 * Displays while image is loading.
 */
export const ImageSkeleton = forwardRef<HTMLDivElement, ImageSkeletonProps>(
  ({ width, height, radius = 'none', className, style, ...props }, ref) => {
    const radiusMap: Record<string, string> = {
      none: '0',
      sm: '0.25rem',
      md: '0.5rem',
      lg: '1rem',
      full: '9999px',
    };

    const skeletonStyles: React.CSSProperties = {
      width: typeof width === 'number' ? `${width}px` : width || '100%',
      height: typeof height === 'number' ? `${height}px` : height || '100%',
      backgroundColor: 'var(--color-neutral-200)',
      borderRadius: radiusMap[radius],
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      ...style,
    };

    return (
      <>
        <style>
          {`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `}
        </style>
        <div
          ref={ref}
          className={`rottay-image-skeleton ${className || ''}`}
          style={skeletonStyles}
          aria-hidden="true"
          {...props}
        />
      </>
    );
  }
);

ImageSkeleton.displayName = 'ImageSkeleton';
