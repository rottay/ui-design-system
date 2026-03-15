import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { BarChart } from '.';
import { LineChart } from '.';
import { renderSurface } from '../../surfaces/tests/test-utils';

describe('Chart components integration', () => {
  it('renders a live line chart shell with legend content', async () => {
    const { container } = renderSurface(
      <LineChart
        title="Revenue"
        subtitle="Weekly performance"
        width={480}
        height={280}
        responsive={false}
        showArea
        series={[
          {
            name: 'Revenue',
            data: [
              { x: 'Mon', y: 14 },
              { x: 'Tue', y: 18 },
              { x: 'Wed', y: 12 },
              { x: 'Thu', y: 21 },
              { x: 'Fri', y: 26 },
            ],
          },
        ]}
      />
    );

    expect((await screen.findAllByText('Revenue')).length).toBeGreaterThan(0);
    expect(await screen.findByText('Weekly performance')).toBeInTheDocument();
    expect((await screen.findAllByText('Mon')).length).toBeGreaterThan(0);
    const chart = screen.getByRole('img', { name: 'Revenue' });
    expect(chart).toHaveAttribute('tabindex', '0');
    expect(screen.getByText(/line chart containing 5 data items/i)).toBeInTheDocument();

    fireEvent.keyDown(chart, { key: 'ArrowRight' });
    expect(screen.getByText(/Active data point: Series: Revenue, X: Tue, Y: 18/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(container.querySelector('svg')).toBeTruthy();
      expect(container.querySelectorAll('path').length).toBeGreaterThan(0);
    });
  });

  it('renders a live bar chart with bars and values', async () => {
    const { container } = renderSurface(
      <BarChart
        title="Tickets by Tier"
        width={480}
        height={280}
        responsive={false}
        showValues
        data={[
          { label: 'VIP', value: 180 },
          { label: 'GA', value: 420 },
          { label: 'Sponsors', value: 72 },
        ]}
      />
    );

    expect(await screen.findByText('Tickets by Tier')).toBeInTheDocument();
    expect((await screen.findAllByText('VIP')).length).toBeGreaterThan(0);
    expect(screen.getByRole('img', { name: 'Tickets by Tier' })).toBeInTheDocument();
    expect(screen.getByText(/bar chart containing 3 data items/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(container.querySelector('svg')).toBeTruthy();
      expect(container.querySelectorAll('rect').length).toBeGreaterThan(0);
    });
  });

  it('localizes the loading label through the root provider locale', async () => {
    renderSurface(<LineChart loading width={360} height={220} responsive={false} series={[]} />, {
      tenantOverrides: {
        locale: 'es',
      },
    });

    expect(await screen.findByText('Cargando grafico...')).toBeInTheDocument();
  });
});
