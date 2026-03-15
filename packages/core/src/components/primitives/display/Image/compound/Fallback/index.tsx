/**
 * Image.Fallback - Compound Component
 *
 * Displays custom fallback content when an image fails to load.
 * Can be used standalone or as part of the Image component.
 */

'use client';

import React, { forwardRef } from 'react';
import type { ImageFallbackProps } from '../../types';

/**
 * Image.Fallback component for displaying fallback content when image load fails.
 *
 * Features:
 * - Customizable fallback content
 * - Default broken image icon
 * - Flexible sizing
 * - Accessible styling
 *
 * @example
 * ```tsx
 * <Image.Fallback width={200} height={200}>
 *   <span>Image not available</span>
 * </Image.Fallback>
 * ```
 */
export const ImageFallback = forwardRef<HTMLDivElement, ImageFallbackProps>(
  ({ children, className = '', style, width, height, ...props }, ref) => {
    /**
     * Default fallback icon displayed when no children provided.
     */
    const DefaultFallbackIcon = () => (
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M40 8H8C6.9 8 6 8.9 6 10V38C6 39.1 6.9 40 8 40H40C41.1 40 42 39.1 42 38V10C42 8.9 41.1 8 40 8ZM16 34L22 26L26 32L32 24L38 34H16Z"
          fill="currentColor"
        />
      </svg>
    );

    // Container styles
    const fallbackStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: typeof width === 'number' ? `${width}px` : width || '100%',
      height: typeof height === 'number' ? `${height}px` : height || '100%',
      backgroundColor: 'var(--ds-color-neutral-100, #f5f5f5)',
      color: 'var(--ds-color-neutral-500, #737373)',
      fontSize: '0.875rem',
      ...style,
    };

    return (
      <div
        ref={ref}
        className={`rottay-image-fallback ${className}`}
        style={fallbackStyles}
        role="img"
        aria-label="Image failed to load"
        {...props}
      >
        {children || <DefaultFallbackIcon />}
      </div>
    );
  }
);

ImageFallback.displayName = 'ImageFallback';
