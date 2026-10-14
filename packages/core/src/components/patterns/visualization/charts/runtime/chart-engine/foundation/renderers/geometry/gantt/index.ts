import { scaleBand, scaleTime, timeFormat } from 'd3';

import { DEFAULT_COLORS } from '../../../../../../foundation/palettes';

import {
  finiteSize,
  normalizeInsets,
  plotRect,
  type ChartGeometryInsets,
  type ChartGeometryRect,
  type ChartGeometryTick,
} from '../kernel';

// ---------------------------------------------------------------------------
// Gantt (time-axis lanes) geometry
// ---------------------------------------------------------------------------

export interface SvgGanttTask {
  readonly id: string;
  readonly name: string;
  readonly start: Date;
  readonly end: Date;
  readonly progress?: number;
  readonly color?: string;
}

export interface SvgGanttBarGeometry {
  readonly id: string;
  readonly name: string;
  readonly index: number;
  readonly duration: ChartGeometryRect;
  readonly progress: ChartGeometryRect | null;
  readonly progressValue: number | null;
  readonly color: string;
  readonly colorSource: 'palette' | 'custom';
  readonly rowLabel: { readonly x: number; readonly y: number };
}

export interface SvgGanttGeometry {
  readonly width: number;
  readonly height: number;
  readonly plot: ChartGeometryRect;
  readonly bars: readonly SvgGanttBarGeometry[];
  readonly xTicks: readonly ChartGeometryTick[];
  readonly gridLines: readonly {
    readonly id: string;
    readonly x: number;
    readonly y1: number;
    readonly y2: number;
  }[];
  readonly today:
    | { readonly x: number; readonly y1: number; readonly y2: number; readonly labelX: number; readonly labelY: number }
    | null;
}

export interface BuildSvgGanttGeometryOptions {
  readonly tasks: readonly SvgGanttTask[];
  readonly width: number;
  readonly height: number;
  readonly margin?: ChartGeometryInsets;
  readonly showProgress?: boolean;
  readonly showToday?: boolean;
  readonly colors?: readonly string[];
  /** Injected for deterministic fixtures; defaults to the wall clock. */
  readonly now?: Date;
}

const DEFAULT_GANTT_INSETS: ChartGeometryInsets = Object.freeze({
  top: 20,
  right: 20,
  bottom: 30,
  left: 150,
});

function ganttTickFormat(domainSpanMs: number): (date: Date) => string {
  const days = domainSpanMs / (24 * 60 * 60 * 1000);
  if (days > 730) return timeFormat('%Y');
  if (days > 120) return timeFormat('%b %Y');
  return timeFormat('%b %d');
}

/**
 * Deterministic Gantt geometry. D3 contributes the time scale, band scale and
 * tick generation; the React renderer draws lanes and bars. All marks are
 * absolute so the renderer performs no scale math. `now` is injectable to keep
 * the today marker deterministic under test.
 */
export function buildSvgGanttGeometry({
  tasks,
  width: widthInput,
  height: heightInput,
  margin,
  showProgress = true,
  showToday = true,
  colors,
  now,
}: BuildSvgGanttGeometryOptions): SvgGanttGeometry {
  const width = finiteSize(widthInput, 800);
  const height = finiteSize(heightInput, 400);
  const insets = normalizeInsets(margin, DEFAULT_GANTT_INSETS);
  const plot = plotRect(width, height, insets);
  const palette = colors && colors.length > 0 ? colors : DEFAULT_COLORS;

  if (tasks.length === 0 || plot.width === 0 || plot.height === 0) {
    return {
      width,
      height,
      plot,
      bars: Object.freeze([]),
      xTicks: Object.freeze([]),
      gridLines: Object.freeze([]),
      today: null,
    };
  }

  const earliest = tasks.reduce((acc, task) => (task.start < acc ? task.start : acc), tasks[0]!.start);
  const latest = tasks.reduce((acc, task) => (task.end > acc ? task.end : acc), tasks[0]!.end);
  const constantDomain = earliest.getTime() === latest.getTime();
  const domainStart = constantDomain
    ? new Date(earliest.getTime() - 12 * 60 * 60 * 1000)
    : earliest;
  const domainEnd = constantDomain
    ? new Date(latest.getTime() + 12 * 60 * 60 * 1000)
    : latest;

  const x = scaleTime().domain([domainStart, domainEnd]).range([0, plot.width]).nice();
  const y = scaleBand<string>().domain(tasks.map((task) => task.id)).range([0, plot.height]).padding(0.3);
  const [niceStart, niceEnd] = x.domain();
  const tickFormatter = ganttTickFormat(niceEnd.getTime() - niceStart.getTime());
  const bandwidth = y.bandwidth();

  const bars = tasks.map<SvgGanttBarGeometry>((task, index) => {
    const barX = plot.x + x(task.start);
    const barY = plot.y + (y(task.id) ?? 0);
    const durationWidth = Math.max(1, x(task.end) - x(task.start));
    const hasProgress = showProgress && task.progress != null && task.progress > 0;
    return {
      id: task.id,
      name: task.name,
      index,
      duration: { x: barX, y: barY, width: durationWidth, height: bandwidth },
      progress: hasProgress
        ? {
            x: barX,
            y: barY,
            width: Math.max(1, durationWidth * ((task.progress ?? 0) / 100)),
            height: bandwidth,
          }
        : null,
      progressValue: task.progress ?? null,
      color: task.color ?? palette[index % palette.length] ?? 'var(--ds-color-primary)',
      colorSource: task.color ? 'custom' : 'palette',
      rowLabel: { x: plot.x - 8, y: barY + bandwidth / 2 },
    };
  });

  const xTicks = x.ticks(6).map<ChartGeometryTick>((tickDate, index) => ({
    id: `gantt-tick-${index}`,
    label: tickFormatter(tickDate),
    value: tickDate.getTime(),
    x: plot.x + x(tickDate),
    y: plot.y + plot.height,
  }));

  const gridLines = xTicks.map((tick) => ({
    id: `${tick.id}-grid`,
    x: tick.x,
    y1: plot.y,
    y2: plot.y + plot.height,
  }));

  const marker = now ?? new Date();
  const today = showToday
    && Number.isFinite(marker.getTime())
    && marker >= niceStart
    && marker <= niceEnd
    ? {
        x: plot.x + x(marker),
        y1: plot.y,
        y2: plot.y + plot.height,
        labelX: plot.x + x(marker),
        labelY: plot.y - 6,
      }
    : null;

  return {
    width,
    height,
    plot,
    bars: Object.freeze(bars),
    xTicks: Object.freeze(xTicks),
    gridLines: Object.freeze(gridLines),
    today,
  };
}
