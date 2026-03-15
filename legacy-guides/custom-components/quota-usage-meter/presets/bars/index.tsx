'use client';

/**
 * QuotaUsageMeter - Bars Preset
 * Horizontal progress bars showing usage per quota
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { QuotaUsageMeterProps, QuotaItem } from '../../core';
import {
  getQuotaStatus,
  getQuotaStatusColors,
  formatQuotaValue,
  getUsagePercentage,
} from '../../core';

export const BarsQuotaUsageMeter = createPreset<QuotaUsageMeterProps>({
  name: 'QuotaUsageMeter.Bars',
  render: ({ primitives, props, tokens, engine }: PresetContext<QuotaUsageMeterProps>) => {
    const { Box, Stack, Text } = primitives;
    const statusColors = getQuotaStatusColors(tokens);

    const {
      quotas,
      onUpgrade,
      onViewDetail,
      title = 'Usage',
      subtitle,
      loading,
      className,
      style,
    } = props;

    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const groupedByCategory = quotas.reduce<Record<string, QuotaItem[]>>((acc, quota) => {
      const cat = quota.category ?? 'General';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(quota);
      return acc;
    }, {});

    const categories = Object.keys(groupedByCategory);

    return (
      <Box
        className={className}
        style={{
          padding: tokens.spacing[5],
          backgroundColor: tokens.colors.common.white,
          borderRadius: tokens.borderRadius.lg,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          boxShadow: tokens.surface.useGlass ? tokens.shadows.sm : 'none',
          ...style,
        }}
      >
        {/* Header */}
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[5] }}>
          <Box>
            <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>
              {title}
            </h3>
            {subtitle && (
              <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], margin: `${tokens.spacing[1]}px 0 0` }}>
                {subtitle}
              </p>
            )}
          </Box>
          {onUpgrade && (
            <button
              onClick={onUpgrade}
              style={{
                padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[300]}`,
                backgroundColor: tokens.colors.primaryScale[50],
                color: tokens.colors.primaryScale[600],
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              Upgrade Plan
            </button>
          )}
        </Box>

        {loading ? (
          <Box style={{ textAlign: 'center', padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>
            Loading...
          </Box>
        ) : (
          <Stack direction="vertical" spacing="lg">
            {categories.map((category) => (
              <Box key={category}>
                {categories.length > 1 && (
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[400],
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: tokens.spacing[3],
                    }}
                  >
                    {category}
                  </Text>
                )}
                <Stack direction="vertical" spacing="md">
                  {groupedByCategory[category].map((quota) => {
                    const status = getQuotaStatus(quota.current, quota.limit);
                    const colors = statusColors[status];
                    const percentage = getUsagePercentage(quota.current, quota.limit);
                    const isHovered = hoveredId === quota.id;

                    return (
                      <div
                        key={quota.id}
                        onMouseEnter={() => setHoveredId(quota.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        onClick={() => onViewDetail?.(quota.id)}
                        style={{
                          cursor: onViewDetail ? 'pointer' : 'default',
                          padding: tokens.spacing[3],
                          borderRadius: tokens.borderRadius.md,
                          backgroundColor: isHovered ? tokens.colors.neutral[50] : 'transparent',
                          transition: `background-color ${tokens.motion.hover}`,
                        }}
                      >
                        {/* Label row */}
                        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[2] }}>
                          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700] }}>
                              {quota.label}
                            </Text>
                            <span style={{
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.semibold,
                              color: colors.text,
                              backgroundColor: colors.badge,
                              padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                              borderRadius: tokens.borderRadius.full,
                              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${colors.border}`,
                            }}>
                              {percentage}%
                            </span>
                          </Box>
                          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
                            {formatQuotaValue(quota.current)} / {formatQuotaValue(quota.limit)} {quota.unit}
                          </Text>
                        </Box>

                        {/* Progress bar */}
                        <Box style={{
                          width: '100%',
                          height: tokens.spacing[2],
                          backgroundColor: tokens.colors.neutral[100],
                          borderRadius: tokens.borderRadius.full,
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            width: `${percentage}%`,
                            height: '100%',
                            backgroundColor: colors.bar,
                            borderRadius: tokens.borderRadius.full,
                            transition: `width ${tokens.motion.hover}`,
                          }} />
                        </Box>

                        {/* Reset date */}
                        {quota.resetDate && (
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], marginTop: tokens.spacing[1] }}>
                            Resets {quota.resetDate.toLocaleDateString()}
                          </Text>
                        )}
                      </div>
                    );
                  })}
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    );
  },
});
