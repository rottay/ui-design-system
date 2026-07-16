import { describe, expect, it } from 'vitest';

import type { SpatialPolicyInput } from '../../../contracts/spatial';
import {
  SPATIAL_QUALITY_BUDGETS,
  downgradeSpatialMode,
  resolveSpatialPolicy,
  resolveSpatialQualityBudget,
} from '..';

const LIVE_INPUT: SpatialPolicyInput = Object.freeze({
  enabled: true,
  hydrated: true,
  contractReady: true,
  visible: true,
  inView: true,
  reduce: false,
  capability: 'webgl2',
  contextState: 'ready',
  lease: true,
  phone: false,
  tablet: false,
  pointer: 'fine',
  power: 'normal',
  quality: 'auto',
  adaptiveLow: false,
});

describe('resolveSpatialPolicy', () => {
  it('fails incomplete, null, hostile and WebGPU-shaped input closed', () => {
    expect(resolveSpatialPolicy(undefined)).toMatchObject({
      mode: 'static',
      backend: 'none',
      reason: 'disabled',
      shouldLoad: false,
      shouldMount: false,
      shouldRun: false,
      budget: null,
    });
    expect(resolveSpatialPolicy(null).reason).toBe('disabled');

    const hostile = new Proxy({}, {
      get() {
        throw new Error('hostile getter');
      },
    });
    expect(resolveSpatialPolicy(hostile).reason).toBe('disabled');

    expect(resolveSpatialPolicy({
      ...LIVE_INPUT,
      capability: 'webgpu',
    } as unknown).reason).toBe('capability-unknown');
  });

  it.each([
    ['enabled', false, 'disabled'],
    ['hydrated', false, 'not-hydrated'],
    ['contractReady', false, 'contract-not-ready'],
    ['visible', false, 'page-hidden'],
    ['inView', false, 'offscreen'],
    ['capability', 'unknown', 'capability-unknown'],
    ['capability', 'none', 'webgl2-unsupported'],
    ['contextState', 'error', 'context-error'],
    ['contextState', 'lost', 'context-lost'],
    ['lease', false, 'context-busy'],
    ['phone', true, 'phone'],
    ['pointer', 'coarse', 'coarse-pointer'],
    ['power', 'constrained', 'constrained-power'],
  ] as const)('returns static when %s is %s', (key, value, reason) => {
    expect(resolveSpatialPolicy({ ...LIVE_INPUT, [key]: value })).toEqual({
      mode: 'static',
      backend: 'none',
      reason,
      shouldLoad: false,
      shouldMount: false,
      shouldRun: false,
      budget: null,
    });
  });

  it('selects reduced content before capability, context, lease and device gates', () => {
    expect(resolveSpatialPolicy({
      ...LIVE_INPUT,
      reduce: true,
      capability: 'none',
      contextState: 'lost',
      lease: false,
      phone: true,
      pointer: 'coarse',
      power: 'constrained',
    })).toEqual({
      mode: 'reduced',
      backend: 'none',
      reason: 'reduced-motion',
      shouldLoad: false,
      shouldMount: false,
      shouldRun: false,
      budget: null,
    });
  });

  it('resolves cheap device constraints before capability probing', () => {
    expect(resolveSpatialPolicy({
      ...LIVE_INPUT,
      phone: true,
      capability: 'unknown',
      contextState: 'error',
      lease: false,
    }).reason).toBe('phone');
    expect(resolveSpatialPolicy({
      ...LIVE_INPUT,
      pointer: 'coarse',
      capability: 'unknown',
      contextState: 'error',
      lease: false,
    }).reason).toBe('coarse-pointer');
    expect(resolveSpatialPolicy({
      ...LIVE_INPUT,
      power: 'constrained',
      capability: 'unknown',
      contextState: 'error',
      lease: false,
    }).reason).toBe('constrained-power');
  });

  it('keeps disabled, hydration, contract and visibility gates ahead of reduced', () => {
    for (const [key, reason] of [
      ['enabled', 'disabled'],
      ['hydrated', 'not-hydrated'],
      ['contractReady', 'contract-not-ready'],
      ['visible', 'page-hidden'],
      ['inView', 'offscreen'],
    ] as const) {
      expect(resolveSpatialPolicy({
        ...LIVE_INPUT,
        reduce: true,
        [key]: false,
      }).reason).toBe(reason);
    }
  });

  it('selects high only for a resolved desktop fine-pointer normal-power path', () => {
    expect(resolveSpatialPolicy(LIVE_INPUT)).toEqual({
      mode: 'live-high',
      backend: 'webgl2',
      reason: 'eligible-high',
      shouldLoad: true,
      shouldMount: true,
      shouldRun: true,
      budget: SPATIAL_QUALITY_BUDGETS['live-high'],
    });
  });

  it.each([
    [{ tablet: true }, 'tablet'],
    [{ quality: 'low' }, 'requested low quality'],
    [{ adaptiveLow: true }, 'adaptive downgrade'],
    [{ tablet: true, quality: 'high' }, 'tablet high request'],
  ])('selects live-low for %s (%s)', (overrides) => {
    expect(resolveSpatialPolicy({ ...LIVE_INPUT, ...overrides })).toEqual({
      mode: 'live-low',
      backend: 'webgl2',
      reason: 'eligible-low',
      shouldLoad: true,
      shouldMount: true,
      shouldRun: true,
      budget: SPATIAL_QUALITY_BUDGETS['live-low'],
    });
  });

  it('downgrades unknown quality and missing device evidence without weakening other fields', () => {
    expect(resolveSpatialPolicy({
      ...LIVE_INPUT,
      quality: 'ultra',
    } as unknown).mode).toBe('live-low');

    const missingTablet = { ...LIVE_INPUT } as Record<string, unknown>;
    delete missingTablet.tablet;
    expect(resolveSpatialPolicy(missingTablet).mode).toBe('live-low');

    const missingPointer = { ...LIVE_INPUT } as Record<string, unknown>;
    delete missingPointer.pointer;
    expect(resolveSpatialPolicy(missingPointer).reason).toBe('coarse-pointer');
  });
});

describe('spatial quality budget', () => {
  it('keeps bounded immutable low/high envelopes', () => {
    expect(SPATIAL_QUALITY_BUDGETS).toEqual({
      'live-low': {
        quality: 'low',
        maxDpr: 1.25,
        antialias: false,
        powerPreference: 'default',
      },
      'live-high': {
        quality: 'high',
        maxDpr: 1.5,
        antialias: true,
        powerPreference: 'high-performance',
      },
    });
    expect(Object.isFrozen(SPATIAL_QUALITY_BUDGETS)).toBe(true);
    expect(Object.isFrozen(SPATIAL_QUALITY_BUDGETS['live-low'])).toBe(true);
    expect(Object.isFrozen(SPATIAL_QUALITY_BUDGETS['live-high'])).toBe(true);
  });

  it('returns no renderer budget for static/reduced and never promotes on downgrade', () => {
    expect(resolveSpatialQualityBudget('static')).toBeNull();
    expect(resolveSpatialQualityBudget('reduced')).toBeNull();
    expect(resolveSpatialQualityBudget('live-low')).toBe(
      SPATIAL_QUALITY_BUDGETS['live-low'],
    );
    expect(downgradeSpatialMode('live-high')).toBe('live-low');
    expect(downgradeSpatialMode('live-low')).toBe('live-low');
    expect(downgradeSpatialMode('reduced')).toBe('reduced');
    expect(downgradeSpatialMode('static')).toBe('static');
  });
});
