'use client';

import React, { forwardRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { FadeInProps } from '../../types';

export const FadeIn = forwardRef<HTMLDivElement, FadeInProps>(
  ({ children, direction = 'up', distance = 20, duration = 0.5, delay = 0, once = true, className, style }, ref) => {
    const shouldReduceMotion = useReducedMotion();

    const getOffset = () => {
      if (shouldReduceMotion) return { x: 0, y: 0 };
      switch (direction) {
        case 'up': return { x: 0, y: distance };
        case 'down': return { x: 0, y: -distance };
        case 'left': return { x: distance, y: 0 };
        case 'right': return { x: -distance, y: 0 };
      }
    };

    const offset = getOffset();

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, x: offset.x, y: offset.y }}
        {...(once
          ? { whileInView: { opacity: 1, x: 0, y: 0 }, viewport: { once: true, amount: 0.3 } }
          : { animate: { opacity: 1, x: 0, y: 0 } }
        )}
        transition={{ duration: shouldReduceMotion ? 0 : duration, delay: shouldReduceMotion ? 0 : delay, ease: 'easeOut' }}
        className={className}
        style={style}
      >
        {children}
      </motion.div>
    );
  }
);

FadeIn.displayName = 'FadeIn';
