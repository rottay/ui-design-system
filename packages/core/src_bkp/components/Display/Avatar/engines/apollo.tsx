/**
 * Apollo Avatar Engine
 *
 * Native HTML + Tailwind CSS avatar implementation.
 * Zero external dependencies, minimal bundle size.
 */

'use client';

import { useState } from 'react';
import type { AvatarProps } from '../../../../types/components/avatar';
import { cn } from '../../../../utils/cn';

// Size mappings for avatar dimensions
const sizeStyles = {
  small: 'w-8 h-8 text-xs',
  default: 'w-10 h-10 text-sm',
  large: 'w-12 h-12 text-base',
};

// Icon size mappings
const iconSizeStyles = {
  small: 'w-4 h-4',
  default: 'w-5 h-5',
  large: 'w-6 h-6',
};

/**
 * Apollo Avatar - Native HTML + Tailwind implementation
 */
function ApolloAvatar({
  src,
  srcSet,
  alt,
  size = 'default',
  shape = 'circle',
  icon,
  children,
  className,
  style,
  onError,
  'aria-label': ariaLabel,
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);

  // Determine size class - support both preset and numeric sizes
  const sizeClass =
    typeof size === 'number'
      ? ''
      : sizeStyles[size as keyof typeof sizeStyles] || sizeStyles.default;

  const iconSizeClass =
    typeof size === 'number'
      ? ''
      : iconSizeStyles[size as keyof typeof iconSizeStyles] || iconSizeStyles.default;

  // Custom size style for numeric sizes
  const customSizeStyle =
    typeof size === 'number'
      ? {
          width: `${size}px`,
          height: `${size}px`,
          fontSize: `${size / 2.5}px`,
        }
      : {};

  // Determine shape class
  const shapeClass = shape === 'square' ? 'rounded-md' : 'rounded-full';

  // Handle image error - call onError and set error state
  const handleImageError = () => {
    setImageError(true);
    // Call user's onError handler if provided
    const result = onError?.();
    // If onError returns false, keep showing broken image
    if (result === false) {
      return;
    }
    // Otherwise, clear the src to show fallback
    setImageSrc(undefined);
  };

  // Determine what content to show
  const showImage = imageSrc && !imageError;
  const showFallback = !showImage;

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center overflow-hidden bg-gray-200 text-gray-600 font-medium select-none',
        sizeClass,
        shapeClass,
        className
      )}
      style={{ ...customSizeStyle, ...style }}
      aria-label={ariaLabel}
    >
      {/* Image content */}
      {showImage && (
        <img
          src={imageSrc}
          srcSet={srcSet}
          alt={alt || ''}
          onError={handleImageError}
          className="w-full h-full object-cover"
          draggable={false}
        />
      )}

      {/* Fallback content (icon or children) */}
      {showFallback && (
        <>
          {icon && (
            <span
              className={cn(
                'inline-flex items-center justify-center',
                typeof size === 'number' ? '' : iconSizeClass
              )}
              style={
                typeof size === 'number'
                  ? { width: `${size / 2}px`, height: `${size / 2}px` }
                  : undefined
              }
            >
              {icon}
            </span>
          )}
          {!icon && children && (
            <span className="inline-flex items-center justify-center uppercase">
              {children}
            </span>
          )}
          {!icon && !children && (
            <svg
              className={cn('text-gray-400', iconSizeClass)}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </>
      )}
    </div>
  );
}

ApolloAvatar.displayName = 'ApolloAvatar';

export default ApolloAvatar;
