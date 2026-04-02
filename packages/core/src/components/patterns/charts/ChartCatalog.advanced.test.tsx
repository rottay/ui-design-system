import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';

import {
  BarChart,
  FunnelChart,
  GanttChart,
  NetworkGraph,
  PieChart,
  RadarChart,
  TreeMap,
} from '.';
import { renderSurface } from '../../surfaces/common/test-utils';

describe('chart catalog advanced coverage', () => {
  it('covers bar chart horizontal orientation, labels, legend, tooltip, and axis-label branches', async () => {
    const { container } = renderSurface(
      <BarChart
        title="Tier comparison"
        subtitle="Horizontal layout"
        width={520}
        height={320}
        responsive={false}
        orientation="horizontal"
        showValues
        legend
        tooltip
        animate={false}
        xAxisLabel="Revenue"
        yAxisLabel="Tier"
        data={[
          { label: 'VIP', value: 200, color: '#f97316' },
          { label: 'GA', value: 420 },
          { label: 'Partner', value: 90 },
        ]}
      />
    );

    expect(screen.getByRole('img', { name: 'Tier comparison' })).toBeInTheDocument();
    expect(screen.getByText('Horizontal layout')).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('Tier')).toBeInTheDocument();
    expect(screen.getByText(/bar chart containing 3 data items/i)).toBeInTheDocument();

    expect(container.querySelectorAll('rect.bar').length).toBe(3);
    expect(container.querySelectorAll('text.value').length).toBe(3);
    expect(container.querySelectorAll('title').length).toBe(3);
  });

  it('covers funnel chart horizontal and vertical branches with legend, conversion, and percentage variants', async () => {
    const vertical = renderSurface(
      <FunnelChart
        title="Vertical funnel"
        width={520}
        height={320}
        responsive={false}
        tooltip
        animate={false}
        showConversion
        showPercentage={false}
        data={[
          { label: 'Visited', value: 1000 },
          { label: 'Started', value: 620 },
          { label: 'Purchased', value: 180 },
        ]}
      />
    );

    expect(screen.getByRole('img', { name: 'Vertical funnel' })).toBeInTheDocument();

    expect(vertical.container.querySelectorAll('polygon').length).toBe(3);
    expect(vertical.container.querySelectorAll('title').length).toBe(3);
    expect(screen.getAllByText('62.0%').length).toBeGreaterThan(0);
    expect(screen.getAllByText('29.0%').length).toBeGreaterThan(0);
    expect(screen.getAllByText('1000').length).toBeGreaterThan(0);

    vertical.unmount();

    const horizontal = renderSurface(
      <FunnelChart
        title="Horizontal funnel"
        width={520}
        height={320}
        responsive={false}
        legend
        tooltip={false}
        animate={false}
        orientation="horizontal"
        data={[
          { label: 'Lead', value: 300 },
          { label: 'Demo', value: 160 },
          { label: 'Win', value: 80 },
        ]}
      />
    );

    expect(screen.getByRole('img', { name: 'Horizontal funnel' })).toBeInTheDocument();
    expect(screen.getByText(/horizontal orientation/i)).toBeInTheDocument();
    expect(screen.getAllByText('Lead').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Demo').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Win').length).toBeGreaterThan(0);

    expect(horizontal.container.querySelectorAll('polygon').length).toBe(3);
    expect(horizontal.container.querySelectorAll('title').length).toBe(0);
  });

  it('covers pie chart donut, percentage labels, legend, tooltip, and hidden-label branches', async () => {
    const donut = renderSurface(
      <PieChart
        title="Channel mix"
        width={420}
        height={320}
        responsive={false}
        donut
        showPercentage
        legend
        tooltip
        animate={false}
        data={[
          { label: 'Email', value: 40 },
          { label: 'Social', value: 35 },
          { label: 'Organic', value: 25 },
        ]}
      />
    );

    expect(screen.getByRole('img', { name: 'Channel mix' })).toBeInTheDocument();
    expect(screen.getByText(/rendered as a donut chart/i)).toBeInTheDocument();

    expect(donut.container.querySelectorAll('path').length).toBeGreaterThan(0);
    expect(donut.container.querySelectorAll('title').length).toBe(3);
    expect(screen.getByText('40%')).toBeInTheDocument();
    expect(screen.getByText('35%')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();

    donut.unmount();

    const hiddenLabels = renderSurface(
      <PieChart
        title="Zero split"
        width={420}
        height={320}
        responsive={false}
        showLabels={false}
        showPercentage
        legend={false}
        tooltip={false}
        animate={false}
        data={[
          { label: 'A', value: 0 },
          { label: 'B', value: 0 },
        ]}
      />
    );

    expect(screen.getByRole('img', { name: 'Zero split' })).toBeInTheDocument();
    expect(screen.getAllByText('0%').length).toBeGreaterThan(0);

    expect(hiddenLabels.container.querySelectorAll('title').length).toBe(0);
    expect(hiddenLabels.container.querySelectorAll('svg text').length).toBe(0);
  });

  it('covers radar chart multi-series legend and hidden-axis-label branches', async () => {
    const { container } = renderSurface(
      <RadarChart
        title="Capability balance"
        width={420}
        height={320}
        responsive={false}
        showLabels={false}
        legend
        tooltip
        animate={false}
        series={[
          {
            name: 'Ops',
            color: '#f97316',
            data: [
              { axis: 'Safety', value: 8 },
              { axis: 'Speed', value: 6 },
              { axis: 'Quality', value: 9 },
            ],
          },
          {
            name: 'Support',
            data: [
              { axis: 'Safety', value: 7 },
              { axis: 'Speed', value: 9 },
              { axis: 'Quality', value: 8 },
            ],
          },
        ]}
        data={[]}
      />
    );

    expect(screen.getByRole('img', { name: 'Capability balance' })).toBeInTheDocument();
    expect(screen.getAllByText('Ops').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Support').length).toBeGreaterThan(0);

    expect(container.querySelectorAll('polygon').length).toBeGreaterThan(2);
    expect(container.querySelectorAll('circle').length).toBe(6);
    expect(container.querySelectorAll('title').length).toBe(6);
    expect(container.querySelectorAll('svg text').length).toBe(0);
  });

  it('covers treemap label visibility, legend, and tooltip-off branches', async () => {
    const { container } = renderSurface(
      <TreeMap
        title="Revenue treemap"
        width={520}
        height={320}
        responsive={false}
        legend
        tooltip={false}
        animate={false}
        showLabels={false}
        padding={6}
        data={[
          { name: 'Tickets', value: 420 },
          { name: 'Merch', value: 160 },
          { name: 'Food', value: 95 },
        ]}
      />
    );

    expect(screen.getByRole('img', { name: 'Revenue treemap' })).toBeInTheDocument();
    expect(screen.getAllByText('Tickets').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Merch').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Food').length).toBeGreaterThan(0);

    expect(container.querySelectorAll('rect').length).toBe(3);
    expect(container.querySelectorAll('title').length).toBe(0);
    expect(container.querySelectorAll('svg text').length).toBe(0);
  });

  it('covers gantt progress and today-marker branches', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-13T12:00:00Z'));

    try {
      const { container } = renderSurface(
        <GanttChart
          title="Launch plan"
          width={680}
          height={240}
          responsive={false}
          tooltip
          animate={false}
          showToday
          showProgress
          tasks={[
            {
              id: 'setup',
              name: 'Setup',
              start: '2026-03-10T09:00:00Z',
              end: '2026-03-15T18:00:00Z',
              progress: 50,
            },
            {
              id: 'launch',
              name: 'Launch',
              start: '2026-03-13T08:00:00Z',
              end: '2026-03-14T18:00:00Z',
              progress: 100,
            },
          ]}
        />
      );

      expect(screen.getByRole('img', { name: 'Launch plan' })).toBeInTheDocument();
      expect(screen.getByText('Today')).toBeInTheDocument();
      expect(container.querySelectorAll('rect').length).toBeGreaterThan(2);
      expect(container.querySelectorAll('title').length).toBe(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('covers network graph directed arrows, grouped legend, and non-animated layout branches', async () => {
    const { container } = renderSurface(
      <NetworkGraph
        title="Team graph"
        width={520}
        height={320}
        responsive={false}
        directed
        legend
        animate={false}
        tooltip
        nodes={[
          { id: 'ops', label: 'Ops', group: 'Core' },
          { id: 'sales', label: 'Sales', group: 'Go-to-market' },
          { id: 'support', label: 'Support', group: 'Core' },
        ]}
        links={[
          { source: 'ops', target: 'sales', value: 2 },
          { source: 'sales', target: 'support', value: 1 },
        ]}
      />
    );

    expect(screen.getByRole('img', { name: 'Team graph' })).toBeInTheDocument();
    expect(screen.getByText(/directed edges are shown with arrows/i)).toBeInTheDocument();
    expect(screen.getAllByText('Core').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Go-to-market').length).toBeGreaterThan(0);

    expect(container.querySelectorAll('circle').length).toBe(3);
    expect(container.querySelectorAll('line').length).toBe(2);
    expect(container.querySelectorAll('marker#arrow').length).toBe(1);
    expect(container.querySelectorAll('title').length).toBe(3);
  });
});
