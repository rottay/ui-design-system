import { describe, expect, it } from 'vitest';
import {
  FRECENCY_HALF_LIFE_MS,
  decayedFrecency,
  rankByFrecency,
  recordUse,
  type CommandUsageMap,
} from '..';

const T0 = 1_700_000_000_000;
const DAY_MS = 24 * 60 * 60 * 1000;

describe('decayedFrecency', () => {
  it('returns 0 for missing entries', () => {
    expect(decayedFrecency(undefined, T0)).toBe(0);
  });

  it('returns the raw score at zero age', () => {
    expect(decayedFrecency({ score: 3, lastUsedAt: T0 }, T0)).toBe(3);
  });

  it('halves the score after exactly one half-life (14 days)', () => {
    const score = decayedFrecency({ score: 4, lastUsedAt: T0 }, T0 + FRECENCY_HALF_LIFE_MS);
    expect(score).toBeCloseTo(2, 10);
  });

  it('quarters the score after two half-lives', () => {
    const score = decayedFrecency({ score: 4, lastUsedAt: T0 }, T0 + 2 * FRECENCY_HALF_LIFE_MS);
    expect(score).toBeCloseTo(1, 10);
  });

  it('clamps future lastUsedAt to zero age instead of amplifying', () => {
    expect(decayedFrecency({ score: 2, lastUsedAt: T0 + DAY_MS }, T0)).toBe(2);
  });
});

describe('recordUse', () => {
  it('creates a fresh entry with score 1', () => {
    const next = recordUse({}, 'deploy', T0);
    expect(next['deploy']).toEqual({ score: 1, lastUsedAt: T0 });
  });

  it('does not mutate the input map', () => {
    const usage: CommandUsageMap = { deploy: { score: 1, lastUsedAt: T0 } };
    recordUse(usage, 'deploy', T0 + DAY_MS);
    expect(usage['deploy']).toEqual({ score: 1, lastUsedAt: T0 });
  });

  it('decays the previous score before adding the new use', () => {
    const first = recordUse({}, 'deploy', T0);
    const second = recordUse(first, 'deploy', T0 + FRECENCY_HALF_LIFE_MS);
    expect(second['deploy']!.score).toBeCloseTo(1.5, 10);
    expect(second['deploy']!.lastUsedAt).toBe(T0 + FRECENCY_HALF_LIFE_MS);
  });

  it('is equivalent to summing per-use decays (compact form is exact)', () => {
    // Three uses at t0, t0+3d, t0+10d, evaluated at t0+20d.
    const times = [T0, T0 + 3 * DAY_MS, T0 + 10 * DAY_MS];
    const evalAt = T0 + 20 * DAY_MS;
    let usage: CommandUsageMap = {};
    for (const t of times) usage = recordUse(usage, 'cmd', t);
    const compact = decayedFrecency(usage['cmd'], evalAt);
    const direct = times.reduce(
      (sum, t) => sum + Math.pow(2, -(evalAt - t) / FRECENCY_HALF_LIFE_MS),
      0,
    );
    expect(compact).toBeCloseTo(direct, 10);
  });

  it('tolerates prototype-name command ids without reading Object.prototype', () => {
    const next = recordUse({}, 'toString', T0);
    expect(next['toString']).toEqual({ score: 1, lastUsedAt: T0 });
    const again = recordUse(next, 'toString', T0);
    expect(again['toString']!.score).toBeCloseTo(2, 10);
  });
});

describe('rankByFrecency', () => {
  const items = [
    { id: 'a', label: 'Alpha' },
    { id: 'b', label: 'Bravo' },
    { id: 'c', label: 'Charlie' },
  ];

  it('keeps the incoming order when nothing was used (stable at score 0)', () => {
    expect(rankByFrecency(items, (i) => i.id, {}, T0).map((i) => i.id)).toEqual(['a', 'b', 'c']);
  });

  it('ranks used items above unused ones, descending by decayed score', () => {
    let usage: CommandUsageMap = {};
    usage = recordUse(usage, 'c', T0);
    usage = recordUse(usage, 'c', T0);
    usage = recordUse(usage, 'b', T0);
    const ranked = rankByFrecency(items, (i) => i.id, usage, T0).map((i) => i.id);
    expect(ranked).toEqual(['c', 'b', 'a']);
  });

  it('recency breaks a raw-count tie: newer single use beats decayed double use', () => {
    let usage: CommandUsageMap = {};
    // Two uses of "a" long ago decay below one fresh use of "b".
    usage = recordUse(usage, 'a', T0 - 3 * FRECENCY_HALF_LIFE_MS);
    usage = recordUse(usage, 'a', T0 - 3 * FRECENCY_HALF_LIFE_MS);
    usage = recordUse(usage, 'b', T0);
    const ranked = rankByFrecency(items, (i) => i.id, usage, T0).map((i) => i.id);
    expect(ranked).toEqual(['b', 'a', 'c']);
  });

  it('ignores malformed persisted entries instead of producing NaN ordering', () => {
    const usage = {
      a: { score: Number.NaN, lastUsedAt: T0 },
      b: { score: 1, lastUsedAt: T0 },
    } as CommandUsageMap;
    const ranked = rankByFrecency(items, (i) => i.id, usage, T0).map((i) => i.id);
    expect(ranked).toEqual(['b', 'a', 'c']);
  });

  it('does not mutate the input array', () => {
    const input = [...items];
    rankByFrecency(input, (i) => i.id, { c: { score: 5, lastUsedAt: T0 } }, T0);
    expect(input.map((i) => i.id)).toEqual(['a', 'b', 'c']);
  });
});
