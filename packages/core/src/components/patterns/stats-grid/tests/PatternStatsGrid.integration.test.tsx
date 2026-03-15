import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import { PatternStatsGrid } from '..';
import { renderSurface } from '../../../surfaces/tests/test-utils';

const stats = [
  { key: 'events', label: 'Events', value: 18, change: 12, changeType: 'increase' as const },
  { key: 'tickets', label: 'Tickets', value: '12.4k', change: 8, changeType: 'increase' as const },
  { key: 'conversion', label: 'Conversion', value: '7.8%', change: -1.4, changeType: 'decrease' as const },
];

describe('PatternStatsGrid integration', () => {
  it('renders the live pattern through the real provider stack', async () => {
    renderSurface(<PatternStatsGrid stats={stats} animate={false} columns={3} />);

    expect(await screen.findByText('Events')).toBeInTheDocument();
    expect(await screen.findByText('Tickets')).toBeInTheDocument();
    expect(await screen.findByText('Conversion')).toBeInTheDocument();
  });

  it('routes stat clicks through the live runtime component', async () => {
    const onStatClick = vi.fn();

    renderSurface(
      <PatternStatsGrid
        stats={stats}
        animate={false}
        columns={3}
        onStatClick={onStatClick}
      />
    );

    fireEvent.click(await screen.findByText('Events'));

    expect(onStatClick).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'events',
        label: 'Events',
      })
    );
  });
});
