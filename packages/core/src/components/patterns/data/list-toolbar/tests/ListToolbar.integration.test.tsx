import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';

import { PatternListToolbar } from '..';
import { STABLE_ENGINES, renderWithEngine } from '../../../../../_internal/testing/helpers/engine-test-utils';
import { mockMatchMedia } from '../../../../../_internal/testing/helpers/match-media';

describe('PatternListToolbar integration', () => {
  it.each(STABLE_ENGINES)(
    'renders the compact mobile toolbar through the %s engine',
    async (engine) => {
      mockMatchMedia(390);

      renderWithEngine(
        <PatternListToolbar
          engine={engine}
          title="Events"
          totalCount={42}
          search=""
          onSearchChange={vi.fn()}
          filterPills={[
            {
              key: 'status',
              label: 'Status',
              value: 'all',
              options: [
                { label: 'All', value: 'all' },
                { label: 'Live', value: 'live' },
              ],
            },
          ]}
          viewMode="list"
          onViewModeChange={vi.fn()}
          density="comfortable"
          onDensityChange={vi.fn()}
          primaryAction={{
            label: 'Create event',
            onClick: vi.fn(),
          }}
        />,
        engine,
      );

      expect(await screen.findByText('Events')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create event/i })).toBeInTheDocument();
      expect(screen.getByText('All')).toBeInTheDocument();
    },
    45000,
  );
});
