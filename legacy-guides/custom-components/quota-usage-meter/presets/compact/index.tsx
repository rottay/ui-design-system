'use client';

/**
 * QuotaUsageMeter - Compact Preset
 * Inline bar list for tight layouts
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { QuotaUsageMeterProps } from '../../core';
import {
  getQuotaStatus,
  getQuotaStatusColors,
  formatQuotaValue,
  getUsagePercentage,
} from '../../core';

export const CompactQuotaUsageMeter = createPreset<QuotaUsageMeterProps>({
  name: 'QuotaUsageMeter.Compact',
  render: ({ primitives, props, tokens, engine }: PresetContext<QuotaUsageMeterProps>) => {
    const { Box, Text } = primitives;
    const statusColors = getQuotaStatusColors(tokens);

    const {
      quotas,
      onUpgrade,
      onViewDetail,
      title,
      loading,
      className,
      style,
    } = props;

    const [hoveredId, setHoveredId] = useState<string | null>(null);

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
        {/* Header */}
        {(title || onUpgrade) && (
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[3] }}>
            {title && (
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                {title}
              </Text>
            )}
            {onUpgrade && (
              <button
                onClick={onUpgrade}
                style={{
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.sm,
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: tokens.colors.primaryScale[600],
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Upgrade
              </button>
            )}
          </Box>
        )}

        {loading ? (
          <Box style={{ textAlign: 'center', padding: tokens.spacing[4], color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
            Loading...
          </Box>
        ) : (
          <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
            {quotas.map((quota) => {
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
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    cursor: onViewDetail ? 'pointer' : 'default',
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.sm,
                    backgroundColor: isHovered ? tokens.colors.neutral[50] : 'transparent',
                    transition: `background-color ${tokens.motion.hover}`,
                  }}
                >
                  {/* Label */}
                  <Text style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[600],
                    minWidth: '80px',
                    flexShrink: 0,
                  }}>
                    {quota.label}
                  </Text>

                  {/* Inline bar */}
                  <Box style={{
                    flex: 1,
                    height: tokens.spacing[1],
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

                  {/* Value */}
                  <Text style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: colors.text,
                    fontWeight: tokens.typography.fontWeight.medium,
                    minWidth: '32px',
                    textAlign: 'right',
                    flexShrink: 0,
                  }}>
                    {percentage}%
                  </Text>
                </div>
              );
            })}
          </Box>
        )}
      </Box>
    );
  },
});
