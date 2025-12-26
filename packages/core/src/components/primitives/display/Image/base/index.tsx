/**
 * Image - Base Component
 * Uses CSS variables from design tokens for consistent styling.
 * This is extended by engine-specific implementations.
 */

'use client';

import React, { forwardRef, useState, useEffect, useCallback } from 'react';
import type { ImageProps } from '../types';
import { IMAGE_DEFAULTS, RADIUS_MAP } from '../types';
import type { ImageStatus, ImageRadius } from '../types';

/**
 * Base Image component using CSS variables.
 * Provides loading states, fallback handling, and consistent styling
 * across all engine implementations.
 *
 * @example
 * ```tsx
 * <BaseImage
 *   src="/photo.jpg"
 *   alt="A beautiful landscape"
 *   width={400}
 *   height={300}
 *   objectFit="cover"
 *   radius="md"
 * />
 * ```
 */
export const BaseImage = forwardRef<HTMLImageElement, ImageProps>(
  (props, ref) => {
    const {
      src,
      alt,
      width,
      height,
      objectFit = IMAGE_DEFAULTS.objectFit,
      objectPosition = IMAGE_DEFAULTS.objectPosition,
      radius = IMAGE_DEFAULTS.radius as ImageRadius,
      bordered = IMAGE_DEFAULTS.bordered,
      shadow = IMAGE_DEFAULTS.shadow,
      zoomable = IMAGE_DEFAULTS.zoomable,
      lazy = IMAGE_DEFAULTS.lazy,
      placeholder,
      fallback,
      onClick,
      onLoad,
      onError,
      aspectRatio,
      hoverOverlay,
      className = '',
      style = {},
      ...restProps
    } = props;

    const [status, setStatus] = useState<ImageStatus>('loading');
    const [isHovered, setIsHovered] = useState(false);

    // Reset status when src changes
    useEffect(() => {
      setStatus('loading');
    }, [src]);

    /**
     * Handles successful image load event.
     */
    const handleLoad = useCallback(() => {
      setStatus('loaded');
      onLoad?.();
    }, [onLoad]);

    /**
     * Handles image load error event.
     */
    const handleError = useCallback(
      (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
        setStatus('error');
        onError?.(event);
      },
      [onError]
    );

    // Compute radius value from map
    const radiusValue = RADIUS_MAP[radius] || RADIUS_MAP.none;

    // Build CSS variables for the image
    const imageVars: React.CSSProperties = {
      '--image-width': typeof width === 'number' ? `${width}px` : width || 'auto',
      '--image-height': typeof height === 'number' ? `${height}px` : height || 'auto',
      '--image-radius': radiusValue,
      '--image-object-fit': objectFit,
      '--image-object-position': objectPosition,
      '--image-aspect-ratio': aspectRatio ? String(aspectRatio) : 'auto',
    } as React.CSSProperties;

    // Container styles
    const containerStyle: React.CSSProperties = {
      ...imageVars,
      position: 'relative',
      display: 'inline-block',
      width: 'var(--image-width)',
      height: 'var(--image-height)',
      aspectRatio: aspectRatio ? 'var(--image-aspect-ratio)' : undefined,
      borderRadius: 'var(--image-radius)',
      overflow: 'hidden',
      border: bordered ? '1px solid var(--color-border, rgba(0, 0, 0, 0.1))' : 'none',
      boxShadow: shadow ? 'var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1))' : 'none',
      cursor: onClick || zoomable ? 'pointer' : 'default',
      ...style,
    };

    // Image element styles
    const imageStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      objectFit: 'var(--image-object-fit)' as React.CSSProperties['objectFit'],
      objectPosition: 'var(--image-object-position)',
      borderRadius: 'var(--image-radius)',
      display: status === 'loaded' ? 'block' : 'none',
      transition: 'opacity 0.3s ease-in-out',
    };

    // Placeholder/skeleton styles
    const placeholderStyle: React.CSSProperties = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: status === 'loading' ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--color-neutral-100, #f5f5f5)',
      borderRadius: 'var(--image-radius)',
    };

    // Fallback styles
    const fallbackStyle: React.CSSProperties = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: status === 'error' ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--color-neutral-100, #f5f5f5)',
      color: 'var(--color-neutral-500, #737373)',
      borderRadius: 'var(--image-radius)',
    };

    // Hover overlay styles
    const overlayStyle: React.CSSProperties = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: isHovered && hoverOverlay ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      borderRadius: 'var(--image-radius)',
      transition: 'opacity 0.2s ease-in-out',
    };

    // Default fallback icon
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

    // Default loading placeholder
    const DefaultPlaceholder = () => (
      <div
        className="rottay-image-placeholder-animation"
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'var(--color-neutral-200, #e5e5e5)',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }}
      />
    );

    return (
      <div
        className={`rottay-image-wrapper ${className}`}
        style={containerStyle}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        {/* Loading Placeholder */}
        <div className="rottay-image-placeholder" style={placeholderStyle}>
          {placeholder || <DefaultPlaceholder />}
        </div>

        {/* Error Fallback */}
        <div className="rottay-image-fallback" style={fallbackStyle}>
          {fallback || <DefaultFallbackIcon />}
        </div>

        {/* Main Image */}
        <img
          ref={ref}
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={lazy ? 'lazy' : 'eager'}
          onLoad={handleLoad}
          onError={handleError}
          className="rottay-image"
          style={imageStyle}
          {...restProps}
        />

        {/* Hover Overlay */}
        {hoverOverlay && (
          <div className="rottay-image-overlay" style={overlayStyle}>
            {hoverOverlay}
          </div>
        )}

        {/* Inline styles for animation */}
        <style>
          {`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `}
        </style>
      </div>
    );
  }
);

BaseImage.displayName = 'BaseImage';
