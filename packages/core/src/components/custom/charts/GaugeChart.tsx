'use client';

/**
 * GaugeChart - Semi-circular gauge indicator
 * Token-driven: colors by zones, animation from personality.
 */

import React from 'react';
import type { DesignTokens } from '../../../types';

export interface GaugeChartProps {
  value: number;
  min?: number;
  max?: number;
  size?: number;
  tokens: DesignTokens;
  label?: string;
  zones?: { threshold: number; color: string }[];
}

export function GaugeChart({
  value,
  min = 0,
  max = 100,
  size = 120,
  tokens,
  label,
  zones,
}: GaugeChartProps): React.ReactElement {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  // Semi-circle: 180 degrees
  const semiCircumference = Math.PI * radius;
  const range = max - min || 1;
  const pct = Math.min(Math.max((value - min) / range, 0), 1);
  const dashArray = `${pct * semiCircumference} ${semiCircumference}`;

  const defaultZones = [
    { threshold: 0.33, color: tokens.colors.errorScale[500] },
    { threshold: 0.66, color: tokens.colors.warningScale[500] },
    { threshold: 1, color: tokens.colors.successScale[500] },
  ];

  const activeZones = zones || defaultZones;
  const fillColor = activeZones.find(z => pct <= z.threshold)?.color || tokens.colors.successScale[500];

  const animate = tokens.personality.chart.animateOnMount;
  const duration = tokens.personality.chart.mountDuration;

  return (
    <svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.65}`}>
      {/* Track */}
      <path
        d={`M ${strokeWidth / 2} ${center} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${center}`}
        fill="none"
        stroke={tokens.colors.neutral[100]}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Value arc */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={fillColor}
        strokeWidth={strokeWidth}
        strokeDasharray={dashArray}
        strokeDashoffset={0}
        strokeLinecap="round"
        transform={`rotate(180 ${center} ${center})`}
        style={animate ? {
          transition: `stroke-dasharray ${duration}ms ease`,
        } : undefined}
      />
      {/* Value text */}
      <text
        x={center}
        y={center - 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill={tokens.colors.neutral[900]}
        fontSize={tokens.typography.fontSize.xl}
        fontWeight={tokens.typography.fontWeight.bold}
      >
        {value}
      </text>
      {label && (
        <text
          x={center}
          y={center + 14}
          textAnchor="middle"
          dominantBaseline="central"
          fill={tokens.colors.neutral[500]}
          fontSize={tokens.typography.fontSize.xs}
        >
          {label}
        </text>
      )}
    </svg>
  );
}
