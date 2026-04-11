'use client';

/**
 * @fileoverview Stats-grid personality helpers. Translates global personality
 * tokens into the smaller motion contract the stats grid engines need
 * (animate, duration, skeletonAnimation).
 *
 * This is a pure function (no hooks) so it can be called from engine
 * adapters that may or may not be React components.
 */
import type { PersonalityTokens } from '../../../../contracts';

export interface ResolvedStatsGridMotion {
  animate: boolean;
  duration: number;
  skeletonAnimation: 'pulse' | 'wave';
}

/**
 * Resolves stats-grid animation behavior from personality tokens and
 * the user's motion preference.
 *
 * The `animate` parameter takes highest priority, followed by the
 * personality's `countUpEnabled` flag, and finally `prefersReducedMotion`
 * as a veto. Duration is derived from the personality's entrance duration
 * but floored at 360ms because shorter count-up animations feel jarring
 * on numeric stat cards.
 *
 * @param personality - Global personality tokens from the design system context.
 * @param prefersReducedMotion - Whether the user's OS requests reduced motion.
 * @param animate - Explicit override; when provided, bypasses personality logic.
 * @returns A resolved motion contract for the stats grid engines.
 *
 * @example
 * ```tsx
 * const motion = resolveStatsGridMotion(tokens.personality, prefersReducedMotion);
 * // motion.animate, motion.duration, motion.skeletonAnimation
 * ```
 */
export function resolveStatsGridMotion(
  personality: PersonalityTokens,
  prefersReducedMotion: boolean,
  animate?: boolean
): ResolvedStatsGridMotion {
  const shouldAnimate =
    animate ?? (personality.animation.countUpEnabled && !prefersReducedMotion);

  return {
    animate: shouldAnimate,
    // Stats benefit from a slightly longer count-up than generic entrance
    // motion. The 2x multiplier and 360ms floor were tuned empirically.
    duration: Math.max(360, personality.animation.entranceDuration * 2),
    skeletonAnimation:
      personality.animation.skeletonStyle === 'wave' ? 'wave' : 'pulse',
  };
}
