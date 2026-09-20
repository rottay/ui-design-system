/**
 * @fileoverview The surviving half of the retired `useChartTheme` suite.
 *
 * `ChartTheme.root-scope.test.tsx` mixed two subjects: the retired hook's
 * provider-ancestry scoping, and the resolver those assertions ran through.
 * The hook is gone (owner resolution R2, 2026-09-19); `resolveCssColor` is not
 * -- the paint materializer and the export path both read through it, so its
 * fallback and refusal behaviour is kept here rather than deleted with the
 * consumer that happened to host it.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { resolveCssColor } from '..';

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

function ownerWithCycle(): HTMLDivElement {
  const owner = document.createElement('div');
  owner.style.setProperty('--cycle-a', 'var(--cycle-b)');
  owner.style.setProperty('--cycle-b', 'var(--cycle-a)');
  document.body.appendChild(owner);
  // Browser engines report cyclic computed custom properties as invalid.
  // happy-dom recursively computes them forever, so expose the raw authored
  // values here and exercise the resolver's own cycle guard directly.
  vi.spyOn(window, 'getComputedStyle').mockImplementation((element) => ({
    getPropertyValue: (name: string) =>
      element === owner ? owner.style.getPropertyValue(name) : '',
  }) as CSSStyleDeclaration);
  return owner;
}

describe('resolveCssColor', () => {
  it('reads an inline fallback, including a nested one', () => {
    expect(resolveCssColor('var(--missing, #abcdef)', null)).toBe('#abcdef');
    expect(resolveCssColor('var(--missing, var(--also-missing, #fedcba))', null)).toBe('#fedcba');
  });

  it('answers a cyclic or partially-invalid value with the caller fallback', () => {
    const owner = ownerWithCycle();
    expect(resolveCssColor('var(--cycle-a)', owner, '#010203')).toBe('#010203');
    expect(resolveCssColor('rgb(var(--missing) / 50%)', owner, '#040506')).toBe('#040506');
  });

  it('preserves a concrete colour and falls back only for an unresolvable variable', () => {
    expect(resolveCssColor('var(--missing)', null, '#fedcba')).toBe('#fedcba');
    expect(resolveCssColor('#123456', null, '#fedcba')).toBe('#123456');
  });
});
