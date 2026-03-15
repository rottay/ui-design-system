'use client';

/**
 * SparklineWidget - Bar Preset
 * Gradient-filled bar chart with per-bar hover highlights, value labels,
 * animated growth, max badge, and card wrapper with accent bar.
 */

import { useState, useMemo, useId } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createAccentBarStyle,
  createBadgeStyle,
  createHoverStyle,
  getCardHoverShadow,
} from '../../../helpers';
import type { SparklineWidgetProps } from '../../core';

export const Bar = createPreset<SparklineWidgetProps>((context: PresetContext<SparklineWidgetProps>) => {
  const { primitives, props, tokens, engine } = context;
  const { Box, Text, Spinner } = primitives;
  const {
    data,
    color = 'primary',
    width = 200,
    height = 80,
    showValue,
    label,
    className,
    style,
  } = props;

  const [isHovered, setIsHovered] = useState(false);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const uniqueId = useId();
  const isGlass = tokens.surface.useGlass && !!tokens.glass;

  const scaleMap: Record<string, any> = {
    primary: tokens.colors.primaryScale,
    success: tokens.colors.successScale,
    warning: tokens.colors.warningScale,
    error: tokens.colors.errorScale,
  };
  const scale = scaleMap[color] || tokens.colors.primaryScale;

  const cardStyle = useMemo(() => ({
    ...createCardStyle(tokens, {
      elevation: isHovered ? 'md' : 'sm',
      glass: isGlass,
      interactive: true,
    }),
    position: 'relative' as const,
    overflow: 'hidden' as const,
    ...style,
  }), [tokens, isGlass, isHovered, style]);

  const loading = !data || data.length === 0;
  if (loading) {
    return (
      <Box className={className} style={{ ...cardStyle, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: height + tokens.spacing[12] }}>
        <Spinner size="lg" />
      </Box>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const lastValue = data[data.length - 1];
  const maxIndex = data.indexOf(max);

  const chartW = width;
  const chartH = height;
  const barGapRatio = 0.25;
  const barSlotWidth = chartW / data.length;
  const gap = barSlotWidth * barGapRatio;
  const barWidth = barSlotWidth - gap;

  const gradientBarId = `bar-grad-${uniqueId}`;
  const gradientBarHoverId = `bar-hover-${uniqueId}`;

  return (
    <div
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setHoveredBar(null); }}
      style={{
        ...cardStyle,
        transform: isHovered ? tokens.motion.transform : 'none',
      }}
    >
      <div style={createAccentBarStyle(tokens, { position: 'top', color: scale[400] })} />

      {/* Header Row */}
      <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, paddingBottom: tokens.spacing[1] }}>
        <Box>
          {label && (
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], fontWeight: tokens.typography.fontWeight.medium, marginBottom: tokens.spacing[1], display: 'block' }}>
              {label}
            </Text>
          )}
          {showValue && (
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], lineHeight: tokens.typography.lineHeight.tight }}>
              {lastValue}
            </Text>
          )}
        </Box>
        {/* Max Value Badge */}
        <Box style={{ ...createBadgeStyle(tokens, color === 'primary' ? 'primary' : color as any), gap: tokens.spacing[1] }}>
          <span style={{ fontSize: tokens.typography.fontSize.xs }}>Peak</span>
          <span style={{ fontWeight: tokens.typography.fontWeight.semibold }}>{max}</span>
        </Box>
      </Box>

      {/* Chart */}
      <Box style={{ padding: `0 ${tokens.spacing[3]}px ${tokens.spacing[3]}px` }}>
        <svg
          width="100%"
          height={chartH}
          viewBox={`0 0 ${chartW} ${chartH}`}
          preserveAspectRatio="none"
          style={{ display: 'block', overflow: 'visible' }}
        >
          <defs>
            <linearGradient id={gradientBarId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={scale[400]} />
              <stop offset="100%" stopColor={scale[600]} />
            </linearGradient>
            <linearGradient id={gradientBarHoverId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={scale[300]} />
              <stop offset="100%" stopColor={scale[500]} />
            </linearGradient>
          </defs>

          {data.map((value, index) => {
            const barH = ((value - min) / range) * (chartH - tokens.spacing[3]);
            const x = index * barSlotWidth + gap / 2;
            const y = chartH - barH;
            const isBarHovered = hoveredBar === index;
            const isMax = index === maxIndex;

            return (
              <g key={index}>
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  fill={isBarHovered ? `url(#${gradientBarHoverId})` : `url(#${gradientBarId})`}
                  rx={tokens.spacing[1]}
                  style={{
                    transition: `all ${tokens.transitions?.fast || tokens.motion.hover}`,
                    filter: isBarHovered ? `drop-shadow(0 2px 4px ${scale[300]})` : 'none',
                    opacity: isBarHovered || !isHovered ? 1 : 0.7,
                  }}
                  onMouseEnter={() => setHoveredBar(index)}
                  onMouseLeave={() => setHoveredBar(null)}
                  cursor="pointer"
                />

                {/* Max indicator dot */}
                {isMax && (
                  <circle
                    cx={x + barWidth / 2}
                    cy={y - tokens.spacing[2]}
                    r={3}
                    fill={scale[700]}
                  />
                )}

                {/* Hover value label */}
                {isBarHovered && (
                  <g>
                    <rect
                      x={x + barWidth / 2 - 16}
                      y={y - 24}
                      width={32}
                      height={18}
                      rx={4}
                      fill={scale[700]}
                    />
                    <text
                      x={x + barWidth / 2}
                      y={y - 12}
                      textAnchor="middle"
                      fill={tokens.colors.common.white}
                      fontSize={tokens.typography.fontSize.xs}
                      fontWeight={tokens.typography.fontWeight.semibold}
                    >
                      {value}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </Box>

      {/* Footer Stats */}
      <Box style={{ display: 'flex', justifyContent: 'space-between', padding: `0 ${tokens.spacing[4]}px ${tokens.spacing[3]}px`, borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, paddingTop: tokens.spacing[2] }}>
        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
          {data.length} points
        </Text>
        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
          Avg: {(data.reduce((a, b) => a + b, 0) / data.length).toFixed(1)}
        </Text>
      </Box>
    </div>
  );
});
