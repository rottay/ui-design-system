/**
 * Hermes Avatar Engine
 *
 * DaisyUI avatar implementation with unified AvatarProps.
 */

'use client';

import { useState } from 'react';
import type { AvatarProps } from '../../../../types/components/avatar';

// Map unified size to DaisyUI size classes
const sizeClasses = {
  small: 'w-8',
  default: 'w-10',
  large: 'w-12',
};

/**
 * Hermes Avatar - DaisyUI implementation with unified AvatarProps
 */
function HermesAvatar({
  src,
  srcSet,
  alt,
  size = 'default',
  shape = 'circle',
  icon,
  children,
  className = '',
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
      : sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.default;

  // Custom size style for numeric sizes
  const customSizeStyle =
    typeof size === 'number'
      ? {
          width: `${size}px`,
          height: `${size}px`,
        }
      : {};

  // Handle image error
  const handleImageError = () => {
    setImageError(true);
    const result = onError?.();
    if (result === false) {
      return;
    }
    setImageSrc(undefined);
  };

  // Determine what content to show
  const showImage = imageSrc && !imageError;
  const showFallback = !showImage;

  // Build DaisyUI classes
  const avatarClasses = ['avatar', className].filter(Boolean).join(' ');

  const innerClasses = [
    sizeClass,
    shape === 'square' ? 'rounded-btn' : 'rounded-full',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={avatarClasses} style={style} aria-label={ariaLabel}>
      <div className={innerClasses} style={customSizeStyle}>
        {/* Image content */}
        {showImage && (
          <img src={imageSrc} srcSet={srcSet} alt={alt || ''} onError={handleImageError} />
        )}

        {/* Fallback content */}
        {showFallback && (
          <>
            {icon && <span className="flex items-center justify-center w-full h-full">{icon}</span>}
            {!icon && children && (
              <div className="flex items-center justify-center w-full h-full bg-neutral text-neutral-content">
                <span className="text-xs uppercase">{children}</span>
              </div>
            )}
            {!icon && !children && (
              <div className="flex items-center justify-center w-full h-full bg-neutral text-neutral-content">
                <svg className="w-1/2 h-1/2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

HermesAvatar.displayName = 'HermesAvatar';

export default HermesAvatar;
