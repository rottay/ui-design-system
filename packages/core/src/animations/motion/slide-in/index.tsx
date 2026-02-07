'use client';

import React, { forwardRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { SlideInProps } from '../../types';

export const SlideIn = forwardRef<HTMLDivElement, SlideInProps>(
  ({ children, direction = 'left', distance = 40, duration = 0.6, delay = 0, once = true, className, style }, ref) => {
    const shouldReduceMotion = useReducedMotion();

    const getOffset = () => {
      if (shouldReduceMotion) return { x: 0, y: 0 };
      switch (direction) {
        case 'up': return { x: 0, y: distance };
        case 'down': return { x: 0, y: -distance };
        case 'left': return { x: distance, y: 0 };
        case 'right': return { x: -distance, y: 0 };
        default: return { x: 0, y: 0 };
      }
    };

    const offset = getOffset();

    return (
      <motion.div
        ref={ref}
        initial={{ x: offset.x, y: offset.y }}
        {...(once
          ? { whileInView: { x: 0, y: 0 }, viewport: { once: true, amount: 0.3 } }
          : { animate: { x: 0, y: 0 } }
        )}
        transition={{ duration: shouldReduceMotion ? 0 : duration, delay: shouldReduceMotion ? 0 : delay, ease: [0.25, 0.1, 0.25, 1] }}
        className={className}
        style={style}
      >
        {children}
      </motion.div>
    );
  }
);

SlideIn.displayName = 'SlideIn';
