'use client';

import React, { useMemo } from 'react';
import type { AuroraProps } from '../../types';
import { useMotionPersonality } from '../../hooks';

export const Aurora: React.FC<AuroraProps> = ({
  colors = ['var(--ds-color-primary-500)', 'var(--ds-color-secondary-500)', 'var(--ds-color-accent)'],
  speed = 1,
  children,
  className,
  style,
}) => {
  const motionPersonality = useMotionPersonality();
  const shouldReduceMotion = motionPersonality.shouldReduceMotion;
  const pulseDurationMap = {
    none: 0,
    slow: 1.2,
    normal: 1,
    fast: 0.8,
  } as const;

  const blobs = useMemo(
    () => {
      const baseDuration = Math.max(
        motionPersonality.durationSeconds * 18 * (pulseDurationMap[motionPersonality.pulseSpeed] || 1),
        6
      );
      const normalizedSpeed = speed <= 0 ? 1 : speed;

      return colors.map((color, i) => ({
        color,
        duration: (baseDuration + i * 3) / normalizedSpeed,
        delay: i * Math.max(motionPersonality.delaySeconds * 4, 0.2),
        size: 40 + i * 10,
        top: 20 + i * 15,
        left: 10 + i * 20,
      }));
    },
    [
      colors,
      motionPersonality.delaySeconds,
      motionPersonality.durationSeconds,
      motionPersonality.pulseSpeed,
      speed,
    ]
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
              opacity: motionPersonality.skeletonStyle === 'wave' ? 0.34 : 0.28,
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
