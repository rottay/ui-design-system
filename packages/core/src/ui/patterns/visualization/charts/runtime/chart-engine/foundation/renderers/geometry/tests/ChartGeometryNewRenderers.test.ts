import { describe, expect, it } from 'vitest';

import {
  buildSvgAreaGeometry,
  buildSvgHistogramGeometry,
  buildSvgRadarGeometry,
  buildSvgSparklineGeometry,
  buildSvgWaterfallGeometry,
} from '..';

describe('Radar geometry', () => {
  const data = [
    { axis: 'Role fit', value: 8 },
    { axis: 'Experience', value: 7 },
    { axis: 'Momentum', value: 6 },
  ];

  it('preserves the label-safe default while allowing compact radars to reclaim plot area', () => {
    const labelled = buildSvgRadarGeometry({ data, width: 270, height: 216 });
    const compact = buildSvgRadarGeometry({ data, width: 270, height: 216, padding: 16 });

    expect(labelled.radius).toBe(68);
    expect(compact.radius).toBe(92);
    expect(compact.radius).toBeGreaterThan(labelled.radius);
    expect(compact.axes.every((axis) => Number.isFinite(axis.lineX) && Number.isFinite(axis.lineY))).toBe(true);
  });

  it('normalises unsafe padding without allowing marks outside the chart bounds', () => {
    const negative = buildSvgRadarGeometry({ data, width: 160, height: 120, padding: -50 });
    const excessive = buildSvgRadarGeometry({ data, width: 160, height: 120, padding: 500 });

    expect(negative.radius).toBe(52);
    expect(excessive.radius).toBe(1);
  });
});

describe('Area geometry', () => {
  const series = [
    { id: 'a', label: 'A', points: [
      { id: 'a0', x: 'Jan', value: 20 },
      { id: 'a1', x: 'Feb', value: 40 },
    ] },
    { id: 'b', label: 'B', points: [
      { id: 'b0', x: 'Jan', value: 10 },
      { id: 'b1', x: 'Feb', value: 30 },
    ] },
  ];

  it('anchors independent series bands to the value baseline and is deterministic', () => {
    const first = buildSvgAreaGeometry({ series, width: 480, height: 280 });
    const second = buildSvgAreaGeometry({ series, width: 480, height: 280 });
    expect(first).toEqual(second);
    expect(first.stacked).toBe(false);
    expect(first.stackOverflow).toBe(false);
    for (const geometrySeries of first.series) {
      expect(geometrySeries.path.startsWith('M')).toBe(true);
      expect(geometrySeries.areaPath.startsWith('M')).toBe(true);
      for (const point of geometrySeries.points) {
        // Independent series rest on the baseline.
        expect(point.lowerPosition).toBeCloseTo(first.baseline, 6);
        // Positive values draw above the baseline.
        expect(point.yPosition).toBeLessThanOrEqual(first.baseline);
      }
    }
  });

  it('stacks series with a cumulative lower edge in stacked mode', () => {
    const geometry = buildSvgAreaGeometry({ series, width: 480, height: 280, stacked: true });
    expect(geometry.stacked).toBe(true);
    const [lower, upper] = geometry.series;
    // The second series lower edge equals the first series upper edge per category.
    for (let index = 0; index < 2; index += 1) {
      expect(upper?.points[index]?.lowerPosition).toBeCloseTo(lower?.points[index]?.yPosition ?? -1, 6);
    }
  });

  it('flags a non-finite stacked cumulative total as overflow', () => {
    const overflow = buildSvgAreaGeometry({
      series: [
        { id: 'a', label: 'A', points: [{ id: 'a0', x: 'Jan', value: Number.MAX_VALUE }] },
        { id: 'b', label: 'B', points: [{ id: 'b0', x: 'Jan', value: Number.MAX_VALUE }] },
      ],
      width: 400,
      height: 240,
      stacked: true,
    });
    expect(overflow.stackOverflow).toBe(true);
  });

  it('drops non-finite and non-string x points', () => {
    const geometry = buildSvgAreaGeometry({
      series: [{ id: 'a', label: 'A', points: [
        { id: 'a0', x: 'Jan', value: 10 },
        { id: 'a1', x: 'Feb', value: Number.NaN },
      ] }],
      width: 400,
      height: 240,
    });
    expect(geometry.series[0]?.points).toHaveLength(1);
  });
});

describe('Sparkline geometry', () => {
  it('returns null when no finite datum exists', () => {
    expect(buildSvgSparklineGeometry({ data: [], width: 100, height: 24 })).toBeNull();
    expect(buildSvgSparklineGeometry({ data: [Number.NaN], width: 100, height: 24 })).toBeNull();
  });

  it('builds a deterministic line path with an end dot at the final index', () => {
    const options = { data: [4, 8, 3, 12, 7], width: 100, height: 24 } as const;
    const first = buildSvgSparklineGeometry({ ...options });
    const second = buildSvgSparklineGeometry({ ...options });
    expect(first).toEqual(second);
    expect(first?.linePath.startsWith('M')).toBe(true);
    expect(first?.minimum).toBe(3);
    expect(first?.maximum).toBe(12);
    expect(first?.pointCount).toBe(5);
    expect(first?.endDot).not.toBeNull();
    // End dot x maps to the last index at the right padding edge.
    expect(first?.endDot?.cx).toBeGreaterThan(first?.minDot?.cx ?? 0);
  });

  it('centres a flat series vertically', () => {
    const geometry = buildSvgSparklineGeometry({ data: [5, 5, 5], width: 90, height: 30, showEndDot: false });
    const midpoint = 30 / 2;
    expect(geometry?.endDot).toBeNull();
    // All equal values collapse onto the vertical centre line.
    expect(geometry?.linePath.startsWith('M')).toBe(true);
    expect(Math.abs((geometry?.maximum ?? 0) - (geometry?.minimum ?? 0))).toBe(0);
    expect(midpoint).toBe(15);
  });

  it('emits an area path only when fill is requested', () => {
    expect(buildSvgSparklineGeometry({ data: [1, 2, 3], width: 100, height: 24, showArea: false })?.areaPath).toBeNull();
    expect(buildSvgSparklineGeometry({ data: [1, 2, 3], width: 100, height: 24, showArea: true })?.areaPath).toContain('M');
  });

  it('marks min and max dots distinctly from the end dot', () => {
    const geometry = buildSvgSparklineGeometry({ data: [9, 1, 5, 2, 6], width: 120, height: 30, showMinMax: true, showEndDot: true });
    expect(geometry?.minDot).not.toBeNull();
    expect(geometry?.maxDot).not.toBeNull();
  });
});

describe('Histogram geometry', () => {
  const values = [12, 15, 22, 28, 28, 31, 35, 42, 42, 42, 55, 60];

  it('bins values into contiguous bars whose counts sum to the sample size', () => {
    const geometry = buildSvgHistogramGeometry({ values, width: 600, height: 360, bins: 6 });
    expect(geometry.bins.length).toBeGreaterThan(0);
    const totalCount = geometry.bins.reduce((sum, bin) => sum + bin.count, 0);
    expect(totalCount).toBe(values.length);
    expect(geometry.bins.every((bin) => bin.width >= 0)).toBe(true);
    expect(geometry.bins.every((bin) => bin.height >= 0)).toBe(true);
  });

  it('is deterministic and empty for empty input', () => {
    const first = buildSvgHistogramGeometry({ values, width: 600, height: 360 });
    const second = buildSvgHistogramGeometry({ values, width: 600, height: 360 });
    expect(first).toEqual(second);
    expect(buildSvgHistogramGeometry({ values: [], width: 600, height: 360 }).bins).toHaveLength(0);
  });

  it('normalises density so probability mass integrates toward one', () => {
    const geometry = buildSvgHistogramGeometry({ values, width: 600, height: 360, density: true, bins: 6 });
    const mass = geometry.bins.reduce((sum, bin) => sum + bin.densityValue * (bin.x1 - bin.x0), 0);
    expect(mass).toBeCloseTo(1, 6);
  });

  it('builds a cumulative overlay that reaches 100 percent', () => {
    const geometry = buildSvgHistogramGeometry({ values, width: 600, height: 360, cumulative: true, bins: 6 });
    expect(geometry.cumulative).not.toBeNull();
    const lastPoint = geometry.cumulative?.points.at(-1);
    expect(lastPoint?.ratio).toBeCloseTo(1, 6);
    expect(geometry.cumulative?.path.startsWith('M')).toBe(true);
    expect(geometry.cumulative?.axisTicks.some((tick) => tick.label === '100%')).toBe(true);
  });
});

describe('Waterfall geometry', () => {
  const data = [
    { label: 'Revenue', value: 420 },
    { label: 'COGS', value: -200 },
    { label: 'Expenses', value: -80 },
    { label: 'Net Profit', value: 140, type: 'total' as const },
  ];

  it('accumulates running totals and anchors total bars to zero', () => {
    const geometry = buildSvgWaterfallGeometry({ data, width: 600, height: 360 });
    expect(geometry.bars).toHaveLength(4);
    const [revenue, cogs, expenses, total] = geometry.bars;
    expect(revenue?.start).toBe(0);
    expect(revenue?.end).toBe(420);
    expect(cogs?.start).toBe(420);
    expect(cogs?.end).toBe(220);
    expect(expenses?.end).toBe(140);
    expect(total?.start).toBe(0);
    expect(total?.end).toBe(140);
    expect(total?.type).toBe('total');
  });

  it('emits one connector fewer than bars and a baseline inside the plot', () => {
    const geometry = buildSvgWaterfallGeometry({ data, width: 600, height: 360 });
    expect(geometry.connectors).toHaveLength(geometry.bars.length - 1);
    expect(geometry.baseline).toBeGreaterThanOrEqual(geometry.plot.y);
    expect(geometry.baseline).toBeLessThanOrEqual(geometry.plot.y + geometry.plot.height);
  });

  it('skips non-finite values and infers increase/decrease tone from sign', () => {
    const geometry = buildSvgWaterfallGeometry({
      data: [
        { label: 'Up', value: 10 },
        { label: 'Bad', value: Number.NaN },
        { label: 'Down', value: -4 },
      ],
      width: 480,
      height: 280,
    });
    expect(geometry.bars).toHaveLength(2);
    expect(geometry.bars[0]?.type).toBe('increase');
    expect(geometry.bars[1]?.type).toBe('decrease');
  });

  it('swaps axes in horizontal orientation', () => {
    const vertical = buildSvgWaterfallGeometry({ data, width: 600, height: 360, orientation: 'vertical' });
    const horizontal = buildSvgWaterfallGeometry({ data, width: 600, height: 360, orientation: 'horizontal' });
    expect(vertical.orientation).toBe('vertical');
    expect(horizontal.orientation).toBe('horizontal');
    // Vertical bars share a category-derived x band; horizontal bars share a y band.
    expect(new Set(vertical.bars.map((bar) => bar.width)).size).toBe(1);
    expect(new Set(horizontal.bars.map((bar) => bar.height)).size).toBe(1);
  });
});
