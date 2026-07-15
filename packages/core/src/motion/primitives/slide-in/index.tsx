"use client";

/**
 * @fileoverview SlideIn motion primitive - Rottay Design System
 *
 * Reveals content with a pronounced directional offset combined with an
 * opacity fade. Compared to `FadeIn`, SlideIn enforces a minimum travel
 * distance (24px) so the positional shift is always perceptible, making
 * it better suited for panels, drawers, and section entrances.
 *
 * @example
 * ```tsx
 * <SlideIn direction="left" distance={60}>
 *   <Sidebar />
 * </SlideIn>
 * ```
 */

import React, { forwardRef, useMemo } from "react";
import { motion } from "motion/react";
import type { SlideInProps } from "../../types";
import { useMotionPersonality } from "../../hooks";
import {
  hasExplicitMotionTiming,
  motionMillisecondsToSeconds,
  motionSecondsToMilliseconds,
  resolveMotionMilliseconds,
} from "../../internal/timing";
import { resolveMotionTransformStyle } from "../../internal/transform";

/**
 * Slide content into view while honoring tenant motion defaults and reduced motion.
 *
 * The four supported directions map to x/y pixel offsets. When the personality
 * entrance is `'fade'`, the directional offset is suppressed and the component
 * behaves as a pure crossfade.
 *
 * @param props - {@link SlideInProps}
 * @param props.children - Content to reveal with a slide animation.
 * @param props.direction - Edge the content slides in from. Defaults to `'left'`.
 * @param props.distance - Pixel offset for the slide. Minimum 24px from personality defaults.
 * @param props.durationMs - Duration in milliseconds.
 * @param props.delayMs - Delay in milliseconds before the animation starts.
 * @param props.once - When `true` (default), the animation fires only on first viewport entry.
 * @param props.className - CSS class applied to the motion wrapper.
 * @param props.style - Inline styles applied to the motion wrapper.
 * @returns A `motion.div` that slides and fades its children into view.
 */
export const SlideIn = forwardRef<HTMLDivElement, SlideInProps>(
  (
    {
      children,
      direction = "left",
      distance,
      durationMs,
      delayMs,
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

    // Keep slide animations aligned with profile defaults unless the caller
    // intentionally overrides them. The 24px floor ensures the slide is always
    // visually distinct from a FadeIn even with low-motion personalities.
    const effectiveDistance =
      distance ?? Math.max(motionPersonality.offsetDistance, 24);
    const effectiveDurationMs = resolveMotionMilliseconds({
      milliseconds: durationMs,
      legacy: duration,
      fallbackMilliseconds: Math.max(
        motionSecondsToMilliseconds(motionPersonality.durationSeconds),
        200
      ),
    });
    const effectiveDelayMs = resolveMotionMilliseconds({
      milliseconds: delayMs,
      legacy: delay,
      fallbackMilliseconds: motionSecondsToMilliseconds(
        motionPersonality.delaySeconds
      ),
    });
    const effectiveDuration = motionMillisecondsToSeconds(effectiveDurationMs);
    const effectiveDelay = motionMillisecondsToSeconds(effectiveDelayMs);
    const hasExplicitDuration = hasExplicitMotionTiming(durationMs, duration);
    const resolvedStyle = useMemo(
      () => resolveMotionTransformStyle(style),
      [style]
    );

    // -- Directional offset calculation ---------------------------------------
    const getOffset = () => {
      if (shouldReduceMotion) return { x: 0, y: 0 };
      switch (direction) {
        case "up":
          return { x: 0, y: effectiveDistance };
        case "down":
          return { x: 0, y: -effectiveDistance };
        case "left":
          return { x: effectiveDistance, y: 0 };
        case "right":
          return { x: -effectiveDistance, y: 0 };
        default:
          return { x: 0, y: 0 };
      }
    };

    const offset = getOffset();

    // -- Transition: instant | spring | tween ---------------------------------
    // The [0.22, 1, 0.36, 1] bezier produces a fast-in, slow-out curve that
    // emphasizes the arrival position rather than the departure.
    const isStatic =
      Boolean(shouldReduceMotion) || motionPersonality.entrance === "none";
    const transition = isStatic
      ? { duration: 0, delay: 0 }
      : motionPersonality.entrance === "spring" ||
        motionPersonality.entrance === "bounce" ||
        motionPersonality.useSpring
      ? hasExplicitDuration
        ? {
            type: "spring" as const,
            duration: effectiveDuration,
            delay: effectiveDelay,
            bounce: motionPersonality.entrance === "bounce" ? 0.35 : 0.14,
          }
        : {
            type: "spring" as const,
            stiffness: motionPersonality.springTension,
            damping: motionPersonality.springFriction,
            delay: effectiveDelay,
            bounce: motionPersonality.entrance === "bounce" ? 0.35 : 0.14,
          }
      : {
          duration: effectiveDuration,
          delay: effectiveDelay,
          ease: [0.22, 1, 0.36, 1] as const,
        };

    // -- Initial state --------------------------------------------------------
    const initial = isStatic
      ? { opacity: 1, x: 0, y: 0 }
      : motionPersonality.entrance === "fade"
      ? { opacity: 0, x: 0, y: 0 }
      : { opacity: 0, x: offset.x, y: offset.y };

    return (
      <motion.div
        ref={ref}
        initial={isStatic ? false : initial}
        // Like FadeIn, viewport-based animation is the default because most call
        // sites are page sections rather than isolated micro-interactions.
        {...(isStatic
          ? { animate: { opacity: 1, x: 0, y: 0 } }
          : once
          ? {
              whileInView: { opacity: 1, x: 0, y: 0 },
              viewport: { once: true, amount: 0.3 },
            }
          : { animate: { opacity: 1, x: 0, y: 0 } })}
        transition={transition}
        transformTemplate={resolvedStyle.transformTemplate}
        data-ds-motion-primitive="slide-in"
        data-ds-motion-state={isStatic ? "static" : "entrance"}
        className={className}
        style={resolvedStyle.style}
      >
        {children}
      </motion.div>
    );
  }
);

SlideIn.displayName = "SlideIn";
