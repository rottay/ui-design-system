'use client';

/**
 * @fileoverview FadeIn motion primitive - Rottay Design System
 *
 * Reveals content with an opacity transition and an optional directional
 * offset. All timing, easing, and spring values fall back to the active
 * motion personality when the corresponding props are omitted, making the
 * animation automatically consistent across the tenant's product.
 *
 * @example
 * ```tsx
 * <FadeIn direction="up" distance={20} delay={0.1}>
 *   <Card>...</Card>
 * </FadeIn>
 * ```
 */

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import type { FadeInProps } from '../../types';
import { useMotionPersonality } from '../../hooks';

/**
 * Fade content into view while honoring tenant motion defaults and
 * reduced-motion preferences.
 *
 * Supports four directional offsets (`up`, `down`, `left`, `right`) and
 * three entrance modes (`fade`, `spring`/`bounce`, `slideUp`) derived
 * from the motion personality.
 *
 * @param props - {@link FadeInProps}
 * @param props.children - Content to reveal.
 * @param props.direction - Direction the element fades in from. Defaults to `'up'`.
 * @param props.distance - Pixel offset applied along the chosen direction.
 * @param props.duration - Duration in seconds (tween mode only).
 * @param props.delay - Delay in seconds before the animation starts.
 * @param props.once - When `true` (default), the animation plays only on first viewport entry.
 * @param props.className - CSS class applied to the wrapper `<div>`.
 * @param props.style - Inline styles applied to the wrapper `<div>`.
 * @returns A `motion.div` that fades its children into view.
 */
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

    // -- Directional offset calculation ---------------------------------------
    // Maps the human-readable `direction` prop to x/y pixel offsets. Returns
    // zero offsets when reduced motion is active so the element appears in place.
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

    // Custom cubic bezier curves chosen for perceptually smooth entrance motion.
    // `slideEase` has a sharper attack for positional slides; `fadeEase` is
    // gentler for pure opacity fades.
    const slideEase = [0.22, 1, 0.36, 1] as const;
    const fadeEase = [0.16, 1, 0.3, 1] as const;

    // -- Transition selection based on entrance mode --------------------------
    // Three branches: instant (reduced motion / none), spring-based, or tween.
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

    // -- Initial state --------------------------------------------------------
    // `entrance === 'fade'` strips the directional offset to produce a pure
    // crossfade; all other modes combine opacity with the positional offset.
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
        // `whileInView` keeps the default ergonomic for page content; `animate`
        // is still available when callers want immediate mounting transitions.
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
