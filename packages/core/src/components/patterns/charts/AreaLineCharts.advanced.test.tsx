import React from 'react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { AreaChart, LineChart } from '.';
import { renderSurface } from '../../surfaces/common/test-utils';

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

    const chart = await screen.findByRole('img', { name: 'Revenue' });
    fireEvent.keyDown(chart, { key: 'End' });
    expect(screen.getByText(/Active data point: Series: Revenue, X: 2026-03-12T00:00:00.000Z, Y: 18/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(firstRender.container.querySelectorAll('circle').length).toBeGreaterThan(0);
      expect(firstRender.container.querySelectorAll('linearGradient').length).toBeGreaterThan(0);
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

    expect(await screen.findByText('Linear Revenue')).toBeInTheDocument();
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
            data: [
              { x: 'Mon', y: 10 },
              { x: 'Tue', y: 12 },
              { x: 'Wed', y: 14 },
            ],
          },
          {
            name: 'Standing',
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

    await waitFor(() => {
      expect(container.querySelectorAll('linearGradient').length).toBe(0);
      expect(container.querySelectorAll('title').length).toBeGreaterThan(2);
      expect(container.querySelectorAll('circle').length).toBeGreaterThan(2);
    });
  });
});
