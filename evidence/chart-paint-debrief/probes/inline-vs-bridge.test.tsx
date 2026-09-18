import React from 'react';
import { waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BarChart, PieChart } from '@ui/patterns/visualization/charts';
import { renderSurface } from '@ui/surfaces/foundation/common/test-utils';

const DATA = [{ label: 'A', value: 10 }, { label: 'B', value: 20 }];

describe('FAM-09 probe: same page, same scheme, two paint authorities', () => {
  it('bar carries inline paint; pie carries none and defers to the bridge', async () => {
    const { container } = renderSurface(
      <>
        <div data-testid="bar"><BarChart width={320} height={220} responsive={false} animate={false} data={DATA} /></div>
        <div data-testid="pie"><PieChart width={320} height={220} responsive={false} animate={false} data={DATA} /></div>
      </>,
    );
    await waitFor(() => {
      expect(container.querySelector('[data-testid="bar"] [data-part="bar-mark"]')).not.toBeNull();
      expect(container.querySelector('[data-testid="pie"] [data-part="pie-slice-mark"]')).not.toBeNull();
    });
    const barMark = container.querySelector('[data-testid="bar"] [data-part="bar-mark"]');
    const pieMark = container.querySelector('[data-testid="pie"] [data-part="pie-slice-mark"]');
    const barScope = container.querySelector('[data-testid="bar"] [data-part="chart-renderer"]');
    const pieScope = container.querySelector('[data-testid="pie"] [data-part="chart-renderer"]');
    console.log(JSON.stringify({
      barScope: barScope?.getAttribute('data-chart-color-scheme'),
      pieScope: pieScope?.getAttribute('data-chart-color-scheme'),
      barMarkInline: barMark?.getAttribute('style'),
      barMarkSeriesIndex: barMark?.getAttribute('data-series-index'),
      pieMarkInline: pieMark?.getAttribute('style'),
      pieMarkSeriesIndex: pieMark?.getAttribute('data-series-index'),
      pieSliceFillAttr: pieMark?.querySelector('[data-part="pie-slice"]')?.getAttribute('fill'),
    }, null, 2));
  });
});
