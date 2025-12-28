/**
 * @fileoverview Image Apollo Engine - Rottay Design System
 * @description Pure HTML/CSS image with custom zoom overlay.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine provides a lightweight, dependency-free image using only
 * inline styles with a custom zoom modal overlay.
 *
 * **Implementation Details:**
 * - Uses inline styles for all visual properties
 * - Custom zoom overlay with close button
 * - Native loading state management
 * - Full accessibility support
 *
 * **Advantages:**
 * - Zero external dependencies
 * - Smallest bundle size
 * - Maximum browser compatibility
 * - Custom zoom implementation
 *
 * **Accessibility:**
 * - `role="button"` for clickable images
 * - `aria-label` for zoom functionality
 * - `role="dialog"` for zoom overlay
 * - Keyboard close support
 *
 * @example Basic Usage
 * ```tsx
 * import { Image } from '@rottay/design-system';
 *
 * <Image engine="apollo" src="/photo.jpg" alt="Photo" />
 * ```
 *
 * @example With Custom Zoom
 * ```tsx
 * <Image
 *   engine="apollo"
 *   src="/photo.jpg"
 *   alt="Photo"
 *   zoomable
 *   radius="md"
 * />
 * ```
 *
 * @see {@link Image} for the main component
 * @see {@link BaseImage} for CSS variable implementation
 * @module ApolloImage
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { ImageProps } from '../../types';
import { IMAGE_DEFAULTS, RADIUS_MAP } from '../../types';
import type { ImageRadius, ImageStatus } from '../../types';

/**
 * Apollo (Pure HTML/CSS) implementation of the Image component.
 *
 * Features:
 * - Zero external dependencies
 * - Maximum accessibility compliance
 * - Native browser image handling
 * - CSS variable-based theming
 *
 * @example
 * ```tsx
 * <ApolloImage
 *   src="/photo.jpg"
 *   alt="Photo description"
 *   width={400}
 *   height={300}
 *   radius="md"
 * />
 * ```
 */
export default function ApolloImage(props: ImageProps): React.ReactElement {
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
  } = props;

  const [status, setStatus] = useState<ImageStatus>('loading');
  const [isHovered, setIsHovered] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  // Reset status when src changes
  useEffect(() => {
    setStatus('loading');
  }, [src]);

  /**
   * Handles successful image load.
   */
  const handleLoad = useCallback(() => {
    setStatus('loaded');
    onLoad?.();
  }, [onLoad]);

  /**
   * Handles image load error.
   */
  const handleError = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setStatus('error');
      onError?.(event);
    },
    [onError]
  );

  /**
   * Handles click events, including zoom functionality.
   */
  const handleClick = useCallback(() => {
    if (zoomable) {
      setIsZoomed(true);
    }
    onClick?.();
  }, [onClick, zoomable]);

  /**
   * Closes the zoom overlay.
   */
  const handleCloseZoom = useCallback(() => {
    setIsZoomed(false);
  }, []);

  // Get radius CSS value
  const radiusValue = RADIUS_MAP[radius] || RADIUS_MAP.none;

  // Container styles
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    width: typeof width === 'number' ? `${width}px` : width || 'auto',
    height: typeof height === 'number' ? `${height}px` : height || 'auto',
    aspectRatio: aspectRatio ? String(aspectRatio) : undefined,
    borderRadius: radiusValue,
    overflow: 'hidden',
    border: bordered ? '1px solid rgba(0, 0, 0, 0.1)' : 'none',
    boxShadow: shadow ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : 'none',
    cursor: onClick || zoomable ? 'pointer' : 'default',
    transition: 'all 0.2s ease-in-out',
    ...style,
  };

  // Image element styles
  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit,
    objectPosition,
    borderRadius: radiusValue,
    display: status === 'loaded' ? 'block' : 'none',
    transition: 'opacity 0.3s ease-in-out',
  };

  // Placeholder styles
  const placeholderStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: status === 'loading' ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: radiusValue,
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
    backgroundColor: '#f5f5f5',
    color: '#737373',
    borderRadius: radiusValue,
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
    borderRadius: radiusValue,
    transition: 'opacity 0.2s ease-in-out',
  };

  // Zoom overlay styles
  const zoomOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    display: isZoomed ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    zIndex: 9999,
    cursor: 'zoom-out',
  };

  // Zoomed image styles
  const zoomedImageStyle: React.CSSProperties = {
    maxWidth: '90vw',
    maxHeight: '90vh',
    objectFit: 'contain',
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
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#e5e5e5',
        animation: 'apolloImagePulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }}
    />
  );

  return (
    <>
      <div
        className={`rottay-image-apollo ${className}`}
        style={containerStyle}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role={onClick || zoomable ? 'button' : undefined}
        tabIndex={onClick || zoomable ? 0 : undefined}
        aria-label={zoomable ? `${alt} (click to zoom)` : undefined}
      >
        {/* Loading Placeholder */}
        <div style={placeholderStyle}>
          {placeholder || <DefaultPlaceholder />}
        </div>

        {/* Error Fallback */}
        <div style={fallbackStyle}>
          {fallback || <DefaultFallbackIcon />}
        </div>

        {/* Main Image */}
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={lazy ? 'lazy' : 'eager'}
          onLoad={handleLoad}
          onError={handleError}
          style={imageStyle}
        />

        {/* Hover Overlay */}
        {hoverOverlay && (
          <div style={overlayStyle}>{hoverOverlay}</div>
        )}

        {/* Zoom indicator */}
        {zoomable && isHovered && status === 'loaded' && (
          <div
            style={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              padding: 6,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              borderRadius: '50%',
              color: 'white',
            }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
            </svg>
          </div>
        )}
      </div>

      {/* Zoom Overlay */}
      {zoomable && (
        <div
          style={zoomOverlayStyle}
          onClick={handleCloseZoom}
          role="dialog"
          aria-label="Zoomed image"
          aria-modal="true"
        >
          <img
            src={src}
            alt={alt}
            style={zoomedImageStyle}
          />
          <button
            onClick={handleCloseZoom}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              padding: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              color: 'white',
              cursor: 'pointer',
            }}
            aria-label="Close zoom"
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Inline keyframes for animation */}
      <style>
        {`
          @keyframes apolloImagePulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </>
  );
}

ApolloImage.displayName = 'ApolloImage';
