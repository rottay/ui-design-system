/** @fileoverview VisualizationSurface tests -- tabs, stats, chart slot rendering. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { VisualizationSurface } from '..';
import type { VisualizationSurfaceConfig } from '../../../../../foundation/contracts';
import { renderSurface } from '../../../../../foundation/common/test-utils';

function buildConfig(overrides?: Partial<VisualizationSurfaceConfig>): VisualizationSurfaceConfig {
  return {
    visual: {},
    presentation: {
      chrome: {
        title: 'Analytics',
      },
      intro: <div>Overview metrics for this workspace.</div>,
    },
    behavior: {
      views: [
        {
          key: 'chart',
          label: 'Chart',
          badge: <span>Live</span>,
          content: <div>Chart visualization</div>,
        },
        {
          key: 'table',
          label: 'Table',
          content: <div>Table visualization</div>,
        },
      ],
      onViewChange: vi.fn(),
    },
    access: undefined,
    ...overrides,
  };
}

describe('VisualizationSurface', () => {
  it('switches views and forwards view changes when uncontrolled', async () => {
    const config = buildConfig();

    renderSurface(<VisualizationSurface config={config} />);

    fireEvent.click(await screen.findByRole('tab', { name: 'Table' }));

    await waitFor(() => {
      expect(config.behavior.onViewChange).toHaveBeenCalledWith('table');
    });

    expect(await screen.findByText('Table visualization')).toBeInTheDocument();
  });

  it('filters protected views and preserves badges on visible views', async () => {
    const config = buildConfig({
      behavior: {
        views: [
          {
            key: 'chart',
            label: 'Chart',
            badge: <span>Live</span>,
            content: <div>Chart visualization</div>,
          },
          {
            key: 'table',
            label: 'Table',
            permissionId: 'analytics.table',
            content: <div>Table visualization</div>,
          },
        ],
        onViewChange: vi.fn(),
      },
      access: {
        mode: 'resolved',
        capabilities: [
          { kind: 'tab', id: 'chart', visible: true },
          { kind: 'tab', id: 'analytics.table', visible: false },
        ],
      },
    });

    renderSurface(<VisualizationSurface config={config} />);

    expect(await screen.findByRole('tab', { name: /Chart/i })).toBeInTheDocument();
    expect(screen.getByText('Live')).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /Table/i })).not.toBeInTheDocument();
  });

  it('covers empty states, controlled fallback views, stats, aside, footer, and descriptions', async () => {
    const config = buildConfig({
      presentation: {
        chrome: {
          title: 'Analytics',
        },
        intro: <div>Overview metrics for this workspace.</div>,
        aside: <div>Visualization aside</div>,
        footer: <div>Visualization footer</div>,
      },
      behavior: {
        activeView: 'missing',
        views: [
          {
            key: 'chart',
            label: 'Chart',
            description: 'Primary chart description',
            content: <div>Chart visualization</div>,
          },
        ],
        stats: [
          { id: 'revenue', label: 'Revenue', value: '$24k' },
        ],
        onViewChange: vi.fn(),
      },
    });

    const view = renderSurface(<VisualizationSurface config={config} />);

    expect(await screen.findByText('Overview metrics for this workspace.')).toBeInTheDocument();
    expect(screen.getByText('Visualization aside')).toBeInTheDocument();
    expect(screen.getByText('Visualization footer')).toBeInTheDocument();
    expect(await screen.findByText('Revenue')).toBeInTheDocument();
    expect(await screen.findByText('$24k')).toBeInTheDocument();
    expect(screen.getByText('Primary chart description')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Chart' })).toHaveAttribute('aria-selected', 'true');

    view.unmount();

    renderSurface(
      <VisualizationSurface
        config={buildConfig({
          behavior: {
            views: [],
          },
          presentation: {
            chrome: {
              title: 'Analytics',
            },
            emptyState: <div>Bring your own visualization state</div>,
          },
        })}
      />
    );

    expect(await screen.findByText('Bring your own visualization state')).toBeInTheDocument();
  });
});
