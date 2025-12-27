/**
 * Skeleton.Text - Compound Component
 */

'use client';

import React, { forwardRef } from 'react';

export interface SkeletonTextProps {
  lines?: number;
  width?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export const SkeletonText = forwardRef<HTMLDivElement, SkeletonTextProps>(
  (props, ref) => {
    const { lines = 3, width = '100%', className = '', style = {} } = props;

    const containerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      ...style,
    };

    const lineStyle: React.CSSProperties = {
      height: '16px',
      borderRadius: '4px',
      background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      backgroundSize: '200% 100%',
      animation: 'skeleton-loading 1.5s infinite',
    };

    return (
      <div ref={ref} className={`rottay-skeleton-text ${className}`} style={containerStyle}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            style={{
              ...lineStyle,
              width: index === lines - 1 ? '60%' : width,
            }}
          />
        ))}
      </div>
    );
  }
);

SkeletonText.displayName = 'Skeleton.Text';

export default SkeletonText;
