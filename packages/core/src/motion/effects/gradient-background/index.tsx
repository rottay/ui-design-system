'use client';

/**
 * @fileoverview GradientBackground - Rottay Design System
 *
 * Fills its parent with an animated linear gradient that slowly pans left
 * and right by shifting `background-position` between 0% and 100%.
 * The `backgroundSize: 200% 200%` trick doubles the painted gradient area
 * so the pan reveals different color blends over time. Animation duration
 * adapts to the tenant's motion personality, and the gradient string is
 * memoized to avoid unnecessary style object churn during animation frames.
 *
 * @example
 * <GradientBackground colors={['#6366f1', '#ec4899', '#f59e0b']} duration={12}>
 *   <HeroSection />
 * </GradientBackground>
 */

import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { GradientBackgroundProps } from '../../types';
import { useMotionPersonality } from '../../hooks/use-motion-personality';

/** Maps personality pulse speed to a duration multiplier for the pan cycle. */
const PULSE_DURATION_MAP: Record<string, number> = { slow: 1.6, normal: 1, fast: 0.6 };

/**
 * Full-size animated gradient backdrop that layers child content above
 * a continuously panning linear gradient.
 *
 * @param props - {@link GradientBackgroundProps}
 * @param props.colors - Array of CSS color values for the gradient stops (default: primary + secondary).
 * @param props.animate - Whether the gradient should pan; set false for a static gradient (default: true).
 * @param props.duration - Explicit cycle duration in seconds; overrides personality-derived timing.
 * @param props.children - Content rendered above the gradient at z-index 1.
 * @param props.className - Optional CSS class for the outer container.
 * @param props.style - Optional inline styles merged onto the outer container.
 * @returns A full-width/height container with an animated gradient behind child content.
 */
export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  colors = ['var(--ds-color-primary-500)', 'var(--ds-color-secondary-500)'],
  animate = true,
  duration,
  children,
  className,
  style,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const motionPersonality = useMotionPersonality();
  const shouldAnimate = animate && !shouldReduceMotion;

  // If the caller doesn't pass an explicit duration, derive one from the
  // personality with a 4s floor. Very fast pans look jittery on gradients
  // because the color transition is already smooth and doesn't need speed.
  const effectiveDuration = duration ?? Math.max(
    motionPersonality.durationSeconds * 10 * (PULSE_DURATION_MAP[motionPersonality.pulseSpeed] || 1),
    4
  );

  // Memoize the gradient string so Framer Motion's animation loop doesn't
  // force a new style object allocation on every frame.
  // backgroundSize: 200% 200% is essential - it creates a gradient surface
  // twice as wide/tall as the element so background-position can pan across
  // the extra area and reveal different color blends.
  const gradientStyle = useMemo(
    () => ({ background: `linear-gradient(45deg, ${colors.join(', ')})`, backgroundSize: '200% 200%' }),
    [colors]
  );

  return (
    <div className={className} style={{ position: 'relative', width: '100%', height: '100%', ...style }}>
      {/* The gradient div is absolutely positioned behind the content layer.
          backgroundPosition keyframes pan left-to-right-to-left; 'linear' easing
          prevents the pan from decelerating at edges, which would look like a stall. */}
      <motion.div
        style={{ position: 'absolute', inset: 0, ...gradientStyle }}
        animate={shouldAnimate ? { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] } : undefined}
        transition={{ duration: effectiveDuration, repeat: Infinity, ease: 'linear' }}
      />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>{children}</div>
    </div>
  );
};

GradientBackground.displayName = 'GradientBackground';
