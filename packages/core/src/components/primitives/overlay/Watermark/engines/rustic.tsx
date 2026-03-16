'use client';

/**
 * @fileoverview Watermark Rustic Engine - Rottay Design System
 * @description Rustic (Pure HTML/CSS) implementation of the Watermark component.
 * Uses canvas for pattern generation with inline CSS for positioning.
 *
 * @remarks
 * The Rustic engine provides:
 * - Pure inline CSS with no external dependencies
 * - Canvas-based watermark pattern generation
 * - Full offset support for precise positioning
 * - Device pixel ratio support for retina displays
 * - SSR-safe with typeof document check
 *
 * Implementation details:
 * - useEffect generates canvas pattern on prop changes
 * - SSR guard prevents document access on server
 * - backgroundPosition uses offset prop for positioning
 * - Image crossOrigin set for external images
 *
 * This implementation is ideal for:
 * - Embedded applications without CSS framework dependencies
 * - Server-side rendering without CSS extraction
 * - Maximum browser compatibility scenarios
 *
 * @example Using Rustic Engine
 * ```tsx
 * import { Watermark } from '@rottay/design-system';
 *
 * <Watermark
 *   engine="rustic"
 *   content="Confidential"
 *   offset={[20, 20]}
 *   zIndex={100}
 * >
 *   <div>Sensitive document</div>
 * </Watermark>
 * ```
 *
 * @see {@link Watermark} - The main engine-aware component
 * @module Watermark/Engines/Rustic
 * @category Overlay
 * @package @rottay/design-system
 */
import React, { useEffect, useState } from 'react';
import type { WatermarkProps } from '../Watermark.types';
import { WATERMARK_DEFAULTS } from '../Watermark.types';

/**
 * Rustic engine implementation of Watermark using vanilla HTML/CSS.
 *
 * Features:
 * - Zero external dependencies (no UI library required)
 * - Canvas-based watermark pattern generation
 * - Full offset support for precise positioning
 * - Device pixel ratio support for retina displays
 *
 * @component
 * @example
 * ```tsx
 * <Watermark content="Confidential" engine="rustic">
 *   <div>Sensitive content</div>
 * </Watermark>
 * ```
 *
 * @param props - Watermark configuration props
 * @param ref - Forwarded ref to the container div
 * @returns Watermarked content using vanilla HTML/CSS
 */
export const Watermark = React.forwardRef<HTMLDivElement, WatermarkProps>(
  (props, ref) => {
    const {
      content,
      image,
      width = 120,
      height = 64,
      rotate = WATERMARK_DEFAULTS.rotate,
      gap = WATERMARK_DEFAULTS.gap,
      offset = WATERMARK_DEFAULTS.offset,
      zIndex = WATERMARK_DEFAULTS.zIndex,
      font = WATERMARK_DEFAULTS.font,
      children,
      className,
      style,
    } = props;

    const [backgroundImage, setBackgroundImage] = useState<string>('');

    // Generate a repeating watermark tile on an off-screen canvas each time
    // visual parameters change. The tile is exported as a data URL and applied
    // as a CSS background-image on the overlay div.
    useEffect(() => {
      // SSR guard -- canvas API is only available in the browser
      if (typeof document === 'undefined') return;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Scale by devicePixelRatio so the watermark stays crisp on retina displays
      const ratio = window.devicePixelRatio || 1;
      const canvasWidth = (width + gap![0]) * ratio;
      const canvasHeight = (height + gap![1]) * ratio;

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Center the origin then rotate so the watermark text/image is drawn at an angle
      ctx.translate(canvasWidth / 2, canvasHeight / 2);
      ctx.rotate((rotate! * Math.PI) / 180);

      if (image) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          ctx.drawImage(img, -width / 2, -height / 2, width, height);
          setBackgroundImage(`url(${canvas.toDataURL()})`);
        };
        img.src = image;
      } else if (content) {
        // Merge user-provided font overrides with defaults for consistent fallback
        const mergedFont = { ...WATERMARK_DEFAULTS.font, ...font };
        ctx.font = `${mergedFont.fontStyle} ${mergedFont.fontWeight} ${mergedFont.fontSize! * ratio}px ${mergedFont.fontFamily}`;
        ctx.fillStyle = mergedFont.color!;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Support multi-line watermarks when content is an array of strings
        const lines = Array.isArray(content) ? content : [content];
        const lineHeight = mergedFont.fontSize! * 1.5 * ratio;
        const startY = -((lines.length - 1) * lineHeight) / 2;

        lines.forEach((line, index) => {
          ctx.fillText(line, 0, startY + index * lineHeight);
        });

        setBackgroundImage(`url(${canvas.toDataURL()})`);
      }
    }, [content, image, width, height, rotate, gap, font]);

    return (
      <div
        ref={ref}
        className={className}
        style={{
          position: 'relative',
          ...style,
        }}
      >
        {children}
        {/* Non-interactive overlay renders the repeating watermark pattern via CSS background.
            backgroundPosition uses the offset prop for fine-grained initial placement. */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            backgroundImage,
            backgroundRepeat: 'repeat',
            backgroundPosition: `${offset![0]}px ${offset![1]}px`,
            zIndex,
          }}
        />
      </div>
    );
  }
);

Watermark.displayName = 'Watermark.Rustic';

export default Watermark;
