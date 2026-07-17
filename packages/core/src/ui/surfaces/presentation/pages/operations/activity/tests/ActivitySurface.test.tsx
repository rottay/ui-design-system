/** @fileoverview ActivitySurface tests -- timeline rendering and pagination. */

import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ActivitySurface } from '..';
import type { ActivitySurfaceConfig } from '../../../../../foundation/contracts';
import { renderSurface } from '../../../../../foundation/common/test-utils';

function buildConfig(overrides?: Partial<ActivitySurfaceConfig>): ActivitySurfaceConfig {
  return {
    visual: {},
    presentation: {
      chrome: {
        title: 'Activity Log',
        subtitle: 'Recent actions across the platform',
      },
    },
    behavior: {
      activities: [
        {
          id: 'a1',
          user: { name: 'Alice' },
          action: 'Created document',
          timestamp: '2026-03-15T10:30:00Z',
          entityType: 'document',
        },
        {
          id: 'a2',
          user: { name: 'Bob' },
          action: 'Updated settings',
          timestamp: '2026-03-15T09:15:00Z',
          entityType: 'settings',
        },
      ],
      onActivityClick: vi.fn(),
    },
    ...overrides,
  };
}

describe('ActivitySurface', () => {
  it('renders page chrome and activities', async () => {
    renderSurface(<ActivitySurface config={buildConfig()} />);

    expect(await screen.findByText('Activity Log')).toBeInTheDocument();
  });

  it('renders pagination when provided', async () => {
    const config = buildConfig({
      behavior: {
        activities: [
          { id: 'a1', user: { name: 'Alice' }, action: 'Created', timestamp: '2026-03-15' },
        ],
        pagination: { current: 1, total: 50, pageSize: 10 },
      },
    });

    renderSurface(<ActivitySurface config={config} />);

    expect(await screen.findByText(/Page 1/)).toBeInTheDocument();
    expect(await screen.findByText(/50 total/)).toBeInTheDocument();
  });
});
