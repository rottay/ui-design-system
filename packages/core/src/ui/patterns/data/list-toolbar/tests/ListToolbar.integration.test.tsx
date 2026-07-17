import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';

import { PatternListToolbar } from '..';
import { STABLE_ENGINES, renderWithEngine } from '../../../../../tooling/testing/helpers/engine';
import { mockMatchMedia } from '../../../../../tooling/testing/helpers/browser/match-media';

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
          className="toolbar-token-contract"
          primaryAction={{
            label: 'Create event',
            onClick: vi.fn(),
          }}
        />,
        engine,
      );

      expect(await screen.findByText('Events')).toBeInTheDocument();
      expect(await screen.findByPlaceholderText('Search...')).toBeInTheDocument();
      expect(await screen.findByRole('button', { name: /create event/i })).toBeInTheDocument();
      if (engine === 'modern') {
        expect(await screen.findByRole('button', { name: /status/i })).toBeInTheDocument();
      } else {
        expect(await screen.findByText('All')).toBeInTheDocument();
      }
      await waitFor(() => {
        const root = document.querySelector('.toolbar-token-contract') as HTMLElement | null;
        expect(root).not.toBeNull();
        if (engine === 'modern') {
          expect(root?.getAttribute('data-part')).toBe('root');
          expect(root?.style.boxShadow).toBe('');
        } else {
          expect(root?.getAttribute('style')).toContain('--ds-toolbar-shadow');
        }
      });
    },
    45000,
  );
});
