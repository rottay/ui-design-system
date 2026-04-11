import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { StatsHeader } from '..';
import { STABLE_ENGINES, renderWithEngine } from '../../../../../_internal/testing/helpers/engine-test-utils';
import { mockMatchMedia } from '../../../../../_internal/testing/helpers/match-media';

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
});
