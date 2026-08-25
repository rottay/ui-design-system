import React from 'react';
import { waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  FunnelChart,
  GanttChart,
  NetworkGraph,
  SankeyChart,
  ScatterChart,
} from '..';
import { resolveChartSeriesPaint } from '../runtime/chart-engine/foundation/grammar/palette';
import { renderSurface } from '../../../../surfaces/foundation/common/test-utils';

/**
 * `tenantOverrides.personality` used to select the `monochrome` colour
 * scheme here. `personality` is refused by `resolveVisualAuthority` by mere
 * PRESENCE on `TenantConfig` -- unconditionally, even under a declared
 * `visualAuthority: { authority: 'compiled-artifact', ... }`
 * (`resolveVisualAuthority`'s conflict list treats `payload.personality` the
 * same as `payload.brandTheme`: any presence blocks, regardless of an
 * artifact) -- so `renderSurface` fails closed against
 * `DesignSystemProvider`'s authority barrier (`358ce9188`) and every chart
 * mounts nothing. None of the 5 chart family components under test forward a
 * `colorScheme` prop to `useChartPersonality` (only `animate`/`tooltip`), so
 * there is no per-component override path either. The suite's own helper
 * docblock (`test-utils/index.tsx:14-32`) is explicit: "a suite that
 * genuinely needs compiled tenant paint must mount a verified artifact and
 * declare `visualAuthority`; it must not re-add raw colours here" -- and here
 * that is doubly true, since no artifact declaration can admit `personality`
 * either. Dropped the override; the suite still verifies its real subject
 * (one resolved series palette applied consistently across every
 * colors-capable chart family) against `DEFAULT_PERSONALITY.chart.colorScheme
 * = 'default'`, the scheme every chart resolves to with no tenant override at
 * all.
 */

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
    );

    await waitFor(() => {
      expect(container.querySelectorAll('[data-part="scatter-point-mark"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="node-mark"]')).toHaveLength(3);
    });

    const expected = resolveChartSeriesPaint('accessible')[0];
    const marks = [
      container.querySelector('[data-testid="funnel-palette"] [data-part="segment"]'),
      container.querySelector('[data-testid="gantt-palette"] [data-part="task-duration"]'),
      container.querySelector('[data-testid="network-palette"] [data-part="node-mark"]'),
      container.querySelector('[data-testid="sankey-palette"] [data-part="node-mark"]'),
    ];

    for (const mark of marks) {
      expect(mark).toHaveAttribute('fill', expected);
    }

    // Scatter (like pie) is a categorical family: it paints through the governed
    // `--ds-chart-paint-N` skin channel keyed on `data-series-index`, not an
    // inline resolved fill. Its tenant-palette governance is therefore proven by
    // the governed series index on the mark rather than a concrete fill attr.
    const scatterMark = container.querySelector(
      '[data-testid="scatter-palette"] [data-part="scatter-point-mark"]',
    );
    expect(scatterMark).toHaveAttribute('data-series-index', '0');
    expect(scatterMark?.querySelector('[data-part="scatter-point"]')).not.toHaveAttribute('fill');
  });
});
