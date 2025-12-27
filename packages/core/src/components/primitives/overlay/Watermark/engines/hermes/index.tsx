'use client';

/**
 * Watermark - Hermes Engine (DaisyUI/Tailwind)
 *
 * Tailwind CSS implementation of the Watermark component.
 * Uses canvas for pattern generation with Tailwind utility classes for layout.
 *
 * @module WatermarkHermes
 */
import React, { useEffect, useState } from 'react';
import type { WatermarkProps } from '../../types';
import { WATERMARK_DEFAULTS } from '../../types';

/**
 * Hermes engine implementation of Watermark using Tailwind CSS.
 *
 * Features:
 * - Canvas-based watermark pattern generation
 * - Tailwind utility classes for positioning
 * - Device pixel ratio support for retina displays
 *
 * @component
 * @example
 * ```tsx
 * <Watermark content="Draft" engine="hermes">
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

    useEffect(() => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const ratio = window.devicePixelRatio || 1;
      const canvasWidth = (width + gap![0]) * ratio;
      const canvasHeight = (height + gap![1]) * ratio;

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

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
        const mergedFont = { ...WATERMARK_DEFAULTS.font, ...font };
        ctx.font = `${mergedFont.fontStyle} ${mergedFont.fontWeight} ${mergedFont.fontSize! * ratio}px ${mergedFont.fontFamily}`;
        ctx.fillStyle = mergedFont.color!;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

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
        className={`relative ${className || ''}`}
        style={style}
      >
        {children}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage,
            backgroundRepeat: 'repeat',
            zIndex,
          }}
        />
      </div>
    );
  }
);

Watermark.displayName = 'Watermark.Hermes';

export default Watermark;
