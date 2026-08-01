/**
 * @fileoverview Avatar.Fallback compound component.
 * Provides graceful degradation when an avatar image source is missing or
 * fails to load, rendering caller-supplied fallback content instead.
 * Accessed via `Avatar.Fallback` dot-notation in consumer code.
 */

'use client';

import React, { useState } from 'react';
import type { ReactNode, CSSProperties } from 'react';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

/** Accessible-name floor for a nameless avatar image; the i18n catalogue
 * (`avatar.image_alt`, all five locales) wins when a provider is mounted,
 * the English floor keeps standalone renders honest. */
const IMG_ALT = { key: 'avatar.image_alt', fallback: 'Avatar' };

export interface AvatarFallbackProps {
  /** Image URL to attempt loading. When absent or broken, `fallback` is shown. */
  src?: string;
  /** Alt text for the `<img>` element (defaults to the localized `avatar.image_alt` floor). */
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
  // Optional provider + English floor, the same idiom as the engine's status
  // names: bare compositions (tests, lightweight consumers) must not crash.
  const i18n = useOptionalTranslation('components');

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
      <div className={`rottay-avatar-fallback ${className}`} data-part="fallback" style={style}>
        {fallback}
      </div>
    );
  }

  return (
    <img
      data-part="img"
      src={src}
      alt={alt || i18n?.tOr(IMG_ALT.key, IMG_ALT.fallback) || IMG_ALT.fallback}
      onError={handleError}
      style={imgStyle}
      className={className}
    />
  );
}

AvatarFallback.displayName = 'Avatar.Fallback';
