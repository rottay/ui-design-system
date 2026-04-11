'use client';

/**
 * @fileoverview Parallax motion primitive - Rottay Design System
 *
 * Creates a vertical parallax scrolling effect by mapping the element's
 * scroll progress to a translateY offset. The `speed` multiplier controls
 * how much the content drifts relative to the natural scroll rate. Uses
 * framer-motion's `useScroll` and `useTransform` for GPU-accelerated motion.
 *
 * @example
 * ```tsx
 * <Parallax speed={0.3}>
 *   <Image src="/hero-bg.jpg" alt="background" />
 * </Parallax>
 * ```
 */

import React, { forwardRef, useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import type { ParallaxProps } from '../../types';

/**
 * Apply a vertical parallax scroll effect to its children.
 *
 * Unlike other motion primitives, Parallax reads reduced-motion preference
 * directly from `useReducedMotion` rather than the motion personality because
 * it does not involve entrance animations or spring physics -- only a
 * continuous scroll-linked transform.
 *
 * @param props - {@link ParallaxProps}
 * @param props.children - Content that will translate vertically during scroll.
 * @param props.speed - Parallax intensity multiplier. `0` = no effect, `1` = full offset. Defaults to `0.5`.
 * @param props.className - CSS class applied to the inner motion wrapper.
 * @param props.style - Inline styles merged onto the inner motion wrapper.
 * @returns A relatively-positioned container with a scroll-translated `motion.div` child.
 */
export const Parallax = forwardRef<HTMLDivElement, ParallaxProps>(
  ({ children, speed = 0.5, className, style }, ref) => {
    const shouldReduceMotion = useReducedMotion();
    const targetRef = useRef<HTMLDivElement>(null);

    // Track scroll progress from when the element enters the bottom of the
    // viewport ('start end') until it exits the top ('end start'). This range
    // ensures the parallax effect is active for the element's full visibility.
    const { scrollYProgress } = useScroll({
      target: targetRef,
      offset: ['start end', 'end start'],
    });

    // Map the 0-1 scroll progress to a symmetric Y displacement range.
    // Positive speed moves the content upward as the user scrolls down,
    // producing the classic "slower background" parallax illusion.
    const y = useTransform(
      scrollYProgress,
      [0, 1],
      shouldReduceMotion ? [0, 0] : [100 * speed, -100 * speed]
    );

    return (
      <div ref={targetRef} style={{ position: 'relative' }}>
        <motion.div ref={ref} style={{ y, ...style }} className={className}>
          {children}
        </motion.div>
      </div>
    );
  }
);

Parallax.displayName = 'Parallax';
