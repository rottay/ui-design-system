'use client';

/**
 * TenantOverviewCard - Admin Preset
 * Full-detail card with all tenant data, usage metrics, feature tags,
 * industry info, MRR, creation date, and complete admin action set
 * (manage, upgrade, suspend, delete).
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { TenantOverviewCardProps } from '../../core';
import {
  getPlanColors,
  getStatusColors,
  formatStorage,
  formatMrr,
  getUsagePercent,
  getUsageColor,
  formatPlanLabel,
  formatStatusLabel,
  getDaysRemaining,
} from '../../core';
import {
  createCardStyle,
  createBadgeStyle,
  createProgressBarStyle,
  createStatusDotStyle,
  createSectionHeaderStyle,
} from '../../../helpers';

export const AdminTenantOverviewCard = createPreset<TenantOverviewCardProps>({
  name: 'TenantOverviewCard.Admin',
  render: ({ primitives, props, tokens }: PresetContext<TenantOverviewCardProps>) => {
    const { Box, Stack, Text } = primitives;
    const {
      tenant,
      onManage,
      onUpgrade,
      onSuspend,
      onDelete,
      title,
      className,
      style,
    } = props;

    const [confirmDelete, setConfirmDelete] = useState(false);

    const planColors = getPlanColors(tokens);
    const statusColors = getStatusColors(tokens);
    const plan = planColors[tenant.plan];
    const status = statusColors[tenant.status];

    const userPercent = getUsagePercent(tenant.userCount, tenant.userLimit);
    const storagePercent = getUsagePercent(tenant.storageUsedMb, tenant.storageLimitMb);
    const userBarColor = getUsageColor(userPercent, tokens);
    const storageBarColor = getUsageColor(storagePercent, tokens);

    const userBar = createProgressBarStyle(tokens, { color: userBarColor, percent: userPercent });
    const storageBar = createProgressBarStyle(tokens, { color: storageBarColor, percent: storagePercent });

    const createdLabel = tenant.createdAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    const buttonBase = {
      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
      borderRadius: tokens.borderRadius.md,
      fontSize: tokens.typography.fontSize.sm,
      fontWeight: tokens.typography.fontWeight.medium,
      cursor: 'pointer',
      transition: `all ${tokens.motion.hover}`,
      border: 'none',
    };

    return (
      <Box
        className={className}
        style={{
          ...createCardStyle(tokens, { elevation: 'md' }),
          ...style,
        }}
      >
        <Stack direction="vertical" spacing="md">
          {/* Header Row */}
          <Box style={{ display: 'flex', alignItems: 'flex-start', gap: tokens.spacing[3] }}>
            {/* Logo */}
            {tenant.logo ? (
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: tokens.borderRadius.lg,
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
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
                  width: 48,
                  height: 48,
                  borderRadius: tokens.borderRadius.lg,
                  backgroundColor: tokens.colors.primaryScale[100],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: tokens.colors.primaryScale[600],
                  fontWeight: tokens.typography.fontWeight.bold,
                  fontSize: tokens.typography.fontSize.lg,
                }}
              >
                {tenant.name.charAt(0).toUpperCase()}
              </Box>
            )}

            <Box style={{ flex: 1, minWidth: 0 }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[1] }}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.lg,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[900],
                  }}
                >
                  {title || tenant.name}
                </Text>
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
                  }}
                >
                  {formatPlanLabel(tenant.plan)}
                </Box>
                <Box
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.full,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    backgroundColor: status.bg,
                    color: status.text,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${status.border}`,
                  }}
                >
                  <div style={createStatusDotStyle(tokens, status.dot)} />
                  {formatStatusLabel(tenant.status)}
                </Box>
              </Box>

              <Box style={{ display: 'flex', gap: tokens.spacing[3], flexWrap: 'wrap' }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                  Slug: {tenant.slug}
                </Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                  ID: {tenant.id}
                </Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                  Created: {createdLabel}
                </Text>
                {tenant.industry && (
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                    Industry: {tenant.industry}
                  </Text>
                )}
              </Box>
            </Box>

            {/* MRR */}
            {tenant.mrr !== undefined && (
              <Box style={{ textAlign: 'right' as const, flexShrink: 0 }}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xl,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.neutral[900],
                  }}
                >
                  {formatMrr(tenant.mrr)}
                </Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                  MRR
                </Text>
              </Box>
            )}
          </Box>

          {/* Trial Warning */}
          {tenant.status === 'trial' && tenant.trialEndsAt && (
            <Box
              style={{
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.warningScale[50],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.warningScale[200]}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.warningScale[700] }}>
                Trial expires in {getDaysRemaining(tenant.trialEndsAt)} days
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.warningScale[600] }}>
                {tenant.trialEndsAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </Box>
          )}

          {/* Usage Section */}
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: tokens.spacing[4],
            }}
          >
            {/* Users */}
            <Box>
              <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[600] }}>
                  Users
                </Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                  {tenant.userCount} / {tenant.userLimit} ({userPercent}%)
                </Text>
              </Box>
              <div style={userBar.track}>
                <div style={userBar.fill} />
              </div>
            </Box>

            {/* Storage */}
            <Box>
              <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[600] }}>
                  Storage
                </Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                  {formatStorage(tenant.storageUsedMb)} / {formatStorage(tenant.storageLimitMb)} ({storagePercent}%)
                </Text>
              </Box>
              <div style={storageBar.track}>
                <div style={storageBar.fill} />
              </div>
            </Box>
          </Box>

          {/* Features */}
          {tenant.features.length > 0 && (
            <Box>
              <Text style={createSectionHeaderStyle(tokens)}>
                Enabled Features
              </Text>
              <Box style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing[1] }}>
                {tenant.features.map((feature) => (
                  <Box
                    key={feature}
                    style={{
                      ...createBadgeStyle(tokens, 'info'),
                      fontSize: tokens.typography.fontSize.xs,
                    }}
                  >
                    {feature}
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Admin Actions */}
          <Box
            style={{
              display: 'flex',
              gap: tokens.spacing[2],
              borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              paddingTop: tokens.spacing[3],
              flexWrap: 'wrap',
            }}
          >
            {onManage && (
              <div
                onClick={() => onManage(tenant.id)}
                style={{
                  ...buttonBase,
                  color: tokens.colors.common.white,
                  backgroundColor: tokens.colors.primaryScale[600],
                }}
              >
                Manage Tenant
              </div>
            )}

            {onUpgrade && tenant.plan !== 'enterprise' && (
              <div
                onClick={() => onUpgrade(tenant.id)}
                style={{
                  ...buttonBase,
                  color: tokens.colors.primaryScale[600],
                  backgroundColor: tokens.colors.primaryScale[50],
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
                }}
              >
                Upgrade Plan
              </div>
            )}

            {onSuspend && tenant.status === 'active' && (
              <div
                onClick={() => onSuspend(tenant.id)}
                style={{
                  ...buttonBase,
                  color: tokens.colors.warningScale[700],
                  backgroundColor: tokens.colors.warningScale[50],
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.warningScale[200]}`,
                }}
              >
                Suspend
              </div>
            )}

            {onDelete && (
              <>
                {!confirmDelete ? (
                  <div
                    onClick={() => setConfirmDelete(true)}
                    style={{
                      ...buttonBase,
                      color: tokens.colors.errorScale[600],
                      backgroundColor: 'transparent',
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
                      marginLeft: 'auto',
                    }}
                  >
                    Delete
                  </div>
                ) : (
                  <Box
                    style={{
                      display: 'flex',
                      gap: tokens.spacing[2],
                      marginLeft: 'auto',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.errorScale[600] }}>
                      Confirm?
                    </Text>
                    <div
                      onClick={() => {
                        onDelete(tenant.id);
                        setConfirmDelete(false);
                      }}
                      style={{
                        ...buttonBase,
                        color: tokens.colors.common.white,
                        backgroundColor: tokens.colors.errorScale[600],
                      }}
                    >
                      Yes, Delete
                    </div>
                    <div
                      onClick={() => setConfirmDelete(false)}
                      style={{
                        ...buttonBase,
                        color: tokens.colors.neutral[600],
                        backgroundColor: tokens.colors.neutral[100],
                      }}
                    >
                      Cancel
                    </div>
                  </Box>
                )}
              </>
            )}
          </Box>
        </Stack>
      </Box>
    );
  },
});
