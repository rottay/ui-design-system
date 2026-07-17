import React, { useState, type CSSProperties } from 'react';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CalendarHeatMap, HeatMap } from '..';
import { renderSurface } from '../../../../surfaces/foundation/common/test-utils';

const scopedHeatMapColors = {
  '--test-heat-low': '#edf2f7',
  '--test-heat-high': '#123456',
} as CSSProperties;

const scopedCalendarColors = {
  '--test-calendar-low': '#f3f4f6',
  '--test-calendar-high': '#16a34a',
} as CSSProperties;

function expectConcreteNonBlackFill(cell: SVGRectElement): void {
  const fill = cell.getAttribute('fill') ?? '';
  expect(fill).not.toBe('');
  expect(fill).not.toContain('var(');
  expect(fill).not.toContain('NaN');
  expect(fill.replaceAll(' ', '').toLowerCase()).not.toBe('rgb(0,0,0)');
  expect(fill.toLowerCase()).not.toBe('#000000');
}

function colorWeight(cell: SVGRectElement): number {
  const channels = (cell.getAttribute('fill') ?? '').match(/[\d.]+/g)?.map(Number) ?? [];
  return channels.slice(0, 3).reduce((total, channel) => total + channel, 0);
}

function expectDistinctMonotonicFills(cells: SVGRectElement[]): void {
  const fills = cells.map((cell) => cell.getAttribute('fill'));
  expect(new Set(fills).size).toBe(cells.length);
  const weights = cells.map(colorWeight);
  expect(weights).toEqual([...weights].sort((left, right) => left - right));
  cells.forEach(expectConcreteNonBlackFill);
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

function ClearingCalendarHeatMap({
  onCellClick,
}: {
  onCellClick?: (date: Date, value: number) => void;
}): React.ReactElement {
  const [data, setData] = useState([
    { date: '2026-01-01', value: 5 },
    { date: '2026-01-02', value: Number.NaN },
    { date: '2026-01-03', value: Number.POSITIVE_INFINITY },
    { date: '2026-01-04', value: 0 },
    { date: '2026-01-05', value: -3 },
    { date: 'not-a-date', value: 9 },
  ]);

  return (
    <>
      <button type="button" onClick={() => setData([])}>Clear calendar</button>
      <CalendarHeatMap
        title="Correct calendar heatmap"
        width={420}
        responsive={false}
        animate={false}
        startDate="2026-01-01"
        endDate="2026-01-05"
        data={data}
        colorSteps={1}
        cellSize={Number.NaN}
        cellGap={Number.POSITIVE_INFINITY}
        colorRange={['var(--test-calendar-low)', 'var(--test-calendar-high)']}
        style={scopedCalendarColors}
        onCellClick={onCellClick}
      />
    </>
  );
}

describe('heatmap correctness floor', () => {
  it('resolves scoped colors, normalizes a constant domain, filters non-finite values, and clears stale cells', async () => {
    const { container } = renderSurface(<ClearingHeatMap />);

    await waitFor(() => {
      expect(container.querySelectorAll('rect.cell')).toHaveLength(1);
    });

    const cell = container.querySelector('rect.cell') as SVGRectElement;
    expectConcreteNonBlackFill(cell);
    expect(cell.getAttribute('fill')).toBe('rgb(18, 52, 86)');
    expect(screen.queryByText('NaN')).not.toBeInTheDocument();
    expect(screen.queryByText('Infinity')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear heatmap' }));
    await waitFor(() => {
      expect(container.querySelectorAll('rect.cell')).toHaveLength(0);
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
      expect(negativeChart.querySelector('rect.cell')).toBeTruthy();
      expect(zeroChart.querySelector('rect.cell')).toBeTruthy();
    });

    const negativeCell = negativeChart.querySelector('rect.cell') as SVGRectElement;
    const zeroCell = zeroChart.querySelector('rect.cell') as SVGRectElement;
    expectConcreteNonBlackFill(negativeCell);
    expectConcreteNonBlackFill(zeroCell);
    expect(negativeCell.getAttribute('fill')).toBe('rgb(17, 34, 51)');
    expect(zeroCell.getAttribute('fill')).toBe('rgb(170, 187, 204)');
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
    const owner = chart.closest('[data-part="chart-scaffold"]') as HTMLElement;
    const highCell = () => chart.querySelectorAll<SVGRectElement>('rect.cell')[1];

    await waitFor(() => {
      expect(highCell()?.getAttribute('fill')).toBe('rgb(64, 80, 96)');
    });

    act(() => {
      owner.style.setProperty('--live-high', '#a0b0c0');
      owner.dataset.theme = 'tenant-update';
    });

    await waitFor(() => {
      expect(highCell()?.getAttribute('fill')).toBe('rgb(160, 176, 192)');
    });
  });

  it('produces distinct monotonic sequential and quantized steps across simultaneous scoped roots', async () => {
    const matrixData = [
      { x: 'Low', y: 'Row', value: 0 },
      { x: 'Mid', y: 'Row', value: 5 },
      { x: 'High', y: 'Row', value: 10 },
    ];
    const calendarData = [
      { date: '2026-02-01', value: -5 },
      { date: '2026-02-02', value: 0 },
      { date: '2026-02-03', value: 5 },
    ];

    renderSurface(
      <>
        <HeatMap
          title="Default sequential root"
          width={360}
          height={220}
          responsive={false}
          animate={false}
          data={matrixData}
          style={{
            '--ds-color-info-bg': '#102030',
            '--ds-color-primary-500': '#90a0b0',
          } as CSSProperties}
        />
        <HeatMap
          title="Prop sequential root"
          width={360}
          height={220}
          responsive={false}
          animate={false}
          data={matrixData}
          colorRange={['var(--root-low)', 'var(--root-high)']}
          style={{ '--root-low': '#203040', '--root-high': '#a0b0c0' } as CSSProperties}
        />
        <CalendarHeatMap
          title="Scheme quantized root"
          width={360}
          responsive={false}
          animate={false}
          startDate="2026-02-01"
          endDate="2026-02-03"
          data={calendarData}
          colorSteps={4}
          colorScheme="monochrome"
          style={{
            '--ds-color-bg-tertiary': '#304050',
            '--ds-color-primary-900': '#b0c0d0',
          } as CSSProperties}
        />
        <CalendarHeatMap
          title="Prop quantized root"
          width={360}
          responsive={false}
          animate={false}
          startDate="2026-02-01"
          endDate="2026-02-03"
          data={calendarData}
          colorSteps={4}
          colorRange={['var(--root-low)', 'var(--root-high)']}
          style={{ '--root-low': '#405060', '--root-high': '#c0d0e0' } as CSSProperties}
        />
      </>,
    );

    const chartCells = (name: string, selector: string): SVGRectElement[] => {
      const chart = screen.getByRole('img', { name });
      return [...chart.querySelectorAll<SVGRectElement>(selector)];
    };

    await waitFor(() => {
      expect(chartCells('Default sequential root', 'rect.cell')).toHaveLength(3);
      expect(chartCells('Prop sequential root', 'rect.cell')).toHaveLength(3);
      expect(chartCells('Scheme quantized root', 'rect.cal-cell[data-state="filled"]')).toHaveLength(3);
      expect(chartCells('Prop quantized root', 'rect.cal-cell[data-state="filled"]')).toHaveLength(3);
    });

    const defaultSequential = chartCells('Default sequential root', 'rect.cell');
    const propSequential = chartCells('Prop sequential root', 'rect.cell');
    const schemeQuantized = chartCells('Scheme quantized root', 'rect.cal-cell[data-state="filled"]');
    const propQuantized = chartCells('Prop quantized root', 'rect.cal-cell[data-state="filled"]');

    expectDistinctMonotonicFills(defaultSequential);
    expectDistinctMonotonicFills(propSequential);
    expectDistinctMonotonicFills(schemeQuantized);
    expectDistinctMonotonicFills(propQuantized);
    expect(defaultSequential[0]?.getAttribute('fill')).not.toBe(propSequential[0]?.getAttribute('fill'));
    expect(schemeQuantized[0]?.getAttribute('fill')).not.toBe(propQuantized[0]?.getAttribute('fill'));
  });

  it('normalizes calendar steps and geometry, ignores invalid values, and repaints empty data', async () => {
    const onCellClick = vi.fn();
    const { container } = renderSurface(<ClearingCalendarHeatMap onCellClick={onCellClick} />);

    await waitFor(() => {
      expect(container.querySelectorAll('rect.cal-cell')).toHaveLength(5);
    });

    const filledCells = [...container.querySelectorAll<SVGRectElement>('rect.cal-cell[data-state="filled"]')];
    const filled = filledCells[0] as SVGRectElement;
    const empty = container.querySelector('rect.cal-cell[data-state="empty"]') as SVGRectElement;
    expect(filledCells).toHaveLength(3);
    expect(filled).toBeTruthy();
    expect(empty).toBeTruthy();
    expectConcreteNonBlackFill(filled);
    expect(filled.getAttribute('fill')).toBe('rgb(22, 163, 74)');
    expect(empty.getAttribute('fill')).toBe('rgb(243, 244, 246)');
    expect(filled.getAttribute('width')).toBe('14');
    expect(filled.getAttribute('height')).toBe('14');
    expect(filledCells[1]?.querySelector('title')).toHaveTextContent('2026-01-04: 0');
    expect(filledCells[2]?.querySelector('title')).toHaveTextContent('2026-01-05: -3');

    fireEvent.click(filledCells[2] as SVGRectElement);
    expect(onCellClick).toHaveBeenCalledTimes(1);
    expect(onCellClick.mock.calls[0]?.[1]).toBe(-3);

    fireEvent.click(screen.getByRole('button', { name: 'Clear calendar' }));
    await waitFor(() => {
      expect(container.querySelectorAll('rect.cal-cell[data-state="filled"]')).toHaveLength(0);
      expect(container.querySelectorAll('rect.cal-cell[data-state="empty"]')).toHaveLength(5);
    });

    for (const cell of container.querySelectorAll<SVGRectElement>('rect.cal-cell')) {
      expect(cell.getAttribute('fill')).toBe('rgb(243, 244, 246)');
    }
  });
});
