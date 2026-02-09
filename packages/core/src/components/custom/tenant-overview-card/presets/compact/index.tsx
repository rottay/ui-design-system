'use client';

/**
 * TenantOverviewCard - Compact Preset
 * Minimal horizontal row layout for list/table views.
 * Shows key metrics inline without expanded details.
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { TenantOverviewCardProps } from '../../core';
import {
  getPlanColors,
  getStatusColors,
  formatStorage,
  getUsagePercent,
  formatPlanLabel,
  formatStatusLabel,
} from '../../core';
import {
  createHoverStyle,
  createStatusDotStyle,
} from '../../../helpers';

export const CompactTenantOverviewCard = createPreset<TenantOverviewCardProps>({
  name: 'TenantOverviewCard.Compact',
  render: ({ primitives, props, tokens }: PresetContext<TenantOverviewCardProps>) => {
    const { Box, Text } = primitives;
    const { tenant, onManage, title, className, style } = props;

    const [hovered, setHovered] = useState(false);

    const planColors = getPlanColors(tokens);
    const statusColors = getStatusColors(tokens);
    const plan = planColors[tenant.plan];
    const status = statusColors[tenant.status];

    const userPercent = getUsagePercent(tenant.userCount, tenant.userLimit);
    const storagePercent = getUsagePercent(tenant.storageUsedMb, tenant.storageLimitMb);

    return (
      <div
        className={className}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onManage?.(tenant.id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[3],
          padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
          backgroundColor: hovered ? tokens.colors.neutral[50] : tokens.colors.common.white,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
          ...createHoverStyle(tokens),
          ...style,
        }}
      >
        {/* Avatar / Logo */}
        {tenant.logo ? (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: tokens.borderRadius.md,
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <img
              src={tenant.logo}
              alt={tenant.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        ) : (
          <Box
            style={{
              width: 32,
              height: 32,
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.primaryScale[100],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: tokens.colors.primaryScale[600],
              fontWeight: tokens.typography.fontWeight.semibold,
              fontSize: tokens.typography.fontSize.xs,
            }}
          >
            {tenant.name.charAt(0).toUpperCase()}
          </Box>
        )}

        {/* Name + Slug */}
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.neutral[900],
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {title || tenant.name}
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[400],
            }}
          >
            {tenant.slug}
          </Text>
        </Box>

        {/* Plan Badge */}
        <Box
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
            borderRadius: tokens.borderRadius.full,
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.medium,
            backgroundColor: plan.bg,
            color: plan.text,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${plan.border}`,
            flexShrink: 0,
          }}
        >
          {formatPlanLabel(tenant.plan)}
        </Box>

        {/* Status */}
        <Box
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            flexShrink: 0,
          }}
        >
          <div style={createStatusDotStyle(tokens, status.dot)} />
          <Text
            style={{
              fontSize: tokens.typography.fontSize.xs,
              color: status.text,
              fontWeight: tokens.typography.fontWeight.medium,
            }}
          >
            {formatStatusLabel(tenant.status)}
          </Text>
        </Box>

        {/* Users */}
        <Box style={{ flexShrink: 0, textAlign: 'right' as const, minWidth: 60 }}>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[600],
            }}
          >
            {tenant.userCount}/{tenant.userLimit}
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[400],
            }}
          >
            users
          </Text>
        </Box>

        {/* Storage */}
        <Box style={{ flexShrink: 0, textAlign: 'right' as const, minWidth: 70 }}>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[600],
            }}
          >
            {formatStorage(tenant.storageUsedMb)}
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[400],
            }}
          >
            of {formatStorage(tenant.storageLimitMb)}
          </Text>
        </Box>

        {/* MRR */}
        {tenant.mrr !== undefined && (
          <Box style={{ flexShrink: 0, textAlign: 'right' as const, minWidth: 60 }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
              }}
            >
              ${tenant.mrr}
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[400],
              }}
            >
              /mo
            </Text>
          </Box>
        )}
      </div>
    );
  },
});
