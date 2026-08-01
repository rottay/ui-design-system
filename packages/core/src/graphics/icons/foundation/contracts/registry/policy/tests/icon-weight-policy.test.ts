/**
 * Icon weight policy (C1b substrate): the expressive posture tables are
 * proven executable while the axis itself stays FRONTIER (no tenant schema
 * accepts it, no provider stamps it). State weights remain supreme in every
 * posture — feedback is never traded for decoration.
 */
import { describe, expect, it } from 'vitest';

import { resolveIconWeight } from '..';

describe('resolveIconWeight', () => {
  it('keeps today\'s behavior byte-identical without a profile', () => {
    expect(resolveIconWeight('control', 'idle')).toBe('regular');
    expect(resolveIconWeight('navigation', 'idle')).toBe('regular');
    expect(resolveIconWeight('feature', 'idle')).toBe('duotone');
    expect(resolveIconWeight('status', 'idle')).toBe('duotone');
    expect(resolveIconWeight('illustration', 'idle')).toBe('duotone');
  });

  it('selects the posture table when a profile is provided', () => {
    expect(resolveIconWeight('feature', 'idle', 'linear')).toBe('regular');
    expect(resolveIconWeight('status', 'idle', 'linear')).toBe('regular');
    expect(resolveIconWeight('control', 'idle', 'strong-outline')).toBe('bold');
    expect(resolveIconWeight('navigation', 'idle', 'duotone')).toBe('duotone');
    expect(resolveIconWeight('control', 'idle', 'duotone')).toBe('regular');
    expect(resolveIconWeight('feature', 'idle', 'solid-active')).toBe('fill');
  });

  it('never lets a posture override a state weight', () => {
    for (const profile of [
      'linear',
      'strong-outline',
      'duotone',
      'solid-active',
    ] as const) {
      expect(resolveIconWeight('control', 'active', profile)).toBe('fill');
      expect(resolveIconWeight('status', 'busy', profile)).toBe('bold');
      expect(resolveIconWeight('feature', 'success', profile)).toBe('fill');
      expect(resolveIconWeight('navigation', 'error', profile)).toBe('fill');
    }
  });
});
