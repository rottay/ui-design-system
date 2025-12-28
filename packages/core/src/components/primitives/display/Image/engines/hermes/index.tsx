/**
 * @fileoverview Image Hermes Engine - Rottay Design System
 * @description Tailwind/DaisyUI-based image with utility-first styling.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine uses Tailwind CSS utilities and DaisyUI patterns for
 * lightweight, responsive image rendering with hover effects.
 *
 * **Implementation Details:**
 * - Uses Tailwind `object-*` classes for fit modes
 * - Uses `rounded-*` classes for border radius
 * - Uses `animate-pulse` for loading skeleton
 * - Smooth opacity transitions on load
 *
 * **Tailwind Classes:**
 * - `rounded-none/sm/md/lg/full` - Border radius
 * - `object-cover/contain/fill` - Object fit
 * - `shadow-md` - Drop shadow
 * - `border border-base-300` - Border styling
 *
 * @example Basic Usage
 * ```tsx
 * import { Image } from '@rottay/design-system';
 *
 * <Image engine="hermes" src="/photo.jpg" alt="Photo" radius="lg" />
 * ```
 *
 * @example With Hover Effect
 * ```tsx
 * <Image
 *   engine="hermes"
 *   src="/photo.jpg"
 *   alt="Photo"
 *   shadow
 *   hoverOverlay={<span className="text-white">View</span>}
 * />
 * ```
 *
 * @see {@link Image} for the main component
 * @see {@link https://tailwindcss.com/docs/object-fit} Tailwind Object Fit
 * @module HermesImage
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { ImageProps } from '../../types';
import { IMAGE_DEFAULTS } from '../../types';
import type { ImageRadius, ImageStatus } from '../../types';

/**
 * Maps radius prop to Tailwind CSS classes.
 */
const RADIUS_CLASS_MAP: Record<ImageRadius, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

/**
 * Hermes (DaisyUI/Tailwind) implementation of the Image component.
 *
 * Features:
 * - Tailwind CSS utility classes
 * - DaisyUI component patterns
 * - Smooth loading transitions
 * - Responsive design utilities
 *
 * @example
 * ```tsx
 * <HermesImage
 *   src="/photo.jpg"
 *   alt="Photo description"
 *   width={400}
 *   height={300}
 *   radius="lg"
 *   shadow
 * />
 * ```
 */
export default function HermesImage(props: ImageProps): React.ReactElement {
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

  // Build Tailwind class names
  const radiusClass = RADIUS_CLASS_MAP[radius] || RADIUS_CLASS_MAP.none;

  const containerClasses = [
    'relative',
    'inline-block',
    'overflow-hidden',
    radiusClass,
    bordered && 'border border-base-300',
    shadow && 'shadow-md',
    (onClick || zoomable) && 'cursor-pointer',
    'transition-all',
    'duration-300',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Object fit Tailwind classes
  const objectFitClass = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
    none: 'object-none',
    'scale-down': 'object-scale-down',
  }[objectFit] || 'object-cover';

  // Image classes
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
    ...style,
  };

  // Default fallback icon component
  const DefaultFallbackIcon = () => (
    <svg
      className="w-12 h-12 text-base-content/30"
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Loading Placeholder */}
      {status === 'loading' && (
        <div className={`absolute inset-0 flex items-center justify-center bg-base-200 ${radiusClass}`}>
          {placeholder || (
            <div className="animate-pulse w-full h-full bg-base-300" />
          )}
        </div>
      )}

      {/* Error Fallback */}
      {status === 'error' && (
        <div className={`absolute inset-0 flex items-center justify-center bg-base-200 text-base-content/50 ${radiusClass}`}>
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
        <div className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity duration-200 ${radiusClass}`}>
          {hoverOverlay}
        </div>
      )}

      {/* Zoom indicator for zoomable images */}
      {zoomable && isHovered && (
        <div className="absolute bottom-2 right-2 p-1.5 bg-black/50 rounded-full text-white">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
          </svg>
        </div>
      )}
    </div>
  );
}

HermesImage.displayName = 'HermesImage';
