'use client';

import React, { forwardRef } from 'react';
import type { ImageFallbackProps } from '../../types';

/**
 * Image.Fallback component for custom fallback content.
 *
 * Used when image fails to load.
 */
export const ImageFallback = forwardRef<HTMLDivElement, ImageFallbackProps>(
  ({ children, className, style, ...props }, ref) => {
    const fallbackStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      backgroundColor: 'var(--color-neutral-100)',
      color: 'var(--color-neutral-500)',
      fontSize: '0.875rem',
      ...style,
    };

    return (
      <div
        ref={ref}
        className={`rottay-image-fallback ${className || ''}`}
        style={fallbackStyles}
        {...props}
      >
        {children || (
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <path
              d="M40 8H8C6.9 8 6 8.9 6 10V38C6 39.1 6.9 40 8 40H40C41.1 40 42 39.1 42 38V10C42 8.9 41.1 8 40 8ZM16 34L22 26L26 32L32 24L38 34H16Z"
              fill="currentColor"
            />
          </svg>
        )}
      </div>
    );
  }
);

ImageFallback.displayName = 'ImageFallback';
