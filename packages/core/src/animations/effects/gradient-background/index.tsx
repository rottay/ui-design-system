'use client';

import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { GradientBackgroundProps } from '../../types';

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  colors = ['var(--ds-color-primary-500, #667eea)', 'var(--ds-color-secondary-500, #764ba2)'],
  animate = true,
  duration = 10,
  children,
  className,
  style,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const shouldAnimate = animate && !shouldReduceMotion;

  const gradientStyle = useMemo(
    () => ({ background: `linear-gradient(45deg, ${colors.join(', ')})`, backgroundSize: '200% 200%' }),
    [colors]
  );

  return (
    <div className={className} style={{ position: 'relative', width: '100%', height: '100%', ...style }}>
      <motion.div
        style={{ position: 'absolute', inset: 0, ...gradientStyle }}
        animate={shouldAnimate ? { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] } : undefined}
        transition={{ duration, repeat: Infinity, ease: 'linear' }}
      />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>{children}</div>
    </div>
  );
};

GradientBackground.displayName = 'GradientBackground';
