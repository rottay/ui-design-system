'use client';

import React, { forwardRef } from 'react';
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
      loading,
      fallbackSrc,
      fallback,
      showSkeleton,
      radius,
      onError,
      onLoad,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const handleError = () => {
      if (onError) {
        onError(new Error('Failed to load image'));
      }
    };

    return (
      <AntImage
        ref={ref as any}
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
        {...props}
      />
    );
  }
);

TitanImage.displayName = 'TitanImage';
