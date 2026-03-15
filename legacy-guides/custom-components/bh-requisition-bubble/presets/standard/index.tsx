'use client';

/**
 * BhRequisitionBubble - Standard Preset
 * Pure SVG bubble chart with axis labels, grid lines, sized circles,
 * category legend, hover tooltips, and scale-in entrance animation.
 *
 * No D3 dependency — all calculations are inline.
 * Colors sourced exclusively from design tokens.
 */

import { useMemo, useState, useCallback, useEffect } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { BhRequisitionBubbleProps, BubbleDataPoint } from '../../core';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Format axis tick value */
function formatTickValue(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  if (Number.isInteger(v)) return v.toString();
  return v.toFixed(1);
}

/** Generate nice tick values for an axis range */
function generateTicks(min: number, max: number, count: number = 5): number[] {
  if (min === max) return [min];
  const range = max - min;
  const rawStep = range / (count - 1);
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const niceSteps = [1, 2, 5, 10];
  const step =
    magnitude *
    (niceSteps.find((s) => s * magnitude >= rawStep) ?? 10);

  const ticks: number[] = [];
  let tick = Math.ceil(min / step) * step;
  while (tick <= max + step * 0.001) {
    ticks.push(tick);
    tick += step;
  }
  return ticks;
}

/* ------------------------------------------------------------------ */
/*  Default category colors from tokens                                */
/* ------------------------------------------------------------------ */

function getDefaultCategoryColors(t: PresetContext['tokens']): string[] {
  return [
    t.colors.primaryScale[500],
    t.colors.secondaryScale[500],
    t.colors.successScale[500],
    t.colors.warningScale[500],
    t.colors.infoScale[500],
    t.colors.errorScale[400],
    t.colors.primaryScale[400],
    t.colors.secondaryScale[400],
  ];
}

/* ------------------------------------------------------------------ */
/*  Tooltip type                                                       */
/* ------------------------------------------------------------------ */

interface TooltipInfo {
  x: number;
  y: number;
  label: string;
  xValue: string;
  yValue: string;
  sizeValue: string;
  customTooltip?: string;
}

/* ------------------------------------------------------------------ */
/*  Preset                                                             */
/* ------------------------------------------------------------------ */

export const StandardBhRequisitionBubble = createPreset<BhRequisitionBubbleProps>({
  name: 'BhRequisitionBubble.Standard',
  render: (ctx: PresetContext<BhRequisitionBubbleProps>) => {
    const { props, tokens: t } = ctx;

    const {
      data,
      width = 600,
      height = 400,
      animate = true,
      onBubbleClick,
      showGrid = true,
      showLegend = true,
      className,
      style,
    } = props;

    const points = data?.points ?? [];
    const xAxis = data?.xAxis ?? { label: 'X' };
    const yAxis = data?.yAxis ?? { label: 'Y' };
    const sizeLabel = data?.sizeLabel ?? 'Size';
    const categories = data?.categories;

    const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [animationReady, setAnimationReady] = useState(!animate);

    // Entrance animation
    useEffect(() => {
      if (!animate) {
        setAnimationReady(true);
        return;
      }
      const timer = setTimeout(() => setAnimationReady(true), 50);
      return () => clearTimeout(timer);
    }, [animate]);

    const defaultColors = useMemo(() => getDefaultCategoryColors(t), [t]);

    // Build category color map
    const categoryColorMap = useMemo(() => {
      const map = new Map<string, string>();
      if (categories) {
        categories.forEach((c) => map.set(c.name, c.color));
      }
      // Assign fallback colors for categories without explicit color
      const uniqueCategories = Array.from(
        new Set(points.map((p) => p.category).filter(Boolean)),
      ) as string[];
      uniqueCategories.forEach((cat, i) => {
        if (!map.has(cat)) {
          map.set(cat, defaultColors[i % defaultColors.length]);
        }
      });
      return map;
    }, [categories, points, defaultColors]);

    // Chart area dimensions
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const legendHeight = showLegend && categoryColorMap.size > 0 ? 30 : 0;
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom - legendHeight;

    // Data ranges
    const { xMin, xMax, yMin, yMax, sizeMin, sizeMax } = useMemo(() => {
      if (points.length === 0) {
        return { xMin: 0, xMax: 1, yMin: 0, yMax: 1, sizeMin: 0, sizeMax: 1 };
      }
      const xs = points.map((p) => p.x);
      const ys = points.map((p) => p.y);
      const ss = points.map((p) => p.size);
      return {
        xMin: xAxis.min ?? Math.min(...xs),
        xMax: xAxis.max ?? Math.max(...xs),
        yMin: yAxis.min ?? Math.min(...ys),
        yMax: yAxis.max ?? Math.max(...ys),
        sizeMin: Math.min(...ss),
        sizeMax: Math.max(...ss),
      };
    }, [points, xAxis.min, xAxis.max, yAxis.min, yAxis.max]);

    // Bubble radius range
    const minRadius = 6;
    const maxRadius = Math.min(chartWidth, chartHeight) * 0.08;

    // Tick values
    const xTicks = useMemo(() => generateTicks(xMin, xMax), [xMin, xMax]);
    const yTicks = useMemo(() => generateTicks(yMin, yMax), [yMin, yMax]);

    // Scale functions
    const scaleX = useCallback(
      (v: number) => {
        const range = xMax - xMin || 1;
        return margin.left + ((v - xMin) / range) * chartWidth;
      },
      [xMin, xMax, chartWidth, margin.left],
    );

    const scaleY = useCallback(
      (v: number) => {
        const range = yMax - yMin || 1;
        return margin.top + chartHeight - ((v - yMin) / range) * chartHeight;
      },
      [yMin, yMax, chartHeight, margin.top],
    );

    const scaleSize = useCallback(
      (v: number) => {
        const range = sizeMax - sizeMin || 1;
        return lerp(minRadius, maxRadius, (v - sizeMin) / range);
      },
      [sizeMin, sizeMax, minRadius, maxRadius],
    );

    // Compute bubble positions
    const bubbles = useMemo(
      () =>
        points.map((p) => ({
          ...p,
          cx: scaleX(p.x),
          cy: scaleY(p.y),
          r: scaleSize(p.size),
          fill:
            p.color ??
            (p.category ? categoryColorMap.get(p.category) : undefined) ??
            t.colors.primaryScale[500],
        })),
      [points, scaleX, scaleY, scaleSize, categoryColorMap, t],
    );

    const handleBubbleEnter = useCallback(
      (
        bubble: (typeof bubbles)[0],
        e: React.MouseEvent,
      ) => {
        setHoveredId(bubble.id);
        setTooltip({
          x: e.nativeEvent.offsetX,
          y: e.nativeEvent.offsetY,
          label: bubble.label,
          xValue: `${xAxis.label}: ${formatTickValue(bubble.x)}`,
          yValue: `${yAxis.label}: ${formatTickValue(bubble.y)}`,
          sizeValue: `${sizeLabel}: ${formatTickValue(bubble.size)}`,
          customTooltip: bubble.tooltip,
        });
      },
      [xAxis.label, yAxis.label, sizeLabel],
    );

    const handleBubbleLeave = useCallback(() => {
      setHoveredId(null);
      setTooltip(null);
    }, []);

    /* -- Empty state ------------------------------------------------ */
    if (points.length === 0) {
      return (
        <svg
          className={className}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="No requisition data"
          style={{ display: 'block', ...style }}
        >
          <text
            x={width / 2}
            y={height / 2}
            textAnchor="middle"
            fill={t.colors.neutral[400]}
            fontSize={t.typography.fontSize.sm}
          >
            No data available
          </text>
        </svg>
      );
    }

    return (
      <div style={{ position: 'relative', display: 'inline-block', ...style }}>
        <svg
          className={className}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`Bubble chart: ${points.length} data points`}
          style={{ display: 'block', overflow: 'visible' }}
        >
          {/* Grid lines */}
          {showGrid && (
            <g>
              {xTicks.map((tick) => {
                const x = scaleX(tick);
                return (
                  <line
                    key={`xg-${tick}`}
                    x1={x}
                    y1={margin.top}
                    x2={x}
                    y2={margin.top + chartHeight}
                    stroke={t.colors.neutral[100]}
                    strokeWidth={1}
                  />
                );
              })}
              {yTicks.map((tick) => {
                const y = scaleY(tick);
                return (
                  <line
                    key={`yg-${tick}`}
                    x1={margin.left}
                    y1={y}
                    x2={margin.left + chartWidth}
                    y2={y}
                    stroke={t.colors.neutral[100]}
                    strokeWidth={1}
                  />
                );
              })}
            </g>
          )}

          {/* X axis */}
          <line
            x1={margin.left}
            y1={margin.top + chartHeight}
            x2={margin.left + chartWidth}
            y2={margin.top + chartHeight}
            stroke={t.colors.neutral[300]}
            strokeWidth={1}
          />
          {xTicks.map((tick) => {
            const x = scaleX(tick);
            return (
              <g key={`xt-${tick}`}>
                <line
                  x1={x}
                  y1={margin.top + chartHeight}
                  x2={x}
                  y2={margin.top + chartHeight + 5}
                  stroke={t.colors.neutral[300]}
                  strokeWidth={1}
                />
                <text
                  x={x}
                  y={margin.top + chartHeight + 18}
                  textAnchor="middle"
                  fill={t.colors.neutral[500]}
                  fontSize={t.typography.fontSize.xs}
                >
                  {formatTickValue(tick)}
                </text>
              </g>
            );
          })}
          {/* X axis label */}
          <text
            x={margin.left + chartWidth / 2}
            y={height - legendHeight - 6}
            textAnchor="middle"
            fill={t.colors.neutral[600]}
            fontSize={t.typography.fontSize.xs}
            fontWeight={t.typography.fontWeight.medium}
          >
            {xAxis.label}
          </text>

          {/* Y axis */}
          <line
            x1={margin.left}
            y1={margin.top}
            x2={margin.left}
            y2={margin.top + chartHeight}
            stroke={t.colors.neutral[300]}
            strokeWidth={1}
          />
          {yTicks.map((tick) => {
            const y = scaleY(tick);
            return (
              <g key={`yt-${tick}`}>
                <line
                  x1={margin.left - 5}
                  y1={y}
                  x2={margin.left}
                  y2={y}
                  stroke={t.colors.neutral[300]}
                  strokeWidth={1}
                />
                <text
                  x={margin.left - 8}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="central"
                  fill={t.colors.neutral[500]}
                  fontSize={t.typography.fontSize.xs}
                >
                  {formatTickValue(tick)}
                </text>
              </g>
            );
          })}
          {/* Y axis label */}
          <text
            x={14}
            y={margin.top + chartHeight / 2}
            textAnchor="middle"
            fill={t.colors.neutral[600]}
            fontSize={t.typography.fontSize.xs}
            fontWeight={t.typography.fontWeight.medium}
            transform={`rotate(-90, 14, ${margin.top + chartHeight / 2})`}
          >
            {yAxis.label}
          </text>

          {/* Bubbles */}
          {bubbles.map((bubble, i) => {
            const isHovered = hoveredId === bubble.id;
            return (
              <circle
                key={bubble.id}
                cx={bubble.cx}
                cy={bubble.cy}
                r={animationReady ? bubble.r : 0}
                fill={bubble.fill}
                fillOpacity={isHovered ? 1.0 : 0.7}
                stroke={isHovered ? t.colors.neutral[800] : 'none'}
                strokeWidth={isHovered ? 2 : 0}
                style={{
                  cursor: onBubbleClick ? 'pointer' : 'default',
                  transition: animate
                    ? `r 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.04}s, fill-opacity 0.2s ease, stroke-width 0.15s ease`
                    : 'fill-opacity 0.2s ease, stroke-width 0.15s ease',
                }}
                onMouseEnter={(e) => handleBubbleEnter(bubble, e)}
                onMouseMove={(e) =>
                  setTooltip((prev) =>
                    prev
                      ? {
                          ...prev,
                          x: e.nativeEvent.offsetX,
                          y: e.nativeEvent.offsetY,
                        }
                      : null,
                  )
                }
                onMouseLeave={handleBubbleLeave}
                onClick={() => onBubbleClick?.(bubble)}
              />
            );
          })}

          {/* Legend */}
          {showLegend && categoryColorMap.size > 0 && (
            <g
              transform={`translate(${margin.left}, ${height - legendHeight + 4})`}
            >
              {Array.from(categoryColorMap.entries()).map(
                ([name, color], i) => {
                  const xOffset = i * 100;
                  return (
                    <g key={name} transform={`translate(${xOffset}, 0)`}>
                      <circle cx={5} cy={6} r={4} fill={color} fillOpacity={0.8} />
                      <text
                        x={14}
                        y={6}
                        dominantBaseline="central"
                        fill={t.colors.neutral[600]}
                        fontSize={t.typography.fontSize.xs}
                      >
                        {name}
                      </text>
                    </g>
                  );
                },
              )}
            </g>
          )}
        </svg>

        {/* Tooltip overlay */}
        {tooltip && (
          <div
            style={{
              position: 'absolute',
              left: tooltip.x + 14,
              top: tooltip.y - 16,
              backgroundColor: t.colors.neutral[800],
              color: t.colors.common.white,
              padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
              borderRadius: t.borderRadius.md,
              fontSize: t.typography.fontSize.xs,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              zIndex: 10,
              boxShadow: t.shadows.md,
            }}
          >
            <div
              style={{
                fontWeight: t.typography.fontWeight.semibold,
                marginBottom: 2,
              }}
            >
              {tooltip.label}
            </div>
            {tooltip.customTooltip ? (
              <div style={{ color: t.colors.neutral[300] }}>
                {tooltip.customTooltip}
              </div>
            ) : (
              <>
                <div style={{ color: t.colors.neutral[300] }}>
                  {tooltip.xValue}
                </div>
                <div style={{ color: t.colors.neutral[300] }}>
                  {tooltip.yValue}
                </div>
                <div style={{ color: t.colors.neutral[300] }}>
                  {tooltip.sizeValue}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  },
});
