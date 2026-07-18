import { describe, expect, it } from 'vitest';

import {
  buildSvgBulletGeometry,
  buildSvgCalendarHeatMapGeometry,
  buildSvgGanttGeometry,
  buildSvgTreeMapGeometry,
} from '..';

describe('Bullet geometry', () => {
  it('keeps a truthful domain and widest-first bands for a valid KPI', () => {
    const geometry = buildSvgBulletGeometry({
      width: 600,
      height: 60,
      data: [{ id: 'rev', label: 'Revenue', value: 275, target: 250, ranges: [150, 200, 300] }],
    });

    expect(geometry.fallbackMessage).toBeNull();
    expect(geometry.items).toHaveLength(1);
    const item = geometry.items[0]!;
    expect(item.domainMin).toBeLessThanOrEqual(0);
    expect(item.domainMax).toBeGreaterThanOrEqual(300);
    // Bands ordered widest first: good, satisfactory, poor.
    expect(item.bands.map((band) => band.tier)).toEqual(['good', 'satisfactory', 'poor']);
    expect(item.bands[0]!.width).toBeGreaterThanOrEqual(item.bands[1]!.width);
    expect(item.bands[1]!.width).toBeGreaterThanOrEqual(item.bands[2]!.width);
    expect(item.valueDirection).toBe('positive');
  });

  it('is deterministic and reports the three distinct fallback classes', () => {
    const options = {
      width: 480,
      height: 60,
      data: [{ id: 'a', label: 'A', value: 10, target: 8 }],
    } as const;
    expect(buildSvgBulletGeometry(options)).toEqual(buildSvgBulletGeometry(options));

    expect(buildSvgBulletGeometry({ width: 480, height: 60, data: [] }).fallbackMessage)
      .toBe('No data to display.');
    expect(buildSvgBulletGeometry({
      width: 480,
      height: 60,
      data: [{ id: 'a', label: 'A', value: Number.NaN, target: 8 }],
    }).fallbackMessage).toBe('Bullet charts require finite values.');
    expect(buildSvgBulletGeometry({
      width: 480,
      height: 60,
      data: [{ id: 'a', label: 'A', value: 10, target: 8, ranges: [30, 20, 10] }],
    }).fallbackMessage).toBe('Bullet chart ranges must be ordered from low to high.');
  });

  it('emits a zero baseline only when the domain spans negative values', () => {
    const positive = buildSvgBulletGeometry({
      width: 400,
      height: 60,
      data: [{ id: 'p', label: 'P', value: 10, target: 8 }],
    });
    const negative = buildSvgBulletGeometry({
      width: 400,
      height: 60,
      data: [{ id: 'n', label: 'N', value: -4, target: 6 }],
    });
    expect(positive.items[0]!.zeroBaseline).toBeNull();
    expect(negative.items[0]!.zeroBaseline).not.toBeNull();
  });

  it('lays out vertical orientation with column-centered anchors', () => {
    const geometry = buildSvgBulletGeometry({
      width: 300,
      height: 320,
      orientation: 'vertical',
      data: [
        { id: 'a', label: 'A', value: 5, target: 4 },
        { id: 'b', label: 'B', value: 7, target: 9 },
      ],
    });
    expect(geometry.orientation).toBe('vertical');
    expect(geometry.items).toHaveLength(2);
    expect(geometry.items[1]!.labelAnchor.x).toBeGreaterThan(geometry.items[0]!.labelAnchor.x);
  });
});

describe('TreeMap geometry', () => {
  it('tiles descending by value with the largest at the origin', () => {
    const geometry = buildSvgTreeMapGeometry({
      width: 400,
      height: 300,
      padding: 0,
      data: [
        { name: 'Small', value: 10 },
        { name: 'Large', value: 60 },
        { name: 'Medium', value: 30 },
      ],
    });
    expect(geometry.tiles).toHaveLength(3);
    expect(geometry.tiles[0]!.name).toBe('Large');
    expect(geometry.tiles[0]!.x).toBe(0);
    expect(geometry.tiles[0]!.y).toBe(0);
    // Total tile area approximates the plot area (padding 0, rounded).
    const totalArea = geometry.tiles.reduce((sum, tile) => sum + tile.width * tile.height, 0);
    expect(totalArea).toBeGreaterThan(400 * 300 * 0.9);
  });

  it('drops non-positive leaves and cycles the supplied palette', () => {
    const geometry = buildSvgTreeMapGeometry({
      width: 300,
      height: 200,
      colors: ['#111111', '#222222'],
      data: [
        { name: 'Keep', value: 40 },
        { name: 'Drop', value: 0 },
        { name: 'Keep2', value: 20 },
        { name: 'Also', value: 10 },
      ],
    });
    expect(geometry.tiles.map((tile) => tile.name)).toEqual(['Keep', 'Keep2', 'Also']);
    expect(geometry.tiles[0]!.color).toBe('#111111');
    expect(geometry.tiles[1]!.color).toBe('#222222');
    expect(geometry.tiles[2]!.color).toBe('#111111');
  });

  it('flags small tiles as unlabeled and is deterministic', () => {
    const options = {
      width: 200,
      height: 200,
      data: [
        { name: 'Big', value: 95 },
        { name: 'Tiny', value: 1 },
      ],
    } as const;
    const geometry = buildSvgTreeMapGeometry(options);
    expect(geometry).toEqual(buildSvgTreeMapGeometry(options));
    const tiny = geometry.tiles.find((tile) => tile.name === 'Tiny');
    expect(tiny?.showLabel).toBe(false);
  });

  it('returns no tiles for empty input', () => {
    expect(buildSvgTreeMapGeometry({ width: 200, height: 200, data: [] }).tiles).toHaveLength(0);
  });
});

describe('Calendar heat-map geometry', () => {
  it('emits one cell per day with filled/empty state and month labels', () => {
    const values = new Map<string, number>([
      ['2025-01-02', 5],
      ['2025-01-10', 9],
    ]);
    const geometry = buildSvgCalendarHeatMapGeometry({
      startDate: new Date(2025, 0, 1),
      endDate: new Date(2025, 0, 31),
      values,
      colorRange: ['#e5e7eb', '#0072b2'],
    });
    expect(geometry.cells).toHaveLength(31);
    expect(geometry.recordedCount).toBe(2);
    expect(geometry.cells.filter((cell) => cell.state === 'filled')).toHaveLength(2);
    expect(geometry.startDateKey).toBe('2025-01-01');
    expect(geometry.endDateKey).toBe('2025-01-31');
    expect(geometry.monthLabels.length).toBeGreaterThan(0);
    // Days of the same week share a column; a Monday sits in the top row.
    const monday = geometry.cells.find((cell) => cell.dateKey === '2025-01-06');
    expect(monday?.y).toBe(geometry.cells.find((cell) => cell.dateKey === '2025-01-13')?.y);
  });

  it('reserves the lowest step for days without observation and is deterministic', () => {
    const values = new Map<string, number>([['2025-03-05', 8]]);
    const options = {
      startDate: new Date(2025, 2, 1),
      endDate: new Date(2025, 2, 10),
      values,
      colorRange: ['#000000', '#ffffff'] as const,
    };
    const geometry = buildSvgCalendarHeatMapGeometry(options);
    expect(geometry).toEqual(buildSvgCalendarHeatMapGeometry(options));
    const empty = geometry.cells.find((cell) => cell.state === 'empty');
    const filled = geometry.cells.find((cell) => cell.state === 'filled');
    expect(empty?.fill).not.toBe(filled?.fill);
  });

  it('returns an empty grid for an inverted range', () => {
    const geometry = buildSvgCalendarHeatMapGeometry({
      startDate: new Date(2025, 5, 10),
      endDate: new Date(2025, 5, 1),
      values: new Map(),
      colorRange: ['#000', '#fff'],
    });
    expect(geometry.cells).toHaveLength(0);
    expect(geometry.width).toBe(0);
  });
});

describe('Gantt geometry', () => {
  const tasks = [
    { id: '1', name: 'Design', start: new Date(2026, 0, 1), end: new Date(2026, 1, 15), progress: 80 },
    { id: '2', name: 'Build', start: new Date(2026, 1, 1), end: new Date(2026, 3, 1), progress: 30 },
  ];

  it('positions duration and progress bars within the plot', () => {
    const geometry = buildSvgGanttGeometry({
      tasks,
      width: 800,
      height: 200,
      now: new Date(2026, 0, 20),
    });
    expect(geometry.bars).toHaveLength(2);
    const design = geometry.bars[0]!;
    expect(design.duration.x).toBeGreaterThanOrEqual(geometry.plot.x);
    expect(design.progress).not.toBeNull();
    expect(design.progress!.width).toBeLessThanOrEqual(design.duration.width);
    expect(geometry.xTicks.length).toBeGreaterThan(0);
    expect(geometry.gridLines).toHaveLength(geometry.xTicks.length);
  });

  it('draws the today marker only when the injected clock is inside the domain', () => {
    const inside = buildSvgGanttGeometry({ tasks, width: 800, height: 200, now: new Date(2026, 0, 20) });
    const outside = buildSvgGanttGeometry({ tasks, width: 800, height: 200, now: new Date(2030, 0, 1) });
    expect(inside.today).not.toBeNull();
    expect(outside.today).toBeNull();
  });

  it('omits progress bars when disabled and is deterministic', () => {
    const options = { tasks, width: 800, height: 200, showProgress: false, now: new Date(2026, 0, 20) } as const;
    const geometry = buildSvgGanttGeometry(options);
    expect(geometry).toEqual(buildSvgGanttGeometry(options));
    expect(geometry.bars.every((bar) => bar.progress === null)).toBe(true);
  });

  it('returns no bars for empty tasks', () => {
    const geometry = buildSvgGanttGeometry({ tasks: [], width: 800, height: 200 });
    expect(geometry.bars).toHaveLength(0);
    expect(geometry.today).toBeNull();
  });
});
