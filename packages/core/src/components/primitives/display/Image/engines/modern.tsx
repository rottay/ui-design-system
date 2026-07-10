/**
 * @fileoverview Modern (DaisyUI/Tailwind) engine for the Image display primitive.
 * Renders images with utility-first Tailwind classes, a smooth opacity-based
 * load transition, optional hover overlays, and a zoom indicator icon.
 *
 * @example
 * ```tsx
 * <Image engine="modern" src="/photo.jpg" alt="Photo" radius="lg" shadow />
 * ```
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';

import { partAttributes, useInteractionState } from '../../../../../behavior';
import type { ImageProps } from '../Image.types';
import { IMAGE_DEFAULTS } from '../Image.types';
import type { ImageRadius, ImageStatus } from '../Image.types';

/** Maps the DS radius token to the corresponding Tailwind `rounded-*` class. */
const RADIUS_CLASS_MAP: Record<ImageRadius, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

/**
 * Modern (DaisyUI/Tailwind) Image engine. Composes Tailwind utility classes
 * for responsive sizing, smooth load transitions, and optional hover overlays.
 *
 * @param props - Standard ImageProps shared across all engines.
 * @returns A Tailwind-styled container with `<img>`, overlay, and zoom indicator.
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

  // Assemble Tailwind class strings from the DS-level prop values
  const radiusClass = RADIUS_CLASS_MAP[radius] || RADIUS_CLASS_MAP.none;

  const containerClasses = [
    'relative',
    'inline-block',
    'overflow-hidden',
    radiusClass,
    bordered && 'border',
    (onClick || zoomable) && 'cursor-pointer',
    'transition-all',
    'duration-300',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Map the CSS object-fit value to Tailwind's utility class equivalent
  const objectFitClass = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
    none: 'object-none',
    'scale-down': 'object-scale-down',
  }[objectFit] || 'object-cover';

  // Start invisible (opacity-0) and fade in on load for a smooth reveal
  const imageClasses = [
    'w-full',
    'h-full',
    objectFitClass,
    radiusClass,
    'transition-opacity',
    'duration-300',
    status === 'loaded' ? 'opacity-100' : 'opacity-0',
  ]
    .filter(Boolean)
    .join(' ');

  // Container styles
  const containerStyle: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width || 'auto',
    height: typeof height === 'number' ? `${height}px` : height || 'auto',
    aspectRatio: aspectRatio ? String(aspectRatio) : undefined,
    ...(bordered && { borderColor: 'var(--ds-color-border)' }),
    ...(shadow && { boxShadow: 'var(--ds-elevation-2)' }),
    ...style,
  };

  // Inline SVG used when no consumer fallback is provided and the image fails
  const DefaultFallbackIcon = () => (
    <svg
      className="w-12 h-12"
      style={{ color: 'var(--ds-color-text-secondary)' }}
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

  return (
    <div
      className={containerClasses}
      style={containerStyle}
      onClick={onClick}
      {...interactionHandlers}
      {...partAttributes('root', interaction)}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Loading Placeholder */}
      {status === 'loading' && (
        <div
          className={`absolute inset-0 flex items-center justify-center ${radiusClass}`}
          style={{ background: 'var(--ds-surface-inset)' }}
        >
          {placeholder || (
            <div className="animate-pulse w-full h-full" style={{ background: 'var(--ds-surface-panel)' }} />
          )}
        </div>
      )}

      {/* Error Fallback */}
      {status === 'error' && (
        <div
          className={`absolute inset-0 flex items-center justify-center ${radiusClass}`}
          style={{ background: 'var(--ds-surface-inset)', color: 'var(--ds-color-text-secondary)' }}
        >
          {fallback || <DefaultFallbackIcon />}
        </div>
      )}

      {/* Main Image */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={lazy ? 'lazy' : 'eager'}
        onLoad={handleLoad}
        onError={handleError}
        className={imageClasses}
        style={{ objectPosition }}
      />

      {/* Hover Overlay */}
      {hoverOverlay && isHovered && (
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${radiusClass}`} style={{ background: 'var(--ds-color-alpha-black-40)' }}>
          {hoverOverlay}
        </div>
      )}

      {/* Zoom indicator for zoomable images */}
      {zoomable && isHovered && (
        <div className="absolute bottom-2 right-2 p-1.5 rounded-full" style={{ background: 'var(--ds-color-alpha-black-50)', color: 'var(--ds-color-white)' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
          </svg>
        </div>
      )}
    </div>
  );
}

ModernImage.displayName = 'ModernImage';
