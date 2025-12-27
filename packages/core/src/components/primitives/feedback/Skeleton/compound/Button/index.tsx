/**
 * Skeleton.Button - Compound Component
 */

'use client';

import React, { forwardRef } from 'react';

export interface SkeletonButtonProps {
  size?: 'sm' | 'md' | 'lg';
  shape?: 'default' | 'circle' | 'round';
  className?: string;
  style?: React.CSSProperties;
}

const SIZE_MAP = {
  sm: { width: 64, height: 24 },
  md: { width: 80, height: 32 },
  lg: { width: 96, height: 40 },
};

export const SkeletonButton = forwardRef<HTMLDivElement, SkeletonButtonProps>(
  (props, ref) => {
    const { size = 'md', shape = 'default', className = '', style = {} } = props;

    const dimensions = SIZE_MAP[size];
    const borderRadius = shape === 'circle' ? '50%' : shape === 'round' ? dimensions.height / 2 : '4px';

    const buttonStyle: React.CSSProperties = {
      width: shape === 'circle' ? dimensions.height : dimensions.width,
      height: dimensions.height,
      borderRadius,
      background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      backgroundSize: '200% 100%',
      animation: 'skeleton-loading 1.5s infinite',
      ...style,
    };

    return (
      <div ref={ref} className={`rottay-skeleton-button ${className}`} style={buttonStyle} />
    );
  }
);

SkeletonButton.displayName = 'Skeleton.Button';

export default SkeletonButton;
