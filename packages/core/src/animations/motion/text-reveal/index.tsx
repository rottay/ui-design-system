'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { TextRevealProps } from '../../types';
import { useMotionPersonality } from '../../hooks';

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

  const segments = type === 'char' ? text.split('') : type === 'word' ? text.split(' ') : text.split('\n');

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
          style={{ display: type === 'line' ? 'block' : 'inline-block' }}
        >
          {segment === ' ' ? '\u00A0' : segment}
          {type === 'word' && index < segments.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </motion.div>
  );
};

TextReveal.displayName = 'TextReveal';
