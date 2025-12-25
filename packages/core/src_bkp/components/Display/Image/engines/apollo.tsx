/**
 * Apollo Image Engine
 *
 * Native HTML + Tailwind CSS image implementation.
 * Zero external dependencies, minimal bundle size.
 * Optional lightbox preview support.
 */

'use client';

import { useState, useEffect } from 'react';
import type { ImageProps } from '../../../../types/components/image';
import { cn } from '../../../../utils/cn';

// Map unified fit to CSS object-fit values
const fitStyles: Record<string, string> = {
  contain: 'object-contain',
  cover: 'object-cover',
  fill: 'object-fill',
  none: 'object-none',
  'scale-down': 'object-scale-down',
};

/**
 * Apollo Image - Native HTML + Tailwind implementation
 */
function ApolloImage({
  src,
  alt,
  width,
  height,
  fallback,
  placeholder,
  preview,
  loading = 'lazy',
  className,
  rootClassName,
  style,
  rootStyle,
  onLoad,
  onError,
  fit = 'cover',
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
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoaded, setIsLoaded] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Update image src when prop changes
  useEffect(() => {
    setImageSrc(src);
    setImageError(false);
    setIsLoaded(false);
  }, [src]);

  // Determine current src (fallback on error)
  const currentSrc = imageError && fallback ? fallback : imageSrc;

  // Handle image error
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setImageError(true);
    // If fallback exists, show it
    if (fallback) {
      setImageSrc(fallback);
    }
    // Call user's onError handler if provided
    onError?.(event);
  };

  // Handle image load
  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true);
    onLoad?.(event);
  };

  // Determine if preview is enabled
  const previewEnabled = preview === true || (typeof preview === 'object' && preview !== null);

  // Handle preview click
  const handlePreviewClick = () => {
    if (previewEnabled) {
      setPreviewOpen(true);
      // If preview config has onVisibleChange, call it
      if (typeof preview === 'object' && preview.onVisibleChange) {
        preview.onVisibleChange(true);
      }
    }
  };

  // Handle preview close
  const handlePreviewClose = () => {
    setPreviewOpen(false);
    // If preview config has onVisibleChange, call it
    if (typeof preview === 'object' && preview.onVisibleChange) {
      preview.onVisibleChange(false);
    }
  };

  // Get preview zIndex
  const previewZIndex =
    typeof preview === 'object' && preview.zIndex ? preview.zIndex : 1000;

  // Determine fit class
  const fitClass = fitStyles[fit] || fitStyles.cover;

  return (
    <>
      {/* Root container */}
      <div
        className={cn('relative inline-block', rootClassName)}
        style={rootStyle}
      >
        {/* Placeholder (shown while loading) */}
        {!isLoaded && placeholder && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            {typeof placeholder === 'string' ? (
              <img
                src={placeholder}
                alt="Loading..."
                className={cn('w-full h-full', fitClass)}
              />
            ) : (
              placeholder
            )}
          </div>
        )}

        {/* Main image */}
        <img
          src={currentSrc}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt ?? ''}
          width={width}
          height={height}
          loading={loading}
          onLoad={handleImageLoad}
          onError={handleImageError}
          onClick={previewEnabled ? handlePreviewClick : undefined}
          className={cn(
            'block',
            fitClass,
            previewEnabled && 'cursor-pointer hover:opacity-90 transition-opacity',
            className
          )}
          style={style}
          title={title}
          crossOrigin={crossOrigin}
          decoding={decoding}
          referrerPolicy={referrerPolicy}
          useMap={useMap}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedby}
          role={role}
        />

        {/* Preview mask overlay (shown on hover when preview enabled) */}
        {previewEnabled && isLoaded && (
          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer bg-black/40"
            onClick={handlePreviewClick}
          >
            {typeof preview === 'object' && preview.mask ? (
              preview.mask
            ) : (
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                />
              </svg>
            )}
          </div>
        )}
      </div>

      {/* Lightbox preview modal */}
      {previewEnabled && previewOpen && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center"
          style={{ zIndex: previewZIndex }}
          onClick={handlePreviewClose}
        >
          {/* Close button */}
          <button
            type="button"
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            onClick={handlePreviewClose}
            aria-label="Close preview"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Preview image */}
          <img
            src={currentSrc}
            alt={alt ?? ''}
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

ApolloImage.displayName = 'ApolloImage';

export default ApolloImage;
