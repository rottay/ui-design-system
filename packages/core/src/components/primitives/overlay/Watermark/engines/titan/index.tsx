'use client';

/**
 * Watermark - Titan Engine (Ant Design)
 */
import React from 'react';
import { Watermark as AntWatermark } from 'antd';
import type { WatermarkProps } from '../../types';

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
