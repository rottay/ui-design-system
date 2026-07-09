'use client';

/**
 * @fileoverview CountUp motion primitive - Rottay Design System
 *
 * Animates a numeric value from a starting number to a target number using
 * spring physics derived from the active motion personality. The animation
 * triggers when the element scrolls into view and respects reduced-motion
 * preferences as well as the tenant's `countUpEnabled` flag.
 *
 * @example
 * ```tsx
 * <CountUp from={0} to={1250} suffix="+" formatter={(n) => `$${n}`} />
 * ```
 */

import React, { useEffect, useRef } from 'react';
import { useMotionValue, useSpring, useInView } from 'framer-motion';
import type { CountUpProps } from '../../types';
import { useMotionPersonality } from '../../hooks';

/**
 * Animate a number from `from` to `to` when the element enters the viewport.
 *
 * Uses framer-motion's spring system for natural deceleration and writes
 * directly to the DOM on each frame to avoid per-frame React re-renders.
 *
 * @param props - {@link CountUpProps}
 * @param props.from - Starting numeric value. Defaults to `0`.
 * @param props.to - Target numeric value the counter animates toward.
 * @param props.duration - Animation duration in seconds. Defaults to `2`.
 * @param props.delay - Delay before the count begins (in seconds). Defaults to `0`.
 * @param props.prefix - Static text rendered before the number (e.g. `"$"`).
 * @param props.suffix - Static text rendered after the number (e.g. `"%"`).
 * @param props.formatter - Custom formatter applied to the rounded integer on each frame.
 * @param props.className - CSS class applied to the outer `<span>`.
 * @param props.style - Inline styles applied to the outer `<span>`.
 * @returns A `<span>` element whose text content animates from `from` to `to`.
 */
export const CountUp: React.FC<CountUpProps> = ({
  from = 0,
  to,
  duration = 2,
  delay = 0,
  prefix = '',
  suffix = '',
  formatter,
  className,
  style,
}) => {
  const motionPersonality = useMotionPersonality();

  // Respect both the OS-level reduced-motion preference AND the tenant-level
  // countUpEnabled flag so administrators can disable counting animations
  // independently of other motion primitives.
  const shouldReduceMotion =
    motionPersonality.shouldReduceMotion || !motionPersonality.countUpEnabled;

  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(from);

  // Spring physics are preferred over linear interpolation because they produce
  // a natural deceleration curve that feels more polished on dashboard stats.
  const springValue = useSpring(motionValue, {
    damping: motionPersonality.springFriction,
    stiffness: motionPersonality.springTension,
    duration: shouldReduceMotion ? 0 : duration * 1000,
  });

  // `amount: 0.5` ensures the element is at least half-visible before counting
  // begins, preventing wasted animation cycles off-screen.
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const displayRef = useRef<HTMLSpanElement>(null);

  // -- Trigger the spring when the element enters the viewport ----------------
  useEffect(() => {
    if (isInView) {
      // Delay is preserved for choreographed stat entrances, but disabled when reduced motion wins.
      const timeout = setTimeout(() => {
        motionValue.set(to);
      }, (shouldReduceMotion ? 0 : delay) * 1000);
      return () => clearTimeout(timeout);
    }
  }, [isInView, to, delay, motionValue, shouldReduceMotion]);

  // -- Sync the spring output to the DOM without React state updates ----------
  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      if (displayRef.current) {
        // Render directly into the span to avoid a React state update every
        // animation frame. This keeps the component jank-free even when
        // multiple CountUp instances animate simultaneously.
        const rounded = Math.round(latest);
        const formatted = formatter ? formatter(rounded) : rounded.toLocaleString();
        displayRef.current.textContent = `${prefix}${formatted}${suffix}`;
      }
    });
    return unsubscribe;
  }, [springValue, prefix, suffix, formatter]);

  return (
    <span ref={ref} className={className} style={style}>
      {/* ds-nums-tabular (CRA-01, foundation/base/typography.css) locks every
          digit to a fixed advance width so the ticking value never jitters
          column-to-column as digits change on each animation frame. */}
      <span ref={displayRef} className="ds-nums-tabular">{prefix}{formatter ? formatter(from) : from.toLocaleString()}{suffix}</span>
    </span>
  );
};

CountUp.displayName = 'CountUp';
