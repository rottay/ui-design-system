'use client';

/**
 * @fileoverview NoiseTexture - Rottay Design System
 *
 * Overlays a procedural film-grain texture on top of child content using an
 * SVG `<feTurbulence>` filter. The noise is generated entirely in the browser
 * (no image assets), desaturated to grayscale via `<feColorMatrix>`, and
 * rendered at a very low opacity (default 3%) so it adds tactile depth to
 * flat surfaces without obscuring text or interactive elements.
 *
 * @example
 * <NoiseTexture opacity={0.05}>
 *   <GlassCard>Textured panel</GlassCard>
 * </NoiseTexture>
 */

import React from 'react';
import type { NoiseTextureProps } from '@/graphics/motion/foundation/contracts';

/**
 * Procedural film-grain overlay rendered via an SVG turbulence filter.
 * Purely decorative and non-interactive (pointerEvents: none).
 *
 * @param props - {@link NoiseTextureProps}
 * @param props.opacity - Visibility of the grain layer, 0-1 (default: 0.03).
 * @param props.children - Content displayed beneath the noise overlay at z-index 2.
 * @param props.className - Optional CSS class for the outer container.
 * @param props.style - Optional inline styles merged onto the outer container.
 * @returns A container with a procedural noise SVG overlay and child content.
 */
export const NoiseTexture: React.FC<NoiseTextureProps> = ({
  opacity = 0.03,
  children,
  className,
  style,
}) => {
  return (
    <div className={className} style={{ position: 'relative', ...style }}>
      {/* The SVG filter pipeline:
          1. feTurbulence generates Perlin fractal noise at baseFrequency 0.8 -
             high enough to produce fine grain rather than large cloud-like blobs.
             numOctaves=4 layers four frequencies for natural-looking variation.
             stitchTiles="stitch" ensures seamless tiling at element boundaries.
          2. feColorMatrix saturate=0 strips all color, producing pure grayscale
             noise that works on any background hue.
          The SVG sits at z-index 1; child content at z-index 2 renders on top. */}
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
