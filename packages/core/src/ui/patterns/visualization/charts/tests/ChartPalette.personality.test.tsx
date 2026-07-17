import React from 'react';
import { waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { TenantConfig } from '../../../../../foundation/contracts';
import {
  FunnelChart,
  GanttChart,
  NetworkGraph,
  SankeyChart,
  ScatterChart,
} from '..';
import { MONOCHROME_COLORS } from '../foundation/palettes';
import { renderSurface } from '../../../../surfaces/foundation/common/test-utils';

const MONOCHROME_TENANT_OVERRIDE = {
  personality: {
    chart: {
      animateOnMount: false,
      mountDuration: 0,
      lineStyle: 'sharp',
      showDots: true,
      useGradientFill: false,
      tooltipStyle: 'minimal',
      colorScheme: 'monochrome',
    },
  },
} satisfies Partial<TenantConfig>;

describe('chart personality palette fallback', () => {
  it('uses the provider-resolved tenant palette in every colors-capable family', async () => {
    const { container } = renderSurface(
      <>
        <div data-testid="funnel-palette">
          <FunnelChart
            width={320}
            height={220}
            responsive={false}
            animate={false}
            data={[{ label: 'Qualified', value: 10 }]}
          />
        </div>
        <div data-testid="gantt-palette">
          <GanttChart
            width={320}
            height={220}
            responsive={false}
            animate={false}
            showToday={false}
            tasks={[{
              id: 'discovery',
              name: 'Discovery',
              start: '2026-07-01',
              end: '2026-07-03',
            }]}
          />
        </div>
        <div data-testid="network-palette">
          <NetworkGraph
            width={320}
            height={220}
            responsive={false}
            animate={false}
            nodes={[{ id: 'source', group: 'primary' }]}
            links={[]}
          />
        </div>
        <div data-testid="sankey-palette">
          <SankeyChart
            width={320}
            height={220}
            responsive={false}
            animate={false}
            nodes={[
              { id: 'source', label: 'Source' },
              { id: 'target', label: 'Target' },
            ]}
            links={[{ source: 'source', target: 'target', value: 10 }]}
          />
        </div>
        <div data-testid="scatter-palette">
          <ScatterChart
            width={320}
            height={220}
            responsive={false}
            animate={false}
            data={[{ x: 1, y: 1 }]}
          />
        </div>
      </>,
      { tenantOverrides: MONOCHROME_TENANT_OVERRIDE },
    );

    await waitFor(() => {
      expect(container.querySelectorAll('[data-part="series-point"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="node-mark"]')).toHaveLength(3);
    });

    const expected = MONOCHROME_COLORS[0];
    const marks = [
      container.querySelector('[data-testid="funnel-palette"] [data-part="segment"]'),
      container.querySelector('[data-testid="gantt-palette"] [data-part="task-duration"]'),
      container.querySelector('[data-testid="network-palette"] [data-part="node-mark"]'),
      container.querySelector('[data-testid="sankey-palette"] [data-part="node-mark"]'),
      container.querySelector('[data-testid="scatter-palette"] [data-part="series-point"]'),
    ];

    for (const mark of marks) {
      expect(mark).toHaveAttribute('fill', expected);
    }
  });
});
