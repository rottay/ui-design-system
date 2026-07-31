/**
 * @fileoverview Modern engine for the Image display primitive, painted by the
 * modern skin (`foundation/tokens/css/runtime/engines/modern/skin/image.css`).
 * The engine tracks the loading/loaded/error lifecycle and stamps the data-*
 * contract (radius, object-fit, bordered/shadow, interactive, status); all
 * geometry and paint -- including the opacity reveal, the placeholder pulse
 * and the zoom badge -- are skin-owned. The only inline declarations are the
 * caller's measured values and the single pinned logical `end-2` utility on
 * the zoom badge.
 *
 * @example
 * ```tsx
 * <Image engine="modern" src="/photo.jpg" alt="Photo" radius="lg" shadow />
 * ```
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';

import { partAttributes, useInteractionState } from '../../../../../../foundation/behavior';
import type { ImageProps } from '../../contracts';
import { IMAGE_DEFAULTS } from '../../contracts';
import type { ImageRadius, ImageStatus } from '../../contracts';

/**
 * Modern (skin-painted) Image engine. Tracks the loading lifecycle and
 * composes the frame, the reveal and the overlays through the modern skin's
 * data contract -- no Tailwind utilities remain (the zoom badge's logical
 * `end-2` is the single pinned exception).
 *
 * @param props - Standard ImageProps shared across all engines.
 * @returns A skin-styled container with `<img>`, overlay, and zoom indicator.
 */
export default function ModernImage(props: ImageProps): React.ReactElement {
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

  // Tracks loading/loaded/error lifecycle for opacity transition and fallback
  const [status, setStatus] = useState<ImageStatus>('loading');
  const { state: interaction, handlers: interactionHandlers } = useInteractionState();
  const isHovered = interaction.hovered;

  // A new src means the image must be re-fetched; reset to loading
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

  // Geometry and paint are skin-owned (image.css), keyed on the data-*
  // contract below: radius, object-fit, bordered/shadow, interactive cursor
  // and the load-status reveal. The only inline declarations are the
  // caller's measured values (width/height/aspectRatio/objectPosition).
  const containerClasses = ['rottay-image', 'rottay-image--modern', className]
    .filter(Boolean)
    .join(' ');

  // Container styles
  const containerStyle: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width || 'auto',
    height: typeof height === 'number' ? `${height}px` : height || 'auto',
    aspectRatio: aspectRatio ? String(aspectRatio) : undefined,
    ...style,
  };

  // Inline SVG used when no consumer fallback is provided and the image fails.
  // `fill="currentColor"` resolves against the fallback panel's own colour.
  const DefaultFallbackIcon = () => (
    <svg
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

  const isInteractive = Boolean(onClick || zoomable);

  return (
    <div
      className={containerClasses}
      data-status={status}
      data-radius={radius}
      data-object-fit={objectFit}
      data-bordered={bordered ? 'true' : undefined}
      data-shadow={shadow ? 'true' : undefined}
      data-zoomable={zoomable ? 'true' : undefined}
      data-interactive={isInteractive ? 'true' : undefined}
      style={containerStyle}
      onClick={onClick}
      {...(onClick
        ? {
            onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick();
              }
            },
          }
        : {})}
      {...interactionHandlers}
      {...partAttributes('root', interaction)}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Loading Placeholder — the pulse animation is owned by the skin
          (ds-foundation-pulse), not a raw Tailwind `animate-pulse` utility;
          the global reduced-motion guard neutralizes it. */}
      {status === 'loading' && (
        <div data-part="placeholder">
          {placeholder || (
            <div className="rottay-image__pulse" />
          )}
        </div>
      )}

      {/* Error Fallback */}
      {status === 'error' && (
        <div data-part="fallback">
          {fallback || <DefaultFallbackIcon />}
        </div>
      )}

      {/* Main Image */}
      <img
        data-part="img"
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={lazy ? 'lazy' : 'eager'}
        onLoad={handleLoad}
        onError={handleError}
        style={{ objectPosition }}
      />

      {/* Hover Overlay */}
      {hoverOverlay && isHovered && (
        <div data-part="hover-overlay">
          {hoverOverlay}
        </div>
      )}

      {/* Zoom indicator for zoomable images — `end-2` is LOGICAL
          (inset-inline-end), so the badge mirrors under RTL, and it is the one
          utility the quality contract pins verbatim; every other property
          (position, padding, radius, ink) is skin-owned. */}
      {zoomable && isHovered && (
        <div data-part="zoom-indicator" className="end-2">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
          </svg>
        </div>
      )}
    </div>
  );
}

ModernImage.displayName = 'ModernImage';
