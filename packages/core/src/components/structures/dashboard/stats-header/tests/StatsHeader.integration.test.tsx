import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { StatsHeader } from '..';
import { STABLE_ENGINES, renderWithEngine } from '@tests/support/engine';
import { mockMatchMedia } from '@tests/support/browser/match-media';

describe('StatsHeader integration', () => {
  it.each(STABLE_ENGINES)(
    'renders the responsive stats cards through the %s engine',
    async (engine) => {
      mockMatchMedia(390);

      renderWithEngine(
        <StatsHeader
          engine={engine}
          stats={[
            {
              key: 'tickets',
              label: 'Tickets',
              value: 3248,
              accentColor: 'primary',
              insight: 'Velocity still rising',
            },
            {
              key: 'finance',
              label: 'Revenue',
              value: '$182k',
              accentColor: 'success',
              insight: 'Ahead of forecast',
            },
          ]}
        />,
        engine,
      );

      expect(await screen.findByText('Tickets')).toBeInTheDocument();
      expect(screen.getByText('Revenue')).toBeInTheDocument();
      expect(screen.getByText('Velocity still rising')).toBeInTheDocument();
      expect(screen.getByText('Ahead of forecast')).toBeInTheDocument();
    },
    45000,
  );

  it('derives the loading state from the stamped card anatomy', async () => {
    mockMatchMedia(390);

    const { container } = renderWithEngine(
      <StatsHeader
        stats={[
          { key: 'tickets', label: 'Tickets', value: 3248, accentColor: 'primary' },
          { key: 'finance', label: 'Revenue', value: '$182k', accentColor: 'success' },
        ]}
        loading
      />,
      'modern',
    );

    // The root keeps the single announcement; the shared renderer wraps the
    // real card grid in its anatomy source and paints bones from it.
    const root = container.querySelector('.ds-stats-header') as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.getAttribute('aria-busy')).toBe('true');
    const source = root.querySelector('[data-part="source"]');
    expect(source).not.toBeNull();
    expect(source?.getAttribute('aria-hidden')).toBe('true');
    expect(source?.querySelectorAll('[data-part="stat-card"]')).toHaveLength(2);
    // No hand-made skeleton anatomy survives the migration.
    expect(container.querySelectorAll('[data-part="skeleton-card"]')).toHaveLength(0);
  }, 45000);
});
