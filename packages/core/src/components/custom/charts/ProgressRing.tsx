'use client';

/**
 * ProgressRing - Circular progress indicator
 * Token-driven: colors and animation from tokens.
 */

import React from 'react';
import type { DesignTokens } from '../../../types';

export interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  tokens: DesignTokens;
  color?: string;
  trackColor?: string;
  showLabel?: boolean;
  label?: string;
}

export function ProgressRing({
  value,
  max = 100,
  size = 64,
  strokeWidth = 6,
  tokens,
  color,
  trackColor,
  showLabel = true,
  label,
}: ProgressRingProps): React.ReactElement {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / (max || 1), 1);
  const dashArray = `${pct * circumference} ${circumference}`;
  const center = size / 2;

  const fillColor = color || (
    pct >= 0.8 ? tokens.colors.successScale[500]
    : pct >= 0.5 ? tokens.colors.warningScale[500]
    : tokens.colors.errorScale[500]
  );

  const track = trackColor || tokens.colors.neutral[100];
  const animate = tokens.personality.chart.animateOnMount;
  const duration = tokens.personality.chart.mountDuration;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={track}
        strokeWidth={strokeWidth}
      />
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={fillColor}
        strokeWidth={strokeWidth}
        strokeDasharray={dashArray}
        strokeLinecap="round"
        transform={`rotate(-90 ${center} ${center})`}
        style={animate ? {
          transition: `stroke-dasharray ${duration}ms ease`,
        } : undefined}
      />
      {showLabel && (
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="central"
          fill={tokens.colors.neutral[900]}
          fontSize={size >= 64 ? tokens.typography.fontSize.sm : '0.625rem'}
          fontWeight={tokens.typography.fontWeight.bold}
        >
          {label ?? `${Math.round(pct * 100)}%`}
        </text>
      )}
    </svg>
  );
}
