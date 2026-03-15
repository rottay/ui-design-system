'use client';

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import type { FadeInProps } from '../../types';
import { useMotionPersonality } from '../../hooks';

export const FadeIn = forwardRef<HTMLDivElement, FadeInProps>(
  (
    {
      children,
      direction = 'up',
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
    // Let product profiles and tenant overrides drive the default motion values.
    // Explicit props still win when a caller wants to opt out of the profile.
    const effectiveDistance = distance ?? motionPersonality.offsetDistance;
    const effectiveDuration = duration ?? motionPersonality.durationSeconds;
    const effectiveDelay = delay ?? motionPersonality.delaySeconds;

    const getOffset = () => {
      if (shouldReduceMotion) return { x: 0, y: 0 };
      switch (direction) {
        case 'up': return { x: 0, y: effectiveDistance };
        case 'down': return { x: 0, y: -effectiveDistance };
        case 'left': return { x: effectiveDistance, y: 0 };
        case 'right': return { x: -effectiveDistance, y: 0 };
      }
    };

    const offset = getOffset();
    const slideEase = [0.22, 1, 0.36, 1] as const;
    const fadeEase = [0.16, 1, 0.3, 1] as const;
    const transition = shouldReduceMotion || motionPersonality.entrance === 'none'
      ? { duration: 0, delay: 0 }
      : motionPersonality.entrance === 'spring' || motionPersonality.entrance === 'bounce' || motionPersonality.useSpring
        ? {
            type: 'spring' as const,
            stiffness: motionPersonality.springTension,
            damping: motionPersonality.springFriction,
            delay: effectiveDelay,
            bounce: motionPersonality.entrance === 'bounce' ? 0.35 : 0.16,
          }
        : {
            duration: effectiveDuration,
            delay: effectiveDelay,
            ease: motionPersonality.entrance === 'slideUp' ? slideEase : fadeEase,
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

FadeIn.displayName = 'FadeIn';
