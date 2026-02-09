'use client';

/**
 * QuotaUsageMeter - Cards Preset
 * Metric cards with circular progress indicators
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

export const CardsQuotaUsageMeter = createPreset<QuotaUsageMeterProps>({
  name: 'QuotaUsageMeter.Cards',
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

    const circleSize = 72;
    const strokeWidth = 6;
    const radius = (circleSize - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

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
          <Box style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fill, minmax(200px, 1fr))`,
            gap: tokens.spacing[4],
          }}>
            {quotas.map((quota) => {
              const status = getQuotaStatus(quota.current, quota.limit);
              const colors = statusColors[status];
              const percentage = getUsagePercentage(quota.current, quota.limit);
              const dashOffset = circumference - (percentage / 100) * circumference;
              const isHovered = hoveredId === quota.id;

              return (
                <div
                  key={quota.id}
                  onMouseEnter={() => setHoveredId(quota.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => onViewDetail?.(quota.id)}
                  style={{
                    padding: tokens.spacing[4],
                    borderRadius: tokens.borderRadius.lg,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isHovered ? colors.border : tokens.colors.neutral[200]}`,
                    backgroundColor: tokens.colors.common.white,
                    cursor: onViewDetail ? 'pointer' : 'default',
                    transition: `all ${tokens.motion.hover}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    boxShadow: isHovered && tokens.surface.useGlass ? tokens.shadows.md : 'none',
                  }}
                >
                  {/* Circular progress */}
                  <Box style={{ position: 'relative', marginBottom: tokens.spacing[3] }}>
                    <svg width={circleSize} height={circleSize} style={{ transform: 'rotate(-90deg)' }}>
                      <circle
                        cx={circleSize / 2}
                        cy={circleSize / 2}
                        r={radius}
                        fill="none"
                        stroke={tokens.colors.neutral[100]}
                        strokeWidth={strokeWidth}
                      />
                      <circle
                        cx={circleSize / 2}
                        cy={circleSize / 2}
                        r={radius}
                        fill="none"
                        stroke={colors.bar}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        style={{ transition: `stroke-dashoffset ${tokens.motion.hover}` }}
                      />
                    </svg>
                    <Box style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.lg,
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: colors.text,
                      }}>
                        {percentage}%
                      </Text>
                    </Box>
                  </Box>

                  {/* Label */}
                  <Text style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[800],
                    marginBottom: tokens.spacing[1],
                  }}>
                    {quota.label}
                  </Text>

                  {/* Values */}
                  <Text style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                  }}>
                    {formatQuotaValue(quota.current)} / {formatQuotaValue(quota.limit)} {quota.unit}
                  </Text>

                  {/* Status badge */}
                  <span style={{
                    marginTop: tokens.spacing[2],
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: colors.text,
                    backgroundColor: colors.badge,
                    padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.full,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${colors.border}`,
                    textTransform: 'capitalize',
                  }}>
                    {status}
                  </span>

                  {/* Reset date */}
                  {quota.resetDate && (
                    <Text style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[400],
                      marginTop: tokens.spacing[2],
                    }}>
                      Resets {quota.resetDate.toLocaleDateString()}
                    </Text>
                  )}
                </div>
              );
            })}
          </Box>
        )}
      </Box>
    );
  },
});
