'use client';

import React, { forwardRef, type MouseEvent } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import type { MagneticProps } from '../../types';
import { useMotionPersonality } from '../../hooks';

export const Magnetic = forwardRef<HTMLDivElement, MagneticProps>(
  ({ children, strength = 0.3, className, style }, ref) => {
    const motionPersonality = useMotionPersonality();
    const shouldReduceMotion = motionPersonality.shouldReduceMotion;
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const springConfig = {
      damping: motionPersonality.springFriction,
      stiffness: motionPersonality.springTension,
      mass: 0.1,
    };
    const springX = useSpring(x, springConfig);
    const springY = useSpring(y, springConfig);

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
      if (shouldReduceMotion) return;
      const rect = e.currentTarget.getBoundingClientRect();
      x.set((e.clientX - rect.left - rect.width / 2) * strength);
      y.set((e.clientY - rect.top - rect.height / 2) * strength);
    };

    const handleMouseLeave = () => {
      x.set(0);
      y.set(0);
    };

    return (
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ x: springX, y: springY, ...style }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }
);

Magnetic.displayName = 'Magnetic';
