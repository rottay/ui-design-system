'use client';

import React, { useEffect, useRef } from 'react';
import { useMotionValue, useSpring, useInView } from 'framer-motion';
import type { CountUpProps } from '../../types';
import { useMotionPersonality } from '../../hooks';

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
  const shouldReduceMotion =
    motionPersonality.shouldReduceMotion || !motionPersonality.countUpEnabled;
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(from);
  const springValue = useSpring(motionValue, {
    damping: motionPersonality.springFriction,
    stiffness: motionPersonality.springTension,
    duration: shouldReduceMotion ? 0 : duration * 1000,
  });
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const displayRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (isInView) {
      const timeout = setTimeout(() => {
        motionValue.set(to);
      }, (shouldReduceMotion ? 0 : delay) * 1000);
      return () => clearTimeout(timeout);
    }
  }, [isInView, to, delay, motionValue, shouldReduceMotion]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      if (displayRef.current) {
        const rounded = Math.round(latest);
        const formatted = formatter ? formatter(rounded) : rounded.toLocaleString();
        displayRef.current.textContent = `${prefix}${formatted}${suffix}`;
      }
    });
    return unsubscribe;
  }, [springValue, prefix, suffix, formatter]);

  return (
    <span ref={ref} className={className} style={style}>
      <span ref={displayRef}>{prefix}{formatter ? formatter(from) : from.toLocaleString()}{suffix}</span>
    </span>
  );
};

CountUp.displayName = 'CountUp';
