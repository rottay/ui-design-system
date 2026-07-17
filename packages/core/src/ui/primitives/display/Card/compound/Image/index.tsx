/**
 * @fileoverview Card.Image Compound - Rottay Design System
 * @description Cover image for Card with overlay and loading states.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * The CardImage provides image display with automatic loading states,
 * error handling, gradient overlays, and custom overlay content.
 *
 * **Position Options:**
 * - `top` - Image at card top (default)
 * - `bottom` - Image at card bottom
 * - `cover` - Full card background
 *
 * **Features:**
 * - Automatic loading spinner
 * - Error state with placeholder icon
 * - Gradient overlay for text readability
 * - Custom overlay content slot
 * - Smooth fade-in animation
 *
 * @example Basic Image
 * ```tsx
 * <Card.Image src="/photo.jpg" alt="Product" />
 * ```
 *
 * @example With Gradient Overlay
 * ```tsx
 * <Card.Image
 *   src="/hero.jpg"
 *   alt="Hero"
 *   gradient
 *   height={300}
 * />
 * ```
 *
 * @example Custom Overlay
 * ```tsx
 * <Card.Image
 *   src="/product.jpg"
 *   alt="Product"
 *   overlay={<Badge variant="success">New</Badge>}
 * />
 * ```
 *
 * @see {@link Card} for the main component
 * @module CardImage
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { useState } from 'react';
import type { CSSProperties } from 'react';
import type { CardImageProps } from '../../contracts';

/**
 * Border radius to CSS value mapping.
 * @internal
 */
const RADIUS_MAP: Record<string, string> = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '12px',
  inherit: 'inherit',
};

/**
 * Card image compound component.
 * Displays images within cards with support for overlays, gradients, and loading states.
 *
 * Features:
 * - Automatic loading state with spinner
 * - Error state with placeholder icon
 * - Gradient overlay for text readability
 * - Custom overlay content support
 * - Configurable positioning (top, bottom, cover)
 * - Smooth fade-in animation on load
 *
 * @component
 * @example
 * // Basic usage
 * <Card.Image src="/photo.jpg" alt="Product photo" />
 *
 * @example
 * // With gradient overlay for text
 * <Card.Image
 *   src="/hero.jpg"
 *   alt="Hero image"
 *   gradient
 *   height={300}
 * />
 *
 * @example
 * // With custom overlay content
 * <Card.Image
 *   src="/product.jpg"
 *   alt="Product"
 *   overlay={
 *     <Badge variant="success">New</Badge>
 *   }
 * />
 *
 * @example
 * // As full card cover
 * <Card.Image
 *   src="/background.jpg"
 *   alt="Background"
 *   position="cover"
 *   gradient
 * />
 *
 * @param {CardImageProps} props - Component properties
 * @returns {React.ReactElement} The rendered CardImage component
 */
export function CardImage({
  src,
  alt,
  height = 200,
  objectFit = 'cover',
  position = 'top',
  overlay,
  gradient = false,
  radius = 'inherit',
  onLoad,
  onError,
  className = '',
  style,
}: CardImageProps): React.ReactElement {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  /**
   * Handles successful image load
   */
  const handleLoad = () => {
    setImageLoaded(true);
    onLoad?.();
  };

  /**
   * Handles image load error
   */
  const handleError = () => {
    setImageError(true);
    onError?.(new Error('Failed to load image'));
  };

  // `radius` passes an unrecognised value straight through, so the resolved radius
  // is an open string no rule can enumerate; card-compounds.css reads it as a custom
  // property and overrides the corner pair each position rounds.
  const containerStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    height: typeof height === 'number' ? `${height}px` : height,
    overflow: 'hidden',
    '--ds-card-image-radius': RADIUS_MAP[radius] || radius,
    ...(position === 'cover' && {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      height: '100%',
      zIndex: 0,
    }),
    ...style,
  } as CSSProperties;

  const imageStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit,
    objectPosition: 'center',
    display: 'block',
    transition: 'opacity 0.3s ease',
    opacity: imageLoaded ? 1 : 0,
  };

  const placeholderStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const overlayStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  };

  const gradientStyle: CSSProperties = gradient ? {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  } : {};

  return (
    <div
      className={`rottay-card-image ${className}`}
      data-part="image"
      data-position={position}
      style={containerStyle}
    >
      {/* Placeholder shown while loading or on error */}
      {(!imageLoaded || imageError) && (
        <div data-part="placeholder" style={placeholderStyle}>
          {imageError ? (
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
              data-part="error-icon"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          ) : (
            <div
              className="rottay-card-image-loading"
              data-part="spinner"
              style={{
                width: '40px',
                height: '40px',
                animation: 'ds-card-image-spin 1s linear infinite',
              }}
            />
          )}
        </div>
      )}

      {/* Actual image */}
      {!imageError && (
        <img
          data-part="img"
          src={src}
          alt={alt}
          style={imageStyle}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}

      {/* Gradient overlay */}
      {gradient && <div data-part="gradient" style={gradientStyle} aria-hidden="true" />}

      {/* Custom overlay content */}
      {overlay && (
        <div className="rottay-card-image-overlay" data-part="overlay" style={overlayStyle}>
          {overlay}
        </div>
      )}
    </div>
  );
}

CardImage.displayName = 'Card.Image';
