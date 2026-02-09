'use client';

/**
 * DonutChart - Distribution visualizations
 * Token-driven: colors from tokens, animation from personality.chart.
 */

import React, { useId } from 'react';
import type { DesignTokens } from '../../../types';

export interface DonutChartSegment {
  label: string;
  value: number;
  color?: string;
}

export interface DonutChartProps {
  data: DonutChartSegment[];
  size?: number;
  thickness?: number;
  tokens: DesignTokens;
  centerLabel?: string;
  centerValue?: string;
}

const CATEGORY_COLORS = [
  'var(--color-primary-500)',
  'var(--color-secondary-500)',
  'var(--color-info-500)',
  'var(--color-success-500)',
  'var(--color-warning-500)',
  'var(--color-error-500)',
  'var(--color-primary-300)',
  'var(--color-secondary-300)',
];

export function DonutChart({
  data,
  size = 120,
  thickness = 16,
  tokens,
  centerLabel,
  centerValue,
}: DonutChartProps): React.ReactElement | null {
  if (!data || data.length === 0) return null;

  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return null;

  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let accumulated = 0;
  const segments = data.map((segment, i) => {
    const pct = segment.value / total;
    const dashArray = `${pct * circumference} ${circumference}`;
    const rotation = (accumulated / total) * 360 - 90;
    accumulated += segment.value;

    return {
      ...segment,
      dashArray,
      rotation,
      color: segment.color || CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    };
  });

  const animate = tokens.personality.chart.animateOnMount;
  const duration = tokens.personality.chart.mountDuration;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background track */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={tokens.colors.neutral[100]}
        strokeWidth={thickness}
      />
      {/* Segments */}
      {segments.map((seg, i) => (
        <circle
          key={i}
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={seg.color}
          strokeWidth={thickness}
          strokeDasharray={seg.dashArray}
          strokeLinecap="round"
          transform={`rotate(${seg.rotation} ${center} ${center})`}
          style={animate ? {
            transition: `stroke-dasharray ${duration}ms ease ${i * 50}ms`,
          } : undefined}
        />
      ))}
      {/* Center text */}
      {(centerValue || centerLabel) && (
        <>
          {centerValue && (
            <text
              x={center}
              y={centerLabel ? center - 4 : center}
              textAnchor="middle"
              dominantBaseline="central"
              fill={tokens.colors.neutral[900]}
              fontSize={tokens.typography.fontSize.lg}
              fontWeight={tokens.typography.fontWeight.bold}
            >
              {centerValue}
            </text>
          )}
          {centerLabel && (
            <text
              x={center}
              y={centerValue ? center + 12 : center}
              textAnchor="middle"
              dominantBaseline="central"
              fill={tokens.colors.neutral[500]}
              fontSize={tokens.typography.fontSize.xs}
            >
              {centerLabel}
            </text>
          )}
        </>
      )}
    </svg>
  );
}
