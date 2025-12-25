'use client';

import React, { forwardRef, useState, useEffect } from 'react';
import type { ImageProps, ImageStatus } from '../types';

/**
 * Base Image component with loading states and fallback.
 *
 * Features:
 * - Loading state with skeleton
 * - Error handling with fallback
 * - Multiple object-fit modes
 * - Lazy loading support
 * - Border radius options
 */
export const BaseImage = forwardRef<HTMLImageElement, ImageProps>(
  (
    {
      src,
      alt,
      width,
      height,
      fit = 'cover',
      loading = 'lazy',
      fallbackSrc,
      fallback,
      showSkeleton = true,
      radius = 'none',
      onError,
      onLoad,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const [status, setStatus] = useState<ImageStatus>('loading');
    const [currentSrc, setCurrentSrc] = useState(src);

    useEffect(() => {
      setCurrentSrc(src);
      setStatus('loading');
    }, [src]);

    const handleLoad = () => {
      setStatus('loaded');
      onLoad?.();
    };

    const handleError = () => {
      if (fallbackSrc && currentSrc !== fallbackSrc) {
        setCurrentSrc(fallbackSrc);
      } else {
        setStatus('error');
        onError?.(new Error('Failed to load image'));
      }
    };

    const radiusMap: Record<string, string> = {
      none: '0',
      sm: '0.25rem',
      md: '0.5rem',
      lg: '1rem',
      full: '9999px',
    };

    const cssVars = {
      '--image-radius': radiusMap[radius],
      '--image-fit': fit,
      '--image-width': typeof width === 'number' ? `${width}px` : width,
      '--image-height': typeof height === 'number' ? `${height}px` : height,
    } as React.CSSProperties;

    const wrapperStyles: React.CSSProperties = {
      ...cssVars,
      position: 'relative',
      display: 'inline-block',
      width: width || 'auto',
      height: height || 'auto',
    };

    const imageStyles: React.CSSProperties = {
      objectFit: fit,
      borderRadius: radiusMap[radius],
      width: '100%',
      height: '100%',
      display: status === 'loaded' ? 'block' : 'none',
      ...style,
    };

    const skeletonStyles: React.CSSProperties = {
      width: '100%',
      height: '100%',
      backgroundColor: 'var(--color-neutral-200)',
      borderRadius: radiusMap[radius],
      display: status === 'loading' && showSkeleton ? 'block' : 'none',
    };

    if (status === 'error' && fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className={`rottay-image-wrapper ${className || ''}`} style={wrapperStyles}>
        {status === 'loading' && showSkeleton && (
          <div className="rottay-image-skeleton" style={skeletonStyles} />
        )}
        <img
          ref={ref}
          src={currentSrc}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          className="rottay-image"
          style={imageStyles}
          {...props}
        />
      </div>
    );
  }
);

BaseImage.displayName = 'BaseImage';
