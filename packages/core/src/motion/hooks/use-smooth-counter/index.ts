'use client';

/**
 * @fileoverview useSmoothCounter hook - Rottay Design System
 *
 * Animates a numeric value from one number to another over a configurable
 * duration using `requestAnimationFrame` and a quartic ease-out curve.
 * Lighter-weight than the spring-based `CountUp` component, this hook is
 * ideal for small dashboard counters, progress indicators, and inline
 * numeric labels that need a smooth transition without spring physics.
 *
 * @example Basic
 * ```ts
 * const displayValue = useSmoothCounter(0, users.length, 800);
 * return <Text>{Math.round(displayValue)} users</Text>;
 * ```
 *
 * @example Staggered (delay each card by index)
 * ```ts
 * const value = useSmoothCounter(0, metric.value, 1000, index * 150);
 * ```
 */

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../use-reduced-motion';

/**
 * Return a smoothly interpolated numeric value that transitions from
 * `from` to `to` over `duration` milliseconds using `requestAnimationFrame`.
 *
 * The animation restarts whenever `from`, `to`, `duration`, or `delay` change,
 * and cleans up the animation frame on unmount to prevent memory leaks.
 *
 * @param from - Starting numeric value.
 * @param to - Target numeric value.
 * @param duration - Animation length in milliseconds. Defaults to `1000`.
 * @param delay - Optional delay in milliseconds before the animation starts. Defaults to `0`.
 * @returns The current interpolated value (not rounded -- callers should round if needed).
 */
export function useSmoothCounter(from: number, to: number, duration: number = 1000, delay: number = 0): number {
  const prefersReducedMotion = useReducedMotion();
  const shouldRenderFinal = prefersReducedMotion || !Number.isFinite(duration) || duration <= 0;
  const [count, setCount] = useState(() => shouldRenderFinal ? to : from);
  const wasStaticRef = useRef(shouldRenderFinal);
  const previousTargetRef = useRef(to);

  useEffect(() => {
    let animationFrame: number | null = null;
    let delayTimer: ReturnType<typeof setTimeout> | null = null;
    const wasStatic = wasStaticRef.current;
    const targetChanged = previousTargetRef.current !== to;

    wasStaticRef.current = shouldRenderFinal;
    previousTargetRef.current = to;

    if (shouldRenderFinal) {
      setCount(to);
      return;
    }

    // SSR/hydration deliberately starts in the safe final state. Do not make
    // settled content jump backwards merely because a non-reduced client has
    // now resolved; future value changes can animate normally.
    if (wasStatic && !targetChanged) return;

    setCount(from);

    // Quartic ease-out: fast start, smooth deceleration. Gives a more
    // dramatic initial motion than quadratic, matching the dashboard
    // aesthetic used across Rottay metrics components.
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

    const startAnimation = () => {
      let startTime: number | null = null;

      const animate = (currentTime: number) => {
        if (startTime === null) startTime = currentTime;

        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutQuart(progress);

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
    };

    if (delay > 0) {
      delayTimer = setTimeout(startAnimation, delay);
    } else {
      startAnimation();
    }

    return () => {
      if (animationFrame !== null) cancelAnimationFrame(animationFrame);
      if (delayTimer !== null) clearTimeout(delayTimer);
    };
  }, [from, to, duration, delay, shouldRenderFinal]);

  return count;
}
