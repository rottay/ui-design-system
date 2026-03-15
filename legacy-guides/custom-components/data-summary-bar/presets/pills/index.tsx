'use client';

/**
 * DataSummaryBar - Pills Preset
 * Premium summary bar with colored metric pills, icon containers,
 * hover transforms, accent bar, panel header, animated entrance,
 * and engine-aware glass container.
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createAccentBarStyle,
  createBadgeStyle,
  createPanelHeaderStyle,
  createSectionHeaderStyle,
} from '../../../helpers';
import type { DataSummaryBarProps, SummaryMetric } from '../../core';

const MetricPill = ({ metric, index, tokens, engine, primitives }: {
  metric: SummaryMetric;
  index: number;
  tokens: any;
  engine: string;
  primitives: any;
}) => {
  const { Box, Text } = primitives;
  const [isHovered, setIsHovered] = useState(false);

  const colorName = (metric.color || 'primary') as 'primary' | 'success' | 'warning' | 'error' | 'info';
  const scale = tokens.colors[`${colorName}Scale`];

  const pillStyle = useMemo((): React.CSSProperties => ({
    ...createBadgeStyle(tokens, colorName),
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacing[2],
    padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
    borderRadius: tokens.borderRadius.full,
    transition: `all ${tokens.motion.hover}`,
    cursor: 'default',
    whiteSpace: 'nowrap' as const,
    animation: `pillEntrance 0.3s ease-out ${index * 0.05}s both`,
  }), [tokens, colorName, index]);

  const iconContainerStyle = useMemo((): React.CSSProperties => ({
    width: tokens.spacing[6],
    height: tokens.spacing[6],
    borderRadius: tokens.borderRadius.full,
    backgroundColor: scale[200],
    color: scale[700],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: tokens.typography.fontSize.sm,
    flexShrink: 0,
    transition: `all ${tokens.motion.hover}`,
  }), [tokens, scale]);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...pillStyle,
        transform: isHovered ? tokens.motion.transform : 'none',
        boxShadow: isHovered ? tokens.shadows.md : tokens.shadows.sm,
        backgroundColor: isHovered ? scale[200] : scale[100],
      }}
    >
      {/* Icon container */}
      {metric.icon && (
        <Box style={{
          ...iconContainerStyle,
          backgroundColor: isHovered ? scale[300] : scale[200],
        }}>
          {metric.icon}
        </Box>
      )}

      {/* Label */}
      <Text style={{
        fontSize: tokens.typography.fontSize.xs,
        fontWeight: tokens.typography.fontWeight.medium,
        color: scale[600],
      }}>
        {metric.label}
      </Text>

      {/* Divider dot */}
      <Box style={{
        width: tokens.spacing[1],
        height: tokens.spacing[1],
        borderRadius: tokens.borderRadius.full,
        backgroundColor: scale[300],
        flexShrink: 0,
      }} />

      {/* Value */}
      <Text style={{
        fontSize: tokens.typography.fontSize.md,
        fontWeight: tokens.typography.fontWeight.bold,
        color: scale[800],
      }}>
        {metric.value}
      </Text>
    </div>
  );
};

export const Pills = createPreset<DataSummaryBarProps>((context: PresetContext<DataSummaryBarProps>) => {
  const { primitives, props, tokens, engine } = context;
  const { Box, Text } = primitives;
  const isGlass = tokens.surface.useGlass && !!tokens.glass;

  const { metrics, className, style } = props;

  const containerStyle = useMemo(() => ({
    ...createCardStyle(tokens, { glass: isGlass, elevation: 'sm' }),
    position: 'relative' as const,
    overflow: 'hidden' as const,
    ...style,
  }), [tokens, isGlass, style]);

  const totalMetrics = metrics.length;

  return (
    <Box className={className} style={containerStyle}>
      {/* Accent bar */}
      <div style={createAccentBarStyle(tokens, { position: 'top' })} />

      <Box style={{ padding: tokens.spacing[4] }}>
        {/* Panel header */}
        <Box style={{
          ...createPanelHeaderStyle(tokens),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: tokens.spacing[4],
          borderRadius: tokens.borderRadius.md,
        }}>
          <Text style={{
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[900],
          }}>
            Summary
          </Text>
          <Box style={{
            ...createBadgeStyle(tokens, 'primary'),
            fontSize: tokens.typography.fontSize.xs,
          }}>
            {totalMetrics} {totalMetrics === 1 ? 'metric' : 'metrics'}
          </Box>
        </Box>

        {/* Pills container */}
        <Box style={{
          display: 'flex',
          flexWrap: 'wrap' as const,
          gap: tokens.spacing[3],
          alignItems: 'center',
        }}>
          {metrics.map((metric, index) => (
            <MetricPill
              key={metric.key}
              metric={metric}
              index={index}
              tokens={tokens}
              engine={engine}
              primitives={primitives}
            />
          ))}
        </Box>

        {/* Bottom separator with count summary */}
        {totalMetrics > 0 && (
          <Box style={{
            marginTop: tokens.spacing[4],
            paddingTop: tokens.spacing[3],
            borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
            display: 'flex',
            gap: tokens.spacing[3],
            flexWrap: 'wrap' as const,
          }}>
            {(['primary', 'success', 'warning', 'error', 'info'] as const).map((colorKey) => {
              const count = metrics.filter(m => (m.color || 'primary') === colorKey).length;
              if (count === 0) return null;
              const scale = tokens.colors[`${colorKey}Scale`];
              return (
                <Box key={colorKey} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                }}>
                  <Box style={{
                    width: tokens.spacing[2],
                    height: tokens.spacing[2],
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: scale[500],
                  }} />
                  <Text style={{
                    ...createSectionHeaderStyle(tokens),
                    marginBottom: 0,
                    textTransform: 'capitalize' as const,
                  }}>
                    {colorKey}: {count}
                  </Text>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      {/* Keyframes for pill entrance animation */}
      <style>{`
        @keyframes pillEntrance {
          from {
            opacity: 0;
            transform: translateY(${tokens.spacing[2]}px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </Box>
  );
});
