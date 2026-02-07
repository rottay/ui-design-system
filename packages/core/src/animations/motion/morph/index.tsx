'use client';

import React, { forwardRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { MorphProps } from '../../types';

export const Morph = forwardRef<HTMLDivElement, MorphProps>(
  ({ children, layoutId, className, style }, ref) => {
    const shouldReduceMotion = useReducedMotion();

    return (
      <AnimatePresence mode="wait">
        <motion.div
          ref={ref}
          layout={!shouldReduceMotion}
          layoutId={layoutId}
          initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
          transition={{
            layout: { duration: shouldReduceMotion ? 0 : 0.3, ease: 'easeInOut' },
            opacity: { duration: shouldReduceMotion ? 0 : 0.2 },
            scale: { duration: shouldReduceMotion ? 0 : 0.2 },
          }}
          className={className}
          style={style}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    );
  }
);

Morph.displayName = 'Morph';
