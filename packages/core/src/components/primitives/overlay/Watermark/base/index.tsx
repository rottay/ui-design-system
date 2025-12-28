/**
 * Watermark - Base Component
 *
 * Base implementation of the Watermark component using CSS variables
 * from design tokens for consistent styling. This component is extended
 * by engine-specific implementations (Titan, Hermes, Apollo).
 *
 * Features:
 * - Canvas-based pattern generation for crisp rendering
 * - Support for text and image watermarks
 * - Multi-line text support
 * - Device pixel ratio awareness for retina displays
 * - CSS variables for easy theming
 *
 * @module WatermarkBase
 */

'use client';

import React, { forwardRef, useEffect, useState, useMemo } from 'react';
import type { WatermarkProps } from '../types';
import { WATERMARK_DEFAULTS } from '../types';

/**
 * Custom hook that generates a watermark pattern using HTML5 Canvas.
 * Creates a repeating background image from text or image content.
 *
 * @param content - Text content (string or array for multiple lines)
 * @param image - Image URL (takes precedence over content)
 * @param width - Width of the watermark unit
 * @param height - Height of the watermark unit
 * @param rotate - Rotation angle in degrees
 * @param gap - Gap between watermarks [horizontal, vertical]
 * @param font - Font configuration object
 * @returns CSS background-image value as data URL
 *
 * @internal
 */
function useWatermarkPattern(
  content: WatermarkProps['content'],
  image: WatermarkProps['image'],
  width: number,
  height: number,
  rotate: number,
  gap: [number, number],
  font: WatermarkProps['font']
): string {
  const [pattern, setPattern] = useState<string>('');

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const ratio = window.devicePixelRatio || 1;
    const canvasWidth = (width + gap[0]) * ratio;
    const canvasHeight = (height + gap[1]) * ratio;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    ctx.rotate((rotate * Math.PI) / 180);

    if (image) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, -width / 2, -height / 2, width, height);
        setPattern(`url(${canvas.toDataURL()})`);
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

      setPattern(`url(${canvas.toDataURL()})`);
    }
  }, [content, image, width, height, rotate, gap, font]);

  return pattern;
}

/**
 * Base Watermark component using CSS variables.
 *
 * This component provides the foundation for all engine-specific watermark
 * implementations. It uses CSS variables for styling consistency and
 * canvas rendering for the watermark pattern.
 *
 * @component
 * @example
 * ```tsx
 * <BaseWatermark content="Draft" rotate={-22}>
 *   <div>Document content</div>
 * </BaseWatermark>
 * ```
 *
 * @param props - Component props
 * @param ref - Forwarded ref to the container div
 * @returns The watermarked content container
 */
export const BaseWatermark = forwardRef<HTMLDivElement, WatermarkProps>(
  (props, ref) => {
    const {
      content,
      image,
      width = 120,
      height = 64,
      rotate = WATERMARK_DEFAULTS.rotate!,
      gap = WATERMARK_DEFAULTS.gap!,
      offset = WATERMARK_DEFAULTS.offset!,
      zIndex = WATERMARK_DEFAULTS.zIndex!,
      font = WATERMARK_DEFAULTS.font,
      children,
      className = '',
      style = {},
    } = props;

    const backgroundImage = useWatermarkPattern(
      content,
      image,
      width,
      height,
      rotate,
      gap,
      font
    );

    // Build CSS custom properties for theming and styling consistency
    // These variables can be overridden via CSS for custom themes
    const watermarkVars = useMemo<React.CSSProperties>(() => ({
      '--ds-watermark-z-index': zIndex,
      '--ds-watermark-rotate': `${rotate}deg`,
      '--ds-watermark-gap-x': `${gap[0]}px`,
      '--ds-watermark-gap-y': `${gap[1]}px`,
      '--ds-watermark-offset-x': `${offset[0]}px`,
      '--ds-watermark-offset-y': `${offset[1]}px`,
      '--ds-watermark-width': `${width}px`,
      '--ds-watermark-height': `${height}px`,
      '--ds-watermark-font-color': font?.color || WATERMARK_DEFAULTS.font?.color,
      '--ds-watermark-font-size': `${font?.fontSize || WATERMARK_DEFAULTS.font?.fontSize}px`,
      '--ds-watermark-font-weight': font?.fontWeight || WATERMARK_DEFAULTS.font?.fontWeight,
      '--ds-watermark-font-family': font?.fontFamily || WATERMARK_DEFAULTS.font?.fontFamily,
    } as React.CSSProperties), [zIndex, rotate, gap, offset, width, height, font]);

    // Container styles
    const containerStyle: React.CSSProperties = {
      ...watermarkVars,
      position: 'relative',
      ...style,
    };

    // Watermark overlay styles
    const overlayStyle: React.CSSProperties = {
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      backgroundImage,
      backgroundRepeat: 'repeat',
      backgroundPosition: `var(--ds-watermark-offset-x) var(--ds-watermark-offset-y)`,
      zIndex: 'var(--ds-watermark-z-index)' as any,
    };

    return (
      <div
        ref={ref}
        className={`rottay-watermark ${className}`}
        style={containerStyle}
        data-rotate={rotate}
        data-z-index={zIndex}
      >
        {children}
        <div
          className="rottay-watermark__overlay"
          style={overlayStyle}
          aria-hidden="true"
        />
      </div>
    );
  }
);

BaseWatermark.displayName = 'BaseWatermark';

