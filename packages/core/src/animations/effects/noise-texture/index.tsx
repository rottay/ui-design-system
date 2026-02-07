'use client';

import React from 'react';
import type { NoiseTextureProps } from '../../types';

export const NoiseTexture: React.FC<NoiseTextureProps> = ({
  opacity = 0.03,
  children,
  className,
  style,
}) => {
  return (
    <div className={className} style={{ position: 'relative', ...style }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity, pointerEvents: 'none', zIndex: 1 }}>
        <filter id="ds-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#ds-noise)" />
      </svg>
      <div style={{ position: 'relative', zIndex: 2 }}>{children}</div>
    </div>
  );
};

NoiseTexture.displayName = 'NoiseTexture';
