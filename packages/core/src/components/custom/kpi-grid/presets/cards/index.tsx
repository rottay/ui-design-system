import React from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { KpiGridProps } from '../../core';
import { createCardStyle } from '../../../helpers';

export const Cards = createPreset<KpiGridProps>((context: PresetContext<KpiGridProps>) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;

  const { items, columns = 3, className, style } = props;

  const cardStyle = createCardStyle(tokens);

  const getTrendColor = (trend?: number) => {
    if (trend === undefined) return tokens.colors.neutral[600];
    return trend > 0 ? tokens.colors.successScale[600] : trend < 0 ? tokens.colors.errorScale[600] : tokens.colors.neutral[600];
  };

  const getTrendIcon = (trend?: number) => {
    if (trend === undefined) return '';
    return trend > 0 ? '↑' : trend < 0 ? '↓' : '→';
  };

  return (
    <Box
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: tokens.spacing[4],
        ...style,
      }}
    >
      {items.map((item) => (
        <Box key={item.key} style={cardStyle}>
          <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: tokens.spacing[2] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
              {item.label}
            </Text>
            {item.icon && (
              <Text style={{ fontSize: tokens.typography.fontSize.lg }}>
                {item.icon}
              </Text>
            )}
          </Box>

          <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], marginBottom: tokens.spacing[1] }}>
            {item.value}{item.unit}
          </Text>

          {item.trend !== undefined && (
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: getTrendColor(item.trend) }}>
                {getTrendIcon(item.trend)} {Math.abs(item.trend)}%
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                vs last period
              </Text>
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
});
