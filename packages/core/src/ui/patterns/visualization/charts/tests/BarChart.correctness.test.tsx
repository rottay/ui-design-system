import React, { useState } from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BarChart } from '..';
import { renderSurface } from '../../../../surfaces/foundation/common/test-utils';

const mixedData = [
  { label: 'Negative', value: -5 },
  { label: 'Zero', value: 0 },
  { label: 'Positive', value: 10 },
  { label: 'Invalid', value: Number.NaN },
];

const mixedSeries = [
  {
    name: 'Negative series',
    data: [
      { x: 'Only', y: -4 },
      { x: 'Invalid', y: Number.NEGATIVE_INFINITY },
    ],
  },
  {
    name: 'Positive series',
    data: [{ x: 'Only', y: 7 }],
  },
];

function expectFiniteGeometry(rect: SVGRectElement): void {
  for (const attribute of ['x', 'y', 'width', 'height'] as const) {
    const value = rect.getAttribute(attribute);
    expect(value).not.toBeNull();
    expect(Number.isFinite(Number(value))).toBe(true);
  }
  expect(Number(rect.getAttribute('width'))).toBeGreaterThanOrEqual(0);
  expect(Number(rect.getAttribute('height'))).toBeGreaterThanOrEqual(0);
}

function ClearingBars(): React.ReactElement {
  const [data, setData] = useState(mixedData);
  return (
    <>
      <button type="button" onClick={() => setData([])}>Clear bars</button>
      <BarChart
        title="Clearing bars"
        width={420}
        height={260}
        responsive={false}
        animate={false}
        data={data}
      />
    </>
  );
}

describe('BarChart correctness floor', () => {
  it('keeps negative, zero and positive single bars inside a finite domain in both orientations', async () => {
    renderSurface(
      <>
        <BarChart
          title="Vertical signed bars"
          width={420}
          height={260}
          responsive={false}
          animate={false}
          data={mixedData}
          showValues
        />
        <BarChart
          title="Horizontal signed bars"
          width={420}
          height={260}
          responsive={false}
          animate={false}
          orientation="horizontal"
          data={mixedData}
          showValues
        />
      </>,
    );

    const vertical = screen.getByRole('img', { name: 'Vertical signed bars' });
    const horizontal = screen.getByRole('img', { name: 'Horizontal signed bars' });

    await waitFor(() => {
      expect(vertical.querySelectorAll('rect[data-part="bar"]')).toHaveLength(3);
      expect(horizontal.querySelectorAll('rect[data-part="bar"]')).toHaveLength(3);
    });

    const verticalBars = [...vertical.querySelectorAll<SVGRectElement>('rect[data-part="bar"]')];
    const horizontalBars = [...horizontal.querySelectorAll<SVGRectElement>('rect[data-part="bar"]')];
    [...verticalBars, ...horizontalBars].forEach(expectFiniteGeometry);

    const [verticalNegative, verticalZero, verticalPositive] = verticalBars;
    const verticalBaseline = Number(verticalZero?.getAttribute('y'));
    expect(Number(verticalNegative?.getAttribute('y'))).toBeCloseTo(verticalBaseline, 4);
    expect(Number(verticalPositive?.getAttribute('y')) + Number(verticalPositive?.getAttribute('height'))).toBeCloseTo(verticalBaseline, 4);

    const [horizontalNegative, horizontalZero, horizontalPositive] = horizontalBars;
    const horizontalBaseline = Number(horizontalZero?.getAttribute('x'));
    expect(Number(horizontalNegative?.getAttribute('x')) + Number(horizontalNegative?.getAttribute('width'))).toBeCloseTo(horizontalBaseline, 4);
    expect(Number(horizontalPositive?.getAttribute('x'))).toBeCloseTo(horizontalBaseline, 4);
    expect(vertical.textContent).not.toContain('NaN');
    expect(horizontal.textContent).not.toContain('Infinity');
  });

  it.each([
    { title: 'Vertical grouped bars', orientation: 'vertical' as const, stacked: false },
    { title: 'Horizontal grouped bars', orientation: 'horizontal' as const, stacked: false },
    { title: 'Vertical stacked bars', orientation: 'vertical' as const, stacked: true },
    { title: 'Horizontal stacked bars', orientation: 'horizontal' as const, stacked: true },
  ])('renders signed multi-series geometry without clipping or NaN: $title', async ({
    title,
    orientation,
    stacked,
  }) => {
    renderSurface(
      <BarChart
        title={title}
        width={420}
        height={260}
        responsive={false}
        animate={false}
        orientation={orientation}
        stacked={stacked}
        series={mixedSeries}
      />,
    );

    const chart = screen.getByRole('img', { name: title });
    await waitFor(() => {
      expect(chart.querySelectorAll('rect[data-part="bar"]')).toHaveLength(2);
    });

    const bars = [...chart.querySelectorAll<SVGRectElement>('rect[data-part="bar"]')];
    bars.forEach(expectFiniteGeometry);
    expect(bars.every((bar) => Number(bar.getAttribute(orientation === 'vertical' ? 'height' : 'width')) > 0)).toBe(true);
    expect(chart.innerHTML).not.toMatch(/NaN|Infinity/);
  });

  it('erases stale marks when finite data transitions to empty', async () => {
    const { container } = renderSurface(<ClearingBars />);

    await waitFor(() => {
      expect(container.querySelectorAll('rect[data-part="bar"]')).toHaveLength(3);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Clear bars' }));
    await waitFor(() => {
      expect(container.querySelectorAll('rect[data-part="bar"]')).toHaveLength(0);
    });
  });

  it('drops overflowing stack segments and normalizes non-finite bar geometry options', async () => {
    renderSurface(
      <BarChart
        title="Overflow-safe stack"
        width={420}
        height={260}
        responsive={false}
        animate={false}
        stacked
        barGap={Number.NaN}
        barRadius={Number.POSITIVE_INFINITY}
        series={[
          { name: 'First', data: [{ x: 'Only', y: 1e308 }] },
          { name: 'Overflowing', data: [{ x: 'Only', y: 1e308 }] },
        ]}
      />,
    );

    const chart = screen.getByRole('img', { name: 'Overflow-safe stack' });
    await waitFor(() => {
      expect(chart.querySelectorAll('rect[data-part="bar"]')).toHaveLength(1);
    });
    [...chart.querySelectorAll<SVGRectElement>('rect[data-part="bar"]')]
      .forEach(expectFiniteGeometry);
    expect(chart.innerHTML).not.toMatch(/NaN|Infinity/);
  });

  it('keeps duplicate display names as independent grouped series', async () => {
    renderSurface(
      <BarChart
        title="Duplicate series names"
        width={420}
        height={260}
        responsive={false}
        animate={false}
        series={[
          { name: 'Same label', data: [{ x: 'A', y: 2 }] },
          { name: 'Same label', data: [{ x: 'A', y: 4 }] },
        ]}
      />,
    );

    const chart = screen.getByRole('img', { name: 'Duplicate series names' });
    const bars = await waitFor(() => {
      const current = [...chart.querySelectorAll<SVGRectElement>('rect[data-part="bar"]')];
      expect(current).toHaveLength(2);
      return current;
    });
    expect(new Set(bars.map((bar) => bar.getAttribute('x'))).size).toBe(2);
    bars.forEach(expectFiniteGeometry);
  });
});
