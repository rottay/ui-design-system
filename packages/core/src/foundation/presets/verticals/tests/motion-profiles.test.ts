import { describe, expect, it } from 'vitest';

import { getVerticalPreset, VERTICAL_REGISTRY } from '..';

describe('built-in vertical motion profiles', () => {
  it.each([
    ['evnto', 'expressive'],
    ['bithire', 'calm'],
    ['rottay', 'precise'],
  ] as const)('%s owns the %s semantic envelope', (vertical, profile) => {
    expect(getVerticalPreset(vertical)?.motionProfile).toBe(profile);
    expect(VERTICAL_REGISTRY[vertical]?.motionProfile).toBe(profile);
  });

  it('the retired `platform` key resolves to nothing, with no alias', () => {
    // `getVerticalPreset` returns undefined for unknown keys by design, so a
    // surviving `platform` caller degrades silently to DS defaults rather than
    // throwing. That is precisely why the absence is asserted here instead of
    // being left to a caller to discover in production.
    expect(getVerticalPreset('platform')).toBeUndefined();
    expect(VERTICAL_REGISTRY.platform).toBeUndefined();
    expect(Object.keys(VERTICAL_REGISTRY).sort()).toEqual([
      'bithire',
      'evnto',
      'rottay',
    ]);
  });
});
