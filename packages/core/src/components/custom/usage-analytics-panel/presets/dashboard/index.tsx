'use client';

/**
 * UsageAnalyticsPanel - Dashboard Preset (Full analytics view)
 * Metric cards with trend indicators, period selector, and data visualization area
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { UsageAnalyticsPanelProps, UsageMetric } from '../../core';
import { getTrendColors, formatChangePercent, getDefaultPeriodOptions } from '../../core';

export const DashboardUsageAnalyticsPanel = createPreset<UsageAnalyticsPanelProps>({
  name: 'UsageAnalyticsPanel.Dashboard',
  render: ({ primitives, props, tokens, engine }: PresetContext<UsageAnalyticsPanelProps>) => {
    const { Box, Stack, Text } = primitives;
    const {
      metrics,
      datasets,
      period = '7d',
      onPeriodChange,
      title = 'Usage Analytics',
      subtitle,
      loading,
      className,
      style,
    } = props;

    const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);
    const [activePeriod, setActivePeriod] = useState(period);

    const trendColors = getTrendColors(tokens);
    const periodOptions = getDefaultPeriodOptions();

    const trendIcons: Record<string, string> = {
      up: '\u2191',
      down: '\u2193',
      stable: '\u2192',
    };

    const handlePeriodChange = (newPeriod: string) => {
      setActivePeriod(newPeriod);
      onPeriodChange?.(newPeriod);
    };

    const renderMetricCard = (metric: UsageMetric, index: number) => {
      const trend = trendColors[metric.trend];
      const isHovered = hoveredMetric === metric.label;

      return (
        <div
          key={metric.label}
          onMouseEnter={() => setHoveredMetric(metric.label)}
          onMouseLeave={() => setHoveredMetric(null)}
          style={{
            flex: 1,
            minWidth: '160px',
            padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
            borderRadius: tokens.borderRadius.lg,
            backgroundColor: tokens.colors.common.white,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isHovered ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
            transition: `all ${tokens.motion.hover}`,
            boxShadow: isHovered && tokens.surface.useGlass ? tokens.shadows.md : 'none',
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
              fontWeight: tokens.typography.fontWeight.medium,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: tokens.spacing[2],
            }}
          >
            {metric.label}
          </Text>

          <Box style={{ display: 'flex', alignItems: 'baseline', gap: tokens.spacing[2] }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: metric.color || tokens.colors.neutral[800],
              }}
            >
              {metric.value.toLocaleString()}
            </Text>
            {metric.unit && (
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[500],
                }}
              >
                {metric.unit}
              </Text>
            )}
          </Box>

          {/* Trend indicator */}
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              marginTop: tokens.spacing[2],
            }}
          >
            <Box
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.sm,
                backgroundColor: trend.bgColor,
              }}
            >
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: trend.color }}>
                {trendIcons[metric.trend]}
              </Text>
              {metric.previousValue !== undefined && (
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: trend.color,
                  }}
                >
                  {formatChangePercent(metric.value, metric.previousValue)}
                </Text>
              )}
            </Box>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[400],
              }}
            >
              vs prev
            </Text>
          </Box>
        </div>
      );
    };

    const renderVisualizationArea = () => {
      if (!datasets || datasets.length === 0) return null;

      const allValues = datasets.flatMap(ds => ds.data.map(p => p.value));
      const maxValue = Math.max(...allValues, 1);

      return (
        <Box
          style={{
            padding: tokens.spacing[5],
            borderRadius: tokens.borderRadius.lg,
            backgroundColor: tokens.colors.common.white,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[700],
              marginBottom: tokens.spacing[4],
            }}
          >
            Trend Overview
          </Text>

          {/* Simple bar-chart visualization */}
          {datasets.map((dataset) => (
            <Box key={dataset.label} style={{ marginBottom: tokens.spacing[4] }}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  marginBottom: tokens.spacing[2],
                }}
              >
                {dataset.label}
              </Text>

              <Box
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: tokens.spacing[1],
                  height: '80px',
                  padding: `${tokens.spacing[2]}px 0`,
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                }}
              >
                {dataset.data.map((point, idx) => {
                  const barHeight = Math.max(2, (point.value / maxValue) * 64);
                  return (
                    <div
                      key={idx}
                      title={`${point.value}`}
                      style={{
                        flex: 1,
                        height: `${barHeight}px`,
                        borderRadius: `${tokens.borderRadius.sm} ${tokens.borderRadius.sm} 0 0`,
                        backgroundColor: dataset.color || tokens.colors.primaryScale[400],
                        transition: `height ${tokens.motion.hover}`,
                        minWidth: '2px',
                      }}
                    />
                  );
                })}
              </Box>
            </Box>
          ))}
        </Box>
      );
    };

    if (loading) {
      return (
        <Box
          className={className}
          style={{
            padding: tokens.spacing[6],
            backgroundColor: tokens.colors.neutral[50],
            borderRadius: tokens.borderRadius.lg,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '300px',
            ...style,
          }}
        >
          <Text style={{ color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
            Loading analytics...
          </Text>
        </Box>
      );
    }

    return (
      <Box
        className={className}
        style={{
          backgroundColor: tokens.colors.neutral[50],
          borderRadius: tokens.borderRadius.lg,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          boxShadow: tokens.surface.useGlass ? tokens.shadows.sm : 'none',
          overflow: 'hidden',
          ...style,
        }}
      >
        {/* Header */}
        <Box
          style={{
            padding: `${tokens.spacing[5]}px ${tokens.spacing[6]}px`,
            backgroundColor: tokens.colors.common.white,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            {title && (
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.lg,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[800],
                }}
              >
                {title}
              </Text>
            )}
            {subtitle && (
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[500],
                  marginTop: tokens.spacing[1],
                }}
              >
                {subtitle}
              </Text>
            )}
          </Box>

          {/* Period selector */}
          {onPeriodChange && (
            <Box
              style={{
                display: 'flex',
                gap: tokens.spacing[1],
                padding: tokens.spacing[1],
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.neutral[100],
              }}
            >
              {periodOptions.map(opt => (
                <div
                  key={opt.value}
                  onClick={() => handlePeriodChange(opt.value)}
                  style={{
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.sm,
                    backgroundColor: activePeriod === opt.value ? tokens.colors.common.white : 'transparent',
                    boxShadow: activePeriod === opt.value && tokens.surface.useGlass ? tokens.shadows.sm : 'none',
                    cursor: 'pointer',
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: activePeriod === opt.value ? tokens.typography.fontWeight.medium : tokens.typography.fontWeight.normal,
                    color: activePeriod === opt.value ? tokens.colors.neutral[800] : tokens.colors.neutral[500],
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  {opt.label}
                </div>
              ))}
            </Box>
          )}
        </Box>

        {/* Metric cards */}
        <Box style={{ padding: tokens.spacing[5] }}>
          <Box
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: tokens.spacing[4],
              marginBottom: datasets && datasets.length > 0 ? tokens.spacing[5] : 0,
            }}
          >
            {metrics.map((metric, index) => renderMetricCard(metric, index))}
          </Box>

          {/* Data visualization */}
          {renderVisualizationArea()}
        </Box>
      </Box>
    );
  },
});
