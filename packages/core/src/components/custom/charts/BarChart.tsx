'use client';

/**
 * BarChart - Horizontal/Vertical bar chart
 * Token-driven: colors from tokens, animation stagger from personality.
 */

import React from 'react';
import type { DesignTokens } from '../../../types';

export interface BarChartItem {
  label: string;
  value: number;
  color?: string;
}

export interface BarChartProps {
  data: BarChartItem[];
  tokens: DesignTokens;
  direction?: 'horizontal' | 'vertical';
  height?: number;
  showValues?: boolean;
  maxValue?: number;
  barHeight?: number;
}

export function BarChart({
  data,
  tokens,
  direction = 'horizontal',
  height = 200,
  showValues = true,
  maxValue,
  barHeight = 28,
}: BarChartProps): React.ReactElement | null {
  if (!data || data.length === 0) return null;

  const max = maxValue || Math.max(...data.map(d => d.value), 1);
  const animate = tokens.personality.chart.animateOnMount;
  const stagger = tokens.personality.animation.staggerDelay;
  const duration = tokens.personality.chart.mountDuration;

  if (direction === 'horizontal') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
        {data.map((item, i) => {
          const pct = (item.value / max) * 100;
          const color = item.color || tokens.colors.primaryScale[500];
          const delay = animate ? Math.min(i * stagger, tokens.personality.animation.staggerMax) : 0;

          return (
            <div
              key={item.label}
              style={{
                display: 'grid',
                gridTemplateColumns: '100px 1fr 40px',
                alignItems: 'center',
                gap: tokens.spacing[3],
              }}
            >
              <span
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[600],
                  textAlign: 'right',
                  fontWeight: tokens.typography.fontWeight.medium,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.label}
              </span>
              <div
                style={{
                  height: barHeight,
                  backgroundColor: tokens.colors.neutral[100],
                  borderRadius: tokens.borderRadius.sm,
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: `${pct}%`,
                    backgroundColor: color,
                    borderRadius: tokens.borderRadius.sm,
                    transition: animate ? `width ${duration}ms ease ${delay}ms` : 'none',
                  }}
                />
              </div>
              {showValues && (
                <span
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[700],
                  }}
                >
                  {item.value}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Vertical bars
  const barWidth = Math.max(12, Math.floor((height * 0.8) / data.length));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: tokens.spacing[1], height }}>
      {data.map((item, i) => {
        const pct = (item.value / max) * 100;
        const color = item.color || tokens.colors.primaryScale[500];
        const delay = animate ? Math.min(i * stagger, tokens.personality.animation.staggerMax) : 0;

        return (
          <div
            key={item.label}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: tokens.spacing[1],
              flex: 1,
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: barWidth,
                height: `${pct}%`,
                backgroundColor: color,
                borderRadius: `${tokens.borderRadius.sm} ${tokens.borderRadius.sm} 0 0`,
                transition: animate ? `height ${duration}ms ease ${delay}ms` : 'none',
                minHeight: 2,
              }}
            />
            <span
              style={{
                fontSize: '0.625rem',
                color: tokens.colors.neutral[500],
                textAlign: 'center',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '100%',
              }}
            >
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
