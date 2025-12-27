'use client';

/**
 * Watermark - Titan Engine (Ant Design)
 *
 * Ant Design implementation of the Watermark component.
 * Wraps the native antd Watermark component with our unified API.
 *
 * @module WatermarkTitan
 * @see {@link https://ant.design/components/watermark} Ant Design Watermark
 */
import React from 'react';
import { Watermark as AntWatermark } from 'antd';
import type { WatermarkProps } from '../../types';

/**
 * Titan engine implementation of Watermark using Ant Design.
 *
 * @component
 * @example
 * ```tsx
 * <Watermark content="Confidential" engine="titan">
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
          font={font as any}
          inherit={inherit}
        >
          {children}
        </AntWatermark>
      </div>
    );
  }
);

Watermark.displayName = 'Watermark.Titan';

export default Watermark;
