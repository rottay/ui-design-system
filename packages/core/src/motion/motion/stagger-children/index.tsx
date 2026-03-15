'use client';

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import type { StaggerChildrenProps } from '../../types';
import { useMotionPersonality } from '../../hooks';

export const StaggerChildren = forwardRef<HTMLDivElement, StaggerChildrenProps>(
  ({ children, staggerDelay, delayChildren, className, style }, ref) => {
    const motionPersonality = useMotionPersonality();
    const shouldReduceMotion = motionPersonality.shouldReduceMotion;
    const effectiveStaggerDelay = staggerDelay ?? Math.max(motionPersonality.delaySeconds, 0.04);
    const effectiveDelayChildren = delayChildren ?? Math.max(motionPersonality.delaySeconds * 0.5, 0);
    const entrance = motionPersonality.entrance;
    const fadeEase = [0.16, 1, 0.3, 1] as const;

    return (
      <motion.div
        ref={ref}
        initial={entrance === 'none' ? false : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={{
          hidden:
            shouldReduceMotion || entrance === 'none'
              ? { opacity: 1 }
              : entrance === 'fade'
                ? { opacity: 0 }
                : { opacity: 0, y: Math.max(motionPersonality.offsetDistance * 0.4, 6) },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              delayChildren: shouldReduceMotion || entrance === 'none' ? 0 : effectiveDelayChildren,
              staggerChildren: shouldReduceMotion || entrance === 'none' ? 0 : effectiveStaggerDelay,
              ...(entrance === 'spring' || entrance === 'bounce' || motionPersonality.useSpring
                ? {
                    type: 'spring' as const,
                    stiffness: motionPersonality.springTension,
                    damping: motionPersonality.springFriction,
                    bounce: entrance === 'bounce' ? 0.28 : 0.1,
                  }
                : {
                    duration: Math.max(motionPersonality.durationSeconds * 0.45, 0.18),
                    ease: fadeEase,
                  }),
            },
          },
        }}
        className={className}
        style={style}
      >
        {children}
      </motion.div>
    );
  }
);

StaggerChildren.displayName = 'StaggerChildren';
