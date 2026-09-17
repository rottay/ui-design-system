import { describe, expect, it } from 'vitest';

import { reorderByKey, resolveEdgeZone, resolveMoveIntent } from '../index';

describe('sortable resolvers: reorderByKey', () => {
  it('reorderByKey returns a new array and leaves the input intact', () => {
    const order = Object.freeze(['a', 'b', 'c', 'd']) as readonly string[];

    const next = reorderByKey(order, 'a', 'c');

    expect(next).not.toBe(order);
    expect(order).toEqual(['a', 'b', 'c', 'd']);
    expect(next).toEqual(['b', 'c', 'a', 'd']);
  });

  it('keeps the direction asymmetry the families already ship', () => {
    expect(reorderByKey(['a', 'b', 'c', 'd'], 'a', 'c')).toEqual(['b', 'c', 'a', 'd']);
    expect(reorderByKey(['a', 'b', 'c', 'd'], 'd', 'b')).toEqual(['a', 'd', 'b', 'c']);
  });

  it('an unknown key, or a move onto itself, changes nothing', () => {
    expect(reorderByKey(['a', 'b', 'c'], 'zz', 'c')).toEqual(['a', 'b', 'c']);
    expect(reorderByKey(['a', 'b', 'c'], 'a', 'zz')).toEqual(['a', 'b', 'c']);
    expect(reorderByKey(['a', 'b', 'c'], 'b', 'b')).toEqual(['a', 'b', 'c']);
  });

  it('a keyed adjacent move lands where a positional one does', () => {
    const order = ['a', 'b', 'c', 'd'];
    const positional = (from: number, to: number) => {
      const next = [...order];
      if (to < 0 || to >= next.length) return next;
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    };

    expect(reorderByKey(order, 'b', 'c')).toEqual(positional(1, 2));
    expect(reorderByKey(order, 'b', 'a')).toEqual(positional(1, 0));
    expect(reorderByKey(order, 'c', 'd')).toEqual(positional(2, 3));
  });
});

describe('sortable resolvers: resolveEdgeZone', () => {
  const rect = { top: 100, height: 40 };
  const zone = (clientY: number, edgeRatio?: number) =>
    resolveEdgeZone(rect, clientY, { zones: 'before-inside-after', edgeRatio });

  it('the before/inside boundary sits at a quarter of the row', () => {
    expect(zone(100 + 9)).toBe('before');
    expect(zone(100 + 11)).toBe('inside');
    expect(zone(100 + 29)).toBe('inside');
    expect(zone(100 + 31)).toBe('after');
  });

  it('the comparisons are strict, so both boundaries are inside', () => {
    expect(zone(100 + 10)).toBe('inside');
    expect(zone(100 + 30)).toBe('inside');
  });

  it('an explicit edgeRatio moves both boundaries', () => {
    expect(zone(100 + 15, 0.5)).toBe('before');
    expect(zone(100 + 25, 0.5)).toBe('after');
  });

  it('the two-zone model splits at the midpoint', () => {
    const halves = (clientY: number) => resolveEdgeZone(rect, clientY, { zones: 'before-after' });

    expect(halves(100 + 19)).toBe('before');
    expect(halves(100 + 20)).toBe('after');
    expect(halves(100 + 21)).toBe('after');
  });
});

describe('sortable resolvers: resolveMoveIntent', () => {
  const vertical = { orientation: 'vertical', rtl: false } as const;
  const board = { orientation: 'vertical', crossAxis: 'horizontal' } as const;

  it('maps the declared axis onto item intents', () => {
    expect(resolveMoveIntent('ArrowDown', vertical)).toBe('next-item');
    expect(resolveMoveIntent('ArrowUp', vertical)).toBe('prev-item');
  });

  it('maps the cross axis onto container intents', () => {
    expect(resolveMoveIntent('ArrowRight', { ...board, rtl: false })).toBe('next-container');
    expect(resolveMoveIntent('ArrowLeft', { ...board, rtl: false })).toBe('prev-container');
  });

  it('ArrowLeft moves next under rtl on a horizontal axis', () => {
    // The reading-direction law is the navigation authority's, and it is
    // LOGICAL: nothing here flips a key name, a sign or an index delta.
    expect(resolveMoveIntent('ArrowLeft', { orientation: 'horizontal', rtl: true })).toBe(
      'next-item'
    );
    expect(resolveMoveIntent('ArrowRight', { orientation: 'horizontal', rtl: true })).toBe(
      'prev-item'
    );
    expect(resolveMoveIntent('ArrowLeft', { ...board, rtl: true })).toBe('next-container');
    expect(resolveMoveIntent('ArrowRight', { ...board, rtl: true })).toBe('prev-container');
  });

  it('a key off both declared axes belongs to the family', () => {
    expect(resolveMoveIntent('ArrowLeft', vertical)).toBeNull();
    expect(resolveMoveIntent('Enter', { ...board, rtl: false })).toBeNull();
    expect(resolveMoveIntent(' ', { ...board, rtl: false })).toBeNull();
  });

  it('Home and End are not move keys', () => {
    expect(resolveMoveIntent('Home', vertical)).toBeNull();
    expect(resolveMoveIntent('End', vertical)).toBeNull();
    expect(resolveMoveIntent('Home', { ...board, rtl: false })).toBeNull();
    expect(resolveMoveIntent('End', { ...board, rtl: true })).toBeNull();
  });

  it('an ambiguous axis pair is refused', () => {
    expect(() =>
      resolveMoveIntent('ArrowDown', { orientation: 'vertical', crossAxis: 'vertical', rtl: false })
    ).toThrow('drag-session/ambiguous-axis');
    expect(() =>
      resolveMoveIntent('ArrowRight', {
        orientation: 'horizontal',
        crossAxis: 'horizontal',
        rtl: false,
      })
    ).toThrow('drag-session/ambiguous-axis');
  });

  it('reproduces the shipped board mapping key for key', () => {
    const shipped = (key: string, rtl: boolean) => {
      if (key === 'ArrowUp') return 'prev-item';
      if (key === 'ArrowDown') return 'next-item';
      if (key === 'ArrowLeft') return rtl ? 'next-container' : 'prev-container';
      if (key === 'ArrowRight') return rtl ? 'prev-container' : 'next-container';
      return null;
    };

    for (const rtl of [false, true]) {
      for (const key of ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'Tab']) {
        expect(resolveMoveIntent(key, { ...board, rtl })).toBe(shipped(key, rtl));
      }
    }
  });
});
