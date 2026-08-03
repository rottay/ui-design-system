/** @fileoverview VisualizationSurface tests -- tabs, stats, chart slot rendering. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import visualizationSkinCss from '@/foundation/tokens/css/presentation/components/skin/visualization.css?raw';
import chartFoundationCss from '@/foundation/tokens/css/presentation/components/skin/chart-foundation.css?raw';
import { Histogram, LineChart } from '../../../../../../patterns/visualization/charts';
import { VisualizationSurface } from '..';
import type { VisualizationSurfaceConfig } from '../../../../../foundation/contracts';
import {
  renderSurface,
  RESOLVED_PHONE_TEST_CONTEXT,
} from '../../../../../foundation/common/test-utils';

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
          { key: 'revenue', label: 'Revenue', value: '$24k' },
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

  it('projects compact legend variables into chart families after phone resolution', async () => {
    renderSurface(
      <VisualizationSurface
        config={buildConfig({
          visual: { compactChartsOnMobile: true },
          behavior: {
            views: [
              {
                key: 'chart',
                label: 'Chart',
                content: (
                  <>
                    <LineChart
                      series={[
                        {
                          name: 'Revenue',
                          data: [
                            { x: 'Jan', y: 10 },
                            { x: 'Feb', y: 20 },
                          ],
                        },
                      ]}
                      width={320}
                      height={240}
                      responsive={false}
                      animate={false}
                      legend
                    />
                    <Histogram
                      values={[1, 2, 2, 3, 4]}
                      width={320}
                      height={240}
                      responsive={false}
                      animate={false}
                      legend
                    />
                  </>
                ),
              },
            ],
          },
        })}
      />,
      { responsiveContext: RESOLVED_PHONE_TEST_CONTEXT }
    );

    await waitFor(() => {
      expect(document.querySelector('.ds-chart-line')).not.toBeNull();
      expect(document.querySelector('.ds-chart-histogram')).not.toBeNull();
      expect(document.querySelector('[data-part="visualization-view"]')).toHaveAttribute(
        'data-chart-density',
        'compact'
      );
    }, { timeout: 3000 });

    const compactView = document.querySelector<HTMLElement>(
      '[data-part="visualization-view"][data-chart-density="compact"]'
    );
    const lineLegend = compactView?.querySelector<HTMLElement>(
      '.ds-chart-line [data-part="legend"]'
    );
    const histogramLegend = compactView?.querySelector<HTMLElement>(
      '.ds-chart-histogram [data-part="legend"]'
    );

    expect(lineLegend).not.toBeNull();
    expect(histogramLegend).not.toBeNull();
    if (!lineLegend || !histogramLegend) {
      throw new Error('Expected compact line and histogram legends');
    }

    expect(visualizationSkinCss).toContain(
      '--ds-chart-legend-gap: var(--ds-spacing-2);'
    );
    expect(visualizationSkinCss).toContain(
      '--ds-chart-legend-margin-top: var(--ds-spacing-2);'
    );
    expect(visualizationSkinCss).toContain(
      '--ds-chart-legend-item-gap: var(--ds-spacing-1);'
    );
    expect(visualizationSkinCss).toContain(
      '--ds-chart-legend-font-size: var(--ds-font-size-xs);'
    );

    // LineChart now consumes the shared chart-foundation legend recipe instead
    // of rebuilding it inline. Histogram has not migrated yet, so this test
    // pins both truthful paths while proving that the surface retune reaches
    // the same channel names.
    expect(lineLegend.style.gap).toBe('');
    expect(
      lineLegend.querySelector<HTMLElement>('[data-part="legend-item"]')?.style.gap
    ).toBe('');
    expect(chartFoundationCss).toMatch(
      /\[data-part='legend'\]\s*\{[\s\S]*?gap:\s*var\(--ds-chart-legend-gap, 16px\)/
    );
    expect(chartFoundationCss).toMatch(
      /\[data-part='legend-item'\]\s*\{[\s\S]*?gap:\s*var\(--ds-chart-legend-item-gap, 6px\)/
    );

    expect(histogramLegend.style.gap).toBe('var(--ds-chart-legend-gap, 16px)');
    const histogramItem = histogramLegend.querySelector<HTMLElement>('[data-part="legend-item"]');
    expect(histogramItem).not.toBeNull();
    expect(histogramItem?.style.gap).toBe('var(--ds-chart-legend-item-gap, 6px)');
  });
});
