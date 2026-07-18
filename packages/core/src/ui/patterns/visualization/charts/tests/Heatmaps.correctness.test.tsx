import React, { useState, type CSSProperties } from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CalendarHeatMap, HeatMap } from '..';
import { renderSurface } from '../../../../surfaces/foundation/common/test-utils';

// Cross-family coexistence + CalendarHeatMap correctness. Both families now
// delegate to chart-engine renderers whose cells expose `data-part="cell"`.
// CalendarHeatMap keeps its concrete inline `fill` (it paints per-day steps),
// so its helpers read the `fill` attribute; HeatMap resolves a sequential
// colour-math sink onto the `--ds-chart-cell-color` custom property, so its
// helpers read that property. (CalendarHeatMap's prior D3 `rect.cal-cell`
// contract is void: its Wave-5 renderer migration landed.)

const scopedCalendarColors = {
  '--test-calendar-low': '#f3f4f6',
  '--test-calendar-high': '#16a34a',
} as CSSProperties;

function expectConcreteNonBlackFill(cell: SVGRectElement): void {
  const fill = cell.getAttribute('fill') ?? '';
  expect(fill).not.toBe('');
  expect(fill).not.toContain('var(');
  expect(fill).not.toContain('NaN');
  expect(fill.split(' ').join('').toLowerCase()).not.toBe('rgb(0,0,0)');
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

function cellVarWeight(cell: SVGRectElement): number {
  const channels = heatMapCellColor(cell).match(/[\d.]+/g)?.map(Number) ?? [];
  return channels.slice(0, 3).reduce((total, channel) => total + channel, 0);
}

function expectDistinctMonotonicVarFills(cells: SVGRectElement[]): void {
  const fills = cells.map(heatMapCellColor);
  expect(new Set(fills).size).toBe(cells.length);
  const weights = cells.map(cellVarWeight);
  expect(weights).toEqual([...weights].sort((left, right) => left - right));
  cells.forEach(expectConcreteNonBlackVarFill);
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

describe('calendar heatmap and cross-family scoped-colour correctness floor', () => {
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
      expect(chartCells('Default sequential root', '[data-part="cell"]')).toHaveLength(3);
      expect(chartCells('Prop sequential root', '[data-part="cell"]')).toHaveLength(3);
      expect(chartCells('Scheme quantized root', '[data-part="cell"][data-state="filled"]')).toHaveLength(3);
      expect(chartCells('Prop quantized root', '[data-part="cell"][data-state="filled"]')).toHaveLength(3);
    });

    const defaultSequential = chartCells('Default sequential root', '[data-part="cell"]');
    const propSequential = chartCells('Prop sequential root', '[data-part="cell"]');
    const schemeQuantized = chartCells('Scheme quantized root', '[data-part="cell"][data-state="filled"]');
    const propQuantized = chartCells('Prop quantized root', '[data-part="cell"][data-state="filled"]');

    expectDistinctMonotonicVarFills(defaultSequential);
    expectDistinctMonotonicVarFills(propSequential);
    expectDistinctMonotonicFills(schemeQuantized);
    expectDistinctMonotonicFills(propQuantized);
    expect(heatMapCellColor(defaultSequential[0])).not.toBe(heatMapCellColor(propSequential[0]));
    expect(schemeQuantized[0]?.getAttribute('fill')).not.toBe(propQuantized[0]?.getAttribute('fill'));
  });

  it('normalizes calendar steps and geometry, ignores invalid values, and repaints empty data', async () => {
    const onCellClick = vi.fn();
    const { container } = renderSurface(<ClearingCalendarHeatMap onCellClick={onCellClick} />);

    await waitFor(() => {
      expect(container.querySelectorAll('[data-part="cell"]')).toHaveLength(5);
    });

    const filledCells = [...container.querySelectorAll<SVGRectElement>('[data-part="cell"][data-state="filled"]')];
    const filled = filledCells[0] as SVGRectElement;
    const empty = container.querySelector('[data-part="cell"][data-state="empty"]') as SVGRectElement;
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
      expect(container.querySelectorAll('[data-part="cell"][data-state="filled"]')).toHaveLength(0);
      expect(container.querySelectorAll('[data-part="cell"][data-state="empty"]')).toHaveLength(5);
    });

    for (const cell of container.querySelectorAll<SVGRectElement>('[data-part="cell"]')) {
      expect(cell.getAttribute('fill')).toBe('rgb(243, 244, 246)');
    }
  });
});
