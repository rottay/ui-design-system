import { describe, expect, it } from 'vitest';

import { isParticleAnimationEligible } from '..';

describe('ParticleField eligibility policy', () => {
  it.each([
    ['offscreen', false, {}],
    ['ambient disabled', true, { allowAmbientMotion: false }],
    ['reduced', true, { reduce: true }],
    ['coarse pointer', true, { pointer: 'coarse' }],
    ['save-data/constrained', true, { power: 'constrained' }],
    ['hidden', true, { visible: false }],
    ['no loop budget', true, { maxContinuousLoops: 0 }],
  ] as const)('fails closed when %s', (_name, inView, override) => {
    expect(isParticleAnimationEligible(inView, {
      allowAmbientMotion: true,
      maxContinuousLoops: 1,
      pointer: 'fine',
      power: 'normal',
      reduce: false,
      visible: true,
      ...override,
    })).toBe(false);
  });

  it('allows an in-view field only under the complete ambient policy', () => {
    expect(isParticleAnimationEligible(true, {
      allowAmbientMotion: true,
      maxContinuousLoops: 1,
      pointer: 'fine',
      power: 'normal',
      reduce: false,
      visible: true,
    })).toBe(true);
  });
});
