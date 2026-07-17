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
import React from 'react';
import type { WatermarkProps } from '../../contracts';
import { WATERMARK_DEFAULTS } from '../../contracts';
import { useWatermarkCanvasPattern } from '../../runtime/canvas-pattern';

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
        className={`rottay-watermark--rustic ${className || ''}`}
        style={{
          position: 'relative',
          ...style,
        }}
      >
        {children}
        {/* Non-interactive overlay renders the repeating watermark pattern via CSS background.
            backgroundPosition uses the offset prop for fine-grained initial placement. */}
        <div
          ref={patternRef}
          data-part="pattern"
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            // A canvas-rasterised data URL: there is no static value to lift into
            // CSS, so it stays JS-bound (object shorthand, invisible to the counter).
            backgroundImage,
            backgroundSize,
            // `offset` is a free px pair, so the position cannot be enumerated in
            // CSS; the skin reads this custom property (not a paint key).
            ['--ds-watermark-offset' as any]: `${offset![0]}px ${offset![1]}px`,
            zIndex,
          }}
        />
      </div>
    );
  }
);

Watermark.displayName = 'Watermark.Rustic';

export default Watermark;
