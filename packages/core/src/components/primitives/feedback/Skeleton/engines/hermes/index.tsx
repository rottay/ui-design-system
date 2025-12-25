/**
 * Skeleton - Hermes Engine (DaisyUI)
 */

import React from 'react';
import type { SkeletonProps } from '../types';
import { SKELETON_DEFAULTS } from '../types';

export default function HermesSkeleton(props: SkeletonProps): React.ReactElement {
  const {
    variant = SKELETON_DEFAULTS.variant,
    width,
    height,
    rows = SKELETON_DEFAULTS.rows,
    avatar,
    avatarSize = SKELETON_DEFAULTS.avatarSize,
    avatarShape = SKELETON_DEFAULTS.avatarShape,
    paragraph,
    title,
    className = '',
    style,
  } = props;

  const getSkeletonStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = { ...style };
    if (width) baseStyle.width = typeof width === 'number' ? `${width}px` : width;
    if (height) baseStyle.height = typeof height === 'number' ? `${height}px` : height;
    return baseStyle;
  };

  if (variant === 'circular' || variant === 'rectangular' || variant === 'rounded') {
    return (
      <div
        className={`skeleton ${className}`}
        style={{
          ...getSkeletonStyle(),
          borderRadius: variant === 'circular' ? '50%' : variant === 'rounded' ? '0.5rem' : '0',
        }}
      />
    );
  }

  return (
    <div className={`flex gap-4 ${className}`} style={style}>
      {avatar && (
        <div
          className="skeleton"
          style={{
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarShape === 'circle' ? '50%' : '0.5rem',
            flexShrink: 0,
          }}
        />
      )}
      <div className="flex-1 space-y-2">
        {title && <div className="skeleton" style={{ height: '1.25rem', width: '60%' }} />}
        {paragraph &&
          Array.from({
            length: typeof paragraph === 'object' ? paragraph.rows || rows! : rows!,
          }).map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: '1rem', width: i === rows! - 1 ? '80%' : '100%' }}
            />
          ))}
      </div>
    </div>
  );
}
