import React, { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { ComparisonCardProps } from '../../core';
import {  createAccentBarStyle,
 createCardStyle } from '../../../helpers';

export const SideBySide = createPreset<ComparisonCardProps>((context: PresetContext<ComparisonCardProps>) => {
  const { primitives, props, tokens, engine } = context;
  const { Box, Text } = primitives;

  const { metrics, title, period = { current: 'Current', previous: 'Previous' }, className, style } = props;

  const cardStyle = useMemo(() => createCardStyle(tokens), [tokens]);

  const calculateChange = (current: number | string, previous: number | string) => {
    const curr = typeof current === 'number' ? current : parseFloat(String(current));
    const prev = typeof previous === 'number' ? previous : parseFloat(String(previous));

    if (isNaN(curr) || isNaN(prev) || prev === 0) return null;

    const change = ((curr - prev) / prev) * 100;
    return change;
  };

  return (
    <Box style={cardStyle} className={className}>
        <div style={createAccentBarStyle(tokens, { position: 'top' })} />
      {title && (
        <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, marginBottom: tokens.spacing[4] }}>
          {title}
        </Text>
      )}

      <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[6] }}>
        <Box>
          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], marginBottom: tokens.spacing[4], fontWeight: tokens.typography.fontWeight.semibold }}>
            {period.current}
          </Text>
          {metrics.map((metric, index) => (
            <Box
              key={index}
              style={{
                padding: tokens.spacing[4],
                backgroundColor: tokens.colors.primaryScale[50],
                borderRadius: tokens.borderRadius.md,
                marginBottom: tokens.spacing[2],
              }}
            >
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], marginBottom: tokens.spacing[1] }}>
                {metric.label}
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[700] }}>
                {metric.current}{metric.unit}
              </Text>
            </Box>
          ))}
        </Box>

        <Box>
          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], marginBottom: tokens.spacing[4], fontWeight: tokens.typography.fontWeight.semibold }}>
            {period.previous}
          </Text>
          {metrics.map((metric, index) => {
            const change = calculateChange(metric.current, metric.previous);

            return (
              <Box
                key={index}
                style={{
                  padding: tokens.spacing[4],
                  backgroundColor: tokens.colors.neutral[50],
                  borderRadius: tokens.borderRadius.md,
                  marginBottom: tokens.spacing[2],
                }}
              >
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], marginBottom: tokens.spacing[1] }}>
                  {metric.label}
                </Text>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[700] }}>
                    {metric.previous}{metric.unit}
                  </Text>
                  {change !== null && (
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.lg, color: change > 0 ? tokens.colors.successScale[600] : change < 0 ? tokens.colors.errorScale[600] : tokens.colors.neutral[600] }}>
                        {change > 0 ? '↑' : change < 0 ? '↓' : '→'}
                      </Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: change > 0 ? tokens.colors.successScale[600] : change < 0 ? tokens.colors.errorScale[600] : tokens.colors.neutral[600] }}>
                        {Math.abs(change).toFixed(1)}%
                      </Text>
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
});
