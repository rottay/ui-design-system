'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { GlowEffectProps } from '../../types';

const INTENSITY_MAP = {
  sm: { blur: 8, spread: 2 },
  md: { blur: 16, spread: 4 },
  lg: { blur: 24, spread: 6 },
};

export const GlowEffect: React.FC<GlowEffectProps> = ({
  color = 'var(--ds-color-primary-500, #667eea)',
  intensity = 'md',
  children,
  className,
  style,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const { blur, spread } = INTENSITY_MAP[intensity];

  const glowSm = `0 0 ${blur * 0.7}px ${spread}px ${color}`;
  const glowLg = `0 0 ${blur}px ${spread * 1.5}px ${color}`;

  return (
    <motion.div
      className={className}
      style={{ position: 'relative', display: 'inline-block', ...style }}
      animate={shouldReduceMotion ? undefined : { boxShadow: [glowSm, glowLg, glowSm] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
};

GlowEffect.displayName = 'GlowEffect';
