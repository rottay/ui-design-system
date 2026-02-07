'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { TextRevealProps } from '../../types';

export const TextReveal: React.FC<TextRevealProps> = ({
  text,
  type = 'char',
  delay = 0,
  duration = 0.05,
  className,
  style,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const segments = type === 'char' ? text.split('') : type === 'word' ? text.split(' ') : text.split('\n');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: shouldReduceMotion ? 0 : delay,
        staggerChildren: shouldReduceMotion ? 0 : duration,
      },
    },
  };

  const segmentVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
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
