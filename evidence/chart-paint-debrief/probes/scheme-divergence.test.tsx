import React from 'react';
import { waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BarChart, PieChart, ScatterChart } from '@ui/patterns/visualization/charts';
import { renderSurface } from '@ui/surfaces/foundation/common/test-utils';
import { resolveChartSeriesPaint } from '@ui/patterns/visualization/charts/runtime/chart-engine/foundation/grammar/palette';

const DATA = [
  { label: 'A', value: 10 },
  { label: 'B', value: 20 },
];

function probe(scheme: 'default' | 'monochrome' | 'vibrant' | undefined) {
  const { container } = renderSurface(
    <div data-testid="probe">
      <BarChart width={320} height={220} responsive={false} animate={false}
        data={DATA} {...(scheme ? { colorScheme: scheme } : {})} />
    </div>,
  );
  return container;
}

describe('FAM-09 probe: colorScheme prop vs stamped scheme scope', () => {
  for (const scheme of ['default', 'monochrome', 'vibrant'] as const) {
    it(`BarChart colorScheme="${scheme}"`, async () => {
      const container = probe(scheme);
      await waitFor(() => {
        expect(container.querySelector('[data-part="chart-renderer"]')).not.toBeNull();
      });
      const root = container.querySelector('[data-part="chart-renderer"]');
      const stamped = root?.getAttribute('data-chart-color-scheme');
      const mark = container.querySelector('[data-part="bar-mark"]') as HTMLElement | null;
      const inline = mark?.getAttribute('style');
      const expectedInline = resolveChartSeriesPaint(scheme)[0];
      // eslint-disable-next-line no-console
      console.log(JSON.stringify({
        requested: scheme,
        stampedScopeAttr: stamped,
        markInlineStyle: inline,
        inlineWouldBeIfSchemeHonoured: expectedInline,
      }, null, 2));
      expect(stamped).toBeDefined();
    });
  }

  it('ScatterChart ignores its declared colors prop', async () => {
    const { container } = renderSurface(
      <ScatterChart width={320} height={220} responsive={false} animate={false}
        data={[{ x: 1, y: 1 }]} colors={['#ff0000']} />,
    );
    await waitFor(() => {
      expect(container.querySelector('[data-part="scatter-point-mark"]')).not.toBeNull();
    });
    const html = container.innerHTML;
    // eslint-disable-next-line no-console
    console.log(JSON.stringify({ containsSuppliedColor: html.includes('#ff0000') }, null, 2));
  });

  it('PieChart honours its colors prop (control)', async () => {
    const { container } = renderSurface(
      <PieChart width={320} height={220} responsive={false} animate={false}
        data={DATA} colors={['#ff0000', '#00ff00']} />,
    );
    await waitFor(() => {
      expect(container.querySelector('[data-part="legend-swatch"], [data-part="pie-slice-mark"]')).not.toBeNull();
    });
    // eslint-disable-next-line no-console
    console.log(JSON.stringify({ containsSuppliedColor: container.innerHTML.includes('rgb(255, 0, 0)') || container.innerHTML.includes('#ff0000') }, null, 2));
  });
});
