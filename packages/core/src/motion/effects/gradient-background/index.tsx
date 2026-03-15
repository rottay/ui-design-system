'use client';

import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { GradientBackgroundProps } from '../../types';
import { useMotionPersonality } from '../../hooks/use-motion-personality';

const PULSE_DURATION_MAP: Record<string, number> = { slow: 1.6, normal: 1, fast: 0.6 };

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  colors = ['var(--ds-color-primary-500)', 'var(--ds-color-secondary-500)'],
  animate = true,
  duration,
  children,
  className,
  style,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const motionPersonality = useMotionPersonality();
  const shouldAnimate = animate && !shouldReduceMotion;

  const effectiveDuration = duration ?? Math.max(
    motionPersonality.durationSeconds * 10 * (PULSE_DURATION_MAP[motionPersonality.pulseSpeed] || 1),
    4
  );

  const gradientStyle = useMemo(
    () => ({ background: `linear-gradient(45deg, ${colors.join(', ')})`, backgroundSize: '200% 200%' }),
    [colors]
  );

  return (
    <div className={className} style={{ position: 'relative', width: '100%', height: '100%', ...style }}>
      <motion.div
        style={{ position: 'absolute', inset: 0, ...gradientStyle }}
        animate={shouldAnimate ? { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] } : undefined}
        transition={{ duration: effectiveDuration, repeat: Infinity, ease: 'linear' }}
      />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>{children}</div>
    </div>
  );
};

GradientBackground.displayName = 'GradientBackground';
