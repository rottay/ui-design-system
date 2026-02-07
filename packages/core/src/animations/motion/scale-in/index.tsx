'use client';

import React, { forwardRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { ScaleInProps } from '../../types';

export const ScaleIn = forwardRef<HTMLDivElement, ScaleInProps>(
  ({ children, initialScale = 0.9, duration = 0.5, delay = 0, once = true, className, style }, ref) => {
    const shouldReduceMotion = useReducedMotion();

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : initialScale }}
        {...(once
          ? { whileInView: { opacity: 1, scale: 1 }, viewport: { once: true, amount: 0.3 } }
          : { animate: { opacity: 1, scale: 1 } }
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

ScaleIn.displayName = 'ScaleIn';
