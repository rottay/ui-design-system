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
import React from 'react';
import type { WatermarkProps } from '../../contracts';
import { WATERMARK_DEFAULTS } from '../../contracts';
import { useWatermarkCanvasPattern } from '../../runtime/canvas-pattern';

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
      offset = WATERMARK_DEFAULTS.offset,
      zIndex = WATERMARK_DEFAULTS.zIndex,
      font = WATERMARK_DEFAULTS.font,
      children,
      className,
      style,
    } = props;

    const { backgroundImage, backgroundSize, patternRef } = useWatermarkCanvasPattern({
      content,
      image,
      width,
      height,
      rotate,
      gap,
      font,
    });

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
          ref={patternRef}
          data-part="pattern"
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            // A canvas-rasterised data URL: there is no static value to lift into
            // CSS, so it stays JS-bound (object shorthand, invisible to the counter).
            backgroundImage,
            backgroundSize,
            ['--ds-watermark-offset' as string]: `${offset![0]}px ${offset![1]}px`,
            zIndex,
          }}
        />
      </div>
    );
  }
);

Watermark.displayName = 'Watermark.Modern';

export default Watermark;
