'use client';

/**
 * Sparkline - Mini line chart for KPIs
 * Token-driven: colors from tokens, curve from personality.chart.lineStyle,
 * gradient fill from personality.chart.useGradientFill.
 */

import React, { useId } from 'react';
import type { DesignTokens } from '../../../types';

export interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  tokens: DesignTokens;
  color?: string;
  trend?: 'up' | 'down' | 'flat';
  showArea?: boolean;
  strokeWidth?: number;
}

function computePoints(data: number[], width: number, height: number, padding: number): string {
  if (data.length < 2) return '';
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = (width - padding * 2) / (data.length - 1);
  return data
    .map((v, i) => {
      const x = padding + i * stepX;
      const y = height - padding - ((v - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');
}

function computeAreaPoints(data: number[], width: number, height: number, padding: number): string {
  if (data.length < 2) return '';
  const line = computePoints(data, width, height, padding);
  const stepX = (width - padding * 2) / (data.length - 1);
  const lastX = padding + (data.length - 1) * stepX;
  return `${padding},${height - padding} ${line} ${lastX},${height - padding}`;
}

export function Sparkline({
  data,
  width = 80,
  height = 32,
  tokens,
  color,
  trend = 'flat',
  showArea,
  strokeWidth = 1.5,
}: SparklineProps): React.ReactElement | null {
  const id = useId();
  if (!data || data.length < 2) return null;

  const useGradient = showArea ?? tokens.personality.chart.useGradientFill;
  const lineColor = color || (
    trend === 'up' ? tokens.colors.successScale[500]
    : trend === 'down' ? tokens.colors.errorScale[500]
    : tokens.colors.primaryScale[500]
  );

  const areaColor = color || (
    trend === 'up' ? tokens.colors.successScale[400]
    : trend === 'down' ? tokens.colors.errorScale[400]
    : tokens.colors.primaryScale[400]
  );

  const padding = 2;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {useGradient && (
        <defs>
          <linearGradient id={`spark-grad-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={areaColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={areaColor} stopOpacity="0" />
          </linearGradient>
        </defs>
      )}
      {useGradient && (
        <polygon
          points={computeAreaPoints(data, width, height, padding)}
          fill={`url(#spark-grad-${id})`}
        />
      )}
      <polyline
        points={computePoints(data, width, height, padding)}
        fill="none"
        stroke={lineColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
