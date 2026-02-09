'use client';

/**
 * UsageAnalyticsPanel - Widget Preset (Compact single-metric or summary card)
 * Small, embeddable card showing key metrics at a glance
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { UsageAnalyticsPanelProps } from '../../core';
import { getTrendColors, formatChangePercent } from '../../core';

export const WidgetUsageAnalyticsPanel = createPreset<UsageAnalyticsPanelProps>({
  name: 'UsageAnalyticsPanel.Widget',
  render: ({ primitives, props, tokens, engine }: PresetContext<UsageAnalyticsPanelProps>) => {
    const { Box, Text } = primitives;
    const {
      metrics,
      datasets,
      period,
      title,
      loading,
      className,
      style,
    } = props;

    const [isHovered, setIsHovered] = useState(false);

    const trendColors = getTrendColors(tokens);

    const trendIcons: Record<string, string> = {
      up: '\u2191',
      down: '\u2193',
      stable: '\u2192',
    };

    if (loading) {
      return (
        <Box
          className={className}
          style={{
            padding: tokens.spacing[4],
            backgroundColor: tokens.colors.common.white,
            borderRadius: tokens.borderRadius.lg,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            minWidth: '180px',
            ...style,
          }}
        >
          <Text style={{ color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.xs }}>
            Loading...
          </Text>
        </Box>
      );
    }

    // Single metric mode: show the first metric prominently
    const isSingleMetric = metrics.length === 1;
    const primaryMetric = metrics[0];

    if (isSingleMetric && primaryMetric) {
      const trend = trendColors[primaryMetric.trend];

      return (
        <div
          className={className}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
            backgroundColor: tokens.colors.common.white,
            borderRadius: tokens.borderRadius.lg,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isHovered ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
            boxShadow: isHovered && tokens.surface.useGlass ? tokens.shadows.md : tokens.shadows.sm,
            transition: `all ${tokens.motion.hover}`,
            minWidth: '180px',
            ...style,
          }}
        >
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                fontWeight: tokens.typography.fontWeight.medium,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {primaryMetric.label}
            </Text>
            {period && (
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[400],
                }}
              >
                {period}
              </Text>
            )}
          </Box>

          <Box style={{ display: 'flex', alignItems: 'baseline', gap: tokens.spacing[2] }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['3xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: primaryMetric.color || tokens.colors.neutral[800],
                lineHeight: 1,
              }}
            >
              {primaryMetric.value.toLocaleString()}
            </Text>
            {primaryMetric.unit && (
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[500],
                }}
              >
                {primaryMetric.unit}
              </Text>
            )}
          </Box>

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
                {trendIcons[primaryMetric.trend]}
              </Text>
              {primaryMetric.previousValue !== undefined && (
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: trend.color,
                  }}
                >
                  {formatChangePercent(primaryMetric.value, primaryMetric.previousValue)}
                </Text>
              )}
            </Box>
          </Box>

          {/* Mini sparkline from dataset if available */}
          {datasets && datasets.length > 0 && datasets[0].data.length > 0 && (() => {
            const data = datasets[0].data;
            const maxVal = Math.max(...data.map(p => p.value), 1);

            return (
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '1px',
                  height: '32px',
                  marginTop: tokens.spacing[3],
                }}
              >
                {data.map((point, idx) => {
                  const barHeight = Math.max(1, (point.value / maxVal) * 28);
                  return (
                    <div
                      key={idx}
                      style={{
                        flex: 1,
                        height: `${barHeight}px`,
                        borderRadius: `${tokens.borderRadius.sm} ${tokens.borderRadius.sm} 0 0`,
                        backgroundColor: datasets[0].color || tokens.colors.primaryScale[300],
                        minWidth: '1px',
                      }}
                    />
                  );
                })}
              </Box>
            );
          })()}
        </div>
      );
    }

    // Multi-metric summary mode
    return (
      <div
        className={className}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          padding: tokens.spacing[4],
          backgroundColor: tokens.colors.common.white,
          borderRadius: tokens.borderRadius.lg,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isHovered ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
          boxShadow: isHovered && tokens.surface.useGlass ? tokens.shadows.md : tokens.shadows.sm,
          transition: `all ${tokens.motion.hover}`,
          minWidth: '200px',
          ...style,
        }}
      >
        {/* Header */}
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[3] }}>
          {title && (
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[700],
              }}
            >
              {title}
            </Text>
          )}
          {period && (
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[400],
              }}
            >
              {period}
            </Text>
          )}
        </Box>

        {/* Metrics list */}
        <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
          {metrics.map((metric) => {
            const trend = trendColors[metric.trend];

            return (
              <Box
                key={metric.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                  }}
                >
                  {metric.label}
                </Text>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: metric.color || tokens.colors.neutral[800],
                    }}
                  >
                    {metric.value.toLocaleString()}{metric.unit ? ` ${metric.unit}` : ''}
                  </Text>
                  <Box
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: `0 ${tokens.spacing[1]}px`,
                      borderRadius: tokens.borderRadius.sm,
                      backgroundColor: trend.bgColor,
                    }}
                  >
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: trend.color }}>
                      {trendIcons[metric.trend]}
                    </Text>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </div>
    );
  },
});
