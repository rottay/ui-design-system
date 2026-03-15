'use client';

import type { PersonalityTokens } from '../../../contracts';

export interface ResolvedStatsGridMotion {
  animate: boolean;
  duration: number;
  skeletonAnimation: 'pulse' | 'wave';
}

export function resolveStatsGridMotion(
  personality: PersonalityTokens,
  prefersReducedMotion: boolean,
  animate?: boolean
): ResolvedStatsGridMotion {
  const shouldAnimate =
    animate ?? (personality.animation.countUpEnabled && !prefersReducedMotion);

  return {
    animate: shouldAnimate,
    duration: Math.max(360, personality.animation.entranceDuration * 2),
    skeletonAnimation:
      personality.animation.skeletonStyle === 'wave' ? 'wave' : 'pulse',
  };
}
