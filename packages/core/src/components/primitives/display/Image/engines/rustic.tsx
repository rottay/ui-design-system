/**
 * @fileoverview Rustic (pure HTML/CSS) engine for the Image display primitive.
 * Zero-dependency implementation styled entirely with inline styles and DS CSS
 * variables, featuring a custom full-screen zoom overlay dialog.
 *
 * @example
 * ```tsx
 * <Image engine="rustic" src="/photo.jpg" alt="Photo" zoomable radius="md" />
 * ```
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { ImageProps } from '../Image.types';
import { IMAGE_DEFAULTS, RADIUS_MAP } from '../Image.types';
import type { ImageRadius, ImageStatus } from '../Image.types';

/**
 * Rustic (pure inline-style) Image engine. Manages loading/error/zoom states
 * internally, renders a full-screen dialog overlay for zoom, and uses only
 * DS CSS variables for theming -- no Tailwind or antd required.
 *
 * @param props - Standard ImageProps shared across all engines.
 * @returns A Fragment containing the image container, zoom overlay, and inline keyframes.
 */
export default function RusticImage(props: ImageProps): React.ReactElement {
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

  // Three independent UI states: load lifecycle, hover for overlay, zoom for dialog
  const [status, setStatus] = useState<ImageStatus>('loading');
  const [isHovered, setIsHovered] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  // When the consumer swaps `src`, restart the loading lifecycle
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

  // Open zoom overlay if enabled, then forward click to consumer
  const handleClick = useCallback(() => {
    if (zoomable) {
      setIsZoomed(true);
    }
    onClick?.();
  }, [onClick, zoomable]);

  // Dismiss the full-screen zoom dialog
  const handleCloseZoom = useCallback(() => {
    setIsZoomed(false);
  }, []);

  // Resolve DS radius token to a CSS value shared by container and inner elements
  const radiusValue = RADIUS_MAP[radius] || RADIUS_MAP.none;

  // All visual decoration (border, shadow, transition) via DS CSS variables
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    width: typeof width === 'number' ? `${width}px` : width || 'auto',
    height: typeof height === 'number' ? `${height}px` : height || 'auto',
    aspectRatio: aspectRatio ? String(aspectRatio) : undefined,
    borderRadius: radiusValue,
    overflow: 'hidden',
    border: bordered ? '1px solid var(--ds-image-border-color, rgba(0, 0, 0, 0.1))' : 'none',
    boxShadow: shadow ? 'var(--ds-image-shadow, 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06))' : 'none',
    cursor: onClick || zoomable ? 'pointer' : 'default',
    transition: 'var(--ds-image-transition, all 0.2s ease-in-out)',
    ...style,
  };

  // Hidden via display:none until loaded, avoiding a flash of broken content
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
    backgroundColor: 'var(--ds-image-placeholder-bg, #f5f5f5)',
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
    backgroundColor: 'var(--ds-image-fallback-bg, #f5f5f5)',
    color: 'var(--ds-image-fallback-color, #737373)',
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
    backgroundColor: 'var(--ds-image-overlay-bg, rgba(0, 0, 0, 0.4))',
    borderRadius: radiusValue,
    transition: 'opacity 0.2s ease-in-out',
  };

  // Fixed full-viewport backdrop for the zoom dialog
  const zoomOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    display: isZoomed ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--ds-image-zoom-overlay-bg, rgba(0, 0, 0, 0.9))',
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

  // Inline pulse animation placeholder -- avoids importing an animation library
  const DefaultPlaceholder = () => (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: 'var(--ds-image-loading-bg, #e5e5e5)',
        animation: 'rusticImagePulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }}
    />
  );

  return (
    <>
      <div
        className={`rottay-image-rustic ${className}`}
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
              backgroundColor: 'var(--ds-image-zoom-indicator-bg, rgba(0, 0, 0, 0.5))',
              borderRadius: '50%',
              color: 'var(--ds-image-zoom-indicator-color, white)',
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
              backgroundColor: 'var(--ds-image-zoom-close-bg, rgba(255, 255, 255, 0.1))',
              border: 'none',
              borderRadius: '50%',
              color: 'var(--ds-image-zoom-close-color, white)',
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
          @keyframes rusticImagePulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </>
  );
}

RusticImage.displayName = 'RusticImage';
