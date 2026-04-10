'use client';

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

import React from 'react';
import { motion } from 'framer-motion';
import type { TextRevealProps } from '../../types';
import { useMotionPersonality } from '../../hooks';

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
 * @param props.delay - Seconds before the first segment appears.
 * @param props.duration - Stagger interval between segments in seconds.
 * @param props.className - CSS class applied to the container `<div>`.
 * @param props.style - Inline styles applied to the container `<div>`.
 * @returns A `motion.div` containing individually animated `motion.span` segments.
 */
export const TextReveal: React.FC<TextRevealProps> = ({
  text,
  type = 'char',
  delay,
  duration,
  className,
  style,
}) => {
  const motionPersonality = useMotionPersonality();
  const shouldReduceMotion = motionPersonality.shouldReduceMotion;
  const effectiveDelay = delay ?? motionPersonality.delaySeconds;
  const effectiveDuration = duration ?? Math.max(motionPersonality.delaySeconds, 0.04);
  const entrance = motionPersonality.entrance;

  // -- Text segmentation ------------------------------------------------------
  // Split strategy is chosen by `type`: individual characters for dramatic
  // reveals, words for readable staggering, or lines for paragraph-level motion.
  const segments = type === 'char' ? text.split('') : type === 'word' ? text.split(' ') : text.split('\n');

  // -- Container variants (orchestrator) --------------------------------------
  // The container itself only controls opacity and delegates per-child timing
  // via `delayChildren` and `staggerChildren`.
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: shouldReduceMotion || entrance === 'none' ? 0 : effectiveDelay,
        staggerChildren: shouldReduceMotion || entrance === 'none' ? 0 : effectiveDuration,
      },
    },
  };

  // -- Per-segment hidden state -----------------------------------------------
  // Each entrance mode uses different y-offset and scale values to create
  // distinct character-level aesthetics (bounce is punchier, spring is subtler).
  const hiddenVariant = shouldReduceMotion || entrance === 'none'
    ? { opacity: 1, y: 0, scale: 1 }
    : entrance === 'fade'
      ? { opacity: 0, y: 0, scale: 1 }
      : entrance === 'bounce'
        ? { opacity: 0, y: 8, scale: 0.94 }
        : entrance === 'spring'
          ? { opacity: 0, y: 6, scale: 0.97 }
          : { opacity: 0, y: 10, scale: 1 };

  const segmentVariants = {
    hidden: hiddenVariant,
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <motion.div
      initial={entrance === 'none' ? false : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      variants={containerVariants}
      className={className}
      style={style}
    >
      {segments.map((segment, index) => (
        <motion.span
          key={`${type}-${index}`}
          variants={segmentVariants}
          transition={
            shouldReduceMotion || entrance === 'none'
              ? { duration: 0 }
              : entrance === 'spring' || entrance === 'bounce' || motionPersonality.useSpring
                ? {
                    type: 'spring',
                    stiffness: motionPersonality.springTension,
                    damping: motionPersonality.springFriction,
                    bounce: entrance === 'bounce' ? 0.32 : 0.12,
                  }
                : {
                    duration: Math.max(motionPersonality.durationSeconds * 0.45, 0.18),
                  }
          }
          // Lines are rendered as blocks so they stack vertically; chars and
          // words use inline-block to flow horizontally within the container.
          style={{ display: type === 'line' ? 'block' : 'inline-block' }}
        >
          {/* Replace literal spaces with non-breaking spaces so inline-block
              segments don't collapse whitespace between them. */}
          {segment === ' ' ? '\u00A0' : segment}
          {type === 'word' && index < segments.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </motion.div>
  );
};

TextReveal.displayName = 'TextReveal';
