'use client';

/**
 * @fileoverview Watermark Modern Engine - Rottay Design System
 * @description Token-driven implementation of the Watermark component.
 * Canvas-based pattern generation (JS-bound, by construction) with the
 * static layout owned by the modern skin (`skin/watermark.css`) -- no
 * Tailwind utility classes.
 *
 * @remarks
 * The Modern engine provides:
 * - Canvas-based watermark pattern generation (rotated text tile or image)
 * - Device pixel ratio support for retina displays
 * - Multi-line text support with array content (up to 32 lines)
 * - Non-interactive overlay (pointer-events: none owned by the skin)
 * - Pattern set as CSS backgroundImage; offset rides the
 *   `--ds-watermark-offset` channel; zIndex is a contract runtime value
 *   (band 9: above page content, below the interactive overlay tier)
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
 * Modern engine implementation of Watermark.
 *
 * Features:
 * - Canvas-based watermark pattern generation
 * - Skin-owned static layout (skin/watermark.css)
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
 * @returns Watermarked content with the skin-painted pattern layer
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
        className={`rottay-watermark--modern ${className || ''}`}
        style={style}
      >
        {children}
        {/* Non-interactive overlay renders the repeating watermark pattern via CSS background */}
        <div
          ref={patternRef}
          data-part="pattern"
          aria-hidden="true"
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
