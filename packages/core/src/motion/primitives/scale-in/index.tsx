'use client';

/**
 * @fileoverview ScaleIn motion primitive - Rottay Design System
 *
 * Reveals content by scaling it from a smaller size into its final dimensions,
 * combined with an opacity fade. Spring tension, initial scale, and timing
 * all inherit from the active motion personality when the caller does not
 * provide explicit overrides.
 *
 * @example
 * ```tsx
 * <ScaleIn initialScale={0.85} delay={0.2}>
 *   <Avatar size="xl" />
 * </ScaleIn>
 * ```
 */

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import type { ScaleInProps } from '../../types';
import { useMotionPersonality } from '../../hooks';

/**
 * Scale content into view while preserving reduced-motion and entrance-token behavior.
 *
 * The component supports viewport-triggered (`once=true`) and immediate
 * (`once=false`) modes, making it suitable for both page sections and
 * programmatic mount/unmount transitions.
 *
 * @param props - {@link ScaleInProps}
 * @param props.children - Content to reveal with a scale animation.
 * @param props.initialScale - Starting scale factor (e.g. `0.8`). Falls back to the personality's `initialScale`.
 * @param props.duration - Duration in seconds (tween mode only).
 * @param props.delay - Delay in seconds before the animation begins.
 * @param props.once - When `true` (default), the animation fires only on first viewport entry.
 * @param props.className - CSS class applied to the motion wrapper.
 * @param props.style - Inline styles applied to the motion wrapper.
 * @returns A `motion.div` that scales and fades its children into view.
 */
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

    // Fall back to the personality's default scale when no explicit value is
    // provided, keeping the look consistent across the product.
    const effectiveScale = initialScale ?? motionPersonality.initialScale;
    const effectiveDuration = duration ?? motionPersonality.durationSeconds;
    const effectiveDelay = delay ?? motionPersonality.delaySeconds;

    // -- Transition: instant | spring | tween ---------------------------------
    // Bounce entrances use a higher bounce coefficient (0.32) to create a
    // noticeable overshoot, while standard springs stay subtle (0.12).
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

    // -- Initial state --------------------------------------------------------
    // Pure `fade` entrance strips the scale transform to avoid competing with
    // the opacity transition. All other entrances combine both channels.
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
        // Viewport-based reveal is the common case; callers can opt into direct animate mode.
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
