'use client';

/**
 * SparklineWidget - Area Preset
 * Multi-stop gradient area fill with hover crosshair, data point markers,
 * min/max labels, trend badge, and engine-aware card wrapper.
 */

import { useState, useMemo, useId } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createAccentBarStyle,
  createBadgeStyle,
} from '../../../helpers';
import type { SparklineWidgetProps } from '../../core';

export const Area = createPreset<SparklineWidgetProps>((context: PresetContext<SparklineWidgetProps>) => {
  const { primitives, props, tokens, engine } = context;
  const { Box, Text, Spinner } = primitives;
  const { data, color = 'primary', width = 200, height = 80, showValue, label, className, style } = props;

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
  const pad = tokens.spacing[2];
  const minIdx = data.indexOf(min);
  const maxIdx = data.indexOf(max);

  const points = data.map((value, i) => ({
    x: pad + (i / (data.length - 1)) * (width - pad * 2),
    y: pad + (1 - (value - min) / range) * (height - pad * 2),
    value,
  }));

  const polyline = points.map(p => `${p.x},${p.y}`).join(' ');
  const area = `${points[0].x},${height} ${polyline} ${points[points.length - 1].x},${height}`;
  const fillId = `area-fill-${uniqueId}`;
  const strokeId = `area-stroke-${uniqueId}`;
  const nearest = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setHoveredIndex(null); }}
      style={{ ...cardStyle, transform: isHovered ? tokens.motion.transform : 'none' }}
    >
      <div style={createAccentBarStyle(tokens, { position: 'top', color: scale[400] })} />

      {/* Header */}
      <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, paddingBottom: tokens.spacing[1] }}>
        <Box>
          {label && (
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], fontWeight: tokens.typography.fontWeight.medium, marginBottom: tokens.spacing[1], display: 'block' }}>
              {label}
            </Text>
          )}
          {showValue && (
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], lineHeight: tokens.typography.lineHeight.tight }}>
              {hoveredIndex !== null ? points[hoveredIndex].value : lastValue}
            </Text>
          )}
        </Box>
        <Box style={{ ...createBadgeStyle(tokens, trendUp ? 'success' : 'error'), gap: tokens.spacing[1] }}>
          <span>{trendUp ? '\u2191' : '\u2193'}</span>
          <span>{trendPct}%</span>
        </Box>
      </Box>

      {/* Chart */}
      <Box style={{ padding: `0 ${tokens.spacing[3]}px ${tokens.spacing[3]}px` }}>
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ display: 'block', overflow: 'visible' }}>
          <defs>
            <linearGradient id={fillId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={scale[300]} stopOpacity="0.4" />
              <stop offset="40%" stopColor={scale[400]} stopOpacity="0.2" />
              <stop offset="100%" stopColor={scale[100]} stopOpacity="0.03" />
            </linearGradient>
            <linearGradient id={strokeId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={scale[400]} />
              <stop offset="50%" stopColor={scale[500]} />
              <stop offset="100%" stopColor={scale[600]} />
            </linearGradient>
          </defs>

          <polygon points={area} fill={`url(#${fillId})`} />
          <polyline points={polyline} fill="none" stroke={`url(#${strokeId})`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Crosshair */}
          {nearest && (
            <line x1={nearest.x} y1={0} x2={nearest.x} y2={height} stroke={scale[300]} strokeWidth="1" strokeDasharray="4 3" style={{ transition: `all ${tokens.transitions?.fast || tokens.motion.hover}` }} />
          )}

          {/* Data points */}
          {points.map((p, i) => {
            const isMinMax = i === minIdx || i === maxIdx;
            const active = hoveredIndex === i;
            return (
              <circle key={i} cx={p.x} cy={p.y} r={active ? 5 : isMinMax ? 4 : 0} fill={active ? scale[600] : scale[500]} stroke={tokens.colors.common.white} strokeWidth={active ? 2 : 1.5}
                style={{ transition: `all ${tokens.transitions?.fast || tokens.motion.hover}`, cursor: 'pointer', opacity: active || isMinMax ? 1 : 0 }}
                onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}

          {/* Hover zones */}
          {points.map((p, i) => (
            <rect key={`z-${i}`} x={p.x - (width / data.length) / 2} y={0} width={width / data.length} height={height} fill="transparent"
              onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} cursor="crosshair"
            />
          ))}

          {/* Min/Max inline labels */}
          <text x={points[minIdx].x} y={points[minIdx].y + 14} textAnchor="middle" fill={scale[600]} fontSize={tokens.typography.fontSize.xs} fontWeight={tokens.typography.fontWeight.medium}>
            {min}
          </text>
          <text x={points[maxIdx].x} y={points[maxIdx].y - 8} textAnchor="middle" fill={scale[700]} fontSize={tokens.typography.fontSize.xs} fontWeight={tokens.typography.fontWeight.bold}>
            {max}
          </text>

          {/* Hover tooltip */}
          {nearest && hoveredIndex !== null && hoveredIndex !== minIdx && hoveredIndex !== maxIdx && (
            <g>
              <rect x={nearest.x - 20} y={nearest.y - 26} width={40} height={18} rx={4} fill={scale[700]} />
              <text x={nearest.x} y={nearest.y - 14} textAnchor="middle" fill={tokens.colors.common.white} fontSize={tokens.typography.fontSize.xs} fontWeight={tokens.typography.fontWeight.semibold}>
                {nearest.value}
              </text>
            </g>
          )}
        </svg>
      </Box>

      {/* Footer badges */}
      <Box style={{ display: 'flex', justifyContent: 'space-between', padding: `0 ${tokens.spacing[4]}px ${tokens.spacing[3]}px` }}>
        <Box style={{ ...createBadgeStyle(tokens, 'info'), gap: tokens.spacing[1] }}>
          <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.infoScale[500] }}>Low</span>
          <span style={{ fontWeight: tokens.typography.fontWeight.semibold }}>{min}</span>
        </Box>
        <Box style={{ ...createBadgeStyle(tokens, 'primary'), gap: tokens.spacing[1] }}>
          <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.primaryScale[500] }}>High</span>
          <span style={{ fontWeight: tokens.typography.fontWeight.semibold }}>{max}</span>
        </Box>
      </Box>
    </div>
  );
});
