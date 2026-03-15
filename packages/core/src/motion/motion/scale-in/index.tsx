'use client';

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import type { ScaleInProps } from '../../types';
import { useMotionPersonality } from '../../hooks';

export const ScaleIn = forwardRef<HTMLDivElement, ScaleInProps>(
  (
    {
      children,
      initialScale,
      duration,
      delay,
      once = true,
      className,
      style,
    },
    ref
  ) => {
    const motionPersonality = useMotionPersonality();
    const shouldReduceMotion = motionPersonality.shouldReduceMotion;
    const effectiveScale = initialScale ?? motionPersonality.initialScale;
    const effectiveDuration = duration ?? motionPersonality.durationSeconds;
    const effectiveDelay = delay ?? motionPersonality.delaySeconds;
    const transition = shouldReduceMotion || motionPersonality.entrance === 'none'
      ? { duration: 0, delay: 0 }
      : motionPersonality.entrance === 'spring' || motionPersonality.entrance === 'bounce' || motionPersonality.useSpring
        ? {
            type: 'spring' as const,
            stiffness: motionPersonality.springTension,
            damping: motionPersonality.springFriction,
            delay: effectiveDelay,
            bounce: motionPersonality.entrance === 'bounce' ? 0.32 : 0.12,
          }
        : {
            duration: effectiveDuration,
            delay: effectiveDelay,
            ease: 'easeOut' as const,
          };
    const initial =
      shouldReduceMotion || motionPersonality.entrance === 'none'
        ? { opacity: 1, scale: 1 }
        : motionPersonality.entrance === 'fade'
          ? { opacity: 0, scale: 1 }
          : { opacity: 0, scale: effectiveScale };

    return (
      <motion.div
        ref={ref}
        initial={initial}
        {...(once
          ? { whileInView: { opacity: 1, scale: 1 }, viewport: { once: true, amount: 0.3 } }
          : { animate: { opacity: 1, scale: 1 } }
        )}
        transition={transition}
        className={className}
        style={style}
      >
        {children}
      </motion.div>
    );
  }
);

ScaleIn.displayName = 'ScaleIn';
