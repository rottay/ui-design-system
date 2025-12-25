/**
 * DashboardCard - Chart Preset
 * Value + mini sparkline chart
 */

// import React from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { DashboardCardProps } from '../../core';

// Simple SVG sparkline renderer
function Sparkline({ data, color, width = 100, height = 40 }: {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export const ChartDashboardCard = createPreset<DashboardCardProps>({
  name: 'DashboardCard.Chart',
  render: ({ primitives, props, tokens }: PresetContext<DashboardCardProps>) => {
    const { Card, Box, Stack, Spinner } = primitives;
    const { title, value, chartData = [], trend, color = 'default', onClick, loading, className, style } = props;

    const colorMap = {
      default: tokens.colors.primary,
      primary: tokens.colors.primary,
      success: tokens.colors.success,
      warning: tokens.colors.warning,
      error: tokens.colors.error,
    };

    const chartColor = colorMap[color];

    return (
      <Card
        variant="elevated"
        padding="lg"
        hoverable={!!onClick}
        onClick={onClick}
        className={className}
        style={style}
      >
        {loading ? (
          <Box style={{ display: 'flex', justifyContent: 'center', padding: tokens.spacing[6] }}>
            <Spinner size="lg" />
          </Box>
        ) : (
          <Stack direction="vertical" spacing="md">
            <Box style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], fontWeight: 500 }}>
              {title}
            </Box>

            <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <Box>
                <Box style={{ fontSize: tokens.typography.fontSize['3xl'], fontWeight: 700 }}>
                  {value}
                </Box>
                {trend && (
                  <Box style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: trend.direction === 'up' ? tokens.colors.success : trend.direction === 'down' ? tokens.colors.error : tokens.colors.neutral[500],
                  }}>
                    {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'} {trend.value}% {trend.label}
                  </Box>
                )}
              </Box>

              {chartData.length > 1 && (
                <Box style={{ opacity: 0.8 }}>
                  <Sparkline data={chartData} color={chartColor} width={80} height={32} />
                </Box>
              )}
            </Box>
          </Stack>
        )}
      </Card>
    );
  },
});
