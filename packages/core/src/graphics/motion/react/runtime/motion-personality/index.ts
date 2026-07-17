'use client';

/**
 * @fileoverview Motion personality hook - Rottay Design System
 * @description Resolve motion defaults from the active token context while
 * respecting the user's reduced-motion preference.
 */

import { useTokens } from '@/infrastructure/runtime/theming/composition/react/tokens';
import { useMotionPolicy } from '@/infrastructure/runtime/motion';
import { resolveMotionProfileEnvelope } from '@/infrastructure/runtime/foundation/motion/policy';

/**
 * Central motion defaults resolved from product profile + tenant/theme tokens.
 * Motion primitives can still override props explicitly, but when they do not
 * we want them to inherit the visual personality of the active product.
 */
export function useMotionPersonality() {
  const tokens = useTokens();
  const policy = useMotionPolicy();
  const shouldReduceMotion = policy.reduce;
  const animation = tokens.personality.animation;
  const envelope = resolveMotionProfileEnvelope(policy.profile);
  const durationMs = shouldReduceMotion
    ? 0
    : Math.round(envelope.baseDurationMs * policy.durationScale);
  const delayMs = shouldReduceMotion
    ? 0
    : Math.round(envelope.staggerDelayMs * policy.durationScale);
  const staggerMaxMs = shouldReduceMotion
    ? 0
    : Math.round(envelope.staggerMaxMs * policy.durationScale);
  const offsetDistance = shouldReduceMotion
    ? 0
    : Math.round(envelope.maxOffsetPx * policy.intensity * 100) / 100;
  const hoverScale = policy.allowHoverEffects
    ? 1 + envelope.maxScaleDelta * policy.intensity
    : 1;

  return {
    shouldReduceMotion,
    policy,
    // Preserve the compatibility union while the legacy entrance branches
    // remain in primitives for one minor; built-in policy emits only the
    // three sanctioned profile values above.
    entrance: envelope.entrance as typeof animation.entrance,
    useSpring: envelope.useSpring,
    // When the user has prefers-reduced-motion enabled, all time-based and
    // distance-based values are zeroed out. This ensures elements appear in
    // their final position immediately without any movement or flicker.
    durationMs,
    delayMs,
    durationSeconds: durationMs / 1000,
    delaySeconds: delayMs / 1000,
    staggerMaxMs,
    offsetDistance,
    initialScale: shouldReduceMotion
      ? 1
      : Math.max(0.96, hoverScale - Math.min(0.04, envelope.maxScaleDelta + 0.01)),
    hoverLift: policy.allowHoverEffects ? offsetDistance : 0,
    hoverScale,
    springTension: envelope.springTension,
    springFriction: envelope.springFriction,
    pulseSpeed: policy.allowContinuousMotion ? animation.pulseSpeed : 'none',
    skeletonStyle: animation.skeletonStyle,
    countUpEnabled: animation.countUpEnabled,
  };
}
