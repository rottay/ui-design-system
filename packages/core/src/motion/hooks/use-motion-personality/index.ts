'use client';

/**
 * @fileoverview Motion personality hook - Rottay Design System
 * @description Resolve motion defaults from the active token context while
 * respecting the user's reduced-motion preference.
 */

import { useReducedMotion } from 'framer-motion';

import { useTokens } from '../../../hooks';

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
    // When the user has prefers-reduced-motion enabled, all time-based and
    // distance-based values are zeroed out. This ensures elements appear in
    // their final position immediately without any movement or flicker.
    durationSeconds: shouldReduceMotion ? 0 : Math.max(animation.entranceDuration / 1000, 0.16),
    delaySeconds: shouldReduceMotion ? 0 : Math.max(animation.staggerDelay / 1000, 0),
    // Offset distance derives from intensity so playful personalities move
    // further while formal ones barely shift. The 12px floor prevents
    // zero-distance animations that would look like a glitch.
    offsetDistance: shouldReduceMotion ? 0 : Math.max(12, Math.round(18 * animation.intensity)),
    // Initial scale for mount animations. Subtracting 0.04 from hoverScale
    // creates a slight "grow into place" effect. The 0.88 floor prevents
    // elements from appearing too small before the animation begins.
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
