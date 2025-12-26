/**
 * Skeleton - Apollo Engine (Vanilla HTML/CSS)
 */

import React from 'react';
import type { SkeletonProps } from '../../types';
import { SKELETON_DEFAULTS } from '../../types';

export default function ApolloSkeleton(props: SkeletonProps): React.ReactElement {
  const {
    variant = SKELETON_DEFAULTS.variant,
    width,
    height,
    animation = SKELETON_DEFAULTS.animation,
    rows = SKELETON_DEFAULTS.rows,
    active = SKELETON_DEFAULTS.active,
    avatar,
    avatarSize = SKELETON_DEFAULTS.avatarSize,
    avatarShape = SKELETON_DEFAULTS.avatarShape,
    paragraph,
    title,
    className = '',
    style,
  } = props;

  const getAnimationStyle = (): React.CSSProperties => {
    if (!active || !animation) return {};
    if (animation === 'pulse') {
      return { animation: 'rottay-skeleton-pulse 1.5s ease-in-out infinite' };
    }
    return {
      background:
        'linear-gradient(90deg, rgba(190,190,190,0.2) 25%, rgba(129,129,129,0.24) 37%, rgba(190,190,190,0.2) 63%)',
      backgroundSize: '400% 100%',
      animation: 'rottay-skeleton-wave 1.4s ease-in-out infinite',
    };
  };

  const baseSkeletonStyle: React.CSSProperties = {
    backgroundColor: 'rgba(190, 190, 190, 0.2)',
    ...getAnimationStyle(),
  };

  if (variant === 'circular' || variant === 'rectangular' || variant === 'rounded') {
    return (
      <>
        <style>{`
          @keyframes rottay-skeleton-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
          @keyframes rottay-skeleton-wave { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }
        `}</style>
        <div
          className={`rottay-skeleton ${className}`}
          style={{
            ...baseSkeletonStyle,
            width: typeof width === 'number' ? `${width}px` : width || '100%',
            height: typeof height === 'number' ? `${height}px` : height || '20px',
            borderRadius: variant === 'circular' ? '50%' : variant === 'rounded' ? '6px' : '0',
            ...style,
          }}
        />
      </>
    );
  }

  return (
    <>
      <style>{`
        @keyframes rottay-skeleton-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes rottay-skeleton-wave { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }
      `}</style>
      <div className={`rottay-skeleton-wrapper ${className}`} style={{ display: 'flex', gap: '16px', ...style }}>
        {avatar && (
          <div
            style={{
              ...baseSkeletonStyle,
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarShape === 'circle' ? '50%' : '6px',
              flexShrink: 0,
            }}
          />
        )}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {title && (<div style={{ ...baseSkeletonStyle, height: '20px', width: '60%', borderRadius: '4px' }} />)}
          {paragraph &&
            Array.from({ length: typeof paragraph === 'object' ? paragraph.rows || rows! : rows! }).map((_, i) => (
              <div key={i} style={{ ...baseSkeletonStyle, height: '16px', width: i === rows! - 1 ? '80%' : '100%', borderRadius: '4px' }} />
            ))}
        </div>
      </div>
    </>
  );
}
