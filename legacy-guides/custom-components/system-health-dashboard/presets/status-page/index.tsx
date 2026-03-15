'use client';

/**
 * SystemHealthDashboard - Status Page Preset (Public-facing status page)
 * Clean, user-friendly view showing service statuses with uptime percentages
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { SystemHealthDashboardProps, ServiceHealth } from '../../core';
import { getServiceStatusColors, getStatusLabel } from '../../core';

export const StatusPageSystemHealthDashboard = createPreset<SystemHealthDashboardProps>({
  name: 'SystemHealthDashboard.StatusPage',
  render: ({ primitives, props, tokens, engine }: PresetContext<SystemHealthDashboardProps>) => {
    const { Box, Stack, Text } = primitives;
    const {
      services,
      overallStatus,
      onViewService,
      title = 'System Status',
      subtitle,
      loading,
      className,
      style,
    } = props;

    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const statusColors = getServiceStatusColors(tokens);

    const computedOverallStatus = overallStatus ?? (() => {
      if (services.some(s => s.status === 'major-outage')) return 'major-outage' as const;
      if (services.some(s => s.status === 'partial-outage')) return 'partial-outage' as const;
      if (services.some(s => s.status === 'degraded')) return 'degraded' as const;
      if (services.some(s => s.status === 'maintenance')) return 'maintenance' as const;
      return 'operational' as const;
    })();

    const overallColors = statusColors[computedOverallStatus];

    const renderService = (service: ServiceHealth) => {
      const colors = statusColors[service.status];
      const isHovered = hoveredId === service.id;

      return (
        <div
          key={service.id}
          onMouseEnter={() => setHoveredId(service.id)}
          onMouseLeave={() => setHoveredId(null)}
          onClick={() => onViewService?.(service.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
            borderRadius: tokens.borderRadius.md,
            backgroundColor: isHovered ? tokens.colors.neutral[50] : tokens.colors.common.white,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            cursor: onViewService ? 'pointer' : 'default',
            transition: `all ${tokens.motion.hover}`,
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
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[800],
              }}
            >
              {service.name}
            </Text>
          </Box>

          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4] }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
              }}
            >
              {service.uptime.toFixed(2)}% uptime
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
          </Box>
        </div>
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
            minHeight: '200px',
            ...style,
          }}
        >
          <Text style={{ color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
            Loading status...
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
        {/* Header with overall status */}
        <Box
          style={{
            padding: `${tokens.spacing[6]}px ${tokens.spacing[6]}px`,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            backgroundColor: overallColors.bgColor,
          }}
        >
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], marginBottom: tokens.spacing[2] }}>
            <div
              style={{
                width: tokens.spacing[4],
                height: tokens.spacing[4],
                borderRadius: tokens.borderRadius.full,
                backgroundColor: overallColors.dot,
              }}
            />
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: overallColors.color,
              }}
            >
              {getStatusLabel(computedOverallStatus)}
            </Text>
          </Box>
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

        {/* Services list */}
        <Box style={{ padding: tokens.spacing[4] }}>
          <Stack direction="vertical" spacing="sm">
            {services.map(service => renderService(service))}
          </Stack>
        </Box>
      </Box>
    );
  },
});
