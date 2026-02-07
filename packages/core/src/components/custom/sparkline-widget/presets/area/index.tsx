import React from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { SparklineWidgetProps } from '../../core';

export const Area = createPreset<SparklineWidgetProps>((context: PresetContext<SparklineWidgetProps>) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;

  const { data, color = 'primary', width = 100, height = 30, showValue, label, className, style } = props;

  if (data.length === 0) return <Box className={className} style={style} />;

  const getColor = () => {
    switch (color) {
      case 'success': return tokens.colors.successScale[500];
      case 'warning': return tokens.colors.warningScale[500];
      case 'error': return tokens.colors.errorScale[500];
      default: return tokens.colors.primaryScale[500];
    }
  };

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <Box className={className} style={{
      boxShadow: tokens.shadows.sm, display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], ...style }}>
      {label && (
        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
          {label}
        </Text>
      )}
      <svg width={width} height={height} style={{ display: 'block' }}>
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={getColor()} stopOpacity="0.4" />
            <stop offset="100%" stopColor={getColor()} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <polygon
          points={areaPoints}
          fill={`url(#${gradientId})`}
        />
        <polyline
          points={points}
          fill="none"
          stroke={getColor()}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showValue && (
        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>
          {data[data.length - 1]}
        </Text>
      )}
    </Box>
  );
});
