/**
 * @fileoverview Classic (Ant Design) engine for the Image display primitive.
 * Delegates to `antd/Image` to provide built-in preview/lightbox, loading
 * placeholders, and error fallback -- all themed via DS CSS variables.
 *
 * @example
 * ```tsx
 * <Image engine="classic" src="/photo.jpg" alt="Photo" zoomable />
 * ```
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Image as AntImage } from 'antd';
import type { ImageProps } from '../Image.types';
import { IMAGE_DEFAULTS, RADIUS_MAP } from '../Image.types';
import type { ImageRadius } from '../Image.types';

/**
 * Classic (Ant Design) Image engine. Wraps `antd/Image` with DS-level
 * border, shadow, and radius tokens, plus error/placeholder state management.
 *
 * @param props - Standard ImageProps shared across all engines.
 * @returns A themed `antd/Image` wrapped in a styled container div.
 */
export default function ClassicImage(props: ImageProps): React.ReactElement {
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
    className = '',
    style = {},
  } = props;

  // Track error so we can clear the src and let antd show its fallback
  const [hasError, setHasError] = useState(false);

  // Clear error when the consumer provides a new image source
  useEffect(() => {
    setHasError(false);
  }, [src]);

  // Return false to suppress antd's built-in broken-image fallback;
  // we manage fallback content ourselves via the `hasError` flag.
  const handleError = (event?: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    if (onError && event) {
      onError(event);
    }
    return false;
  };

  // Propagate the load event to the consumer callback
  const handleLoad = () => {
    onLoad?.();
  };

  // Resolve the token-based radius to a concrete CSS value
  const radiusValue = RADIUS_MAP[radius] || RADIUS_MAP.none;

  // Container wraps the antd Image to add DS-level border/shadow/radius
  const containerStyle: React.CSSProperties = {
    borderRadius: radiusValue,
    border: bordered ? '1px solid var(--ds-color-border, rgba(0, 0, 0, 0.1))' : 'none',
    boxShadow: shadow ? 'var(--ds-shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1))' : 'none',
    overflow: 'hidden',
    display: 'inline-block',
  };

  // Image styles
  const imageStyle: React.CSSProperties = {
    objectFit,
    objectPosition,
    borderRadius: radiusValue,
    cursor: onClick ? 'pointer' : undefined,
    ...style,
  };

  // Use consumer-provided placeholder or fall back to a neutral loading box
  const placeholderContent = placeholder || (
    <div
      style={{
        width: typeof width === 'number' ? width : '100%',
        height: typeof height === 'number' ? height : '100%',
        backgroundColor: 'var(--ds-color-neutral-200, #e5e5e5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span style={{ color: 'var(--ds-color-neutral-400, #a3a3a3)' }}>Loading...</span>
    </div>
  );

  // antd's fallback only accepts a string URL; ReactNode fallbacks are not supported here
  const fallbackContent = fallback ? (
    typeof fallback === 'string' ? fallback : undefined
  ) : undefined;

  return (
    <div
      className={`rottay-image-classic ${className}`}
      style={containerStyle}
      onClick={onClick}
    >
      <AntImage
        src={hasError ? undefined : src}
        alt={alt}
        width={width}
        height={height}
        preview={zoomable}
        loading={lazy ? 'lazy' : 'eager'}
        placeholder={placeholderContent}
        fallback={fallbackContent}
        style={imageStyle}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  );
}

ClassicImage.displayName = 'ClassicImage';
