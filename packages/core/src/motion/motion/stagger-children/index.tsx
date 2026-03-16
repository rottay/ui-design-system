'use client';

/**
 * @fileoverview StaggerChildren motion primitive - Rottay Design System
 *
 * Coordinates the reveal timing of a list of child elements so they animate
 * in sequentially rather than all at once. Each child is delayed by
 * `staggerDelay` seconds after the previous one, producing a cascading
 * entrance effect commonly used for card grids, nav items, and list views.
 *
 * @example
 * ```tsx
 * <StaggerChildren staggerDelay={0.08}>
 *   {items.map((item) => (
 *     <motion.div key={item.id} variants={childVariants}>
 *       <Card>{item.title}</Card>
 *     </motion.div>
 *   ))}
 * </StaggerChildren>
 * ```
 */

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import type { StaggerChildrenProps } from '../../types';
import { useMotionPersonality } from '../../hooks';

/**
 * Reveal children as a coordinated, staggered group while preserving
 * reduced-motion behavior.
 *
 * Uses framer-motion's variant propagation: the container transitions from
 * `"hidden"` to `"visible"`, and children that also define those variant
 * keys inherit the stagger schedule automatically.
 *
 * @param props - {@link StaggerChildrenProps}
 * @param props.children - Elements to stagger. Each should consume `variants` for full effect.
 * @param props.staggerDelay - Seconds between each child's entrance. Defaults to personality delay (min 0.04s).
 * @param props.delayChildren - Seconds to wait before the first child starts. Defaults to half the personality delay.
 * @param props.className - CSS class applied to the container wrapper.
 * @param props.style - Inline styles applied to the container wrapper.
 * @returns A `motion.div` container that orchestrates staggered child reveals.
 */
export const StaggerChildren = forwardRef<HTMLDivElement, StaggerChildrenProps>(
  ({ children, staggerDelay, delayChildren, className, style }, ref) => {
    const motionPersonality = useMotionPersonality();
    const shouldReduceMotion = motionPersonality.shouldReduceMotion;

    // Floor stagger at 0.04s so individual items are visually distinguishable
    // even with fast personality defaults. The initial delay before the first
    // child is half the stagger to avoid a dead gap on entry.
    const effectiveStaggerDelay = staggerDelay ?? Math.max(motionPersonality.delaySeconds, 0.04);
    const effectiveDelayChildren = delayChildren ?? Math.max(motionPersonality.delaySeconds * 0.5, 0);
    const entrance = motionPersonality.entrance;
    const fadeEase = [0.16, 1, 0.3, 1] as const;

    return (
      <motion.div
        ref={ref}
        // Setting `initial` to `false` when entrance is 'none' prevents
        // framer-motion from applying hidden styles entirely, avoiding a
        // flash of invisible content.
        initial={entrance === 'none' ? false : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={{
          hidden:
            shouldReduceMotion || entrance === 'none'
              ? { opacity: 1 }
              : entrance === 'fade'
                ? { opacity: 0 }
                // Non-fade entrances add a scaled-down vertical offset (40% of
                // the personality's distance) for a subtler group-level shift.
                : { opacity: 0, y: Math.max(motionPersonality.offsetDistance * 0.4, 6) },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              // Disable sequencing entirely when reduced motion is active so
              // all children appear simultaneously and instantly.
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
                    // Duration is shortened to 45% of the personality default
                    // because the stagger itself adds perceived duration.
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
