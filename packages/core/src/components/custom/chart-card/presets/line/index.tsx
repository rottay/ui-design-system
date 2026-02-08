'use client';

import React, {useState, useMemo} from 'react';
import { createPreset } from '../../../factory';
import {  createAccentBarStyle,
 createCardStyle } from '../../../helpers';
import type { ChartCardProps } from '../../core';

export default createPreset<ChartCardProps>((context) => {
  const { primitives, props, tokens, engine } = context;
  const isGlass = engine === 'modern' && !!tokens.glass;
  const { Box, Text } = primitives;
  const {
    title,
    value,
    description,
    data,
    trend,
    color = 'primary',
    icon,
    onClick,
    loading,
    className,
    style,
  } = props;
  const [isHovered, setIsHovered] = useState(false);

  const cardStyle = useMemo(() => createCardStyle(tokens, { glass: isGlass, elevation: 'sm', interactive: !!onClick }), [tokens, onClick]);
  const colorScale = tokens.colors[`${color}Scale`];

  // Normalize data for SVG path
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 300;
  const height = 80;
  const padding = 4;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
    const y = height - padding - ((val - min) / range) * (height - padding * 2);
    return { x, y };
  });

  const lineData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');

  const getTrendColor = () => {
    if (!trend) return tokens.colors.neutral[500];
    if (trend.direction === 'up') return tokens.colors.successScale[600];
    if (trend.direction === 'down') return tokens.colors.errorScale[600];
    return tokens.colors.neutral[500];
  };

  const getTrendBg = () => {
    if (!trend) return tokens.colors.neutral[50];
    if (trend.direction === 'up') return tokens.colors.successScale[50];
    if (trend.direction === 'down') return tokens.colors.errorScale[50];
    return tokens.colors.neutral[50];
  };

  return (
    <Box
      className={className}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...cardStyle,
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        transition: `all ${tokens.motion.hover}`,
        transform: isHovered && onClick ? tokens.motion.transform : 'none',
        opacity: loading ? 0.6 : 1,
        pointerEvents: loading ? 'none' : 'auto',
        ...style,
      }}
    >
      <div style={createAccentBarStyle(tokens, { position: 'top' })} />
      {/* Header */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: tokens.spacing[6],
        }}
      >
        <Box style={{ flex: 1 }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[1] }}>
            {icon && (
              <Box style={{ display: 'flex', color: colorScale[600] }}>
                {icon}
              </Box>
            )}
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                fontWeight: tokens.typography.fontWeight.medium,
              }}
            >
              {title}
            </Text>
          </Box>
          <Text
            style={{
              fontSize: tokens.typography.fontSize['3xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              lineHeight: 1.2,
            }}
          >
            {value}
          </Text>
          {description && (
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[400],
                marginTop: tokens.spacing[1],
              }}
            >
              {description}
            </Text>
          )}
        </Box>

        {trend && (
          <Box
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
              borderRadius: tokens.borderRadius.md,
              background: getTrendBg(),
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: getTrendColor(),
            }}
          >
            {trend.direction === 'up' && '↑'}
            {trend.direction === 'down' && '↓'}
            {trend.direction === 'neutral' && '→'}
            {trend.value}%
          </Box>
        )}
      </Box>

      {/* Line Chart */}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{
          width: '100%',
          height: '80px',
          overflow: 'visible',
        }}
      >
        {/* Grid Lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1={padding}
            y1={padding + (i * (height - padding * 2)) / 4}
            x2={width - padding}
            y2={padding + (i * (height - padding * 2)) / 4}
            stroke={tokens.colors.neutral[100]}
            strokeWidth="1"
          />
        ))}

        {/* Line */}
        <path
          d={lineData}
          fill="none"
          stroke={colorScale[500]}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data Points */}
        {points.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="3"
            fill={tokens.colors.common.white}
            stroke={colorScale[500]}
            strokeWidth="2"
          />
        ))}
      </svg>
    </Box>
  );
});
