'use client';

/**
 * @fileoverview Watermark Classic Engine - Rottay Design System
 * @description Classic (Ant Design) implementation of the Watermark component.
 * Wraps Ant Design's Watermark with full feature parity and theming support.
 *
 * @remarks
 * The Classic engine provides:
 * - Native Ant Design Watermark rendering
 * - Full theme integration with Ant Design tokens
 * - Built-in canvas pattern generation
 * - Inheritance support for nested watermarks
 * - All font and positioning options
 *
 * Implementation details:
 * - Wraps children in container div for ref forwarding
 * - Passes all props directly to AntWatermark
 * - Font prop cast to any for type compatibility
 *
 * @example Using Classic Engine
 * ```tsx
 * import { Watermark } from '@rottay/design-system';
 *
 * <Watermark
 *   engine="classic"
 *   content="Confidential"
 *   rotate={-22}
 *   font={{ color: 'rgba(0,0,0,0.15)' }}
 * >
 *   <div>Protected content</div>
 * </Watermark>
 * ```
 *
 * @see {@link Watermark} - The main engine-aware component
 * @see {@link https://ant.design/components/watermark} - Ant Design Watermark docs
 * @module Watermark/Engines/Classic
 * @category Overlay
 * @package @rottay/design-system
 */
import React from 'react';
import { Watermark as AntWatermark } from 'antd';
import type { WatermarkProps } from '../../contracts';

/**
 * Classic engine implementation of Watermark using Ant Design.
 *
 * @component
 * @example
 * ```tsx
 * <Watermark content="Confidential" engine="classic">
 *   <div>Protected content</div>
 * </Watermark>
 * ```
 *
 * @param props - Watermark configuration props
 * @param ref - Forwarded ref to the container div
 * @returns Watermarked content using Ant Design
 */
export const Watermark = React.forwardRef<HTMLDivElement, WatermarkProps>(
  (props, ref) => {
    const {
      content,
      image,
      width,
      height,
      rotate,
      gap,
      offset,
      zIndex,
      font,
      inherit,
      children,
      className,
      style,
    } = props;

    return (
      /* Wrapper div provides ref forwarding; AntWatermark generates its own background pattern */
      <div ref={ref} className={className} style={style}>
        <AntWatermark
          content={content}
          image={image}
          width={width}
          height={height}
          rotate={rotate}
          gap={gap}
          offset={offset}
          zIndex={zIndex}
          /* Cast required because DS WatermarkFont is a superset of Ant Design's font type */
          font={font as any}
          inherit={inherit}
        >
          {children}
        </AntWatermark>
      </div>
    );
  }
);

Watermark.displayName = 'Watermark.Classic';

export default Watermark;
