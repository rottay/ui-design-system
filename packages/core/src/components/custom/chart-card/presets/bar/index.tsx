'use client';

import React, { useState } from 'react';
import { createPreset } from '../../../factory';
import { createCardStyle } from '../../../helpers';
import type { ChartCardProps } from '../../core';

export default createPreset<ChartCardProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;
  const {
    title,
    value,
    description,
    data,
    labels,
    trend,
    color = 'primary',
    icon,
    onClick,
    loading,
    className,
    style,
  } = props;
  const [isHovered, setIsHovered] = useState(false);

  const cardStyle = createCardStyle(tokens, { elevation: 'sm', interactive: !!onClick });
  const colorScale = tokens.colors[`${color}Scale`];

  const max = Math.max(...data);
  const width = 300;
  const height = 80;
  const barWidth = (width - (data.length + 1) * 4) / data.length;

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
        cursor: onClick ? 'pointer' : 'default',
        transition: `all ${tokens.motion.hover}`,
        transform: isHovered && onClick ? tokens.motion.transform : 'none',
        opacity: loading ? 0.6 : 1,
        pointerEvents: loading ? 'none' : 'auto',
        ...style,
      }}
    >
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

      {/* Bar Chart */}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{
          width: '100%',
          height: '80px',
        }}
      >
        {data.map((val, i) => {
          const barHeight = (val / max) * (height - 8);
          const x = 4 + i * (barWidth + 4);
          const y = height - barHeight;

          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={colorScale[500]}
              rx={3}
              style={{
                transition: `all ${tokens.motion.hover}`,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.fill = colorScale[600];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.fill = colorScale[500];
              }}
            />
          );
        })}
      </svg>
    </Box>
  );
});
