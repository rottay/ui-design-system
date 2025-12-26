/**
 * Image - Titan Engine (Ant Design)
 *
 * Uses Ant Design's Image component with preview functionality
 * and built-in loading states.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Image as AntImage } from 'antd';
import type { ImageProps } from '../../types';
import { IMAGE_DEFAULTS, RADIUS_MAP } from '../../types';
import type { ImageRadius } from '../../types';

/**
 * Titan (Ant Design) implementation of the Image component.
 *
 * Features:
 * - Built-in preview/lightbox functionality
 * - Loading placeholder support
 * - Error fallback handling
 * - Responsive sizing
 *
 * @example
 * ```tsx
 * <TitanImage
 *   src="/photo.jpg"
 *   alt="Photo description"
 *   width={400}
 *   height={300}
 *   zoomable
 * />
 * ```
 */
export default function TitanImage(props: ImageProps): React.ReactElement {
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

  const [hasError, setHasError] = useState(false);

  // Reset error state when src changes
  useEffect(() => {
    setHasError(false);
  }, [src]);

  /**
   * Handles image load error.
   * Returns false to prevent Ant Design's default error handling.
   */
  const handleError = (event?: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    if (onError && event) {
      onError(event);
    }
    return false;
  };

  /**
   * Handles successful image load.
   */
  const handleLoad = () => {
    onLoad?.();
  };

  // Get radius CSS value
  const radiusValue = RADIUS_MAP[radius] || RADIUS_MAP.none;

  // Compute container styles
  const containerStyle: React.CSSProperties = {
    borderRadius: radiusValue,
    border: bordered ? '1px solid var(--color-border, rgba(0, 0, 0, 0.1))' : 'none',
    boxShadow: shadow ? 'var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1))' : 'none',
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

  // Default placeholder content
  const placeholderContent = placeholder || (
    <div
      style={{
        width: typeof width === 'number' ? width : '100%',
        height: typeof height === 'number' ? height : '100%',
        backgroundColor: 'var(--color-neutral-200, #e5e5e5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span style={{ color: 'var(--color-neutral-400, #a3a3a3)' }}>Loading...</span>
    </div>
  );

  // Default fallback content
  const fallbackContent = fallback ? (
    typeof fallback === 'string' ? fallback : undefined
  ) : undefined;

  return (
    <div
      className={`rottay-image-titan ${className}`}
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

TitanImage.displayName = 'TitanImage';
