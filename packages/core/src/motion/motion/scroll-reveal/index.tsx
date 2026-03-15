'use client';

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import type { ScrollRevealProps } from '../../types';
import { useMotionPersonality } from '../../hooks';

export const ScrollReveal = forwardRef<HTMLDivElement, ScrollRevealProps>(
  ({ children, threshold = 0.1, rootMargin, once = true, className, style }, ref) => {
    const motionPersonality = useMotionPersonality();
    const shouldReduceMotion = motionPersonality.shouldReduceMotion;
    const slideEase = [0.22, 1, 0.36, 1] as const;
    const fadeEase = [0.16, 1, 0.3, 1] as const;
    const transition = shouldReduceMotion || motionPersonality.entrance === 'none'
      ? { duration: 0 }
      : motionPersonality.entrance === 'spring' || motionPersonality.entrance === 'bounce' || motionPersonality.useSpring
        ? {
            type: 'spring' as const,
            stiffness: motionPersonality.springTension,
            damping: motionPersonality.springFriction,
            bounce: motionPersonality.entrance === 'bounce' ? 0.28 : 0.14,
          }
        : {
            duration: Math.max(motionPersonality.durationSeconds, 0.2),
            ease: motionPersonality.entrance === 'slideUp' ? slideEase : fadeEase,
          };
    const initial =
      shouldReduceMotion || motionPersonality.entrance === 'none'
        ? { opacity: 1, y: 0 }
        : motionPersonality.entrance === 'fade'
          ? { opacity: 0, y: 0 }
          : { opacity: 0, y: motionPersonality.offsetDistance };

    return (
      <motion.div
        ref={ref}
        initial={initial}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once, amount: threshold, margin: rootMargin }}
        transition={transition}
        className={className}
        style={style}
      >
        {children}
      </motion.div>
    );
  }
);

ScrollReveal.displayName = 'ScrollReveal';
