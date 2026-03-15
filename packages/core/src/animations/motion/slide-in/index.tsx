'use client';

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import type { SlideInProps } from '../../types';
import { useMotionPersonality } from '../../hooks';

export const SlideIn = forwardRef<HTMLDivElement, SlideInProps>(
  (
    {
      children,
      direction = 'left',
      distance,
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
    // Keep slide animations aligned with profile defaults unless the caller
    // intentionally overrides them.
    const effectiveDistance = distance ?? Math.max(motionPersonality.offsetDistance, 24);
    const effectiveDuration = duration ?? Math.max(motionPersonality.durationSeconds, 0.2);
    const effectiveDelay = delay ?? motionPersonality.delaySeconds;

    const getOffset = () => {
      if (shouldReduceMotion) return { x: 0, y: 0 };
      switch (direction) {
        case 'up': return { x: 0, y: effectiveDistance };
        case 'down': return { x: 0, y: -effectiveDistance };
        case 'left': return { x: effectiveDistance, y: 0 };
        case 'right': return { x: -effectiveDistance, y: 0 };
        default: return { x: 0, y: 0 };
      }
    };

    const offset = getOffset();
    const transition = shouldReduceMotion || motionPersonality.entrance === 'none'
      ? { duration: 0, delay: 0 }
      : motionPersonality.entrance === 'spring' || motionPersonality.entrance === 'bounce' || motionPersonality.useSpring
        ? {
            type: 'spring' as const,
            stiffness: motionPersonality.springTension,
            damping: motionPersonality.springFriction,
            delay: effectiveDelay,
            bounce: motionPersonality.entrance === 'bounce' ? 0.35 : 0.14,
          }
        : {
            duration: effectiveDuration,
            delay: effectiveDelay,
            ease: [0.22, 1, 0.36, 1] as const,
          };
    const initial =
      shouldReduceMotion || motionPersonality.entrance === 'none'
        ? { opacity: 1, x: 0, y: 0 }
        : motionPersonality.entrance === 'fade'
          ? { opacity: 0, x: 0, y: 0 }
          : { opacity: 0, x: offset.x, y: offset.y };

    return (
      <motion.div
        ref={ref}
        initial={initial}
        {...(once
          ? { whileInView: { opacity: 1, x: 0, y: 0 }, viewport: { once: true, amount: 0.3 } }
          : { animate: { opacity: 1, x: 0, y: 0 } }
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

SlideIn.displayName = 'SlideIn';
