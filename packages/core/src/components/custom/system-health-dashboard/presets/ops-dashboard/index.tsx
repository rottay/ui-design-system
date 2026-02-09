'use client';

/**
 * SystemHealthDashboard - Ops Dashboard Preset (Internal operations view)
 * Detailed metrics, response times, error rates, and acknowledge actions
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { SystemHealthDashboardProps, ServiceHealth, HealthMetric } from '../../core';
import { getServiceStatusColors, getStatusLabel, getMetricHealth } from '../../core';

export const OpsDashboardSystemHealthDashboard = createPreset<SystemHealthDashboardProps>({
  name: 'SystemHealthDashboard.OpsDashboard',
  render: ({ primitives, props, tokens, engine }: PresetContext<SystemHealthDashboardProps>) => {
    const { Box, Stack, Text } = primitives;
    const {
      services,
      overallStatus,
      onViewService,
      onAcknowledge,
      title = 'System Status',
      subtitle,
      loading,
      className,
      style,
    } = props;

    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const statusColors = getServiceStatusColors(tokens);

    const metricHealthColors = {
      healthy: { color: tokens.colors.successScale[700], bgColor: tokens.colors.successScale[50] },
      warning: { color: tokens.colors.warningScale[700], bgColor: tokens.colors.warningScale[50] },
      critical: { color: tokens.colors.errorScale[700], bgColor: tokens.colors.errorScale[50] },
    };

    const trendIcons: Record<string, string> = {
      up: '\u2191',
      down: '\u2193',
      stable: '\u2192',
    };

    const healthyCount = services.filter(s => s.status === 'operational').length;
    const degradedCount = services.filter(s => s.status === 'degraded' || s.status === 'partial-outage').length;
    const outageCount = services.filter(s => s.status === 'major-outage').length;

    const renderMetric = (metric: HealthMetric) => {
      const health = getMetricHealth(metric);
      const mColors = metricHealthColors[health];

      return (
        <Box
          key={metric.name}
          style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderRadius: tokens.borderRadius.md,
            backgroundColor: mColors.bgColor,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            minWidth: '120px',
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
              marginBottom: tokens.spacing[1],
            }}
          >
            {metric.name}
          </Text>
          <Box style={{ display: 'flex', alignItems: 'baseline', gap: tokens.spacing[1] }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: mColors.color,
              }}
            >
              {metric.value}
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
              }}
            >
              {metric.unit}
            </Text>
            {metric.trend && (
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: metric.trend === 'up' ? tokens.colors.errorScale[500] : metric.trend === 'down' ? tokens.colors.successScale[500] : tokens.colors.neutral[400],
                  marginLeft: tokens.spacing[1],
                }}
              >
                {trendIcons[metric.trend]}
              </Text>
            )}
          </Box>
        </Box>
      );
    };

    const renderServiceCard = (service: ServiceHealth) => {
      const colors = statusColors[service.status];
      const isHovered = hoveredId === service.id;
      const isExpanded = expandedId === service.id;
      const needsAck = service.status === 'major-outage' || service.status === 'partial-outage';

      return (
        <Box
          key={service.id}
          style={{
            borderRadius: tokens.borderRadius.lg,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isHovered ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.common.white,
            overflow: 'hidden',
            transition: `all ${tokens.motion.hover}`,
            boxShadow: isHovered && tokens.surface.useGlass ? tokens.shadows.md : 'none',
          }}
        >
          {/* Service header row */}
          <div
            onMouseEnter={() => setHoveredId(service.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => setExpandedId(isExpanded ? null : service.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
              cursor: 'pointer',
            }}
          >
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
              <div
                style={{
                  width: tokens.spacing[3],
                  height: tokens.spacing[3],
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: colors.dot,
                  flexShrink: 0,
                }}
              />
              <Box>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[800],
                  }}
                >
                  {service.name}
                </Text>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                  }}
                >
                  {service.responseTime}ms avg &middot; {service.errorRate}% errors
                </Text>
              </Box>
            </Box>

            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
              {/* Quick stats */}
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                }}
              >
                {service.uptime.toFixed(2)}%
              </Text>

              <Box
                style={{
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: colors.bgColor,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${colors.border}`,
                }}
              >
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: colors.color,
                  }}
                >
                  {getStatusLabel(service.status)}
                </Text>
              </Box>

              {needsAck && onAcknowledge && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onAcknowledge(service.id);
                  }}
                  style={{
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.primaryScale[50],
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
                    cursor: 'pointer',
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.primaryScale[700],
                  }}
                >
                  Acknowledge
                </div>
              )}

              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[400],
                  transition: `transform ${tokens.motion.hover}`,
                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                }}
              >
                &#9656;
              </Text>
            </Box>
          </div>

          {/* Expanded metrics */}
          {isExpanded && (
            <Box
              style={{
                padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px ${tokens.spacing[5]}px`,
                borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
              }}
            >
              <Box style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing[3] }}>
                {service.metrics.map(metric => renderMetric(metric))}
              </Box>

              {service.lastIncident && (
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[400],
                    marginTop: tokens.spacing[3],
                  }}
                >
                  Last incident: {new Date(service.lastIncident).toLocaleDateString()}
                </Text>
              )}

              {onViewService && (
                <div
                  onClick={() => onViewService(service.id)}
                  style={{
                    marginTop: tokens.spacing[3],
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.primaryScale[50],
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
                    cursor: 'pointer',
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.primaryScale[700],
                    display: 'inline-block',
                  }}
                >
                  View Details
                </div>
              )}
            </Box>
          )}
        </Box>
      );
    };

    if (loading) {
      return (
        <Box
          className={className}
          style={{
            padding: tokens.spacing[6],
            backgroundColor: tokens.colors.common.white,
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
            Loading dashboard...
          </Text>
        </Box>
      );
    }

    return (
      <Box
        className={className}
        style={{
          backgroundColor: tokens.colors.common.white,
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

          {/* Summary badges */}
          <Box style={{ display: 'flex', gap: tokens.spacing[3] }}>
            <Box
              style={{
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.successScale[50],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.successScale[200]}`,
              }}
            >
              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.successScale[700] }}>
                {healthyCount} Healthy
              </Text>
            </Box>
            {degradedCount > 0 && (
              <Box
                style={{
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.warningScale[50],
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.warningScale[200]}`,
                }}
              >
                <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.warningScale[700] }}>
                  {degradedCount} Degraded
                </Text>
              </Box>
            )}
            {outageCount > 0 && (
              <Box
                style={{
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.errorScale[50],
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
                }}
              >
                <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.errorScale[700] }}>
                  {outageCount} Outage
                </Text>
              </Box>
            )}
          </Box>
        </Box>

        {/* Service cards */}
        <Box style={{ padding: tokens.spacing[4] }}>
          <Stack direction="vertical" spacing="sm">
            {services.map(service => renderServiceCard(service))}
          </Stack>
        </Box>
      </Box>
    );
  },
});
