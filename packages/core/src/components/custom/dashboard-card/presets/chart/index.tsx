'use client';

/**
 * DashboardCard - Chart Preset
 * Value + mini sparkline SVG chart, engine-differentiated
 */

import { useState, useMemo} from 'react';
import { createPreset, PresetContext } from '../../../factory';
import {
  createAccentBarStyle, createCardStyle 
} from '../../../helpers';
import type { DashboardCardProps } from '../../core';

function Sparkline({ data, color, gradientColor, width = 100, height = 40 }: {
  data: number[];
  color: string;
  gradientColor?: string;
  width?: number;
  height?: number;
}) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = padding + (height - padding * 2) - ((value - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  // Area fill path
  const areaPoints = `0,${height} ${points} ${width},${height}`;
  const gradientId = `sparkline-${Math.random().toString(36).slice(2)}`;

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={gradientColor || color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={gradientColor || color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon fill={`url(#${gradientId})`} points={areaPoints} />
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
  render: ({ primitives, props, tokens, engine }: PresetContext<DashboardCardProps>) => {
    const { Box, Stack, Spinner } = primitives;
    const { title, value, chartData = [], trend, color = 'default', onClick, loading, className, style } = props;
    const [isHovered, setIsHovered] = useState(false);

    const scaleMap: Record<string, any> = {
      default: tokens.colors.primaryScale,
      primary: tokens.colors.primaryScale,
      success: tokens.colors.successScale,
      warning: tokens.colors.warningScale,
      error: tokens.colors.errorScale,
    };
    const scale = scaleMap[color] || tokens.colors.primaryScale;

    const trendScale = trend?.direction === 'up'
      ? tokens.colors.successScale
      : trend?.direction === 'down'
        ? tokens.colors.errorScale
        : tokens.colors.neutral;

    const cardStyle = useMemo(() => createCardStyle(tokens, {
      elevation: isHovered && onClick ? 'md' : 'sm',
      padding: tokens.spacing[5],
      interactive: !!onClick,
      glass: tokens.surface.useGlass,
    }), [tokens, engine, onClick]);

    return (
      <div
        className={className}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
        style={{
          ...cardStyle,
          transform: isHovered && onClick ? tokens.motion.transform : 'none',
          ...style,
        }}
      >
        <div style={createAccentBarStyle(tokens, { position: 'top' })} />
        {loading ? (
          <Box style={{ display: 'flex', justifyContent: 'center', padding: tokens.spacing[6] }}>
            <Spinner size="lg" />
          </Box>
        ) : (
          <Stack direction="vertical" spacing="md">
            <Box
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                fontWeight: tokens.typography.fontWeight.medium,
              }}
            >
              {title}
            </Box>

            <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <Box>
                <Box
                  style={{
                    fontSize: tokens.typography.fontSize['3xl'],
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.neutral[900],
                    lineHeight: tokens.typography.lineHeight.tight,
                  }}
                >
                  {value}
                </Box>
                {trend && (
                  <Box
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: tokens.spacing[1],
                      fontSize: tokens.typography.fontSize.sm,
                      color: trendScale[600],
                      fontWeight: tokens.typography.fontWeight.medium,
                    }}
                  >
                    {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'} {trend.value}%
                    {trend.label && (
                      <span style={{ color: tokens.colors.neutral[400], fontWeight: tokens.typography.fontWeight.normal }}>
                        {' '}{trend.label}
                      </span>
                    )}
                  </Box>
                )}
              </Box>

              {chartData.length > 1 && (
                <Box style={{ flexShrink: 0 }}>
                  <Sparkline
                    data={chartData}
                    color={scale[500]}
                    gradientColor={scale[400]}
                    width={90}
                    height={36}
                  />
                </Box>
              )}
            </Box>
          </Stack>
        )}
      </div>
    );
  },
});
