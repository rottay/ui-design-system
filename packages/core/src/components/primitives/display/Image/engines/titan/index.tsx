'use client';

import { forwardRef } from 'react';
import { Image as AntImage } from 'antd';
import type { ImageProps } from '../../types';

/**
 * Titan (Ant Design) implementation of Image component.
 *
 * Uses Ant Design's Image with preview and loading states.
 */
export const TitanImage = forwardRef<HTMLImageElement, ImageProps>(
  (
    {
      src,
      alt,
      width,
      height,
      fit = 'cover',
      loading: _loading,
      fallbackSrc,
      fallback,
      showSkeleton: _showSkeleton,
      radius: _radius,
      onError,
      onLoad,
      className,
      style,
    },
    _ref
  ) => {
    const handleError = () => {
      if (onError) {
        onError(new Error('Failed to load image'));
      }
    };

    // Note: AntImage doesn't support ref directly
    return (
      <AntImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        preview={false}
        fallback={fallbackSrc || (fallback as any)}
        style={{
          objectFit: fit,
          ...style,
        }}
        onError={handleError}
        onLoad={onLoad}
        className={className}
      />
    );
  }
);

TitanImage.displayName = 'TitanImage';
