"use client";

/**
 * @fileoverview TextReveal motion primitive - Rottay Design System
 *
 * Splits a text string into characters, words, or lines and staggers
 * their entrance for a typewriter / kinetic-typography effect. Each
 * segment is wrapped in its own `motion.span` with variant-driven
 * animation inherited from the active motion personality.
 *
 * @example
 * ```tsx
 * <TextReveal text="Welcome to the platform" type="word" />
 * ```
 */

import React from "react";
import { motion } from "motion/react";
import type { TextRevealProps } from "@/graphics/motion/foundation/contracts";
import { useMotionPersonality } from "@/graphics/motion/react/runtime";
import {
  hasExplicitMotionTiming,
  motionMillisecondsToSeconds,
  motionSecondsToMilliseconds,
  resolveMotionMilliseconds,
} from "@/graphics/motion/foundation/timing";

/**
 * Reveal text by staggering individual characters, words, or lines into view.
 *
 * The `type` prop controls the granularity of the split. Spaces are preserved
 * as non-breaking spaces (`\u00A0`) so inline segments maintain correct
 * spacing even though each is an independent `inline-block` element.
 *
 * @param props - {@link TextRevealProps}
 * @param props.text - The plain-text string to animate.
 * @param props.type - Split granularity: `'char'` (default), `'word'`, or `'line'`.
 * @param props.delayMs - Milliseconds before the first segment appears.
 * @param props.durationMs - Total milliseconds from first segment start to last segment settle.
 * @param props.className - CSS class applied to the container `<div>`.
 * @param props.style - Inline styles applied to the container `<div>`.
 * @returns A `motion.div` containing individually animated `motion.span` segments.
 */
export const TextReveal: React.FC<TextRevealProps> = ({
  text,
  type = "char",
  delayMs,
  durationMs,
  delay,
  duration,
  className,
  style,
}) => {
  const motionPersonality = useMotionPersonality();
  const shouldReduceMotion = motionPersonality.shouldReduceMotion;
  const entrance = motionPersonality.entrance;
  const isStatic = Boolean(shouldReduceMotion) || entrance === "none";

  // -- Text segmentation ------------------------------------------------------
  // Split strategy is chosen by `type`: individual characters for dramatic
  // reveals, words for readable staggering, or lines for paragraph-level motion.
  const segments =
    type === "char"
      ? text.split("")
      : type === "word"
      ? text.split(" ")
      : text.split("\n");
  const segmentCount = Math.max(segments.length, 1);
  const hasExplicitDuration = hasExplicitMotionTiming(durationMs, duration);
  const effectiveDelayMs = resolveMotionMilliseconds({
    milliseconds: delayMs,
    legacy: delay,
    fallbackMilliseconds: motionSecondsToMilliseconds(
      motionPersonality.delaySeconds
    ),
  });
  const defaultSegmentDurationMs = Math.max(
    motionSecondsToMilliseconds(motionPersonality.durationSeconds) * 0.45,
    180
  );
  const defaultStaggerMs = Math.max(
    motionSecondsToMilliseconds(motionPersonality.delaySeconds),
    40
  );
  const explicitTotalDurationMs = resolveMotionMilliseconds({
    milliseconds: durationMs,
    legacy: duration,
    fallbackMilliseconds:
      defaultSegmentDurationMs + defaultStaggerMs * (segmentCount - 1),
  });
  // With an explicit total, equal time slots make the last segment settle at
  // exactly `durationMs`. Without one, retain personality-driven per-segment
  // cadence so long headlines do not collapse into imperceptible frames.
  const segmentDurationMs = hasExplicitDuration
    ? explicitTotalDurationMs / segmentCount
    : defaultSegmentDurationMs;
  const staggerIntervalMs = hasExplicitDuration
    ? explicitTotalDurationMs / segmentCount
    : defaultStaggerMs;
  const effectiveDelay = motionMillisecondsToSeconds(effectiveDelayMs);
  const segmentDuration = motionMillisecondsToSeconds(segmentDurationMs);
  const staggerInterval = motionMillisecondsToSeconds(staggerIntervalMs);

  // -- Container variants (orchestrator) --------------------------------------
  // The container itself only controls opacity and delegates per-child timing
  // via `delayChildren` and `staggerChildren`.
  const containerVariants = {
    hidden: isStatic ? { opacity: 1 } : { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: isStatic ? 0 : effectiveDelay,
        staggerChildren: isStatic ? 0 : staggerInterval,
      },
    },
  };

  // -- Per-segment hidden state -----------------------------------------------
  // Each entrance mode uses different y-offset and scale values to create
  // distinct character-level aesthetics (bounce is punchier, spring is subtler).
  const hiddenVariant = isStatic
    ? { opacity: 1, y: 0, scale: 1 }
    : entrance === "fade"
    ? { opacity: 0, y: 0, scale: 1 }
    : entrance === "bounce"
    ? { opacity: 0, y: 8, scale: 0.94 }
    : entrance === "spring"
    ? { opacity: 0, y: 6, scale: 0.97 }
    : { opacity: 0, y: 10, scale: 1 };

  const segmentVariants = {
    hidden: hiddenVariant,
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <motion.div
      initial={isStatic ? false : "hidden"}
      {...(isStatic
        ? { animate: "visible" }
        : { whileInView: "visible", viewport: { once: true, amount: 0.5 } })}
      variants={containerVariants}
      data-ds-motion-primitive="text-reveal"
      data-ds-motion-state={isStatic ? "static" : "entrance"}
      className={className}
      style={style}
    >
      {segments.map((segment, index) => (
        <motion.span
          key={`${type}-${index}`}
          variants={segmentVariants}
          transition={
            isStatic
              ? { duration: 0 }
              : entrance === "spring" ||
                entrance === "bounce" ||
                motionPersonality.useSpring
              ? hasExplicitDuration
                ? {
                    type: "spring",
                    duration: segmentDuration,
                    bounce: entrance === "bounce" ? 0.32 : 0.12,
                  }
                : {
                    type: "spring",
                    stiffness: motionPersonality.springTension,
                    damping: motionPersonality.springFriction,
                    bounce: entrance === "bounce" ? 0.32 : 0.12,
                  }
              : {
                  duration: segmentDuration,
                }
          }
          // Lines are rendered as blocks so they stack vertically; chars and
          // words use inline-block to flow horizontally within the container.
          style={{ display: type === "line" ? "block" : "inline-block" }}
        >
          {/* Replace literal spaces with non-breaking spaces so inline-block
              segments don't collapse whitespace between them. */}
          {segment === " " ? "\u00A0" : segment}
          {type === "word" && index < segments.length - 1 ? "\u00A0" : ""}
        </motion.span>
      ))}
    </motion.div>
  );
};

TextReveal.displayName = "TextReveal";
