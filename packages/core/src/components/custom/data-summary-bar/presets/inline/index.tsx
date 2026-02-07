import React from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { DataSummaryBarProps } from '../../core';

export const Inline = createPreset<DataSummaryBarProps>((context: PresetContext<DataSummaryBarProps>) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;

  const { metrics, className, style } = props;

  return (
    <Box
      className={className}
      style={{
        boxShadow: tokens.shadows.sm,
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing[4],
        padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
        backgroundColor: tokens.colors.neutral[50],
        borderRadius: tokens.borderRadius.md,
        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        overflowX: 'auto',
        ...style,
      }}
    >
      {metrics.map((metric, index) => (
        <React.Fragment key={metric.key}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], whiteSpace: 'nowrap' }}>
            {metric.icon && (
              <Text style={{ fontSize: tokens.typography.fontSize.md }}>
                {metric.icon}
              </Text>
            )}
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
              {metric.label}:
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
              {metric.value}
            </Text>
          </Box>
          {index < metrics.length - 1 && (
            <Box
              style={{
                width: '1px',
                height: '20px',
                backgroundColor: tokens.colors.neutral[300],
              }}
            />
          )}
        </React.Fragment>
      ))}
    </Box>
  );
});
