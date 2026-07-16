import { describe, expect, it } from 'vitest';

import { MOTION_DIAL_BOUNDS } from '../../../contracts/motion';
import type {
  AmbientMotion,
  MotionPointer,
  MotionPower,
} from '../../../contracts/motion';
import {
  MOTION_PROFILE_DEFAULTS,
  normalizeTenantMotionDial,
  resolveMotionPolicy,
} from '../policy';

describe('normalizeTenantMotionDial', () => {
  it('publishes differentiated defaults for every MotionProfile', () => {
    expect(MOTION_PROFILE_DEFAULTS).toEqual({
      precise: { intensity: 0.45, durationScale: 0.85, ambient: 'subtle' },
      calm: { intensity: 0.3, durationScale: 1, ambient: 'off' },
      expressive: { intensity: 0.8, durationScale: 0.95, ambient: 'subtle' },
    });

    expect(new Set(Object.values(MOTION_PROFILE_DEFAULTS).map(JSON.stringify)).size).toBe(3);
  });

  it('publishes and enforces the bounded tenant surface', () => {
    expect(MOTION_DIAL_BOUNDS).toEqual({
      intensity: { min: 0, max: 1 },
      durationScale: { min: 0.5, max: 1.5 },
    });

    expect(
      normalizeTenantMotionDial(
        { intensity: -10, durationScale: 20, ambient: 'subtle' },
        'precise',
      ),
    ).toEqual({ intensity: 0, durationScale: 1.5, ambient: 'subtle' });
    expect(
      normalizeTenantMotionDial(
        { intensity: 20, durationScale: -10, ambient: 'off' },
        'expressive',
      ),
    ).toEqual({ intensity: 1, durationScale: 0.5, ambient: 'off' });
  });

  it.each([
    ['NaN', { intensity: Number.NaN, durationScale: Number.NaN, ambient: 'loud' }],
    ['Infinity', { intensity: Number.POSITIVE_INFINITY, durationScale: Number.NEGATIVE_INFINITY }],
    ['coercible strings', { intensity: '0.9', durationScale: '1.2', ambient: true }],
    ['null', null],
    ['array', []],
  ])('fails closed for %s input', (_label, input) => {
    expect(normalizeTenantMotionDial(input, 'calm')).toEqual(
      MOTION_PROFILE_DEFAULTS.calm,
    );
  });

  it('contains throwing getters and hostile proxies', () => {
    const getter = Object.defineProperty({}, 'intensity', {
      get() {
        throw new Error('untrusted getter');
      },
    });
    const proxy = new Proxy(
      {},
      {
        get() {
          throw new Error('untrusted proxy');
        },
      },
    );

    expect(normalizeTenantMotionDial(getter, 'precise')).toEqual(
      MOTION_PROFILE_DEFAULTS.precise,
    );
    expect(normalizeTenantMotionDial(proxy, 'expressive')).toEqual(
      MOTION_PROFILE_DEFAULTS.expressive,
    );
  });

  it('falls back to calm for an invalid runtime profile', () => {
    expect(
      normalizeTenantMotionDial(undefined, 'unknown' as never),
    ).toEqual(MOTION_PROFILE_DEFAULTS.calm);
  });
});

describe('resolveMotionPolicy', () => {
  const booleans = [false, true] as const;
  const pointers = ['coarse', 'fine'] as const satisfies readonly MotionPointer[];
  const powers = ['normal', 'constrained'] as const satisfies readonly MotionPower[];
  const ambients = ['off', 'subtle'] as const satisfies readonly AmbientMotion[];

  it('covers the complete accessibility/device/power/visibility/ambient matrix', () => {
    let cases = 0;

    for (const reduce of booleans) {
      for (const pointer of pointers) {
        for (const power of powers) {
          for (const visible of booleans) {
            for (const ambient of ambients) {
              const policy = resolveMotionPolicy({
                profile: 'precise',
                tenantDial: { intensity: 0.7, durationScale: 1.2, ambient },
                reduce,
                pointer,
                power,
                visible,
              });
              const hoverExpected =
                !reduce && pointer === 'fine' && power === 'normal' && visible;
              const continuousExpected = hoverExpected;
              const ambientExpected = hoverExpected && ambient === 'subtle';

              expect(policy.allowHoverEffects).toBe(hoverExpected);
              expect(policy.allowContinuousMotion).toBe(continuousExpected);
              expect(policy.allowAmbientMotion).toBe(ambientExpected);
              expect(policy.maxContinuousLoops).toBe(continuousExpected ? 1 : 0);
              expect(policy).toMatchObject({
                profile: 'precise',
                intensity: 0.7,
                durationScale: 1.2,
                ambient,
                reduce,
                pointer,
                power,
                visible,
              });
              cases += 1;
            }
          }
        }
      }
    }

    expect(cases).toBe(32);
  });

  it('defaults unresolved or hostile environment fields conservatively', () => {
    expect(
      resolveMotionPolicy({
        profile: 'calm',
        reduce: 'true' as never,
        pointer: 'mouse' as never,
        power: 'fast' as never,
        visible: 'yes' as never,
      }),
    ).toMatchObject({
      reduce: false,
      pointer: 'coarse',
      power: 'constrained',
      visible: false,
      maxContinuousLoops: 0,
      allowContinuousMotion: false,
      allowAmbientMotion: false,
      allowHoverEffects: false,
    });
  });
});
