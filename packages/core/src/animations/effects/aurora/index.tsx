'use client';

import React, { useMemo } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { AuroraProps } from '../../types';

export const Aurora: React.FC<AuroraProps> = ({
  colors = ['var(--ds-color-primary-500, #8b5cf6)', 'var(--ds-color-secondary-500, #3b82f6)', '#ec4899'],
  speed = 1,
  children,
  className,
  style,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const blobs = useMemo(
    () => colors.map((color, i) => ({ color, duration: (20 + i * 5) / speed, delay: i * 2, size: 40 + i * 10, top: 20 + i * 15, left: 10 + i * 20 })),
    [colors, speed]
  );

  return (
    <div className={className} style={{ position: 'relative', overflow: 'hidden', ...style }}>
      <style>{`@keyframes ds-aurora-blob { 0%, 100% { transform: translate(0%, 0%) rotate(0deg) scale(1); } 25% { transform: translate(50%, 50%) rotate(90deg) scale(1.1); } 50% { transform: translate(0%, 100%) rotate(180deg) scale(0.9); } 75% { transform: translate(-50%, 50%) rotate(270deg) scale(1.05); } }`}</style>
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        {blobs.map((blob, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: `${blob.top}%`,
              left: `${blob.left}%`,
              width: `${blob.size}%`,
              height: `${blob.size}%`,
              background: blob.color,
              borderRadius: '50%',
              filter: 'blur(60px)',
              opacity: 0.3,
              animation: shouldReduceMotion ? 'none' : `ds-aurora-blob ${blob.duration}s ease-in-out ${blob.delay}s infinite`,
              willChange: shouldReduceMotion ? 'auto' : 'transform',
            }}
          />
        ))}
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
};

Aurora.displayName = 'Aurora';
