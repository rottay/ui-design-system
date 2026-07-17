'use client';

/**
 * @fileoverview Magnetic motion primitive - Rottay Design System
 *
 * Cursor-reactive wrapper that pulls its content toward the mouse pointer
 * using spring physics derived from the active motion personality. The
 * element snaps back to its resting position when the cursor leaves,
 * creating a subtle "magnetic attraction" micro-interaction.
 *
 * @example
 * ```tsx
 * <Magnetic strength={0.4}>
 *   <Button>Hover me</Button>
 * </Magnetic>
 * ```
 */

import React, { forwardRef, type MouseEvent } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import type { MagneticProps } from '@/graphics/motion/foundation/contracts';
import { useMotionPersonality } from '@/graphics/motion/react/runtime';

/**
 * Apply a pointer-following magnetic effect with tenant-aware spring physics.
 *
 * Ideal for call-to-action buttons, icons, and interactive cards where a
 * playful hover response improves perceived interactivity. The effect is
 * completely disabled when the user or tenant prefers reduced motion.
 *
 * @param props - {@link MagneticProps}
 * @param props.children - Content that will visually follow the cursor.
 * @param props.strength - Multiplier controlling how far the element drifts toward the pointer. Defaults to `0.3`.
 * @param props.className - CSS class applied to the wrapper `<div>`.
 * @param props.style - Inline styles merged onto the motion wrapper.
 * @returns A `motion.div` that translates toward the cursor position within its bounds.
 */
export const Magnetic = forwardRef<HTMLDivElement, MagneticProps>(
  ({ children, strength = 0.3, className, style }, ref) => {
    const motionPersonality = useMotionPersonality();
    const motionEnabled = motionPersonality.policy.allowHoverEffects;

    // Raw motion values track the cursor displacement without triggering
    // React re-renders; the springs smooth the raw values before layout.
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Low mass (0.1) makes the element feel lightweight and responsive,
    // while damping/stiffness come from the tenant's personality tokens.
    const springConfig = {
      damping: motionPersonality.springFriction,
      stiffness: motionPersonality.springTension,
      mass: 0.1,
    };
    const springX = useSpring(x, springConfig);
    const springY = useSpring(y, springConfig);

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
      if (!motionEnabled) return;

      // Use element-local coordinates so the same strength setting feels stable
      // regardless of where the component lives on the page. The offset from
      // center is multiplied by `strength` to control maximum displacement.
      const rect = e.currentTarget.getBoundingClientRect();
      const maxDistance = motionPersonality.offsetDistance;
      const clamp = (value: number): number =>
        Math.max(-maxDistance, Math.min(maxDistance, value));
      x.set(clamp((e.clientX - rect.left - rect.width / 2) * strength));
      y.set(clamp((e.clientY - rect.top - rect.height / 2) * strength));
    };

    // Reset to origin on leave so the element springs back to its resting position.
    const handleMouseLeave = () => {
      x.set(0);
      y.set(0);
    };

    return (
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        data-ds-motion-state={motionEnabled ? 'interactive' : 'static'}
        style={{ x: springX, y: springY, ...style }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }
);

Magnetic.displayName = 'Magnetic';
