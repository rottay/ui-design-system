import { describe, expect, it } from 'vitest';

import { arrayValueAt, setArrayValueAt } from '..';

describe('shared/utils/collections', () => {
  const values = ['first', 'second', 'third'] as const;

  it('reads positive and negative integer positions', () => {
    expect(arrayValueAt(values, 0)).toBe('first');
    expect(arrayValueAt(values, 2)).toBe('third');
    expect(arrayValueAt(values, -1)).toBe('third');
    expect(arrayValueAt(values, -3)).toBe('first');
  });

  it('returns undefined outside the array bounds', () => {
    expect(arrayValueAt(values, 3)).toBeUndefined();
    expect(arrayValueAt(values, -4)).toBeUndefined();
    expect(arrayValueAt([], 0)).toBeUndefined();
  });

  it('rejects non-integer positions', () => {
    expect(arrayValueAt(values, 1.5)).toBeUndefined();
    expect(arrayValueAt(values, Number.NaN)).toBeUndefined();
    expect(arrayValueAt(values, Number.POSITIVE_INFINITY)).toBeUndefined();
  });

  it('preserves undefined values and sparse slots', () => {
    expect(arrayValueAt([undefined], 0)).toBeUndefined();
    expect(arrayValueAt(new Array<string>(1), 0)).toBeUndefined();
  });

  it('assigns a requested slot without shifting earlier values', () => {
    const mutableValues = ['first'];

    setArrayValueAt(mutableValues, 2, 'third');

    expect(mutableValues.length).toBe(3);
    expect(mutableValues[0]).toBe('first');
    expect(mutableValues[2]).toBe('third');
  });

  it('ignores invalid assignment positions', () => {
    const mutableValues = ['first'];

    setArrayValueAt(mutableValues, -1, 'negative');
    setArrayValueAt(mutableValues, 0.5, 'fractional');

    expect(mutableValues).toEqual(['first']);
  });
});
