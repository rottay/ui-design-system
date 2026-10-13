import { interpolateRgb, scaleQuantize, timeDay, timeFormat, timeMonday, timeMonth } from 'd3';

import { DEFAULT_COLORS } from '../../../../../../foundation/palettes';

import { normalizedConcreteColor, type ChartGeometryRect } from '../foundation';

// ---------------------------------------------------------------------------
// Calendar heat-map (day grid) geometry
// ---------------------------------------------------------------------------

const CALENDAR_KEY_FORMAT = timeFormat('%Y-%m-%d');
const CALENDAR_MONTH_FORMAT = timeFormat('%b');
const CALENDAR_DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', ''] as const;
const CALENDAR_DEFAULT_STEPS = 5;
const CALENDAR_MAX_STEPS = 256;

export interface SvgCalendarHeatMapCell extends ChartGeometryRect {
  readonly id: string;
  readonly dateKey: string;
  readonly value: number | null;
  readonly state: 'empty' | 'filled';
  readonly fill: string;
}

export interface SvgCalendarHeatMapLabel {
  readonly id: string;
  readonly label: string;
  readonly x: number;
  readonly y: number;
}

export interface SvgCalendarHeatMapGeometry {
  readonly width: number;
  readonly height: number;
  readonly cells: readonly SvgCalendarHeatMapCell[];
  readonly monthLabels: readonly SvgCalendarHeatMapLabel[];
  readonly dayLabels: readonly SvgCalendarHeatMapLabel[];
  readonly recordedCount: number;
  readonly startDateKey: string;
  readonly endDateKey: string;
}

export interface BuildSvgCalendarHeatMapGeometryOptions {
  readonly startDate: Date;
  readonly endDate: Date;
  readonly values: ReadonlyMap<string, number>;
  /** Concrete low/high colors already resolved from CSS by the renderer. */
  readonly colorRange: readonly [string, string];
  readonly colorSteps?: number;
  readonly cellSize?: number;
  readonly cellGap?: number;
  readonly measuredWidth?: number;
  readonly responsive?: boolean;
  readonly showMonthLabels?: boolean;
  readonly showDayLabels?: boolean;
}

function calendarQuantizeDomain(values: readonly number[]): [number, number] {
  if (values.length === 0) return [0, 1];
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  if (minimum !== maximum) return [minimum, maximum];
  if (minimum > 0) return [0, minimum];
  if (minimum < 0) return [minimum, 0];
  return [-1, 0];
}

/**
 * Deterministic GitHub-style contribution grid. D3 supplies calendar math
 * (timeDay/timeMonday/timeMonth) and the quantize color scale; the React
 * renderer draws one positioned rect per day. Colors arrive already resolved
 * to concrete values so this pure module never touches the DOM.
 */
export function buildSvgCalendarHeatMapGeometry({
  startDate,
  endDate,
  values,
  colorRange,
  colorSteps = CALENDAR_DEFAULT_STEPS,
  cellSize = 14,
  cellGap = 2,
  measuredWidth,
  responsive = true,
  showMonthLabels = true,
  showDayLabels = true,
}: BuildSvgCalendarHeatMapGeometryOptions): SvgCalendarHeatMapGeometry {
  const resolvedCellSize = Number.isFinite(cellSize) && cellSize > 0 ? cellSize : 14;
  const resolvedCellGap = Number.isFinite(cellGap) && cellGap >= 0 ? cellGap : 2;
  const resolvedSteps = Number.isFinite(colorSteps)
    ? Math.min(CALENDAR_MAX_STEPS, Math.max(2, Math.floor(colorSteps)))
    : CALENDAR_DEFAULT_STEPS;
  const step = resolvedCellSize + resolvedCellGap;
  const dayLabelWidth = showDayLabels ? 32 : 0;
  const monthLabelHeight = showMonthLabels ? 18 : 0;

  const startValid = Number.isFinite(startDate.getTime());
  const endValid = Number.isFinite(endDate.getTime());
  if (!startValid || !endValid || endDate < startDate) {
    return {
      width: 0,
      height: 0,
      cells: Object.freeze([]),
      monthLabels: Object.freeze([]),
      dayLabels: Object.freeze([]),
      recordedCount: 0,
      startDateKey: startValid ? CALENDAR_KEY_FORMAT(startDate) : '',
      endDateKey: endValid ? CALENDAR_KEY_FORMAT(endDate) : '',
    };
  }

  const allDays = timeDay.range(startDate, timeDay.offset(endDate, 1));
  const firstMonday = timeMonday.floor(startDate);
  const totalWeeks = Math.ceil((timeDay.count(firstMonday, endDate) + 1) / 7);
  const gridWidth = totalWeeks * step;
  const gridHeight = 7 * step;
  const safeMeasured = Number.isFinite(measuredWidth) ? Math.max(0, measuredWidth as number) : 0;
  const width = responsive
    ? Math.max(safeMeasured, gridWidth + dayLabelWidth + 8)
    : gridWidth + dayLabelWidth + 8;
  const height = gridHeight + monthLabelHeight + 4;

  const lowColor = normalizedConcreteColor(colorRange[0], DEFAULT_COLORS[8] as string);
  const highColor = normalizedConcreteColor(colorRange[1], DEFAULT_COLORS[0] as string);
  const interpolate = interpolateRgb(lowColor, highColor);
  const stepColors: string[] = [];
  for (let i = 0; i < resolvedSteps; i += 1) {
    stepColors.push(interpolate(i / (resolvedSteps - 1)));
  }
  // The first color is reserved for days without any observation.
  const filledStepColors = stepColors.slice(1);
  const finiteValues = [...values.values()].filter((value) => Number.isFinite(value));
  const colorScale = scaleQuantize<string>()
    .domain(calendarQuantizeDomain(finiteValues))
    .range(filledStepColors);

  let recordedCount = 0;
  const cells = allDays.map<SvgCalendarHeatMapCell>((date) => {
    const dateKey = CALENDAR_KEY_FORMAT(date);
    const rawValue = values.get(dateKey);
    const hasValue = rawValue != null && Number.isFinite(rawValue);
    if (hasValue) recordedCount += 1;
    const weekOffset = Math.floor(timeDay.count(firstMonday, date) / 7);
    const dow = (date.getDay() + 6) % 7;
    return {
      id: `cal-${dateKey}`,
      dateKey,
      value: hasValue ? (rawValue as number) : null,
      state: hasValue ? 'filled' : 'empty',
      x: dayLabelWidth + weekOffset * step,
      y: monthLabelHeight + dow * step,
      width: resolvedCellSize,
      height: resolvedCellSize,
      fill: hasValue ? colorScale(rawValue as number) ?? lowColor : lowColor,
    };
  });

  const dayLabels = showDayLabels
    ? CALENDAR_DAY_LABELS.flatMap<SvgCalendarHeatMapLabel>((label, i) => (
        label
          ? [{
              id: `cal-day-${i}`,
              label,
              x: dayLabelWidth - 6,
              y: monthLabelHeight + i * step + step / 2,
            }]
          : []
      ))
    : [];

  const monthLabels = showMonthLabels
    ? timeMonth.range(timeMonth.ceil(startDate), timeDay.offset(endDate, 1))
        .map<SvgCalendarHeatMapLabel>((monthDate) => {
          const weekOffset = Math.floor(timeDay.count(firstMonday, monthDate) / 7);
          return {
            id: `cal-month-${CALENDAR_KEY_FORMAT(monthDate)}`,
            label: CALENDAR_MONTH_FORMAT(monthDate),
            x: dayLabelWidth + weekOffset * step,
            y: monthLabelHeight - 4,
          };
        })
    : [];

  return {
    width,
    height,
    cells: Object.freeze(cells),
    monthLabels: Object.freeze(monthLabels),
    dayLabels: Object.freeze(dayLabels),
    recordedCount,
    startDateKey: CALENDAR_KEY_FORMAT(startDate),
    endDateKey: CALENDAR_KEY_FORMAT(endDate),
  };
}
