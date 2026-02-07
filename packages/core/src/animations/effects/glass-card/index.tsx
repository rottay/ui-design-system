'use client';

import React from 'react';
import type { GlassCardProps } from '../../types';

export const GlassCard: React.FC<GlassCardProps> = ({
  blur = 12,
  bgOpacity = 0.1,
  borderOpacity = 0.2,
  children,
  className,
  style,
}) => {
  return (
    <div
      className={className}
      style={{
        backdropFilter: `blur(var(--ds-glass-blur, ${blur}px))`,
        WebkitBackdropFilter: `blur(var(--ds-glass-blur, ${blur}px))`,
        background: `var(--ds-glass-bg, rgba(255, 255, 255, ${bgOpacity}))`,
        border: `1px solid var(--ds-glass-border, rgba(255, 255, 255, ${borderOpacity}))`,
        borderRadius: 'var(--ds-radius-lg, 12px)',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

GlassCard.displayName = 'GlassCard';
