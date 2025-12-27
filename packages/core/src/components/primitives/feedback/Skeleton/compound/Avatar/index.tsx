/**
 * Skeleton.Avatar - Compound Component
 */

'use client';

import React, { forwardRef } from 'react';

export interface SkeletonAvatarProps {
  size?: 'sm' | 'md' | 'lg' | number;
  shape?: 'circle' | 'square';
  className?: string;
  style?: React.CSSProperties;
}

const SIZE_MAP = {
  sm: 32,
  md: 40,
  lg: 48,
};

export const SkeletonAvatar = forwardRef<HTMLDivElement, SkeletonAvatarProps>(
  (props, ref) => {
    const { size = 'md', shape = 'circle', className = '', style = {} } = props;

    const sizeValue = typeof size === 'number' ? size : SIZE_MAP[size];

    const avatarStyle: React.CSSProperties = {
      width: sizeValue,
      height: sizeValue,
      borderRadius: shape === 'circle' ? '50%' : '4px',
      background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      backgroundSize: '200% 100%',
      animation: 'skeleton-loading 1.5s infinite',
      ...style,
    };

    return (
      <div ref={ref} className={`rottay-skeleton-avatar ${className}`} style={avatarStyle} />
    );
  }
);

SkeletonAvatar.displayName = 'Skeleton.Avatar';

export default SkeletonAvatar;
