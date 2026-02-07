import React from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { KpiGridProps } from '../../core';
import { createCardStyle } from '../../../helpers';

export const Detailed = createPreset<KpiGridProps>((context: PresetContext<KpiGridProps>) => {
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
      {items.map((item) => {
        const currentValue = typeof item.value === 'number' ? item.value : 0;
        const targetValue = item.target || 0;
        const progress = targetValue > 0 ? (currentValue / targetValue) * 100 : 0;

        return (
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
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], marginBottom: tokens.spacing[2] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: getTrendColor(item.trend) }}>
                  {getTrendIcon(item.trend)} {Math.abs(item.trend)}%
                </Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                  vs last period
                </Text>
              </Box>
            )}

            {item.previousValue !== undefined && (
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[2] }}>
                Previous: {item.previousValue}{item.unit}
              </Text>
            )}

            {item.target !== undefined && (
              <Box>
                <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[1] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                    Target: {item.target}{item.unit}
                  </Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700] }}>
                    {Math.round(progress)}%
                  </Text>
                </Box>
                <Box
                  style={{
                    width: '100%',
                    height: '6px',
                    backgroundColor: tokens.colors.neutral[200],
                    borderRadius: tokens.borderRadius.full,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    style={{
                      width: `${Math.min(progress, 100)}%`,
                      height: '100%',
                      backgroundColor: progress >= 100 ? tokens.colors.successScale[500] : tokens.colors.primaryScale[500],
                      borderRadius: tokens.borderRadius.full,
                      transition: `width ${tokens.motion.hover}`,
                    }}
                  />
                </Box>
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
});
