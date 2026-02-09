'use client';

/**
 * SystemHealthDashboard - Compact Preset (Mini status indicators)
 * Small, dense view for embedding in sidebars, headers, or widget areas
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { SystemHealthDashboardProps, ServiceHealth } from '../../core';
import { getServiceStatusColors, getStatusLabel } from '../../core';

export const CompactSystemHealthDashboard = createPreset<SystemHealthDashboardProps>({
  name: 'SystemHealthDashboard.Compact',
  render: ({ primitives, props, tokens, engine }: PresetContext<SystemHealthDashboardProps>) => {
    const { Box, Text } = primitives;
    const {
      services,
      overallStatus,
      onViewService,
      title,
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

    if (loading) {
      return (
        <Box
          className={className}
          style={{
            padding: tokens.spacing[3],
            backgroundColor: tokens.colors.common.white,
            borderRadius: tokens.borderRadius.md,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            ...style,
          }}
        >
          <Text style={{ color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.xs }}>
            Loading...
          </Text>
        </Box>
      );
    }

    return (
      <Box
        className={className}
        style={{
          padding: tokens.spacing[3],
          backgroundColor: tokens.colors.common.white,
          borderRadius: tokens.borderRadius.md,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          boxShadow: tokens.surface.useGlass ? tokens.shadows.sm : 'none',
          ...style,
        }}
      >
        {/* Header row */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: tokens.spacing[3],
          }}
        >
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            <div
              style={{
                width: tokens.spacing[2],
                height: tokens.spacing[2],
                borderRadius: tokens.borderRadius.full,
                backgroundColor: overallColors.dot,
                flexShrink: 0,
              }}
            />
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
          </Box>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.xs,
              color: overallColors.color,
              fontWeight: tokens.typography.fontWeight.medium,
            }}
          >
            {getStatusLabel(computedOverallStatus)}
          </Text>
        </Box>

        {/* Service dots grid */}
        <Box
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: tokens.spacing[2],
          }}
        >
          {services.map((service) => {
            const colors = statusColors[service.status];
            const isHovered = hoveredId === service.id;

            return (
              <div
                key={service.id}
                onMouseEnter={() => setHoveredId(service.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => onViewService?.(service.id)}
                title={`${service.name}: ${getStatusLabel(service.status)} (${service.uptime.toFixed(1)}%)`}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.sm,
                  backgroundColor: isHovered ? colors.bgColor : 'transparent',
                  cursor: onViewService ? 'pointer' : 'default',
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                <div
                  style={{
                    width: tokens.spacing[2],
                    height: tokens.spacing[2],
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: colors.dot,
                    flexShrink: 0,
                  }}
                />
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: isHovered ? colors.color : tokens.colors.neutral[600],
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '120px',
                  }}
                >
                  {service.name}
                </Text>
              </div>
            );
          })}
        </Box>
      </Box>
    );
  },
});
