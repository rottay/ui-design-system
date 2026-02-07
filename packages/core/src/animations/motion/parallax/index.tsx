'use client';

import React, { forwardRef, useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import type { ParallaxProps } from '../../types';

export const Parallax = forwardRef<HTMLDivElement, ParallaxProps>(
  ({ children, speed = 0.5, className, style }, ref) => {
    const shouldReduceMotion = useReducedMotion();
    const targetRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
      target: targetRef,
      offset: ['start end', 'end start'],
    });

    const y = useTransform(
      scrollYProgress,
      [0, 1],
      shouldReduceMotion ? [0, 0] : [100 * speed, -100 * speed]
    );

    return (
      <div ref={targetRef} style={{ position: 'relative' }}>
        <motion.div ref={ref} style={{ y, ...style }} className={className}>
          {children}
        </motion.div>
      </div>
    );
  }
);

Parallax.displayName = 'Parallax';
