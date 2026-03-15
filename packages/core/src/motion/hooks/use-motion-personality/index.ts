'use client';

import { useReducedMotion } from 'framer-motion';

import { useTokens } from '../../../core/hooks';

/**
 * Central motion defaults resolved from product profile + tenant/theme tokens.
 * Motion primitives can still override props explicitly, but when they do not
 * we want them to inherit the visual personality of the active product.
 */
export function useMotionPersonality() {
  const tokens = useTokens();
  const shouldReduceMotion = useReducedMotion();
  const animation = tokens.personality.animation;

  return {
    shouldReduceMotion,
    entrance: animation.entrance,
    useSpring: animation.useSpring,
    durationSeconds: shouldReduceMotion ? 0 : Math.max(animation.entranceDuration / 1000, 0.16),
    delaySeconds: shouldReduceMotion ? 0 : Math.max(animation.staggerDelay / 1000, 0),
    offsetDistance: shouldReduceMotion ? 0 : Math.max(12, Math.round(18 * animation.intensity)),
    initialScale: shouldReduceMotion ? 1 : Math.max(0.88, animation.hoverScale - 0.04),
    hoverLift: animation.hoverLift,
    hoverScale: animation.hoverScale,
    springTension: animation.springTension,
    springFriction: animation.springFriction,
    pulseSpeed: animation.pulseSpeed,
    skeletonStyle: animation.skeletonStyle,
    countUpEnabled: animation.countUpEnabled,
  };
}
