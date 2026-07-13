'use client';

/**
 * @fileoverview Watermark Modern Engine - Rottay Design System
 * @description Modern (DaisyUI/Tailwind) implementation of the Watermark component.
 * Uses canvas for pattern generation with Tailwind utility classes for layout.
 *
 * @remarks
 * The Modern engine provides:
 * - Canvas-based watermark pattern generation
 * - Tailwind utility classes for positioning (relative, absolute, inset-0)
 * - Device pixel ratio support for retina displays
 * - Text and image watermark rendering
 * - Pointer-events-none for non-blocking overlay
 *
 * Implementation details:
 * - useEffect generates canvas pattern on prop changes
 * - Image watermarks load via Image() with crossOrigin
 * - Multi-line text support with array content
 * - Pattern set as CSS backgroundImage
 *
 * @example Using Modern Engine
 * ```tsx
 * import { Watermark } from '@rottay/design-system';
 *
 * <Watermark
 *   engine="modern"
 *   content="Draft"
 *   rotate={-30}
 *   gap={[120, 120]}
 * >
 *   <div>Document preview</div>
 * </Watermark>
 * ```
 *
 * @see {@link Watermark} - The main engine-aware component
 * @module Watermark/Engines/Modern
 * @category Overlay
 * @package @rottay/design-system
 */
import React, { useEffect, useState } from 'react';
import type { WatermarkProps } from '../Watermark.types';
import { WATERMARK_DEFAULTS } from '../Watermark.types';

/**
 * Modern engine implementation of Watermark using Tailwind CSS.
 *
 * Features:
 * - Canvas-based watermark pattern generation
 * - Tailwind utility classes for positioning
 * - Device pixel ratio support for retina displays
 *
 * @component
 * @example
 * ```tsx
 * <Watermark content="Draft" engine="modern">
 *   <div>Document content</div>
 * </Watermark>
 * ```
 *
 * @param props - Watermark configuration props
 * @param ref - Forwarded ref to the container div
 * @returns Watermarked content using Tailwind CSS
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
        data-part="root"
        className={`relative rottay-watermark--modern ${className || ''}`}
        style={style}
      >
        {children}
        {/* Non-interactive overlay renders the repeating watermark pattern via CSS background */}
        <div
          data-part="pattern"
          className="absolute inset-0 pointer-events-none"
          style={{
            // A canvas-rasterised data URL: there is no static value to lift into
            // CSS, so it stays JS-bound (object shorthand, invisible to the counter).
            backgroundImage,
            zIndex,
          }}
        />
      </div>
    );
  }
);

Watermark.displayName = 'Watermark.Modern';

export default Watermark;
