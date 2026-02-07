import React from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { DataSummaryBarProps } from '../../core';

export const Pills = createPreset<DataSummaryBarProps>((context: PresetContext<DataSummaryBarProps>) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;

  const { metrics, className, style } = props;

  const getColorStyles = (color?: string) => {
    switch (color) {
      case 'success':
        return {
          backgroundColor: tokens.colors.successScale[100],
          color: tokens.colors.successScale[700],
        };
      case 'warning':
        return {
          backgroundColor: tokens.colors.warningScale[100],
          color: tokens.colors.warningScale[700],
        };
      case 'error':
        return {
          backgroundColor: tokens.colors.errorScale[100],
          color: tokens.colors.errorScale[700],
        };
      case 'info':
        return {
          backgroundColor: tokens.colors.infoScale[100],
          color: tokens.colors.infoScale[700],
        };
      default:
        return {
          backgroundColor: tokens.colors.primaryScale[100],
          color: tokens.colors.primaryScale[700],
        };
    }
  };

  return (
    <Box
      className={className}
      style={{
        boxShadow: tokens.shadows.sm,
        display: 'flex',
        gap: tokens.spacing[2],
        overflowX: 'auto',
        padding: tokens.spacing[2],
        ...style,
      }}
    >
      {metrics.map((metric) => {
        const colorStyles = getColorStyles(metric.color);

        return (
          <Box
            key={metric.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
              borderRadius: tokens.borderRadius.full,
              whiteSpace: 'nowrap',
              ...colorStyles,
            }}
          >
            {metric.icon && (
              <Text style={{ fontSize: tokens.typography.fontSize.md }}>
                {metric.icon}
              </Text>
            )}
            <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium }}>
              {metric.label}:
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold }}>
              {metric.value}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
});
