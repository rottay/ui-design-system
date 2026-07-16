"use client";

/**
 * @fileoverview StaggerChildren motion primitive - Rottay Design System
 *
 * Coordinates the reveal timing of a list of child elements so they animate
 * in sequentially rather than all at once. Each child is delayed by
 * `staggerDelayMs` milliseconds after the previous one, producing a cascading
 * entrance effect commonly used for card grids, nav items, and list views.
 *
 * @example
 * ```tsx
 * <StaggerChildren staggerDelayMs={80}>
 *   {items.map((item) => (
 *     <motion.div key={item.id} variants={childVariants}>
 *       <Card>{item.title}</Card>
 *     </motion.div>
 *   ))}
 * </StaggerChildren>
 * ```
 */

import React, { Children, forwardRef, useMemo } from "react";
import { motion } from "motion/react";
import type { StaggerChildrenProps } from "../../types";
import { useMotionPersonality } from "../../hooks";
import {
  hasExplicitMotionTiming,
  motionMillisecondsToSeconds,
  motionSecondsToMilliseconds,
  resolveMotionMilliseconds,
} from "../../internal/timing";
import { resolveMotionTransformStyle } from "../../internal/transform";

/**
 * Reveal children as a coordinated, staggered group while preserving
 * reduced-motion behavior.
 *
 * Uses Motion's variant propagation: the container transitions from
 * `"hidden"` to `"visible"`, and children that also define those variant
 * keys inherit the stagger schedule automatically.
 *
 * @param props - {@link StaggerChildrenProps}
 * @param props.children - Elements to stagger. Each should consume `variants` for full effect.
 * @param props.durationMs - Duration of the container entrance in milliseconds.
 * @param props.delayMs - Delay before the container entrance in milliseconds.
 * @param props.staggerDelayMs - Milliseconds between each child's entrance.
 * @param props.delayChildrenMs - Milliseconds before the first child starts.
 * @param props.once - Whether viewport choreography runs only on first entry.
 * @param props.className - CSS class applied to the container wrapper.
 * @param props.style - Inline styles applied to the container wrapper.
 * @returns A `motion.div` container that orchestrates staggered child reveals.
 */
export const StaggerChildren = forwardRef<HTMLDivElement, StaggerChildrenProps>(
  (
    {
      children,
      durationMs,
      delayMs,
      staggerDelayMs,
      delayChildrenMs,
      duration,
      delay,
      staggerDelay,
      delayChildren,
      once = true,
      className,
      style,
    },
    ref
  ) => {
    const motionPersonality = useMotionPersonality();
    const shouldReduceMotion = motionPersonality.shouldReduceMotion;

    const personalityDelayMs = motionSecondsToMilliseconds(
      motionPersonality.delaySeconds
    );
    const personalityDurationMs = motionSecondsToMilliseconds(
      motionPersonality.durationSeconds
    );
    const effectiveDurationMs = resolveMotionMilliseconds({
      milliseconds: durationMs,
      legacy: duration,
      fallbackMilliseconds: Math.max(personalityDurationMs * 0.45, 180),
    });
    const effectiveDelayMs = resolveMotionMilliseconds({
      milliseconds: delayMs,
      legacy: delay,
      fallbackMilliseconds: 0,
    });
    const effectiveStaggerDelayMs = resolveMotionMilliseconds({
      milliseconds: staggerDelayMs,
      legacy: staggerDelay,
      fallbackMilliseconds: Math.max(personalityDelayMs, 40),
    });
    const effectiveDelayChildrenMs = resolveMotionMilliseconds({
      milliseconds: delayChildrenMs,
      legacy: delayChildren,
      fallbackMilliseconds: Math.max(personalityDelayMs * 0.5, 0),
    });
    const durationScale = motionPersonality.policy.durationScale;
    const scaleExplicitTiming = (value: number, explicit: boolean): number =>
      explicit ? Math.round(value * durationScale) : value;
    const childCount = Children.count(children);
    const scaledStaggerDelayMs = scaleExplicitTiming(
      effectiveStaggerDelayMs,
      hasExplicitMotionTiming(staggerDelayMs, staggerDelay),
    );
    const boundedStaggerDelayMs = childCount > 1
      ? Math.min(
          scaledStaggerDelayMs,
          motionPersonality.staggerMaxMs / (childCount - 1),
        )
      : scaledStaggerDelayMs;
    const effectiveDuration = motionMillisecondsToSeconds(
      scaleExplicitTiming(
        effectiveDurationMs,
        hasExplicitMotionTiming(durationMs, duration),
      ),
    );
    const effectiveDelay = motionMillisecondsToSeconds(
      scaleExplicitTiming(effectiveDelayMs, hasExplicitMotionTiming(delayMs, delay)),
    );
    const effectiveStaggerDelay = motionMillisecondsToSeconds(
      boundedStaggerDelayMs,
    );
    const effectiveDelayChildren = motionMillisecondsToSeconds(
      scaleExplicitTiming(
        effectiveDelayChildrenMs,
        hasExplicitMotionTiming(delayChildrenMs, delayChildren),
      ),
    );
    const hasExplicitDuration = hasExplicitMotionTiming(durationMs, duration);
    const entrance = motionPersonality.entrance;
    const fadeEase = [0.16, 1, 0.3, 1] as const;
    const isStatic = Boolean(shouldReduceMotion) || entrance === "none";
    const resolvedStyle = useMemo(
      () => resolveMotionTransformStyle(style),
      [style]
    );

    const choreography = isStatic
      ? { duration: 0, delay: 0, delayChildren: 0, staggerChildren: 0 }
      : entrance === "spring" ||
        entrance === "bounce" ||
        motionPersonality.useSpring
      ? hasExplicitDuration
        ? {
            type: "spring" as const,
            duration: effectiveDuration,
            delay: effectiveDelay,
            delayChildren: effectiveDelayChildren,
            staggerChildren: effectiveStaggerDelay,
            bounce: entrance === "bounce" ? 0.28 : 0.1,
          }
        : {
            type: "spring" as const,
            stiffness: motionPersonality.springTension,
            damping: motionPersonality.springFriction,
            delay: effectiveDelay,
            delayChildren: effectiveDelayChildren,
            staggerChildren: effectiveStaggerDelay,
            bounce: entrance === "bounce" ? 0.28 : 0.1,
          }
      : {
          duration: effectiveDuration,
          delay: effectiveDelay,
          delayChildren: effectiveDelayChildren,
          staggerChildren: effectiveStaggerDelay,
          ease: fadeEase,
        };

    return (
      <motion.div
        ref={ref}
        // Setting `initial` to `false` when entrance is 'none' prevents
        // Motion from applying hidden styles entirely, avoiding a
        // flash of invisible content.
        initial={isStatic ? false : "hidden"}
        {...(isStatic
          ? { animate: "visible" }
          : { whileInView: "visible", viewport: { once, amount: 0.2 } })}
        variants={{
          hidden: isStatic
            ? { opacity: 1 }
            : entrance === "fade"
            ? { opacity: 0 }
            : // Non-fade entrances add a scaled-down vertical offset (40% of
              // the personality's distance) for a subtler group-level shift.
              {
                opacity: 0,
                y: motionPersonality.offsetDistance * 0.4,
              },
          visible: {
            opacity: 1,
            y: 0,
            transition: choreography,
          },
        }}
        transformTemplate={resolvedStyle.transformTemplate}
        data-ds-motion-primitive="stagger-children"
        data-ds-motion-state={isStatic ? "static" : "entrance"}
        className={className}
        style={resolvedStyle.style}
      >
        {children}
      </motion.div>
    );
  }
);

StaggerChildren.displayName = "StaggerChildren";
