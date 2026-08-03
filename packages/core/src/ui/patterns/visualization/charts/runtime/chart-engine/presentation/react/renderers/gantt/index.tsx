'use client';

import { useMemo, type CSSProperties } from 'react';

import { useReducedMotion } from '@/graphics/motion/react/runtime';
import { useResolvedChartPersonality } from '@/infrastructure/runtime/personality';
import {
  buildSvgGanttGeometry,
  type ChartGeometryInsets,
  type SvgGanttTask,
} from '../../../../foundation/renderers/geometry';
import { useChartDimensions } from '../../../../runtime/dimensions';
import { ChartRendererSurface } from '..';

export interface SvgGanttRendererProps {
  readonly tasks: readonly SvgGanttTask[];
  readonly ariaLabel: string;
  readonly ariaDescription?: string;
  readonly ariaDescribedBy?: string;
  readonly width?: number | string;
  readonly height?: number;
  /** Recompute the time scale from the container width. Defaults to true. */
  readonly responsive?: boolean;
  /** Uses the resolved tenant personality unless explicitly overridden. */
  readonly animate?: boolean;
  readonly margin?: ChartGeometryInsets;
  readonly showProgress?: boolean;
  readonly showToday?: boolean;
  readonly todayLabel?: string;
  readonly colors?: readonly string[];
  /** Native `<title>` tooltips for non-interactive compatibility views. */
  readonly showTitles?: boolean;
  readonly formatTooltip?: (task: SvgGanttTask) => string;
  readonly className?: string;
  readonly style?: CSSProperties;
}

function defaultTaskTooltip(task: SvgGanttTask): string {
  const start = task.start.toISOString().slice(0, 10);
  const end = task.end.toISOString().slice(0, 10);
  const progress = task.progress != null ? ` (${task.progress}%)` : '';
  return `${task.name}: ${start} - ${end}${progress}`;
}

/**
 * React-owned Gantt timeline. D3 supplies the time scale, band scale and tick
 * generation inside the immutable geometry builder; all SVG marks and motion
 * are React-owned. The today marker is deterministic under test via the
 * geometry's injectable clock.
 */
export function SvgGanttRenderer({
  tasks,
  ariaLabel,
  ariaDescription,
  ariaDescribedBy,
  width = 800,
  height = 400,
  responsive = true,
  animate,
  margin,
  showProgress = true,
  showToday = true,
  todayLabel = 'Today',
  colors,
  showTitles = true,
  formatTooltip,
  className,
  style,
}: SvgGanttRendererProps): React.ReactElement {
  const chartPersonality = useResolvedChartPersonality();
  const reducedMotion = useReducedMotion();
  const { containerRef, dimensions } = useChartDimensions(width, height, responsive);
  const geometryWidth = responsive
    ? dimensions.width
    : typeof width === 'number'
      ? width
      : 800;
  const animationDuration = Number.isFinite(chartPersonality.mountDuration)
    ? Math.max(0, chartPersonality.mountDuration)
    : 0;
  const shouldAnimate = !reducedMotion
    && (animate ?? chartPersonality.animateOnMount)
    && animationDuration > 0;
  const geometry = useMemo(
    () => buildSvgGanttGeometry({
      tasks,
      width: geometryWidth,
      height,
      margin,
      showProgress,
      showToday,
      colors,
    }),
    [colors, geometryWidth, height, margin, showProgress, showToday, tasks],
  );
  const tooltipFor = formatTooltip ?? defaultTaskTooltip;
  const surfaceStyle: CSSProperties = {
    ...(typeof width === 'string' ? { width } : {}),
    ...style,
  };
  const description = ariaDescribedBy
    ? ariaDescription
    : ariaDescription ?? `Gantt chart with ${geometry.bars.length} ${geometry.bars.length === 1 ? 'task' : 'tasks'}.`;
  const rendererClassName = ['ds-chart-gantt', 'ds-chart-renderer-gantt', className]
    .filter(Boolean)
    .join(' ');
  const taskById = useMemo(() => new Map(tasks.map((task) => [task.id, task])), [tasks]);

  return (
    <ChartRendererSurface
      rendererId="svg.gantt"
      ariaLabel={ariaLabel}
      ariaDescription={description}
      ariaDescribedBy={ariaDescribedBy}
      width={geometry.width}
      height={geometry.height}
      responsive={responsive}
      empty={geometry.bars.length === 0}
      className={rendererClassName}
      style={surfaceStyle}
      ownerRef={containerRef}
    >
      <g data-part="plot-area" data-variant="gantt">
        <g data-part="grid" aria-hidden="true">
          {geometry.gridLines.map((gridLine) => (
            <line
              key={gridLine.id}
              data-part="grid-line"
              x1={gridLine.x}
              y1={gridLine.y1}
              x2={gridLine.x}
              y2={gridLine.y2}
              opacity={0.15}
            />
          ))}
        </g>

        <g data-part="axis" data-axis="x" aria-hidden="true">
          {geometry.xTicks.map((tick) => (
            <text
              key={tick.id}
              data-part="axis-tick-label"
              data-axis="x"
              x={tick.x}
              y={tick.y + 16}
              textAnchor="middle"
            >
              {tick.label}
            </text>
          ))}
        </g>

        <g data-part="axis" data-axis="y" aria-hidden="true">
          {geometry.bars.map((bar) => (
            <text
              key={`${bar.id}-row-label`}
              data-part="axis-tick-label"
              data-axis="y"
              x={bar.rowLabel.x}
              y={bar.rowLabel.y}
              textAnchor="end"
              dominantBaseline="middle"
            >
              {bar.name}
            </text>
          ))}
        </g>

        <g data-part="gantt-motion" data-animate={shouldAnimate ? 'true' : 'false'}>
          {geometry.bars.map((bar) => {
            const task = taskById.get(bar.id);
            // Zero-duration tasks (end === start) are milestones: the geometry
            // gives them a sub-pixel bar, so they render as a diamond marker —
            // a distinct shape that stays legible without color or width.
            const isMilestone = bar.duration.width < 1;
            const milestoneCenterY = bar.duration.y + bar.duration.height / 2;
            const milestoneHalf = Math.max(4, bar.duration.height / 2);
            const milestonePath = `M ${bar.duration.x} ${milestoneCenterY - milestoneHalf} L ${bar.duration.x + milestoneHalf} ${milestoneCenterY} L ${bar.duration.x} ${milestoneCenterY + milestoneHalf} L ${bar.duration.x - milestoneHalf} ${milestoneCenterY} Z`;
            return (
              <g
                key={bar.id}
                data-part="task"
                data-datum-id={bar.id}
                data-mark-index={bar.index % 5}
                data-kind={isMilestone ? 'milestone' : 'task'}
                role="img"
                aria-label={`${bar.name}${isMilestone ? ' (milestone)' : ''}${bar.progressValue != null ? `: ${bar.progressValue}% complete` : ''}.`}
              >
                {showTitles && task ? <title>{tooltipFor(task)}</title> : null}
                {isMilestone ? (
                  <path
                    data-part="task-milestone"
                    data-color-source={bar.colorSource}
                    d={milestonePath}
                    style={{ '--_ds-gantt-milestone-fill': bar.color } as CSSProperties}
                    aria-hidden="true"
                  >
                    {shouldAnimate ? (
                      <animate
                        attributeName="opacity"
                        from="0"
                        to="1"
                        begin={`${Math.round(bar.index * 50)}ms`}
                        dur={`${animationDuration}ms`}
                      />
                    ) : null}
                  </path>
                ) : (
                  <rect
                    data-part="task-duration"
                    data-color-source={bar.colorSource}
                    x={bar.duration.x}
                    y={bar.duration.y}
                    width={bar.duration.width}
                    height={bar.duration.height}
                    rx={4}
                    fill={bar.color}
                    opacity={0.25}
                    aria-hidden="true"
                  >
                    {shouldAnimate ? (
                      <animate
                        attributeName="opacity"
                        from="0"
                        to="0.25"
                        begin={`${Math.round(bar.index * 50)}ms`}
                        dur={`${animationDuration}ms`}
                        fill="freeze"
                      />
                    ) : null}
                  </rect>
                )}
                {!isMilestone && bar.progress ? (
                  <rect
                    data-part="task-progress"
                    data-color-source={bar.colorSource}
                    x={bar.progress.x}
                    y={bar.progress.y}
                    width={bar.progress.width}
                    height={bar.progress.height}
                    rx={4}
                    fill={bar.color}
                    aria-hidden="true"
                  >
                    {shouldAnimate ? (
                      <animate
                        attributeName="opacity"
                        from="0"
                        to="1"
                        begin={`${Math.round(bar.index * 50)}ms`}
                        dur={`${animationDuration}ms`}
                        fill="freeze"
                      />
                    ) : null}
                  </rect>
                ) : null}
              </g>
            );
          })}
        </g>

        {geometry.today ? (
          <g data-part="today" aria-hidden="true">
            <line
              data-part="today-marker"
              x1={geometry.today.x}
              y1={geometry.today.y1}
              x2={geometry.today.x}
              y2={geometry.today.y2}
              strokeWidth={1.5}
              strokeDasharray="4,3"
            />
            <text
              data-part="today-label"
              x={geometry.today.labelX}
              y={geometry.today.labelY}
              textAnchor="middle"
            >
              {todayLabel}
            </text>
          </g>
        ) : null}
      </g>
    </ChartRendererSurface>
  );
}
