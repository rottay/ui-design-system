import { describe, expect, it } from 'vitest';

import {
  buildSvgBarGeometry,
  buildSvgHeatMapGeometry,
  buildSvgLineGeometry,
  buildSvgPieGeometry,
  buildSvgScatterGeometry,
} from '..';

describe('React-owned chart geometry', () => {
  it('keeps the bar baseline between negative and positive marks', () => {
    const geometry = buildSvgBarGeometry({
      width: 480,
      height: 280,
      data: [
        { id: 'loss', category: 'Loss', value: -20 },
        { id: 'gain', category: 'Gain', value: 40 },
        { id: 'invalid', category: 'Invalid', value: Number.NaN },
      ],
    });

    const loss = geometry.bars.find((bar) => bar.id === 'loss');
    const gain = geometry.bars.find((bar) => bar.id === 'gain');

    expect(geometry.bars).toHaveLength(2);
    expect(loss).toBeDefined();
    expect(gain).toBeDefined();
    expect(loss?.y).toBe(geometry.baseline);
    expect((loss?.y ?? 0) + (loss?.height ?? 0)).toBeGreaterThan(geometry.baseline);
    expect(gain?.y).toBeLessThan(geometry.baseline);
    expect((gain?.y ?? 0) + (gain?.height ?? 0)).toBe(geometry.baseline);
  });

  it('builds deterministic pie and donut geometry from positive parts only', () => {
    const options = {
      width: 360,
      height: 320,
      innerRadiusRatio: 0.58,
      data: [
        { id: 'north', label: 'North', value: 30 },
        { id: 'south', label: 'South', value: 70 },
        { id: 'zero', label: 'Zero', value: 0 },
        { id: 'invalid', label: 'Invalid', value: Number.NaN },
      ],
    };

    const first = buildSvgPieGeometry(options);
    const second = buildSvgPieGeometry(options);

    expect(first).toEqual(second);
    expect(first.total).toBe(100);
    expect(first.slices.map((slice) => slice.id)).toEqual(['north', 'south']);
    expect(first.slices.reduce((sum, slice) => sum + slice.percentage, 0)).toBe(1);
    expect(first.slices.every((slice) => slice.path.startsWith('M'))).toBe(true);
    expect(first.innerRadius).toBeGreaterThan(0);
    expect(first.innerRadius).toBeLessThan(first.outerRadius);
    expect(first.slices.every((slice) => (
      slice.centroidX >= first.plot.x
      && slice.centroidX <= first.plot.x + first.plot.width
      && slice.centroidY >= first.plot.y
      && slice.centroidY <= first.plot.y + first.plot.height
    ))).toBe(true);
  });

  it('rejects dishonest pie values and treats a zero total as empty', () => {
    expect(() => buildSvgPieGeometry({
      width: 320,
      height: 320,
      data: [{ id: 'loss', label: 'Loss', value: -1 }],
    })).toThrowError('[ChartGeometry] Pie datum loss has a negative value (-1).');

    expect(() => buildSvgPieGeometry({
      width: 320,
      height: 320,
      data: [
        { id: 'duplicate', label: 'First', value: 1 },
        { id: 'duplicate', label: 'Second', value: 2 },
      ],
    })).toThrowError('[ChartGeometry] Duplicate pie datum id: duplicate.');

    const empty = buildSvgPieGeometry({
      width: 320,
      height: 320,
      data: [{ id: 'zero', label: 'Zero', value: 0 }],
    });
    expect(empty.total).toBe(0);
    expect(empty.slices).toHaveLength(0);
  });

  it('builds deterministic series paths without retaining invalid points', () => {
    const options = {
      width: 560,
      height: 300,
      xType: 'category' as const,
      curve: 'smooth' as const,
      showArea: true,
      series: [
        {
          id: 'revenue',
          label: 'Revenue',
          points: [
            { id: 'jan', x: 'Jan', value: 10 },
            { id: 'feb', x: 'Feb', value: 25 },
            { id: 'bad', x: 'Mar', value: Number.POSITIVE_INFINITY },
          ],
        },
      ],
    };

    const first = buildSvgLineGeometry(options);
    const second = buildSvgLineGeometry(options);

    expect(first).toEqual(second);
    expect(first.series[0]?.points).toHaveLength(2);
    expect(first.series[0]?.path).toMatch(/^M/);
    expect(first.series[0]?.areaPath).toMatch(/^M/);
  });

  it('uses bounded UTC ticks and rejects timezone-ambiguous timestamps', () => {
    const geometry = buildSvgLineGeometry({
      width: 560,
      height: 300,
      xType: 'time',
      maxTicks: 4,
      series: [{
        id: 'activity',
        label: 'Activity',
        points: [
          { id: 'start', x: '2026-01-01', value: 1 },
          { id: 'end', x: '2026-01-02T00:00:00Z', value: 2 },
          { id: 'ambiguous', x: '2026-01-01T12:00:00', value: 99 },
          { id: 'outside-date', x: Number.MAX_VALUE, value: 99 },
        ],
      }],
    });

    expect(geometry.series[0]?.points.map((point) => point.id)).toEqual(['start', 'end']);
    expect(geometry.xTicks.length).toBeLessThanOrEqual(4);
    expect(new Set(geometry.xTicks.map((tick) => tick.label)).size)
      .toBe(geometry.xTicks.length);
    expect(geometry.xTicks.every((tick) => tick.label.endsWith('Z'))).toBe(true);
  });

  it('builds bounded deterministic scatter geometry with stable series channels', () => {
    const options = {
      width: 520,
      height: 300,
      maxTicks: 4,
      data: [
        { id: 'alpha', label: 'Alpha', x: -2, y: 8, series: 'Current' },
        { id: 'beta', label: 'Beta', x: 4, y: 2, series: 'Forecast' },
        { id: 'gamma', label: 'Gamma', x: 7, y: 10, series: 'Current' },
        { id: 'invalid-x', label: 'Invalid', x: Number.NaN, y: 1 },
      ],
    } as const;

    const first = buildSvgScatterGeometry(options);
    const second = buildSvgScatterGeometry(options);

    expect(first).toEqual(second);
    expect(first.points.map((point) => point.id)).toEqual(['alpha', 'beta', 'gamma']);
    expect(first.points.map((point) => point.seriesIndex)).toEqual([0, 1, 0]);
    expect(first.xTicks.length).toBeLessThanOrEqual(4);
    expect(first.yTicks.length).toBeLessThanOrEqual(4);
    expect(first.points.every((point) => (
      point.xPosition >= first.plot.x
      && point.xPosition <= first.plot.x + first.plot.width
      && point.yPosition >= first.plot.y
      && point.yPosition <= first.plot.y + first.plot.height
    ))).toBe(true);
  });

  it('uses square-root bubble radii and keeps zero magnitude truthful', () => {
    const geometry = buildSvgScatterGeometry({
      width: 520,
      height: 300,
      variant: 'bubble',
      bubbleRadiusRange: [3, 24],
      data: [
        { id: 'zero', label: 'Zero', x: 0, y: 0, size: 0 },
        { id: 'small', label: 'Small', x: 1, y: 1, size: 4 },
        { id: 'large', label: 'Large', x: 2, y: 2, size: 16 },
      ],
    });

    const [zero, small, large] = geometry.points;
    expect(geometry.sizeDomain).toEqual([0, 16]);
    expect(zero?.radius).toBe(0);
    expect(small?.radius).toBeCloseTo(12);
    expect(large?.radius).toBe(24);
    expect((large?.radius ?? 0) ** 2 / (small?.radius ?? 1) ** 2).toBeCloseTo(4);
  });

  it('rejects duplicate scatter ids and dishonest negative bubble magnitudes', () => {
    expect(() => buildSvgScatterGeometry({
      width: 320,
      height: 240,
      data: [
        { id: 'duplicate', label: 'First', x: 1, y: 1 },
        { id: 'duplicate', label: 'Second', x: 2, y: 2 },
      ],
    })).toThrowError('[ChartGeometry] Duplicate scatter datum id: duplicate.');

    expect(() => buildSvgScatterGeometry({
      width: 320,
      height: 240,
      variant: 'bubble',
      data: [{ id: 'loss', label: 'Loss', x: 1, y: 1, size: -1 }],
    })).toThrowError('[ChartGeometry] Bubble datum loss has a negative size (-1).');
  });

  it('bounds ticks and plot geometry even with dense categories and oversized insets', () => {
    const geometry = buildSvgBarGeometry({
      width: 120,
      height: 80,
      maxTicks: 3,
      insets: { top: 200, right: 200, bottom: 200, left: 200 },
      data: Array.from({ length: 12 }, (_, index) => ({
        id: `bar-${index}`,
        category: `Category ${index}`,
        value: index,
      })),
    });

    expect(geometry.categoryTicks.length).toBeLessThanOrEqual(3);
    expect(geometry.valueTicks.length).toBeLessThanOrEqual(3);
    expect(geometry.plot.x).toBeLessThanOrEqual(geometry.width);
    expect(geometry.plot.y).toBeLessThanOrEqual(geometry.height);
    expect(geometry.plot.x + geometry.plot.width).toBeLessThanOrEqual(geometry.width);
    expect(geometry.plot.y + geometry.plot.height).toBeLessThanOrEqual(geometry.height);
  });

  it('keeps every categorical label by default while preserving compact tick limits', () => {
    const data = Array.from({ length: 6 }, (_, index) => ({
      id: `candidate-${index}`,
      category: `Candidate ${index}`,
      value: 70 + index,
    }));

    const fullGeometry = buildSvgBarGeometry({
      width: 640,
      height: 360,
      orientation: 'horizontal',
      data,
    });
    const compactGeometry = buildSvgBarGeometry({
      width: 320,
      height: 220,
      orientation: 'horizontal',
      maxTicks: 3,
      data,
    });

    expect(fullGeometry.categoryTicks.map((tick) => tick.label)).toEqual(
      data.map((datum) => datum.category),
    );
    expect(compactGeometry.categoryTicks).toHaveLength(3);
  });

  it('returns distinct monotonic provider-resolved heatmap fills', () => {
    const geometry = buildSvgHeatMapGeometry({
      width: 420,
      height: 240,
      colorRange: ['#102030', '#90a0b0'],
      data: [
        { id: 'low', column: 'Low', row: 'Only', value: 0 },
        { id: 'mid', column: 'Mid', row: 'Only', value: 5 },
        { id: 'high', column: 'High', row: 'Only', value: 10 },
      ],
    });

    expect(geometry.cells.map((cell) => cell.cellColor)).toEqual([
      'rgb(16, 32, 48)',
      'rgb(80, 96, 112)',
      'rgb(144, 160, 176)',
    ]);
  });

  it('excludes cells outside explicit domains before computing color geometry', () => {
    const geometry = buildSvgHeatMapGeometry({
      width: 420,
      height: 240,
      colorRange: ['not-a-color', 'also-not-a-color'],
      xLabels: ['Included'],
      yLabels: ['Row'],
      data: [
        { id: 'inside', column: 'Included', row: 'Row', value: 10 },
        { id: 'outside-x', column: 'Outside', row: 'Row', value: 10_000 },
        { id: 'outside-y', column: 'Included', row: 'Outside', value: -10_000 },
      ],
    });

    expect(geometry.cells).toHaveLength(1);
    expect(geometry.cells[0]?.id).toBe('inside');
    expect(geometry.cells[0]?.cellColor).toBe('rgb(47, 107, 154)');
  });

  it('honors explicit empty domains and rejects duplicate semantic coordinates', () => {
    expect(buildSvgHeatMapGeometry({
      width: 420,
      height: 240,
      colorRange: ['#ffffff', '#000000'],
      xLabels: [],
      yLabels: [],
      data: [{ id: 'cell', column: 'A', row: 'B', value: 1 }],
    }).cells).toHaveLength(0);

    expect(() => buildSvgHeatMapGeometry({
      width: 420,
      height: 240,
      colorRange: ['#ffffff', '#000000'],
      data: [
        { id: 'first', column: 'A', row: 'B', value: 1 },
        { id: 'second', column: 'A', row: 'B', value: 2 },
      ],
    })).toThrowError('[ChartGeometry] Duplicate heatmap coordinate: A\u0000B.');
  });
});
