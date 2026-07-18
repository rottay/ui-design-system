import React, { useState, type CSSProperties } from 'react';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { HeatMap } from '..';
import { renderSurface } from '../../../../surfaces/foundation/common/test-utils';

const scopedHeatMapColors = {
  '--test-heat-low': '#edf2f7',
  '--test-heat-high': '#123456',
} as CSSProperties;

// HeatMap delegates to the chart-engine renderer, which resolves the sequential
// colour-math sink through `resolveCssColor` and emits the concrete interpolated
// value on the `--ds-chart-cell-color` custom property (skin CSS applies it as
// `fill`). The correctness semantics are unchanged from the D3 family; only the
// paint channel moved off an inline `fill` attribute onto the custom property.
function heatMapCellColor(cell: SVGRectElement | undefined): string {
  return cell?.style.getPropertyValue('--ds-chart-cell-color').trim() ?? '';
}

function expectConcreteNonBlackVarFill(cell: SVGRectElement): void {
  const fill = heatMapCellColor(cell);
  expect(fill).not.toBe('');
  expect(fill).not.toContain('var(');
  expect(fill).not.toContain('NaN');
  expect(fill.split(' ').join('').toLowerCase()).not.toBe('rgb(0,0,0)');
  expect(fill.toLowerCase()).not.toBe('#000000');
}

function ClearingHeatMap(): React.ReactElement {
  const [data, setData] = useState([
    { x: 'Mon', y: 'Morning', value: 7 },
    { x: 'Tue', y: 'Morning', value: Number.NaN },
    { x: 'Wed', y: 'Morning', value: Number.POSITIVE_INFINITY },
  ]);

  return (
    <>
      <button type="button" onClick={() => setData([])}>Clear heatmap</button>
      <HeatMap
        title="Correct heatmap"
        width={420}
        height={260}
        responsive={false}
        animate={false}
        data={data}
        colorRange={['var(--test-heat-low)', 'var(--test-heat-high)']}
        style={scopedHeatMapColors}
      />
    </>
  );
}

describe('heatmap correctness floor', () => {
  it('resolves scoped colors, normalizes a constant domain, filters non-finite values, and clears stale cells', async () => {
    const { container } = renderSurface(<ClearingHeatMap />);

    await waitFor(() => {
      expect(container.querySelectorAll('[data-part="cell"]')).toHaveLength(1);
    });

    const cell = container.querySelector('[data-part="cell"]') as SVGRectElement;
    expectConcreteNonBlackVarFill(cell);
    expect(heatMapCellColor(cell)).toBe('rgb(18, 52, 86)');
    expect(screen.queryByText('NaN')).not.toBeInTheDocument();
    expect(screen.queryByText('Infinity')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear heatmap' }));
    await waitFor(() => {
      expect(container.querySelectorAll('[data-part="cell"]')).toHaveLength(0);
    });
  });

  it('keeps identical CSS variable names isolated to each chart owner for negative and zero constants', async () => {
    renderSurface(
      <>
        <HeatMap
          title="Negative tenant heatmap"
          width={320}
          height={220}
          responsive={false}
          animate={false}
          data={[{ x: 'Only', y: 'Only', value: -4 }]}
          colorRange={['var(--tenant-heat-low)', 'var(--tenant-heat-high)']}
          style={{
            '--tenant-heat-low': '#112233',
            '--tenant-heat-high': '#445566',
          } as CSSProperties}
        />
        <HeatMap
          title="Zero tenant heatmap"
          width={320}
          height={220}
          responsive={false}
          animate={false}
          data={[{ x: 'Only', y: 'Only', value: 0 }]}
          colorRange={['var(--tenant-heat-low)', 'var(--tenant-heat-high)']}
          style={{
            '--tenant-heat-low': '#aabbcc',
            '--tenant-heat-high': '#ddeeff',
          } as CSSProperties}
        />
      </>,
    );

    const negativeChart = screen.getByRole('img', { name: 'Negative tenant heatmap' });
    const zeroChart = screen.getByRole('img', { name: 'Zero tenant heatmap' });

    await waitFor(() => {
      expect(negativeChart.querySelector('[data-part="cell"]')).toBeTruthy();
      expect(zeroChart.querySelector('[data-part="cell"]')).toBeTruthy();
    });

    const negativeCell = negativeChart.querySelector('[data-part="cell"]') as SVGRectElement;
    const zeroCell = zeroChart.querySelector('[data-part="cell"]') as SVGRectElement;
    expectConcreteNonBlackVarFill(negativeCell);
    expectConcreteNonBlackVarFill(zeroCell);
    expect(heatMapCellColor(negativeCell)).toBe('rgb(17, 34, 51)');
    expect(heatMapCellColor(zeroCell)).toBe('rgb(170, 187, 204)');
  });

  it('repaints from a live mutation on its own provider root', async () => {
    renderSurface(
      <HeatMap
        title="Live tenant heatmap"
        width={320}
        height={220}
        responsive={false}
        animate={false}
        data={[
          { x: 'Low', y: 'Row', value: 0 },
          { x: 'High', y: 'Row', value: 10 },
        ]}
        colorRange={['var(--live-low)', 'var(--live-high)']}
        style={{ '--live-low': '#102030', '--live-high': '#405060' } as CSSProperties}
      />,
    );

    const chart = screen.getByRole('img', { name: 'Live tenant heatmap' });
    // The renderer resolves its sequential range against its own owner scope,
    // so the live provider mutation is applied there (mirrors how a host mutates
    // the nearest paint scope in production).
    const owner = chart.closest('[data-part="chart-renderer"]') as HTMLElement;
    const highCell = () => chart.querySelectorAll<SVGRectElement>('[data-part="cell"]')[1];

    await waitFor(() => {
      expect(heatMapCellColor(highCell())).toBe('rgb(64, 80, 96)');
    });

    act(() => {
      owner.style.setProperty('--live-high', '#a0b0c0');
      owner.dataset.theme = 'tenant-update';
    });

    await waitFor(() => {
      expect(heatMapCellColor(highCell())).toBe('rgb(160, 176, 192)');
    });
  });
});
