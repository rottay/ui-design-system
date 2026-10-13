import { describe, expect, it } from 'vitest';

import {
  buildSvgBarGeometry,
  buildSvgBarSeriesGeometry,
  type ChartGeometryTick,
  type SvgBarSeriesInput,
} from '..';

/**
 * Numeric ground-truth fixtures for the multi-series bar mode matrix
 * (grouped | stacked, vertical | horizontal). These positional assertions are
 * the byte-safety instrument for the bar migration: geometry drift is caught
 * here before the visual harness re-baselines.
 */

const TWO_SERIES: readonly SvgBarSeriesInput[] = [
  { id: 'a', label: 'A', points: [{ category: 'Jan', value: 10 }, { category: 'Feb', value: 20 }] },
  { id: 'b', label: 'B', points: [{ category: 'Jan', value: 6 }, { category: 'Feb', value: 14 }] },
];

function barsFor(bars: readonly { category: string }[], category: string): number {
  return bars.filter((bar) => bar.category === category).length;
}

describe('multi-series bar geometry', () => {
  it('places grouped vertical bars side by side within each category band', () => {
    const geometry = buildSvgBarSeriesGeometry({
      series: TWO_SERIES,
      width: 600,
      height: 360,
      orientation: 'vertical',
      layout: 'grouped',
    });

    expect(geometry.bars).toHaveLength(4);
    expect(geometry.seriesCount).toBe(2);
    expect(geometry.categories).toEqual(['Jan', 'Feb']);
    expect(barsFor(geometry.bars, 'Jan')).toBe(2);

    const janBars = geometry.bars.filter((bar) => bar.category === 'Jan');
    const [first, second] = janBars;
    // Side-by-side: distinct x, equal (inner-band) widths, both finite.
    expect(first?.x).not.toBeCloseTo(second?.x ?? Number.NaN, 3);
    expect(first?.width).toBeCloseTo(second?.width ?? Number.NaN, 6);
    janBars.forEach((bar) => {
      expect(Number.isFinite(bar.x)).toBe(true);
      expect(Number.isFinite(bar.height)).toBe(true);
      expect(bar.height).toBeGreaterThan(0);
      expect(bar.isTopOfStack).toBe(true);
    });
  });

  it('stacks vertical bars so the upper series rests on the lower series', () => {
    const geometry = buildSvgBarSeriesGeometry({
      series: TWO_SERIES,
      width: 600,
      height: 360,
      orientation: 'vertical',
      layout: 'stacked',
    });

    expect(geometry.bars).toHaveLength(4);
    const janLower = geometry.bars.find((bar) => bar.seriesId === 'a' && bar.category === 'Jan');
    const janUpper = geometry.bars.find((bar) => bar.seriesId === 'b' && bar.category === 'Jan');
    // Stacked (not grouped): equal x and full band width for both series.
    expect(janLower?.x).toBeCloseTo(janUpper?.x ?? Number.NaN, 6);
    expect(janLower?.width).toBeCloseTo(janUpper?.width ?? Number.NaN, 6);
    // The upper series bottom edge meets the lower series top edge.
    expect(janUpper?.y ?? 0).toBeLessThan(janLower?.y ?? 0);
    expect((janUpper?.y ?? 0) + (janUpper?.height ?? 0)).toBeCloseTo(janLower?.y ?? Number.NaN, 3);
    // Only the topmost stacked segment rounds its corners.
    expect(janLower?.isTopOfStack).toBe(false);
    expect(janUpper?.isTopOfStack).toBe(true);
  });

  it('accumulates stacked signed values away from a shared zero baseline', () => {
    const geometry = buildSvgBarSeriesGeometry({
      series: [
        { id: 'gain', label: 'Gain', points: [{ category: 'Q1', value: 8 }] },
        { id: 'loss', label: 'Loss', points: [{ category: 'Q1', value: -5 }] },
      ],
      width: 400,
      height: 300,
      orientation: 'vertical',
      layout: 'stacked',
    });

    const gain = geometry.bars.find((bar) => bar.seriesId === 'gain');
    const loss = geometry.bars.find((bar) => bar.seriesId === 'loss');
    // Positive bar sits above the baseline, negative bar below it.
    expect((gain?.y ?? 0) + (gain?.height ?? 0)).toBeCloseTo(geometry.baseline, 3);
    expect(loss?.y ?? 0).toBeCloseTo(geometry.baseline, 3);
    expect(gain?.height ?? 0).toBeGreaterThan(0);
    expect(loss?.height ?? 0).toBeGreaterThan(0);
  });

  it('lays grouped horizontal bars from a shared value baseline', () => {
    const geometry = buildSvgBarSeriesGeometry({
      series: TWO_SERIES,
      width: 600,
      height: 360,
      orientation: 'horizontal',
      layout: 'grouped',
    });

    expect(geometry.bars).toHaveLength(4);
    const janBars = geometry.bars.filter((bar) => bar.category === 'Jan');
    // Grouped horizontal: distinct y lanes, equal heights, growing width.
    expect(janBars[0]?.y).not.toBeCloseTo(janBars[1]?.y ?? Number.NaN, 3);
    expect(janBars[0]?.height).toBeCloseTo(janBars[1]?.height ?? Number.NaN, 6);
    janBars.forEach((bar) => {
      expect(bar.width).toBeGreaterThan(0);
      expect(Number.isFinite(bar.y)).toBe(true);
    });
  });

  it('drops an overflowing stacked segment while keeping the finite one', () => {
    const geometry = buildSvgBarSeriesGeometry({
      series: [
        { id: 'first', label: 'First', points: [{ category: 'Only', value: 1e308 }] },
        { id: 'second', label: 'Second', points: [{ category: 'Only', value: 1e308 }] },
      ],
      width: 400,
      height: 260,
      orientation: 'vertical',
      layout: 'stacked',
    });

    expect(geometry.bars).toHaveLength(1);
    const [bar] = geometry.bars;
    expect(bar?.seriesId).toBe('first');
    for (const attribute of [bar?.x, bar?.y, bar?.width, bar?.height]) {
      expect(Number.isFinite(attribute)).toBe(true);
    }
  });

  it('preserves duplicate series display names as independent series', () => {
    const geometry = buildSvgBarSeriesGeometry({
      series: [
        { id: 'series-0', label: 'Same', points: [{ category: 'A', value: 2 }] },
        { id: 'series-1', label: 'Same', points: [{ category: 'A', value: 4 }] },
      ],
      width: 400,
      height: 260,
      orientation: 'vertical',
      layout: 'grouped',
    });

    expect(geometry.bars).toHaveLength(2);
    expect(new Set(geometry.bars.map((bar) => bar.x)).size).toBe(2);
    expect(geometry.bars.every((bar) => bar.seriesLabel === 'Same')).toBe(true);
  });
});

describe('bar tick budget bounds', () => {
  const size = { width: 640, height: 360 };
  const categoryCount = 8;
  const data = Array.from({ length: categoryCount }, (_, index) => ({
    id: `bar-${index}`,
    category: `Category ${index}`,
    value: index * 13 - 30,
  }));
  const series: readonly SvgBarSeriesInput[] = [
    { id: 'a', label: 'A', points: data.map((datum) => ({ category: datum.category, value: datum.value })) },
    { id: 'b', label: 'B', points: data.map((datum) => ({ category: datum.category, value: datum.value / 2 + 7 })) },
  ];

  interface BarTickGeometry {
    readonly categoryTicks: readonly ChartGeometryTick[];
    readonly valueTicks: readonly ChartGeometryTick[];
  }

  const cases: readonly { readonly name: string; readonly build: (maxTicks: number | undefined) => BarTickGeometry }[] = [
    { name: 'single-series vertical', build: (maxTicks) => buildSvgBarGeometry({ ...size, data, maxTicks }) },
    {
      name: 'single-series horizontal',
      build: (maxTicks) => buildSvgBarGeometry({ ...size, data, orientation: 'horizontal', maxTicks }),
    },
    { name: 'multi-series grouped', build: (maxTicks) => buildSvgBarSeriesGeometry({ ...size, series, maxTicks }) },
    {
      name: 'multi-series stacked horizontal',
      build: (maxTicks) =>
        buildSvgBarSeriesGeometry({ ...size, series, layout: 'stacked', orientation: 'horizontal', maxTicks }),
    },
  ];

  describe.each(cases)('$name', ({ build }) => {
    it.each([1001, 1_000_000, 1e12, Number.MAX_SAFE_INTEGER])(
      'clamps an oversized budget of %d to the 1000-tick ceiling',
      (maxTicks) => {
        const startedAt = performance.now();
        const geometry = build(maxTicks);
        const elapsed = performance.now() - startedAt;

        expect(elapsed).toBeLessThan(2000);
        expect(geometry.valueTicks.length).toBeLessThanOrEqual(1000);
        expect(geometry).toEqual(build(1000));
      },
    );

    it('keeps the lower clamp and the unset fallback unchanged', () => {
      expect(build(0)).toEqual(build(2));
      expect(build(-5)).toEqual(build(2));
      expect(build(2)).not.toEqual(build(5));

      const unset = build(undefined);
      expect(build(Number.NaN)).toEqual(unset);
      expect(build(1.5)).toEqual(unset);
      expect(unset.valueTicks).toEqual(build(5).valueTicks);
      expect(unset.categoryTicks).toHaveLength(categoryCount);
      expect(build(5).categoryTicks).toHaveLength(5);
    });

    it('passes in-range budgets through to the tick bound they request', () => {
      for (const maxTicks of [2, 3, 5, 10, 999, 1000]) {
        const geometry = build(maxTicks);
        expect(geometry.valueTicks.length).toBeLessThanOrEqual(maxTicks);
        expect(geometry.categoryTicks.length).toBeLessThanOrEqual(maxTicks);
      }
      expect(build(10)).not.toEqual(build(5));
    });
  });
});
