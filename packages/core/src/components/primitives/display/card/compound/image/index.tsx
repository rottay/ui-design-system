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
 * - `start` / `end` - Logical inline positions that follow writing direction
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
 *   overlay={<Badge variant="success">New</badge>}
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
import { ContentImageIcon } from '@/graphics/icons/semantic/generated/roles/content-image';

export function CardImage({
  src,
  alt,
  errorLabel,
  loadingLabel,
  height,
  aspectRatio,
  objectFit,
  position = 'top',
  overlay,
  gradient = false,
  radius = 'inherit',
  onLoad,
  onError,
  className = '',
  style,
  ...rest
}: CardImageProps): React.ReactElement {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const logicalPosition = position === 'left'
    ? 'start'
    : position === 'right'
      ? 'end'
      : position;

  const handleLoad = () => {
    setImageLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setImageError(true);
    onError?.(new Error('Failed to load image'));
  };

  const hasHeight = position !== 'cover' && height !== undefined && height !== null;
  // Only runtime-computed channels travel inline: the caller's block size and
  // aspect ratio are open values the skin reads back.
  const containerStyle = {
    ...(hasHeight ? { '--ds-card-image-block-size': typeof height === 'number' ? `${height}px` : height } : {}),
    ...(aspectRatio ? { '--ds-card-image-aspect-ratio': aspectRatio } : {}),
    ...style,
  } as CSSProperties;

  return (
    <div
      {...rest}
      className={['ds-card-image', className].filter(Boolean).join(' ')}
      data-part="image"
      data-position={logicalPosition}
      data-sizing={!hasHeight && aspectRatio ? 'aspect' : undefined}
      data-fit={objectFit}
      data-radius={radius}
      data-loaded={imageLoaded && !imageError ? 'true' : 'false'}
      data-error={imageError ? 'true' : 'false'}
      data-gradient={gradient ? 'true' : 'false'}
      style={containerStyle}
    >
      {(!imageLoaded || imageError) && (
        <div
          data-part="placeholder"
          role={imageError || loadingLabel ? 'status' : undefined}
          aria-live={imageError || loadingLabel ? 'polite' : undefined}
          aria-label={imageError ? (errorLabel ?? alt) : loadingLabel}
          aria-hidden={!imageError && !loadingLabel ? 'true' : undefined}
        >
          {imageError ? (
            <span data-part="error-icon" aria-hidden="true">
              <ContentImageIcon decorative size="2xl" />
            </span>
          ) : (
            <span data-part="spinner" aria-hidden="true" />
          )}
        </div>
      )}

      {!imageError && (
        <img
          data-part="img"
          src={src}
          alt={alt}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
        />
      )}

      {gradient && <div data-part="gradient" aria-hidden="true" />}

      {overlay && (
        <div data-part="overlay">
          {overlay}
        </div>
      )}
    </div>
  );
}

CardImage.displayName = 'Card.Image';
