'use client';

/**
 * SparklineWidget - Line Preset
 * Gradient stroke line chart with area fill, data point markers,
 * animated drawing, min/max badges, and hover-interactive card wrapper.
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

export const Line = createPreset<SparklineWidgetProps>((context: PresetContext<SparklineWidgetProps>) => {
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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
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
  const prevValue = data.length > 1 ? data[data.length - 2] : lastValue;
  const trendUp = lastValue >= prevValue;
  const trendPct = prevValue !== 0 ? Math.abs(((lastValue - prevValue) / prevValue) * 100).toFixed(1) : '0.0';

  const padding = tokens.spacing[2];
  const chartW = width;
  const chartH = height;

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (chartW - padding * 2);
    const y = padding + (1 - (value - min) / range) * (chartH - padding * 2);
    return { x, y, value };
  });

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');
  const areaPoints = `${points[0].x},${chartH} ${polylinePoints} ${points[points.length - 1].x},${chartH}`;

  const gradientStrokeId = `stroke-${uniqueId}`;
  const gradientFillId = `fill-${uniqueId}`;

  const totalLength = points.reduce((acc, p, i) => {
    if (i === 0) return 0;
    const prev = points[i - 1];
    return acc + Math.sqrt((p.x - prev.x) ** 2 + (p.y - prev.y) ** 2);
  }, 0);

  const minIndex = data.indexOf(min);
  const maxIndex = data.indexOf(max);

  return (
    <div
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setHoveredIndex(null); }}
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
        {/* Trend Indicator */}
        <Box style={{
          ...createBadgeStyle(tokens, trendUp ? 'success' : 'error'),
          gap: tokens.spacing[1],
        }}>
          <span>{trendUp ? '\u2191' : '\u2193'}</span>
          <span>{trendPct}%</span>
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
            <linearGradient id={gradientStrokeId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={scale[300]} />
              <stop offset="50%" stopColor={scale[500]} />
              <stop offset="100%" stopColor={scale[700]} />
            </linearGradient>
            <linearGradient id={gradientFillId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={scale[400]} stopOpacity="0.3" />
              <stop offset="60%" stopColor={scale[200]} stopOpacity="0.1" />
              <stop offset="100%" stopColor={scale[100]} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <polygon points={areaPoints} fill={`url(#${gradientFillId})`} />

          {/* Animated line */}
          <polyline
            points={polylinePoints}
            fill="none"
            stroke={`url(#${gradientStrokeId})`}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={totalLength}
            strokeDashoffset="0"
            style={{ transition: `stroke-dashoffset ${tokens.transitions?.slow || '1s'} ease-out` }}
          />

          {/* Data point dots */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={hoveredIndex === i ? 5 : (i === minIndex || i === maxIndex ? 3.5 : 2)}
              fill={hoveredIndex === i ? scale[600] : (i === minIndex || i === maxIndex ? scale[500] : scale[300])}
              stroke={tokens.colors.common.white}
              strokeWidth={hoveredIndex === i ? 2 : 1}
              style={{ transition: `all ${tokens.transitions?.fast || tokens.motion.hover}`, cursor: 'pointer' }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ))}

          {/* Hover value tooltip */}
          {hoveredIndex !== null && (
            <g>
              <rect
                x={points[hoveredIndex].x - 18}
                y={points[hoveredIndex].y - 26}
                width={36}
                height={18}
                rx={4}
                fill={scale[700]}
              />
              <text
                x={points[hoveredIndex].x}
                y={points[hoveredIndex].y - 14}
                textAnchor="middle"
                fill={tokens.colors.common.white}
                fontSize={tokens.typography.fontSize.xs}
                fontWeight={tokens.typography.fontWeight.semibold}
              >
                {points[hoveredIndex].value}
              </text>
            </g>
          )}
        </svg>
      </Box>

      {/* Min/Max Badges */}
      <Box style={{ display: 'flex', justifyContent: 'space-between', padding: `0 ${tokens.spacing[4]}px ${tokens.spacing[3]}px` }}>
        <Box style={{ ...createBadgeStyle(tokens, 'info'), gap: tokens.spacing[1] }}>
          <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.infoScale[500] }}>Min</span>
          <span style={{ fontWeight: tokens.typography.fontWeight.semibold }}>{min}</span>
        </Box>
        <Box style={{ ...createBadgeStyle(tokens, 'primary'), gap: tokens.spacing[1] }}>
          <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.primaryScale[500] }}>Max</span>
          <span style={{ fontWeight: tokens.typography.fontWeight.semibold }}>{max}</span>
        </Box>
      </Box>
    </div>
  );
});
