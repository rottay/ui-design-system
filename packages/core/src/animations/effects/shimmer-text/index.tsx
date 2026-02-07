'use client';

import React from 'react';
import { useReducedMotion } from 'framer-motion';
import type { ShimmerTextProps } from '../../types';

export const ShimmerText: React.FC<ShimmerTextProps> = ({ text, className, style }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <>
      <style>{`@keyframes ds-shimmer { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }`}</style>
      <span
        className={className}
        style={{
          background: shouldReduceMotion
            ? 'var(--ds-text-primary, #000)'
            : 'linear-gradient(90deg, var(--ds-text-secondary, #666) 0%, var(--ds-text-primary, #000) 40%, #fff 50%, var(--ds-text-primary, #000) 60%, var(--ds-text-secondary, #666) 100%)',
          backgroundSize: shouldReduceMotion ? '100% 100%' : '200% 100%',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: shouldReduceMotion ? 'none' : 'ds-shimmer 3s linear infinite',
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
