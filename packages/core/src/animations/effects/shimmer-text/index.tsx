'use client';

import React from 'react';
import type { ShimmerTextProps } from '../../types';
import { useMotionPersonality } from '../../hooks';

export const ShimmerText: React.FC<ShimmerTextProps> = ({ text, className, style }) => {
  const motionPersonality = useMotionPersonality();
  const shouldReduceMotion = motionPersonality.shouldReduceMotion;
  const speedMultiplier = {
    none: 0,
    slow: 1.35,
    normal: 1,
    fast: 0.8,
  } as const;
  const animationDuration = `${Math.max(
    motionPersonality.durationSeconds * 6 * (speedMultiplier[motionPersonality.pulseSpeed] || 1),
    1.4
  )}s`;
  const shimmerGradient =
    motionPersonality.skeletonStyle === 'pulse'
      ? 'linear-gradient(90deg, var(--ds-color-text-secondary) 0%, var(--ds-color-text-primary) 50%, var(--ds-color-text-secondary) 100%)'
      : 'linear-gradient(90deg, var(--ds-color-text-secondary) 0%, var(--ds-color-text-primary) 40%, var(--ds-color-text-on-primary) 50%, var(--ds-color-text-primary) 60%, var(--ds-color-text-secondary) 100%)';

  return (
    <>
      <style>{`@keyframes ds-shimmer { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }`}</style>
      <span
        className={className}
        style={{
          background: shouldReduceMotion
            ? 'var(--ds-color-text-primary)'
            : shimmerGradient,
          backgroundSize: shouldReduceMotion ? '100% 100%' : '200% 100%',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: shouldReduceMotion ? 'none' : `ds-shimmer ${animationDuration} linear infinite`,
          display: 'inline-block',
          ...style,
        }}
      >
        {text}
      </span>
    </>
  );
};

ShimmerText.displayName = 'ShimmerText';
