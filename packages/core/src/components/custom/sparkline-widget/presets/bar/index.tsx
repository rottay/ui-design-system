import React from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { SparklineWidgetProps } from '../../core';

export const Bar = createPreset<SparklineWidgetProps>((context: PresetContext<SparklineWidgetProps>) => {
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

  const barWidth = width / data.length;
  const gap = barWidth * 0.2;
  const actualBarWidth = barWidth - gap;

  return (
    <Box className={className} style={{
      boxShadow: tokens.shadows.sm, display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], ...style }}>
      {label && (
        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
          {label}
        </Text>
      )}
      <svg width={width} height={height} style={{ display: 'block' }}>
        {data.map((value, index) => {
          const barHeight = ((value - min) / range) * height;
          const x = index * barWidth + gap / 2;
          const y = height - barHeight;
          return (
            <rect
              key={index}
              x={x}
              y={y}
              width={actualBarWidth}
              height={barHeight}
              fill={getColor()}
              rx="1"
            />
          );
        })}
      </svg>
      {showValue && (
        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>
          {data[data.length - 1]}
        </Text>
      )}
    </Box>
  );
});
