import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  acquireContinuousGraphicsRuntimeLease,
  createContinuousGraphicsRuntimeGovernor,
  getContinuousGraphicsRuntimeSnapshot,
  installContinuousGraphicsRuntimeTelemetry,
  releaseContinuousGraphicsRuntimeLease,
  resetContinuousGraphicsRuntimeGovernorForTests,
} from '..';
import { DEFAULT_CONTINUOUS_GRAPHICS_RUNTIME_BUDGET } from '../../../foundation/contracts';

afterEach(() => {
  resetContinuousGraphicsRuntimeGovernorForTests();
  vi.restoreAllMocks();
});

describe('continuous graphics runtime governor', () => {
  it('shares one total budget across classes and promotes eligible waiters in FIFO order', () => {
    const governor = createContinuousGraphicsRuntimeGovernor(
      DEFAULT_CONTINUOUS_GRAPHICS_RUNTIME_BUDGET,
    );
    const particle = Symbol('particle');
    const spatial = Symbol('spatial');
    const nextParticle = Symbol('next-particle');
    const promoted: string[] = [];
    const acquireSpatial = vi.fn(() => {
      promoted.push('spatial');
      expect(governor.acquire({
        owner: spatial,
        runtimeClass: 'immersive-spatial',
        onAvailable: acquireSpatial,
      })).toBe(true);
    });
    const acquireNextParticle = vi.fn(() => {
      promoted.push('particle');
      expect(governor.acquire({
        owner: nextParticle,
        runtimeClass: 'decorative-2d',
        onAvailable: acquireNextParticle,
      })).toBe(true);
    });

    expect(governor.acquire({
      owner: particle,
      runtimeClass: 'decorative-2d',
      onAvailable: vi.fn(),
    })).toBe(true);
    expect(governor.acquire({
      owner: spatial,
      runtimeClass: 'immersive-spatial',
      onAvailable: acquireSpatial,
    })).toBe(false);
    expect(governor.acquire({
      owner: nextParticle,
      runtimeClass: 'decorative-2d',
      onAvailable: acquireNextParticle,
    })).toBe(false);
    expect(governor.snapshot()).toMatchObject({
      activeTotal: 1,
      activeByClass: { 'decorative-2d': 1, 'immersive-spatial': 0 },
      waitingTotal: 2,
    });

    governor.release(particle);
    expect(promoted).toEqual(['spatial']);
    expect(governor.snapshot().activeByClass).toEqual({
      'decorative-2d': 0,
      'immersive-spatial': 1,
    });

    governor.release(spatial);
    expect(promoted).toEqual(['spatial', 'particle']);
    governor.release(nextParticle);
    expect(governor.snapshot().activeTotal).toBe(0);
  });

  it('enforces class and total ceilings independently', () => {
    const governor = createContinuousGraphicsRuntimeGovernor({
      maxActiveTotal: 2,
      maxActiveByClass: {
        'decorative-2d': 1,
        'immersive-spatial': 2,
      },
    });
    const firstParticle = Symbol('first-particle');
    const secondParticle = Symbol('second-particle');
    const spatial = Symbol('spatial');
    const promoted = vi.fn(() => {
      governor.acquire({
        owner: secondParticle,
        runtimeClass: 'decorative-2d',
        onAvailable: promoted,
      });
    });

    expect(governor.acquire({
      owner: firstParticle,
      runtimeClass: 'decorative-2d',
      onAvailable: vi.fn(),
    })).toBe(true);
    expect(governor.acquire({
      owner: secondParticle,
      runtimeClass: 'decorative-2d',
      onAvailable: promoted,
    })).toBe(false);
    expect(governor.acquire({
      owner: spatial,
      runtimeClass: 'immersive-spatial',
      onAvailable: vi.fn(),
    })).toBe(true);
    expect(governor.snapshot()).toMatchObject({ activeTotal: 2, waitingTotal: 1 });

    governor.release(firstParticle);
    expect(promoted).toHaveBeenCalledOnce();
    expect(governor.snapshot()).toMatchObject({
      activeTotal: 2,
      activeByClass: { 'decorative-2d': 1, 'immersive-spatial': 1 },
    });
  });

  it('treats zero class or total ceilings as fail-closed switches, not wait queues', () => {
    const classDisabled = createContinuousGraphicsRuntimeGovernor({
      maxActiveTotal: 1,
      maxActiveByClass: { 'decorative-2d': 0, 'immersive-spatial': 1 },
    });
    const totalDisabled = createContinuousGraphicsRuntimeGovernor({
      maxActiveTotal: 0,
      maxActiveByClass: { 'decorative-2d': 1, 'immersive-spatial': 1 },
    });

    expect(classDisabled.acquire({
      owner: Symbol('class-disabled'),
      runtimeClass: 'decorative-2d',
      onAvailable: vi.fn(),
    })).toBe(false);
    expect(classDisabled.snapshot()).toMatchObject({ activeTotal: 0, waitingTotal: 0 });

    expect(totalDisabled.acquire({
      owner: Symbol('total-disabled'),
      runtimeClass: 'immersive-spatial',
      onAvailable: vi.fn(),
    })).toBe(false);
    expect(totalDisabled.snapshot()).toMatchObject({ activeTotal: 0, waitingTotal: 0 });
  });

  it('fails closed for invalid budgets, malformed requests and owner class conflicts', () => {
    const invalidBudgetEvents: unknown[] = [];
    const invalidBudget = createContinuousGraphicsRuntimeGovernor(
      {
        maxActiveTotal: Number.NaN,
        maxActiveByClass: { 'decorative-2d': 1, 'immersive-spatial': 1 },
      },
      (event) => invalidBudgetEvents.push(event),
    );

    expect(invalidBudget.acquire({
      owner: Symbol('valid-request'),
      runtimeClass: 'decorative-2d',
      onAvailable: vi.fn(),
    })).toBe(false);
    expect(invalidBudget.snapshot().budgetValid).toBe(false);
    expect(invalidBudgetEvents).toContainEqual(expect.objectContaining({
      code: 'request-rejected',
      reason: 'invalid-budget',
    }));

    const hostileBudget = new Proxy({}, {
      get: () => {
        throw new Error('hostile budget getter');
      },
    });
    expect(() => createContinuousGraphicsRuntimeGovernor(hostileBudget)).not.toThrow();
    expect(createContinuousGraphicsRuntimeGovernor(hostileBudget).snapshot().budgetValid)
      .toBe(false);

    const governor = createContinuousGraphicsRuntimeGovernor(
      DEFAULT_CONTINUOUS_GRAPHICS_RUNTIME_BUDGET,
    );
    expect(governor.acquire({
      owner: 'not-a-symbol',
      runtimeClass: 'decorative-2d',
      onAvailable: vi.fn(),
    } as never)).toBe(false);
    const hostileRequest = new Proxy({}, {
      get: () => {
        throw new Error('hostile request getter');
      },
    });
    expect(() => governor.acquire(hostileRequest as never)).not.toThrow();
    expect(governor.acquire(hostileRequest as never)).toBe(false);

    const sharedOwner = Symbol('shared-owner');
    expect(governor.acquire({
      owner: sharedOwner,
      runtimeClass: 'decorative-2d',
      onAvailable: vi.fn(),
    })).toBe(true);
    expect(governor.acquire({
      owner: sharedOwner,
      runtimeClass: 'immersive-spatial',
      onAvailable: vi.fn(),
    })).toBe(false);
    expect(governor.snapshot().activeByClass).toEqual({
      'decorative-2d': 1,
      'immersive-spatial': 0,
    });
  });

  it('cancels stale waiters and makes release/reset disposal idempotent', () => {
    const governor = createContinuousGraphicsRuntimeGovernor(
      DEFAULT_CONTINUOUS_GRAPHICS_RUNTIME_BUDGET,
    );
    const active = Symbol('active');
    const stale = Symbol('stale');
    const notify = vi.fn();

    governor.acquire({
      owner: active,
      runtimeClass: 'decorative-2d',
      onAvailable: vi.fn(),
    });
    governor.acquire({
      owner: stale,
      runtimeClass: 'immersive-spatial',
      onAvailable: notify,
    });
    governor.release(stale);
    governor.release(stale);
    governor.release(active);
    governor.release(active);

    expect(notify).not.toHaveBeenCalled();
    expect(governor.snapshot()).toMatchObject({ activeTotal: 0, waitingTotal: 0 });
    expect(() => {
      governor.reset();
      governor.reset();
    }).not.toThrow();
  });

  it('emits immutable bounded lifecycle telemetry and isolates broken sinks', () => {
    const observed: Array<Readonly<Record<string, unknown>>> = [];
    const brokenDisposer = installContinuousGraphicsRuntimeTelemetry(() => {
      throw new Error('broken telemetry sink');
    });
    const workingDisposer = installContinuousGraphicsRuntimeTelemetry((event) => {
      observed.push(event);
    });
    const first = Symbol('first');
    const second = Symbol('second');

    expect(acquireContinuousGraphicsRuntimeLease({
      owner: first,
      runtimeClass: 'decorative-2d',
      onAvailable: vi.fn(),
    })).toBe(true);
    expect(acquireContinuousGraphicsRuntimeLease({
      owner: second,
      runtimeClass: 'immersive-spatial',
      onAvailable: vi.fn(),
    })).toBe(false);
    releaseContinuousGraphicsRuntimeLease(second);
    releaseContinuousGraphicsRuntimeLease(first);

    expect(observed.map((event) => event.code)).toEqual([
      'lease-granted',
      'lease-queued',
      'waiter-cancelled',
      'lease-released',
    ]);
    expect(Object.isFrozen(observed[0])).toBe(true);
    for (const event of observed) {
      expect(Object.keys(event).sort()).toEqual(expect.arrayContaining([
        'activeForClass',
        'activeTotal',
        'code',
        'runtimeClass',
        'waitingTotal',
      ]));
      expect(event).not.toHaveProperty('owner');
      expect(event).not.toHaveProperty('id');
    }

    brokenDisposer();
    brokenDisposer();
    workingDisposer();
    workingDisposer();
    const before = observed.length;
    expect(acquireContinuousGraphicsRuntimeLease({
      owner: Symbol('after-dispose'),
      runtimeClass: 'decorative-2d',
      onAvailable: vi.fn(),
    })).toBe(true);
    expect(observed).toHaveLength(before);
    expect(getContinuousGraphicsRuntimeSnapshot().activeTotal).toBe(1);
  });

  it('keeps admission pure and independent from browser capability state', () => {
    const governor = createContinuousGraphicsRuntimeGovernor(
      DEFAULT_CONTINUOUS_GRAPHICS_RUNTIME_BUDGET,
    );
    const owner = Symbol('ssr');

    expect(governor.acquire({
      owner,
      runtimeClass: 'decorative-2d',
      onAvailable: vi.fn(),
    })).toBe(true);
    expect(() => governor.release(owner)).not.toThrow();
  });
});
