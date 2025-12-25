/**
 * Avatar.Fallback - Compound Component
 * Displays fallback content when image fails to load
 */

'use client';

import React, { useState } from 'react';
import type { ReactNode, CSSProperties } from 'react';

export interface AvatarFallbackProps {
  src?: string;
  alt?: string;
  fallback: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function AvatarFallback({
  src,
  alt,
  fallback,
  className = '',
  style,
}: AvatarFallbackProps): React.ReactElement {
  const [error, setError] = useState(false);

  const handleError = () => {
    setError(true);
  };

  const imgStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

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
