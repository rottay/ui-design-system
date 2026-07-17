import React, { useState } from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  GanttChart,
  GaugeChart,
  Histogram,
  ScatterChart,
  TreeMap,
  WaterfallChart,
} from '..';
import { renderSurface } from '../../../../surfaces/foundation/common/test-utils';

function ClearingFamily({
  renderChart,
}: {
  renderChart: (populated: boolean) => React.ReactElement;
}): React.ReactElement {
  const [populated, setPopulated] = useState(true);

  return (
    <>
      <button type="button" onClick={() => setPopulated(false)}>Clear chart</button>
      {renderChart(populated)}
    </>
  );
}

const remainingCases: Array<{
  title: string;
  selector: string;
  expectedMarks: number | 'some';
  renderChart: (populated: boolean) => React.ReactElement;
}> = [
  {
    title: 'Correct Gantt',
    selector: '[data-part="task"]',
    expectedMarks: 1,
    renderChart: (populated) => (
      <GanttChart
        title="Correct Gantt"
        width={420}
        height={240}
        responsive={false}
        animate={false}
        tasks={populated ? [
          { id: 'valid', name: 'Valid', start: '2026-01-01', end: '2026-01-03', progress: 150 },
          { id: 'valid', name: 'Duplicate id', start: '2026-01-02', end: '2026-01-04' },
          { id: 'invalid', name: 'Invalid', start: 'not-a-date', end: '2026-01-03' },
        ] : []}
      />
    ),
  },
  {
    title: 'Correct treemap',
    selector: '[data-part="tile"]',
    expectedMarks: 1,
    renderChart: (populated) => (
      <TreeMap
        title="Correct treemap"
        width={420}
        height={240}
        responsive={false}
        animate={false}
        data={populated ? [
          { name: 'Valid', value: 10 },
          { name: 'Negative', value: -3 },
          { name: 'Invalid', value: Number.NaN },
        ] : []}
      />
    ),
  },
  {
    title: 'Correct waterfall',
    selector: 'rect[data-part="bar"]',
    expectedMarks: 1,
    renderChart: (populated) => (
      <WaterfallChart
        title="Correct waterfall"
        width={420}
        height={240}
        responsive={false}
        animate={false}
        data={populated ? [
          { label: 'Valid', value: -4 },
          { label: 'Invalid', value: Number.POSITIVE_INFINITY },
        ] : []}
      />
    ),
  },
  {
    title: 'Correct scatter',
    selector: 'circle[data-part="series-point"]',
    expectedMarks: 1,
    renderChart: (populated) => (
      <ScatterChart
        title="Correct scatter"
        width={420}
        height={240}
        responsive={false}
        animate={false}
        data={populated ? [
          { x: -2, y: 3, label: 'Valid' },
          { x: Number.NaN, y: 4, label: 'Invalid' },
        ] : []}
      />
    ),
  },
  {
    title: 'Correct histogram',
    selector: 'rect[data-part="bar"]',
    expectedMarks: 'some',
    renderChart: (populated) => (
      <Histogram
        title="Correct histogram"
        width={420}
        height={240}
        responsive={false}
        animate={false}
        values={populated ? [5, 5, Number.NaN, Number.POSITIVE_INFINITY] : []}
        bins={0}
      />
    ),
  },
];

describe('remaining chart-family correctness floor', () => {
  it.each(remainingCases)(
    'filters invalid input and erases stale marks for $title',
    async ({ title, selector, expectedMarks, renderChart }) => {
      const { container } = renderSurface(<ClearingFamily renderChart={renderChart} />);
      const chart = screen.getByRole('img', { name: title });

      await waitFor(() => {
        const count = chart.querySelectorAll(selector).length;
        if (expectedMarks === 'some') expect(count).toBeGreaterThan(0);
        else expect(count).toBe(expectedMarks);
      });
      expect(container.innerHTML).not.toMatch(/NaN|Infinity|Invalid Date/);

      fireEvent.click(screen.getByRole('button', { name: 'Clear chart' }));
      await waitFor(() => {
        expect(chart.querySelectorAll(selector)).toHaveLength(0);
      });
    },
  );

  it('renders a zero-duration Gantt milestone with finite visible geometry', async () => {
    renderSurface(
      <GanttChart
        title="Gantt milestone"
        width={420}
        height={240}
        responsive={false}
        animate={false}
        tasks={[
          { id: 'milestone', name: 'Milestone', start: '2026-01-01', end: '2026-01-01', progress: 100 },
        ]}
      />,
    );

    const chart = screen.getByRole('img', { name: 'Gantt milestone' });
    const duration = await waitFor(() => {
      const current = chart.querySelector('[data-part="task-duration"]');
      expect(current).toBeTruthy();
      return current as SVGRectElement;
    });
    expect(Number(duration.getAttribute('width'))).toBeGreaterThanOrEqual(1);
    expect(chart.innerHTML).not.toMatch(/NaN|Infinity|Invalid Date/);
  });

  it('normalizes invalid gauge ranges, values, segments and geometry without NaN', async () => {
    renderSurface(
      <GaugeChart
        title="Correct gauge"
        width={360}
        height={240}
        responsive={false}
        animate={false}
        value={Number.NaN}
        min={100}
        max={-100}
        startAngle={Number.NaN}
        endAngle={Number.POSITIVE_INFINITY}
        innerRadius={2}
        segments={[
          { from: -100, to: 0, color: '#123456', label: 'Low' },
          { from: Number.NaN, to: 100, color: '#abcdef', label: 'Invalid' },
        ]}
      />,
    );

    const gauge = screen.getByRole('img', { name: 'Correct gauge' });
    await waitFor(() => {
      expect(gauge.querySelectorAll('[data-part="segment"]')).toHaveLength(1);
      expect(gauge.querySelector('[data-part="needle"]')).toBeTruthy();
    });
    expect(gauge.innerHTML).not.toMatch(/NaN|Infinity/);
  });

  it('keeps degenerate gauge angles and out-of-range segments finite', async () => {
    renderSurface(
      <GaugeChart
        title="Degenerate gauge"
        width={360}
        height={240}
        responsive={false}
        animate={false}
        value={50}
        startAngle={120}
        endAngle={120}
        segments={[
          { from: -50, to: 25, color: '#123456' },
          { from: 200, to: 300, color: '#abcdef' },
        ]}
      />,
    );

    const gauge = screen.getByRole('img', { name: 'Degenerate gauge' });
    expect(gauge.querySelectorAll('[data-part="segment"]')).toHaveLength(1);
    expect(gauge.innerHTML).not.toMatch(/NaN|Infinity/);
  });

  it('preserves a full-circle gauge and scales default segments to a custom range', () => {
    renderSurface(
      <GaugeChart
        title="Full circle gauge"
        width={360}
        height={240}
        responsive={false}
        animate={false}
        value={250}
        min={200}
        max={300}
        startAngle={0}
        endAngle={360}
      />,
    );

    const gauge = screen.getByRole('img', { name: 'Full circle gauge' });
    const plot = gauge.querySelector('[data-part="plot-area"]');
    expect(Number(plot?.getAttribute('data-end-angle')) - Number(plot?.getAttribute('data-start-angle'))).toBe(360);
    expect(gauge.querySelectorAll('[data-part="segment"]')).toHaveLength(3);
    expect(gauge.innerHTML).not.toMatch(/NaN|Infinity/);
  });

  it('uses counts, not density heights, for cumulative histogram semantics', async () => {
    renderSurface(
      <Histogram
        title="Density cumulative"
        width={420}
        height={240}
        responsive={false}
        animate={false}
        density
        cumulativeLine
        thresholds={[2]}
        values={[0.5, 1.5, 2.5, 9]}
      />,
    );

    const chart = screen.getByRole('img', { name: 'Density cumulative' });
    const points = [...chart.querySelectorAll<SVGCircleElement>('[data-part="cumulative-point"]')];
    expect(points).toHaveLength(3);
    expect(Number(points[1].getAttribute('cy'))).toBeCloseTo(90, 4);
    expect(Number(points[2].getAttribute('cy'))).toBeCloseTo(0, 4);
  });

  it('normalizes scatter radius options and suppresses non-finite regressions', async () => {
    renderSurface(
      <ScatterChart
        title="Extreme scatter"
        width={420}
        height={240}
        responsive={false}
        animate={false}
        bubble
        trendLine
        pointRadius={Number.NaN}
        sizeRange={[Number.NaN, Number.POSITIVE_INFINITY]}
        data={[
          { x: -1e308, y: -1e308, size: 1 },
          { x: 1e308, y: 1e308, size: 2 },
        ]}
      />,
    );

    const chart = screen.getByRole('img', { name: 'Extreme scatter' });
    expect(chart.querySelector('[data-part="trend-line"]')).toBeNull();
    expect(chart.innerHTML).not.toMatch(/NaN|Infinity/);
  });

  it('keeps duplicate waterfall labels as distinct ordered bars', async () => {
    renderSurface(
      <WaterfallChart
        title="Duplicate waterfall labels"
        width={420}
        height={240}
        responsive={false}
        animate={false}
        data={[
          { label: 'Repeated', value: 4 },
          { label: 'Repeated', value: -2 },
        ]}
      />,
    );

    const chart = screen.getByRole('img', { name: 'Duplicate waterfall labels' });
    const bars = [...chart.querySelectorAll<SVGRectElement>('rect[data-part="bar"]')];
    expect(bars).toHaveLength(2);
    expect(bars[0].getAttribute('x')).not.toBe(bars[1].getAttribute('x'));
  });
});
