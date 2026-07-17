import { describe, expect, it } from 'vitest';

import { resolveStatsGridMotion } from '../foundation/personality';
import { DEFAULT_PERSONALITY } from '@/infrastructure/runtime/theming/composition/react/tokens';

describe('resolveStatsGridMotion', () => {
  it('uses personality defaults when animation is not forced', () => {
    const result = resolveStatsGridMotion(
      {
        ...DEFAULT_PERSONALITY,
        animation: {
          ...DEFAULT_PERSONALITY.animation,
          countUpEnabled: true,
        },
      },
      false,
      undefined
    );

    expect(result.animate).toBe(true);
    expect(result.duration).toBeGreaterThan(300);
    expect(result.skeletonAnimation).toBe('pulse');
  });

  it('disables animated count-up when reduced motion is preferred', () => {
    const result = resolveStatsGridMotion(
      {
        ...DEFAULT_PERSONALITY,
        animation: {
          ...DEFAULT_PERSONALITY.animation,
          countUpEnabled: true,
          skeletonStyle: 'wave',
        },
      },
      true,
      undefined
    );

    expect(result.animate).toBe(false);
    expect(result.skeletonAnimation).toBe('wave');
  });
});
