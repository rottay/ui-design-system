'use client';

/**
 * @fileoverview useSmoothCounter hook - Rottay Design System
 *
 * Animates a numeric value from one number to another over a configurable
 * duration using `requestAnimationFrame` and a quadratic ease-out curve.
 * Lighter-weight than the spring-based `CountUp` component, this hook is
 * ideal for small dashboard counters, progress indicators, and inline
 * numeric labels that need a smooth transition without spring physics.
 *
 * @example
 * ```ts
 * const displayValue = useSmoothCounter(0, users.length, 800);
 * return <Text>{Math.round(displayValue)} users</Text>;
 * ```
 */

import { useEffect, useState } from 'react';

/**
 * Return a smoothly interpolated numeric value that transitions from
 * `from` to `to` over `duration` milliseconds using `requestAnimationFrame`.
 *
 * The animation restarts whenever `from`, `to`, or `duration` change,
 * and cleans up the animation frame on unmount to prevent memory leaks.
 *
 * @param from - Starting numeric value.
 * @param to - Target numeric value.
 * @param duration - Animation length in milliseconds. Defaults to `1000`.
 * @returns The current interpolated value (not rounded -- callers should round if needed).
 */
export function useSmoothCounter(from: number, to: number, duration: number = 1000): number {
  const [count, setCount] = useState(from);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;

    // Quadratic ease-out: fast start, smooth deceleration. Chosen over
    // cubic or expo curves because it keeps the hook lightweight while
    // still feeling natural for short numeric transitions.
    const easeOutQuad = (t: number) => t * (2 - t);

    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuad(progress);

      // Interpolate between from and to using the eased progress curve.
      setCount(from + (to - from) * easedProgress);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        // Snap to the exact target on the final frame to avoid floating-point
        // drift leaving the value at e.g. 99.9997 instead of 100.
        setCount(to);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [from, to, duration]);

  return count;
}
