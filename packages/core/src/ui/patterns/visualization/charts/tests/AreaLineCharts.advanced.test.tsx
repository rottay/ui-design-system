import React from 'react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';

import { AreaChart, LineChart } from '..';
import { renderSurface } from '../../../../surfaces/foundation/common/test-utils';

describe('Area and line chart advanced coverage', () => {
  let originalGetTotalLength: PropertyDescriptor | undefined;

  beforeEach(() => {
    originalGetTotalLength = Object.getOwnPropertyDescriptor(
      window.SVGElement.prototype,
      'getTotalLength'
    );

    Object.defineProperty(window.SVGElement.prototype, 'getTotalLength', {
      configurable: true,
      value: vi.fn(() => 120),
    });
  });

  afterEach(() => {
    if (originalGetTotalLength) {
      Object.defineProperty(window.SVGElement.prototype, 'getTotalLength', originalGetTotalLength);
    } else {
      delete (window.SVGElement.prototype as SVGElement & { getTotalLength?: () => number })
        .getTotalLength;
    }
  });

  it('covers stacked area charts with gradients, axis labels, tooltip titles, and hidden legends', async () => {
    const { container } = renderSurface(
      <AreaChart
        title="Attendance"
        width={480}
        height={280}
        responsive={false}
        stacked
        tooltip
        legend={false}
        xAxisLabel="Day"
        yAxisLabel="People"
        series={[
          {
            name: 'Guests',
            data: [
              { x: 'Mon', y: 12 },
              { x: 'Tue', y: 18 },
              { x: 'Wed', y: 16 },
            ],
          },
          {
            name: 'Hosts',
            data: [
              { x: 'Mon', y: 2 },
              { x: 'Tue', y: 3 },
              { x: 'Wed', y: 4 },
            ],
          },
        ]}
      />,
      {
        productProfile: 'events.organizer',
      }
    );

    expect(await screen.findByRole('img', { name: 'Attendance' })).toBeInTheDocument();
    expect(screen.getByText('Day')).toBeInTheDocument();
    expect(screen.getByText('People')).toBeInTheDocument();
    expect(screen.queryByText('Guests', { selector: 'span' })).not.toBeInTheDocument();

    await waitFor(() => {
      expect(container.querySelectorAll('linearGradient').length).toBeGreaterThan(0);
      expect(container.querySelectorAll('path').length).toBeGreaterThan(1);
    });
    expect(screen.getByText(/Active data point: Series: Guests, X: Mon, Y: 12/i)).toBeInTheDocument();
  });

  it('covers time and linear line chart branches with dots, area fills, animation, and summary keyboard navigation', async () => {
    const timeSeries = [
      {
        name: 'Revenue',
        data: [
          { x: '2026-03-10T00:00:00.000Z', y: 10 },
          { x: '2026-03-11T00:00:00.000Z', y: 12 },
          { x: '2026-03-12T00:00:00.000Z', y: 18 },
        ],
      },
    ];

    const firstRender = renderSurface(
      <LineChart
        title="Revenue"
        width={480}
        height={280}
        responsive={false}
        xType="time"
        showDots
        showArea
        tooltip
        animate
        legend={false}
        xAxisLabel="Date"
        yAxisLabel="Amount"
        series={timeSeries}
      />,
      {
        productProfile: 'events.organizer',
      }
    );

    await screen.findByRole('img', { name: 'Revenue' });
    // The renderer owns the plot SVG, so the scaffold exposes the accessible
    // summary through its default-active item (first row) rather than the
    // legacy fallback-SVG roving handler; the full item list stays in the DOM.
    expect(screen.getByText(/Active data point: Series: Revenue, X: 2026-03-10T00:00:00.000Z, Y: 10/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(firstRender.container.querySelectorAll('circle').length).toBeGreaterThan(0);
    });

    firstRender.unmount();

    const secondRender = renderSurface(
      <LineChart
        title="Linear Revenue"
        width={480}
        height={280}
        responsive={false}
        xType="linear"
        showDots={false}
        showArea={false}
        curved={false}
        legend
        series={[
          {
            name: 'Revenue',
            data: [
              { x: 1, y: 3 },
              { x: 2, y: 8 },
              { x: 4, y: 13 },
            ],
          },
        ]}
      />,
      {
        productProfile: 'events.organizer',
      }
    );

    // The renderer surface contributes an accessible <title>, so the chart
    // name now appears both as the heading and the SVG title; disambiguate via
    // the image role rather than a bare text match.
    expect(await screen.findByRole('img', { name: 'Linear Revenue' })).toBeInTheDocument();
    expect(screen.getByText('Revenue', { selector: 'span' })).toBeInTheDocument();
    await waitFor(() => {
      expect(secondRender.container.querySelector('svg')).toBeTruthy();
      expect(secondRender.container.querySelectorAll('path').length).toBeGreaterThan(0);
    });
  });

  it('covers non-stacked area charts with visible legends, tooltip titles, and solid fills', async () => {
    const { container } = renderSurface(
      <AreaChart
        title="Capacity"
        width={420}
        height={260}
        responsive={false}
        tooltip
        legend
        opacity={0.45}
        series={[
          {
            name: 'Seated',
            color: '#123456',
            data: [
              { x: 'Mon', y: 10 },
              { x: 'Tue', y: 12 },
              { x: 'Wed', y: 14 },
            ],
          },
          {
            name: 'Standing',
            color: '#abcdef',
            data: [
              { x: 'Mon', y: 4 },
              { x: 'Tue', y: 5 },
              { x: 'Wed', y: 6 },
            ],
          },
        ]}
      />
    );

    expect(await screen.findByRole('img', { name: 'Capacity' })).toBeInTheDocument();
    expect(screen.getByText('Seated', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByText('Standing', { selector: 'span' })).toBeInTheDocument();

    let areaPaths!: SVGPathElement[];
    await waitFor(() => {
      expect(container.querySelectorAll('linearGradient').length).toBe(0);
      areaPaths = Array.from(
        container.querySelectorAll<SVGPathElement>('path[data-part="area"]'),
      );
      expect(areaPaths).toHaveLength(2);
    });

    // WO-CRA-04: native <title> tooltips stay retired. The legacy
    // `.chart-hover-overlay` crosshair belonged to the pre-renderer D3 body;
    // live hover on the migrated area family arrives with the Stage-C
    // interaction-controller wire. Until then the idle ChartTooltip element is
    // the family's interaction contract.
    // The single remaining <title> is the surface-owned svg-level a11y name.
    expect(container.querySelectorAll('svg > title').length).toBe(1);
    expect(container.querySelectorAll('title').length).toBe(1);

    const tooltip = document.querySelector<HTMLElement>("[data-part='chart-tooltip']");
    expect(tooltip).toBeTruthy();
    expect(tooltip?.getAttribute('data-state')).toBe('hidden');

    // The identity contract is unchanged: each series mark must retain the
    // corresponding caller-authored color on its solid area fill.
    expect(areaPaths.map((path) => path.getAttribute('fill'))).toEqual([
      '#123456',
      '#abcdef',
    ]);
  });
});
