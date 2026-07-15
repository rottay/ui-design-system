'use client';

/**
 * @fileoverview Morph motion primitive - Rottay Design System
 *
 * Provides smooth layout transitions between visual states using
 * Motion's `layout` and `layoutId` capabilities. When children
 * swap or reposition, the element morphs its size, position, and opacity
 * with spring or tween physics from the active motion personality.
 *
 * @example
 * ```tsx
 * <Morph layoutId="card-hero">
 *   {isExpanded ? <ExpandedCard /> : <CollapsedCard />}
 * </Morph>
 * ```
 */

import React, { forwardRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { MorphProps } from '../../types';
import { useMotionPersonality } from '../../hooks';

/**
 * Smoothly morph between child states using layout animations.
 *
 * Wraps content in `AnimatePresence` with `mode="wait"` so the outgoing
 * element fully exits before the incoming element enters, preventing
 * layout overlap. Uses separate transition configs for layout, opacity,
 * and scale to allow fine-grained control from the personality tokens.
 *
 * @param props - {@link MorphProps}
 * @param props.children - Content that may change between renders.
 * @param props.layoutId - Shared layout identifier for cross-component morph transitions.
 * @param props.className - CSS class applied to the motion wrapper.
 * @param props.style - Inline styles applied to the motion wrapper.
 * @returns A `motion.div` inside `AnimatePresence` that morphs between child states.
 */
export const Morph = forwardRef<HTMLDivElement, MorphProps>(
  ({ children, layoutId, className, style }, ref) => {
    const motionPersonality = useMotionPersonality();
    const shouldReduceMotion = motionPersonality.shouldReduceMotion;

    // Layout and fade durations are derived as fractions of the personality
    // duration so the two channels finish in proportion. The floor values
    // (0.18s / 0.14s) prevent imperceptibly fast transitions.
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
          // Disable layout animations entirely when reduced motion is active
          // to avoid jarring spatial shifts.
          layout={!shouldReduceMotion}
          layoutId={layoutId}
          initial={{
            opacity: shouldReduceMotion || motionPersonality.entrance === 'none' ? 1 : 0,
            // Bounce entrances use a more dramatic scale (0.92) to accentuate
            // the overshoot, while standard entrances use a subtler 0.96.
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
            // Exit scales are closer to 1 than entry scales so the departure
            // feels lighter and less distracting than the arrival.
            scale:
              shouldReduceMotion || motionPersonality.entrance === 'none'
                ? 1
                : motionPersonality.entrance === 'bounce'
                  ? 0.95
                  : 0.98,
          }}
          transition={{
            // -- Layout transition (position + size) --------------------------
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
            // -- Opacity and scale use the same physics but a shorter tween
            //    duration so they settle before the layout shift completes. ---
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
