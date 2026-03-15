'use client';

import React, { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MorphProps } from '../../types';
import { useMotionPersonality } from '../../hooks';

export const Morph = forwardRef<HTMLDivElement, MorphProps>(
  ({ children, layoutId, className, style }, ref) => {
    const motionPersonality = useMotionPersonality();
    const shouldReduceMotion = motionPersonality.shouldReduceMotion;
    const layoutDuration = Math.max(motionPersonality.durationSeconds * 0.6, 0.18);
    const fadeDuration = Math.max(motionPersonality.durationSeconds * 0.4, 0.14);
    const usesSpring =
      motionPersonality.entrance === 'spring' ||
      motionPersonality.entrance === 'bounce' ||
      motionPersonality.useSpring;

    return (
      <AnimatePresence mode="wait">
        <motion.div
          ref={ref}
          layout={!shouldReduceMotion}
          layoutId={layoutId}
          initial={{
            opacity: shouldReduceMotion || motionPersonality.entrance === 'none' ? 1 : 0,
            scale:
              shouldReduceMotion || motionPersonality.entrance === 'none'
                ? 1
                : motionPersonality.entrance === 'bounce'
                  ? 0.92
                  : 0.96,
          }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{
            opacity: shouldReduceMotion || motionPersonality.entrance === 'none' ? 1 : 0,
            scale:
              shouldReduceMotion || motionPersonality.entrance === 'none'
                ? 1
                : motionPersonality.entrance === 'bounce'
                  ? 0.95
                  : 0.98,
          }}
          transition={{
            layout: usesSpring
              ? {
                  type: 'spring',
                  stiffness: motionPersonality.springTension,
                  damping: motionPersonality.springFriction,
                  bounce: motionPersonality.entrance === 'bounce' ? 0.2 : 0.08,
                }
              : {
                  duration: shouldReduceMotion ? 0 : layoutDuration,
                  ease: [0.22, 1, 0.36, 1],
                },
            opacity: usesSpring
              ? {
                  type: 'spring',
                  stiffness: motionPersonality.springTension,
                  damping: motionPersonality.springFriction,
                }
              : { duration: shouldReduceMotion ? 0 : fadeDuration },
            scale: usesSpring
              ? {
                  type: 'spring',
                  stiffness: motionPersonality.springTension,
                  damping: motionPersonality.springFriction,
                }
              : { duration: shouldReduceMotion ? 0 : fadeDuration },
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
