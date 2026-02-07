import React from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { ComparisonCardProps } from '../../core';
import { createCardStyle } from '../../../helpers';

export const Stacked = createPreset<ComparisonCardProps>((context: PresetContext<ComparisonCardProps>) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;

  const { metrics, title, period = { current: 'Current', previous: 'Previous' }, className, style } = props;

  const cardStyle = createCardStyle(tokens);

  const calculateChange = (current: number | string, previous: number | string) => {
    const curr = typeof current === 'number' ? current : parseFloat(String(current));
    const prev = typeof previous === 'number' ? previous : parseFloat(String(previous));

    if (isNaN(curr) || isNaN(prev) || prev === 0) return null;

    const change = ((curr - prev) / prev) * 100;
    return change;
  };

  return (
    <Box style={cardStyle} className={className}>
      {title && (
        <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, marginBottom: tokens.spacing[4] }}>
          {title}
        </Text>
      )}

      {metrics.map((metric, index) => {
        const change = calculateChange(metric.current, metric.previous);

        return (
          <Box
            key={index}
            style={{
              padding: tokens.spacing[4],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              borderRadius: tokens.borderRadius.md,
              marginBottom: tokens.spacing[2],
            }}
          >
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700], marginBottom: tokens.spacing[4] }}>
              {metric.label}
            </Text>

            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>
                  {period.previous}
                </Text>
                <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[700] }}>
                  {metric.previous}{metric.unit}
                </Text>
              </Box>

              {change !== null && (
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xl, color: change > 0 ? tokens.colors.successScale[600] : change < 0 ? tokens.colors.errorScale[600] : tokens.colors.neutral[600] }}>
                    {change > 0 ? '↑' : change < 0 ? '↓' : '→'}
                  </Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: change > 0 ? tokens.colors.successScale[600] : change < 0 ? tokens.colors.errorScale[600] : tokens.colors.neutral[600] }}>
                    {Math.abs(change).toFixed(1)}%
                  </Text>
                </Box>
              )}

              <Box>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>
                  {period.current}
                </Text>
                <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[700] }}>
                  {metric.current}{metric.unit}
                </Text>
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
});
