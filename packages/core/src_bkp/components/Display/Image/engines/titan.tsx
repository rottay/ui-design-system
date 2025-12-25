/**
 * Titan Image Engine
 *
 * Adapter that converts unified ImageProps to Ant Design Image.
 * Supports full preview/lightbox functionality.
 */

'use client';

import { Image as AntImage } from 'antd';
import type { ImageProps } from '../../../../types/components/image';

/**
 * Titan Image - Ant Design implementation with unified ImageProps
 */
function TitanImage({
  src,
  alt,
  width,
  height,
  fallback,
  placeholder,
  preview,
  loading,
  className,
  rootClassName,
  style,
  rootStyle,
  onLoad,
  onError,
  fit,
  title,
  crossOrigin,
  decoding,
  referrerPolicy,
  sizes,
  srcSet,
  useMap,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  role,
}: ImageProps) {
  // Map unified fit to AntD's preview prop structure
  const objectFit = fit;

  return (
    <AntImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      fallback={fallback}
      placeholder={placeholder}
      preview={preview}
      className={className}
      rootClassName={rootClassName}
      style={{ objectFit, ...style }}
      rootStyle={rootStyle}
      onLoad={onLoad}
      onError={onError}
      loading={loading}
      // HTML attributes
      title={title}
      crossOrigin={crossOrigin}
      decoding={decoding}
      referrerPolicy={referrerPolicy}
      sizes={sizes}
      srcSet={srcSet}
      useMap={useMap}
      // Accessibility
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedby}
      role={role}
    />
  );
}

TitanImage.displayName = 'TitanImage';

export default TitanImage;
