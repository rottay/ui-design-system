import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  CHART_METRIC_TREND_RENDERER_ID,
  ChartMetricTrendView,
  buildChartTrendPoints,
} from '..';

describe('buildChartTrendPoints', () => {
  it('maps a rising series onto the padded viewbox', () => {
    expect(buildChartTrendPoints([0, 10])).toBe('0,30 100,2');
  });

  it('renders a flat series as a midline instead of dividing by zero', () => {
    expect(buildChartTrendPoints([5, 5, 5])).toBe('0,16 50,16 100,16');
  });

  it('drops non-finite values before plotting', () => {
    expect(buildChartTrendPoints([0, Number.NaN, 10])).toBe('0,30 100,2');
  });

  it('yields no line for fewer than two finite values', () => {
    expect(buildChartTrendPoints([7])).toBeNull();
    expect(buildChartTrendPoints([Number.NaN, Number.POSITIVE_INFINITY])).toBeNull();
    expect(buildChartTrendPoints([])).toBeNull();
  });
});

describe('ChartMetricTrendView', () => {
  it('renders label, value, delta tone, and a decorative trend line', () => {
    const { container } = render(
      <ChartMetricTrendView
        view={{ mode: 'micro', rendererId: CHART_METRIC_TREND_RENDERER_ID, metricId: 'conversion-rate', trendId: 'trailing-30' }}
        label="Conversion rate"
        value="4.2%"
        delta="+0.6 pts"
        deltaTone="positive"
        trend={[3.1, 3.4, 3.9, 4.2]}
        ariaLabel="Conversion rate, 4.2 percent, up 0.6 points"
      />,
    );

    const root = screen.getByRole('group', {
      name: 'Conversion rate, 4.2 percent, up 0.6 points',
    });
    expect(root).toHaveAttribute('data-part', 'root');
    expect(root).toHaveAttribute('data-renderer-id', CHART_METRIC_TREND_RENDERER_ID);
    expect(root).toHaveAttribute('data-metric-id', 'conversion-rate');

    expect(screen.getByText('Conversion rate')).toBeInTheDocument();
    expect(screen.getByText('4.2%')).toBeInTheDocument();
    expect(container.querySelector('[data-part="delta"]')).toHaveAttribute('data-tone', 'positive');

    const trend = container.querySelector('[data-part="trend"]');
    expect(trend).toHaveAttribute('aria-hidden', 'true');
    expect(trend).toHaveAttribute('data-trend-id', 'trailing-30');
    const line = container.querySelector('[data-part="trend-line"]');
    expect(line).toHaveAttribute('points');
    expect(line).toHaveAttribute('fill', 'none');
  });

  it('omits the trend mark when values cannot form a line', () => {
    const { container } = render(
      <ChartMetricTrendView
        label="Active users"
        value="18"
        trend={[18]}
        ariaLabel="Active users, 18"
      />,
    );

    expect(container.querySelector('[data-part="trend"]')).toBeNull();
    expect(screen.getByRole('group', { name: 'Active users, 18' })).toHaveAttribute(
      'data-renderer-id',
      CHART_METRIC_TREND_RENDERER_ID,
    );
  });

  it('defaults the delta tone to neutral and omits absent slots', () => {
    const { container } = render(
      <ChartMetricTrendView label="Sessions" value="1,204" delta="±0" ariaLabel="Sessions, 1204" />,
    );

    expect(container.querySelector('[data-part="delta"]')).toHaveAttribute('data-tone', 'neutral');
    expect(container.querySelector('[data-part="trend"]')).toBeNull();
  });
});
