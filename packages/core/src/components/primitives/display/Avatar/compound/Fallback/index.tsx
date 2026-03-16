/**
 * @fileoverview Avatar.Fallback compound component.
 * Provides graceful degradation when an avatar image source is missing or
 * fails to load, rendering caller-supplied fallback content instead.
 * Accessed via `Avatar.Fallback` dot-notation in consumer code.
 */

'use client';

import React, { useState } from 'react';
import type { ReactNode, CSSProperties } from 'react';

export interface AvatarFallbackProps {
  /** Image URL to attempt loading. When absent or broken, `fallback` is shown. */
  src?: string;
  /** Alt text for the `<img>` element (defaults to "avatar"). */
  alt?: string;
  /** Content rendered when `src` is missing or the image fails to load (e.g. initials, icon). */
  fallback: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Avatar.Fallback -- conditionally renders either the avatar image or
 * user-provided fallback content (initials, icon, placeholder, etc.).
 *
 * Internally tracks image load failures via `useState`. Once the `<img>`
 * `onError` fires, the component permanently switches to the fallback
 * for the lifetime of the component instance.
 *
 * @param props - {@link AvatarFallbackProps}
 * @returns The loaded `<img>` element, or the fallback content if the image
 *          source is unavailable or broken.
 *
 * @example
 * ```tsx
 * <Avatar.Fallback
 *   src="/user-photo.jpg"
 *   alt="Jane Doe"
 *   fallback={<Text>JD</Text>}
 * />
 * ```
 */
export function AvatarFallback({
  src,
  alt,
  fallback,
  className = '',
  style,
}: AvatarFallbackProps): React.ReactElement {
  // Tracks whether the <img> fired an error event.
  const [error, setError] = useState(false);

  const handleError = () => {
    setError(true);
  };

  // The image fills its parent container; object-fit: cover prevents distortion.
  const imgStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  // Show fallback when there is no src at all, or when loading failed.
  if (!src || error) {
    return (
      <div className={`rottay-avatar-fallback ${className}`} style={style}>
        {fallback}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || 'avatar'}
      onError={handleError}
      style={imgStyle}
      className={className}
    />
  );
}

AvatarFallback.displayName = 'Avatar.Fallback';
