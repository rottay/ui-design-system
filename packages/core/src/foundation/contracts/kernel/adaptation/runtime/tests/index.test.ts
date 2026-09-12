import { describe, expect, it } from 'vitest';

import {
  CONTAINER_POSTURES,
  DATA_TABLE_ADAPTATION_BASE,
  DATA_TABLE_ADAPT_DEFAULTS,
  POSTURES,
  VIEWPORT_POSTURES,
  postureAttribute,
  resolveContainerPosture,
  type DataTableAdaptation,
  type ResolvedDataTableAdaptation,
} from '../..';
import { resolveAdaptation } from '..';

const BALANCED = { thresholds: { compactMaxPx: 639, standardMaxPx: 839 } };

describe('the posture vocabulary', () => {
  it('is one list of names, viewport first', () => {
    expect(VIEWPORT_POSTURES).toEqual(['phone', 'tablet', 'desktop']);
    expect(CONTAINER_POSTURES).toEqual(['compact', 'regular', 'expanded']);
    expect(POSTURES).toEqual([...VIEWPORT_POSTURES, ...CONTAINER_POSTURES]);
  });

  it('bands a width on the given ladder', () => {
    expect(resolveContainerPosture(320, BALANCED)).toBe('compact');
    expect(resolveContainerPosture(639, BALANCED)).toBe('compact');
    expect(resolveContainerPosture(700, BALANCED)).toBe('regular');
    expect(resolveContainerPosture(840, BALANCED)).toBe('expanded');
  });

  it('stamps the viewport token, and the container token once measured', () => {
    expect(postureAttribute({ viewport: 'desktop', container: null })).toBe('desktop');
    expect(postureAttribute({ viewport: 'desktop', container: 'compact' })).toBe(
      'desktop compact',
    );
  });
});

describe('resolveAdaptation', () => {
  const adapt: Partial<Record<string, DataTableAdaptation>> = {
    phone: { columns: { keep: ['name', 'status', 'owner'] }, presentation: 'cards' },
    compact: { columns: { shrink: ['status'] }, rowActions: 'menu' },
  };

  it('returns the base when nothing applies', () => {
    expect(
      resolveAdaptation<ResolvedDataTableAdaptation>(DATA_TABLE_ADAPTATION_BASE, {
        viewport: 'desktop',
        container: 'expanded',
      }),
    ).toEqual(DATA_TABLE_ADAPTATION_BASE);
  });

  it('layers the family defaults beneath the application', () => {
    const resolved = resolveAdaptation<ResolvedDataTableAdaptation>(
      DATA_TABLE_ADAPTATION_BASE,
      { viewport: 'phone', container: null },
      { phone: { presentation: 'list' } },
      DATA_TABLE_ADAPT_DEFAULTS,
    );
    expect(resolved.presentation).toBe('list');
  });

  it('applies the container entry after the viewport entry, merging objects', () => {
    const resolved = resolveAdaptation<ResolvedDataTableAdaptation>(
      DATA_TABLE_ADAPTATION_BASE,
      { viewport: 'phone', container: 'compact' },
      adapt,
    );
    expect(resolved).toEqual({
      columns: { keep: ['name', 'status', 'owner'], shrink: ['status'] },
      presentation: 'cards',
      rowActions: 'menu',
    });
  });

  it('never mutates the base or the declaration', () => {
    const before = JSON.stringify({ DATA_TABLE_ADAPTATION_BASE, adapt });
    resolveAdaptation(DATA_TABLE_ADAPTATION_BASE, { viewport: 'phone', container: 'compact' }, adapt);
    expect(JSON.stringify({ DATA_TABLE_ADAPTATION_BASE, adapt })).toBe(before);
  });
});
