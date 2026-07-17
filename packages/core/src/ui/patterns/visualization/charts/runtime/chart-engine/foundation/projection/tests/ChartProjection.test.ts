import { describe, expect, it } from 'vitest';

import {
  resolveChartProjection,
  type ChartPhoneProjectionView,
  type ChartProjectionSpec,
  type ChartProjectionView,
} from '..';

type Assert<TValue extends true> = TValue;
type PhoneExcludesFull = Extract<ChartPhoneProjectionView, { mode: 'full' }> extends never
  ? true
  : false;

const phoneTypeContract: Assert<PhoneExcludesFull> = true;

const SPEC: ChartProjectionSpec = {
  desktop: { mode: 'full', rendererId: 'activity.calendar' },
  tablet: {
    mode: 'ranked-rows',
    rendererId: 'activity.ranked-days',
    fieldIds: ['day', 'events'],
  },
  phone: {
    mode: 'summary',
    rendererId: 'activity.mobile-summary',
    summaryId: 'activity.recent-period',
  },
};

describe('ChartProjection', () => {
  it('keeps full projections out of the phone contract', () => {
    expect(phoneTypeContract).toBe(true);
    expect(resolveChartProjection(SPEC, 'phone').mode).not.toBe('full');
  });

  it('resolves each device class deterministically', () => {
    expect(resolveChartProjection(SPEC, 'desktop')).toBe(SPEC.desktop);
    expect(resolveChartProjection(SPEC, 'tablet')).toBe(SPEC.tablet);
    expect(resolveChartProjection(SPEC, 'phone')).toBe(SPEC.phone);

    expect(resolveChartProjection(SPEC, 'phone')).toEqual(
      resolveChartProjection(SPEC, 'phone'),
    );
  });

  it('falls tablet back to the declared desktop projection', () => {
    const withoutTablet: ChartProjectionSpec = {
      desktop: { mode: 'alternate', rendererId: 'revenue.table' },
      phone: {
        mode: 'micro',
        rendererId: 'revenue.kpi',
        metricId: 'revenue.total',
        trendId: 'revenue.change',
      },
    };

    expect(resolveChartProjection(withoutTablet, 'tablet')).toBe(withoutTablet.desktop);
  });

  it.each<ChartProjectionView>([
    { mode: 'full', rendererId: 'orders.chart' },
    {
      mode: 'micro',
      rendererId: 'orders.micro',
      metricId: 'orders.total',
      trendId: 'orders.trend',
    },
    {
      mode: 'summary',
      rendererId: 'orders.summary',
      summaryId: 'orders.period',
    },
    {
      mode: 'ranked-rows',
      rendererId: 'orders.rows',
      fieldIds: ['label', 'value'],
    },
    {
      mode: 'top-n',
      rendererId: 'orders.top-five',
      n: 5,
      remainder: 'aggregate',
    },
    { mode: 'alternate', rendererId: 'orders.table' },
  ])('accepts and resolves the $mode representation', (view) => {
    const spec = {
      desktop: view,
      phone: { mode: 'alternate', rendererId: 'orders.mobile' },
    } satisfies ChartProjectionSpec;

    expect(resolveChartProjection(spec, 'desktop')).toBe(view);
  });

  it('round-trips through JSON without changing the projection contract', () => {
    const roundTripped = JSON.parse(JSON.stringify(SPEC)) as ChartProjectionSpec;

    expect(roundTripped).toEqual(SPEC);
    expect(resolveChartProjection(roundTripped, 'phone')).toEqual(SPEC.phone);
  });

  it.each([
    {
      label: 'full phone projection',
      value: {
        desktop: { mode: 'full', rendererId: 'unsafe.desktop' },
        phone: { mode: 'full', rendererId: 'unsafe.phone' },
      },
      device: 'phone',
    },
    {
      label: 'empty renderer identifier',
      value: {
        desktop: { mode: 'full', rendererId: '' },
        phone: { mode: 'alternate', rendererId: 'safe.phone' },
      },
      device: 'desktop',
    },
    {
      label: 'empty ranked fields',
      value: {
        desktop: { mode: 'ranked-rows', rendererId: 'rows', fieldIds: [] },
        phone: { mode: 'alternate', rendererId: 'safe.phone' },
      },
      device: 'desktop',
    },
    {
      label: 'non-positive top-n count',
      value: {
        desktop: { mode: 'top-n', rendererId: 'top', n: 0, remainder: 'summary' },
        phone: { mode: 'alternate', rendererId: 'safe.phone' },
      },
      device: 'desktop',
    },
  ])('rejects malformed JavaScript input: $label', ({ value, device }) => {
    expect(() => resolveChartProjection(
      value as unknown as ChartProjectionSpec,
      device as 'desktop' | 'phone',
    )).toThrowError(new TypeError('[ChartProjection] Invalid projection spec.'));
  });

  it('rejects unknown runtime device classes', () => {
    expect(() => resolveChartProjection(
      SPEC,
      'watch' as unknown as 'desktop',
    )).toThrowError(new TypeError('[ChartProjection] Invalid device class.'));
  });
});
