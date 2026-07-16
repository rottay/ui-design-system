import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  acquireSpatialContextLease,
  getSpatialContextLeaseCount,
  releaseSpatialContextLease,
  resetSpatialContextLeaseForTests,
} from '../context-lease';

describe('spatial context lease', () => {
  afterEach(() => resetSpatialContextLeaseForTests());

  it('admits one owner and promotes waiters in FIFO order', () => {
    const first = Symbol('first');
    const second = Symbol('second');
    const third = Symbol('third');
    const promoted: string[] = [];
    const acquireSecond = vi.fn(() => {
      promoted.push('second');
      expect(acquireSpatialContextLease(second, acquireSecond)).toBe(true);
    });
    const acquireThird = vi.fn(() => {
      promoted.push('third');
      expect(acquireSpatialContextLease(third, acquireThird)).toBe(true);
    });

    expect(acquireSpatialContextLease(first, vi.fn())).toBe(true);
    expect(acquireSpatialContextLease(second, acquireSecond)).toBe(false);
    expect(acquireSpatialContextLease(third, acquireThird)).toBe(false);
    expect(getSpatialContextLeaseCount()).toBe(1);

    releaseSpatialContextLease(first);
    expect(promoted).toEqual(['second']);
    releaseSpatialContextLease(second);
    expect(promoted).toEqual(['second', 'third']);
    releaseSpatialContextLease(third);
    expect(getSpatialContextLeaseCount()).toBe(0);
  });

  it('removes an unmounted waiter without promoting it later', () => {
    const active = Symbol('active');
    const stale = Symbol('stale');
    const notify = vi.fn();

    acquireSpatialContextLease(active, vi.fn());
    acquireSpatialContextLease(stale, notify);
    releaseSpatialContextLease(stale);
    releaseSpatialContextLease(active);

    expect(notify).not.toHaveBeenCalled();
    expect(getSpatialContextLeaseCount()).toBe(0);
  });
});
