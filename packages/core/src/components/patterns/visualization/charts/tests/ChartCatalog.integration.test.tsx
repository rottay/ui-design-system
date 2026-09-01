import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';

import {
  AreaChart,
  FunnelChart,
  GanttChart,
  HeatMap,
  NetworkGraph,
  PieChart,
  RadarChart,
  TreeMap,
} from '..';
import { renderSurface } from '../../../../surfaces/foundation/common/test-utils';

describe('chart catalog integration', () => {
  it('renders PieChart with accessible summary metadata', async () => {
    const { container } = renderSurface(
      <PieChart
        title="Acquisition mix"
        width={420}
        height={280}
        responsive={false}
        data={[
          { label: 'Email', value: 34 },
          { label: 'Paid social', value: 28 },
          { label: 'Organic', value: 20 },
        ]}
      />
    );

    expect(screen.getByRole('img', { name: 'Acquisition mix' })).toBeInTheDocument();
    expect(screen.getByText(/pie chart containing 3 data items/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(container.querySelectorAll('path').length).toBeGreaterThan(0);
    });
  });

  it('renders AreaChart with multiple series', async () => {
    const { container } = renderSurface(
      <AreaChart
        title="Revenue by stream"
        width={520}
        height={280}
        responsive={false}
        series={[
          {
            name: 'Tickets',
            data: [
              { x: 'Mon', y: 14 },
              { x: 'Tue', y: 18 },
              { x: 'Wed', y: 12 },
            ],
          },
          {
            name: 'Merch',
            data: [
              { x: 'Mon', y: 5 },
              { x: 'Tue', y: 7 },
              { x: 'Wed', y: 4 },
            ],
          },
        ]}
      />
    );

    expect(screen.getByRole('img', { name: 'Revenue by stream' })).toBeInTheDocument();

    await waitFor(() => {
      expect(container.querySelectorAll('path').length).toBeGreaterThan(1);
    });
  });

  it('renders FunnelChart with stage labels', async () => {
    const { container } = renderSurface(
      <FunnelChart
        title="Pipeline conversion"
        width={520}
        height={320}
        responsive={false}
        data={[
          { label: 'Visited', value: 1000 },
          { label: 'Started', value: 640 },
          { label: 'Purchased', value: 180 },
        ]}
      />
    );

    expect(screen.getByRole('img', { name: 'Pipeline conversion' })).toBeInTheDocument();

    await waitFor(() => {
      expect(container.querySelectorAll('polygon').length).toBeGreaterThan(0);
    });
  });

  it('renders HeatMap with cells', async () => {
    const { container } = renderSurface(
      <HeatMap
        title="Attendance heatmap"
        width={520}
        height={320}
        responsive={false}
        data={[
          { x: 'Mon', y: 'Morning', value: 12 },
          { x: 'Mon', y: 'Evening', value: 20 },
          { x: 'Tue', y: 'Morning', value: 18 },
          { x: 'Tue', y: 'Evening', value: 24 },
        ]}
      />
    );

    expect(screen.getByRole('img', { name: 'Attendance heatmap' })).toBeInTheDocument();

    await waitFor(() => {
      expect(container.querySelectorAll('rect').length).toBeGreaterThan(0);
    });
  });

  it('renders GanttChart tasks and today line hooks', async () => {
    const { container } = renderSurface(
      <GanttChart
        title="Production schedule"
        width={640}
        height={280}
        responsive={false}
        tasks={[
          {
            id: 'task-1',
            name: 'Venue setup',
            start: new Date('2026-03-10T09:00:00'),
            end: new Date('2026-03-12T18:00:00'),
            progress: 60,
          },
          {
            id: 'task-2',
            name: 'Crew briefing',
            start: new Date('2026-03-13T09:00:00'),
            end: new Date('2026-03-13T11:00:00'),
            progress: 100,
          },
        ]}
      />
    );

    expect(screen.getByRole('img', { name: 'Production schedule' })).toBeInTheDocument();

    await waitFor(() => {
      expect(container.querySelectorAll('rect').length).toBeGreaterThan(1);
    });
  });

  it('renders NetworkGraph links and nodes', async () => {
    const { container } = renderSurface(
      <NetworkGraph
        title="Crew network"
        width={520}
        height={320}
        responsive={false}
        nodes={[
          { id: 'ops', label: 'Ops', group: 'teams' },
          { id: 'security', label: 'Security', group: 'teams' },
          { id: 'checkin', label: 'Check-in', group: 'teams' },
        ]}
        links={[
          { source: 'ops', target: 'security' },
          { source: 'ops', target: 'checkin' },
        ]}
      />
    );

    expect(screen.getByRole('img', { name: 'Crew network' })).toBeInTheDocument();

    await waitFor(() => {
      expect(container.querySelectorAll('circle').length).toBeGreaterThan(0);
      expect(container.querySelectorAll('line').length).toBeGreaterThan(0);
    });
  });

  it('renders RadarChart with axis labels', async () => {
    const { container } = renderSurface(
      <RadarChart
        title="Operational balance"
        width={420}
        height={320}
        responsive={false}
        data={[
          { axis: 'Safety', value: 8 },
          { axis: 'Speed', value: 6 },
          { axis: 'Quality', value: 9 },
          { axis: 'Coverage', value: 7 },
        ]}
      />
    );

    expect(screen.getByRole('img', { name: 'Operational balance' })).toBeInTheDocument();

    await waitFor(() => {
      expect(container.querySelectorAll('polygon').length).toBeGreaterThan(0);
    });
  });

  it('renders TreeMap blocks', async () => {
    const { container } = renderSurface(
      <TreeMap
        title="Revenue mix"
        width={520}
        height={320}
        responsive={false}
        data={[
          { name: 'Tickets', value: 420 },
          { name: 'Merch', value: 160 },
          { name: 'Food', value: 95 },
        ]}
      />
    );

    expect(screen.getByRole('img', { name: 'Revenue mix' })).toBeInTheDocument();

    await waitFor(() => {
      expect(container.querySelectorAll('rect').length).toBeGreaterThan(0);
    });
  });
});
