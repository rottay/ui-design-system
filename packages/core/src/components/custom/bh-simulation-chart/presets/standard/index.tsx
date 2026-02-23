'use client';

/**
 * BhSimulationChart - Standard Preset
 * SVG histogram with distribution bars, mean/median lines,
 * P10/P90 shaded region, optional target line, hover tooltips,
 * and smooth entrance animation.
 *
 * Layout:
 * - SVG canvas with axes
 * - Vertical bars for each distribution bucket
 * - Mean line (solid, primaryScale[600])
 * - Median line (dashed, primaryScale[400])
 * - P10/P90 shaded region (primaryScale[100] at 0.3 opacity)
 * - Optional target line (errorScale[500] dashed)
 * - X/Y axis labels
 * - Hover tooltip with value & frequency
 * - Legend
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  getPersonalityTypography,
  numericValue,
} from '../../../helpers';
import type { BhSimulationChartProps } from '../../core';
import { BH_SIMULATION_CHART_DEFAULTS } from '../../core';

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const StandardBhSimulationChart = createPreset<BhSimulationChartProps>(
  'StandardBhSimulationChart',
  ({ primitives: { Box, Text }, props, tokens }: PresetContext<BhSimulationChartProps>) => {
    const {
      data,
      width = BH_SIMULATION_CHART_DEFAULTS.width ?? 500,
      height = BH_SIMULATION_CHART_DEFAULTS.height ?? 260,
      showPercentiles = BH_SIMULATION_CHART_DEFAULTS.showPercentiles ?? true,
      showTarget = BH_SIMULATION_CHART_DEFAULTS.showTarget ?? true,
      animate = BH_SIMULATION_CHART_DEFAULTS.animate ?? true,
      className,
      style,
    } = props;

    // ========================================================================
    // STATE
    // ========================================================================

    const [hoveredBucket, setHoveredBucket] = useState<number | null>(null);
    const [animProgress, setAnimProgress] = useState(animate ? 0 : 1);

    // ========================================================================
    // ANIMATION
    // ========================================================================

    useEffect(() => {
      if (!animate) {
        setAnimProgress(1);
        return;
      }

      setAnimProgress(0);
      const start = performance.now();
      const duration = 600;

      function step(now: number) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setAnimProgress(eased);
        if (progress < 1) requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
    }, [animate, data]);

    // ========================================================================
    // DERIVED
    // ========================================================================

    const padding = useMemo(() => ({
      top: 24,
      right: 24,
      bottom: 40,
      left: 50,
    }), []);

    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;

    const buckets = data?.buckets ?? [];
    const maxFreq = useMemo(
      () => Math.max(...buckets.map((b) => b.frequency), 0.001),
      [buckets]
    );

    const minVal = buckets.length > 0 ? buckets[0].value : 0;
    const maxVal = buckets.length > 0 ? buckets[buckets.length - 1].value : 1;
    const valRange = maxVal - minVal || 1;

    const barGap = 2;
    const barWidth = buckets.length > 0
      ? (innerWidth / buckets.length) - barGap
      : 0;

    const toX = useCallback(
      (val: number) => padding.left + ((val - minVal) / valRange) * innerWidth,
      [padding.left, minVal, valRange, innerWidth]
    );

    const toBarX = useCallback(
      (idx: number) => padding.left + (idx / buckets.length) * innerWidth + barGap / 2,
      [padding.left, buckets.length, innerWidth]
    );

    const toY = useCallback(
      (freq: number) => padding.top + innerHeight - (freq / maxFreq) * innerHeight,
      [padding.top, innerHeight, maxFreq]
    );

    // ========================================================================
    // COLORS
    // ========================================================================

    const primaryFill = tokens.colors.primaryScale?.[500] ?? tokens.colors.primary;
    const primaryDark = tokens.colors.primaryScale?.[700] ?? tokens.colors.primary;
    const primaryMedium = tokens.colors.primaryScale?.[400] ?? tokens.colors.primary;
    const primaryLight = tokens.colors.primaryScale?.[100] ?? tokens.colors.primary;
    const primaryHover = tokens.colors.primaryScale?.[600] ?? tokens.colors.primary;
    const errorDashed = tokens.colors.errorScale?.[500] ?? tokens.colors.error;
    const textSecondary = tokens.colors.neutral[500];
    const borderColor = tokens.colors.neutral[200];

    // ========================================================================
    // TOOLTIP
    // ========================================================================

    const tooltipData = hoveredBucket !== null && buckets[hoveredBucket]
      ? buckets[hoveredBucket]
      : null;

    const tooltipX = hoveredBucket !== null ? toBarX(hoveredBucket) + barWidth / 2 : 0;
    const tooltipY = hoveredBucket !== null && tooltipData
      ? toY(tooltipData.frequency) - 10
      : 0;

    // ========================================================================
    // Y-AXIS TICKS
    // ========================================================================

    const yTicks = useMemo(() => {
      const count = 4;
      const ticks: number[] = [];
      for (let i = 0; i <= count; i++) {
        ticks.push((maxFreq / count) * i);
      }
      return ticks;
    }, [maxFreq]);

    // ========================================================================
    // X-AXIS LABELS
    // ========================================================================

    const xLabels = useMemo(() => {
      if (buckets.length <= 6) return buckets;
      const step = Math.max(1, Math.floor(buckets.length / 5));
      return buckets.filter((_, i) => i % step === 0 || i === buckets.length - 1);
    }, [buckets]);

    // ========================================================================
    // RENDER
    // ========================================================================

    if (!data || buckets.length === 0) {
      return (
        <Box
          style={{
            width,
            height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: tokens.colors.common.white,
            borderRadius: numericValue(tokens.borderRadius.md),
            border: `1px solid ${borderColor}`,
            ...style,
          }}
          className={className}
        >
          <Text style={{ fontSize: 13, color: textSecondary }}>No distribution data</Text>
        </Box>
      );
    }

    return (
      <Box
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          gap: numericValue(tokens.spacing[2]),
          ...style,
        }}
        className={className}
      >
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          style={{ overflow: 'visible' }}
        >
          {/* Y-axis */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + innerHeight}
            stroke={borderColor}
            strokeWidth={1}
          />
          {/* X-axis */}
          <line
            x1={padding.left}
            y1={padding.top + innerHeight}
            x2={padding.left + innerWidth}
            y2={padding.top + innerHeight}
            stroke={borderColor}
            strokeWidth={1}
          />

          {/* Y-axis ticks & labels */}
          {yTicks.map((tick, idx) => {
            const y = toY(tick);
            return (
              <g key={`y-${idx}`}>
                <line
                  x1={padding.left - 4}
                  y1={y}
                  x2={padding.left}
                  y2={y}
                  stroke={borderColor}
                  strokeWidth={1}
                />
                <text
                  x={padding.left - 8}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="central"
                  fontSize={10}
                  fill={textSecondary}
                >
                  {(tick * 100).toFixed(0)}%
                </text>
                {/* Grid line */}
                {idx > 0 && (
                  <line
                    x1={padding.left + 1}
                    y1={y}
                    x2={padding.left + innerWidth}
                    y2={y}
                    stroke={borderColor}
                    strokeWidth={0.5}
                    strokeDasharray="4 4"
                    opacity={0.4}
                  />
                )}
              </g>
            );
          })}

          {/* Y-axis label */}
          <text
            x={14}
            y={padding.top + innerHeight / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={10}
            fill={textSecondary}
            transform={`rotate(-90, 14, ${padding.top + innerHeight / 2})`}
          >
            Frequency
          </text>

          {/* P10/P90 shaded region */}
          {showPercentiles && (
            <rect
              x={Math.max(toX(data.p10), padding.left)}
              y={padding.top}
              width={Math.max(0, Math.min(toX(data.p90) - toX(data.p10), innerWidth))}
              height={innerHeight}
              fill={primaryLight}
              opacity={0.3}
            />
          )}

          {/* Distribution bars */}
          {buckets.map((bucket, idx) => {
            const fullBarHeight = (bucket.frequency / maxFreq) * innerHeight;
            const barHeight = fullBarHeight * animProgress;
            const x = toBarX(idx);
            const y = padding.top + innerHeight - barHeight;
            const isHovered = hoveredBucket === idx;

            return (
              <rect
                key={idx}
                x={x}
                y={y}
                width={Math.max(barWidth, 1)}
                height={Math.max(barHeight, 0)}
                fill={isHovered ? primaryHover : primaryFill}
                rx={1}
                style={{ transition: isHovered ? 'fill 0.15s' : undefined, cursor: 'crosshair' }}
                onMouseEnter={() => setHoveredBucket(idx)}
                onMouseLeave={() => setHoveredBucket(null)}
              />
            );
          })}

          {/* Mean line (solid) */}
          <line
            x1={toX(data.mean)}
            y1={padding.top}
            x2={toX(data.mean)}
            y2={padding.top + innerHeight}
            stroke={primaryDark}
            strokeWidth={2}
          />

          {/* Median line (dashed) */}
          <line
            x1={toX(data.median)}
            y1={padding.top}
            x2={toX(data.median)}
            y2={padding.top + innerHeight}
            stroke={primaryMedium}
            strokeWidth={1.5}
            strokeDasharray="6 4"
          />

          {/* Target line */}
          {showTarget && data.target != null && (
            <line
              x1={toX(data.target)}
              y1={padding.top}
              x2={toX(data.target)}
              y2={padding.top + innerHeight}
              stroke={errorDashed}
              strokeWidth={2}
              strokeDasharray="6 3"
            />
          )}

          {/* X-axis labels */}
          {xLabels.map((bucket) => {
            const idx = buckets.indexOf(bucket);
            const x = toBarX(idx) + barWidth / 2;
            return (
              <text
                key={`x-${idx}`}
                x={x}
                y={padding.top + innerHeight + 18}
                textAnchor="middle"
                fontSize={10}
                fill={textSecondary}
              >
                {Math.round(bucket.value)}
              </text>
            );
          })}

          {/* X-axis label */}
          <text
            x={padding.left + innerWidth / 2}
            y={height - 4}
            textAnchor="middle"
            fontSize={10}
            fill={textSecondary}
          >
            Hires
          </text>

          {/* Hover tooltip */}
          {tooltipData && hoveredBucket !== null && (
            <g>
              <rect
                x={tooltipX - 50}
                y={tooltipY - 34}
                width={100}
                height={30}
                rx={numericValue(tokens.borderRadius.sm)}
                fill={tokens.colors.neutral[900]}
                opacity={0.9}
              />
              <text
                x={tooltipX}
                y={tooltipY - 23}
                textAnchor="middle"
                fontSize={10}
                fill={tokens.colors.common.white}
                fontWeight={tokens.typography.fontWeight.semibold}
              >
                Value: {tooltipData.value.toFixed(1)}
              </text>
              <text
                x={tooltipX}
                y={tooltipY - 10}
                textAnchor="middle"
                fontSize={10}
                fill={tokens.colors.common.white}
              >
                Freq: {(tooltipData.frequency * 100).toFixed(1)}%
              </text>
            </g>
          )}
        </svg>

        {/* Legend */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: numericValue(tokens.spacing[4]),
            flexWrap: 'wrap' as const,
            paddingLeft: padding.left,
          }}
        >
          <Box style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width={16} height={3}><line x1={0} y1={1.5} x2={16} y2={1.5} stroke={primaryDark} strokeWidth={2} /></svg>
            <Text style={{ fontSize: 11, color: textSecondary }}>Mean</Text>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width={16} height={3}><line x1={0} y1={1.5} x2={16} y2={1.5} stroke={primaryMedium} strokeWidth={1.5} strokeDasharray="4 3" /></svg>
            <Text style={{ fontSize: 11, color: textSecondary }}>Median</Text>
          </Box>
          {showPercentiles && (
            <Box style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Box style={{ width: 16, height: 10, background: primaryLight, opacity: 0.5, borderRadius: 2 }} />
              <Text style={{ fontSize: 11, color: textSecondary }}>P10-P90</Text>
            </Box>
          )}
          {showTarget && data.target != null && (
            <Box style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width={16} height={3}><line x1={0} y1={1.5} x2={16} y2={1.5} stroke={errorDashed} strokeWidth={2} strokeDasharray="4 2" /></svg>
              <Text style={{ fontSize: 11, color: textSecondary }}>Target</Text>
            </Box>
          )}
        </Box>
      </Box>
    );
  }
);
