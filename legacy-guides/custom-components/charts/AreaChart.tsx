'use client';

/**
 * AreaChart - Time-series area/line chart
 * Token-driven: gradient fill from personality.chart, curve from lineStyle.
 */

import React, { useId, useMemo } from 'react';
import type { DesignTokens } from '../../../types';

export interface AreaChartPoint {
  label: string;
  value: number;
}

export interface AreaChartProps {
  data: AreaChartPoint[];
  tokens: DesignTokens;
  width?: number;
  height?: number;
  color?: string;
  showGrid?: boolean;
  showLabels?: boolean;
}

function buildPath(
  data: AreaChartPoint[],
  width: number,
  height: number,
  padding: { top: number; right: number; bottom: number; left: number },
  smooth: boolean,
): { linePath: string; areaPath: string } {
  if (data.length < 2) return { linePath: '', areaPath: '' };

  const values = data.map(d => d.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const points = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * plotW,
    y: padding.top + plotH - ((d.value - min) / range) * plotH,
  }));

  let linePath: string;
  if (smooth && points.length > 2) {
    // Monotone cubic interpolation approximation
    linePath = `M${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      linePath += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
  } else {
    linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  }

  const bottomY = padding.top + plotH;
  const areaPath = `${linePath} L${points[points.length - 1].x},${bottomY} L${points[0].x},${bottomY} Z`;

  return { linePath, areaPath };
}

export function AreaChart({
  data,
  tokens,
  width = 400,
  height = 200,
  color,
  showGrid = true,
  showLabels = true,
}: AreaChartProps): React.ReactElement | null {
  const id = useId();
  if (!data || data.length < 2) return null;

  const lineColor = color || tokens.colors.primaryScale[500];
  const useGradient = tokens.personality.chart.useGradientFill;
  const smooth = tokens.personality.chart.lineStyle === 'smooth';
  const showDots = tokens.personality.chart.showDots;

  const padding = { top: 12, right: 12, bottom: showLabels ? 28 : 12, left: 12 };

  const { linePath, areaPath } = useMemo(
    () => buildPath(data, width, height, padding, smooth),
    [data, width, height, smooth],
  );

  const values = data.map(d => d.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={`area-grad-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lineColor} stopOpacity="0.25" />
          <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {showGrid && [0, 0.25, 0.5, 0.75, 1].map((pct) => {
        const y = padding.top + plotH * (1 - pct);
        return (
          <line
            key={pct}
            x1={padding.left}
            y1={y}
            x2={width - padding.right}
            y2={y}
            stroke={tokens.colors.neutral[100]}
            strokeWidth="1"
          />
        );
      })}

      {/* Area fill */}
      {useGradient && (
        <path d={areaPath} fill={`url(#area-grad-${id})`} />
      )}

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke={lineColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dots */}
      {showDots && data.map((d, i) => {
        const x = padding.left + (i / (data.length - 1)) * plotW;
        const y = padding.top + plotH - ((d.value - min) / range) * plotH;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={3}
            fill={tokens.colors.common.white}
            stroke={lineColor}
            strokeWidth="2"
          />
        );
      })}

      {/* X-axis labels */}
      {showLabels && data.map((d, i) => {
        // Show max ~6 labels to avoid overlap
        if (data.length > 6 && i % Math.ceil(data.length / 6) !== 0 && i !== data.length - 1) return null;
        const x = padding.left + (i / (data.length - 1)) * plotW;
        return (
          <text
            key={i}
            x={x}
            y={height - 4}
            textAnchor="middle"
            fill={tokens.colors.neutral[400]}
            fontSize="10"
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}
