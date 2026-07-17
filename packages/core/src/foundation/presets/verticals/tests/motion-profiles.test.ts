import { describe, expect, it } from 'vitest';

import { getVerticalPreset, VERTICAL_REGISTRY } from '..';

describe('built-in vertical motion profiles', () => {
  it.each([
    ['evnto', 'expressive'],
    ['bithire', 'calm'],
    ['platform', 'precise'],
  ] as const)('%s owns the %s semantic envelope', (vertical, profile) => {
    expect(getVerticalPreset(vertical)?.motionProfile).toBe(profile);
    expect(VERTICAL_REGISTRY[vertical]?.motionProfile).toBe(profile);
  });
});
