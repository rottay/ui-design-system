'use client';

/**
 * TenantOverviewCard - Standard Preset
 * Full card with plan badge, status indicator, usage progress bars,
 * feature list, and action buttons. Engine-differentiated styling.
 */

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
} from '../../../helpers';

export const StandardTenantOverviewCard = createPreset<TenantOverviewCardProps>({
  name: 'TenantOverviewCard.Standard',
  render: ({ primitives, props, tokens }: PresetContext<TenantOverviewCardProps>) => {
    const { Box, Stack, Text } = primitives;
    const { tenant, onManage, onUpgrade, title, className, style } = props;

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

    return (
      <Box
        className={className}
        style={{
          ...createCardStyle(tokens, { elevation: 'sm' }),
          ...style,
        }}
      >
        <Stack direction="vertical" spacing="md">
          {/* Header: Logo + Name + Badges */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            {tenant.logo ? (
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: tokens.borderRadius.md,
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
                  width: 40,
                  height: 40,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.primaryScale[100],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: tokens.colors.primaryScale[600],
                  fontWeight: tokens.typography.fontWeight.semibold,
                  fontSize: tokens.typography.fontSize.sm,
                }}
              >
                {tenant.name.charAt(0).toUpperCase()}
              </Box>
            )}

            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
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
                  color: tokens.colors.neutral[500],
                }}
              >
                {tenant.slug}
              </Text>
            </Box>

            <Box style={{ display: 'flex', gap: tokens.spacing[2], flexShrink: 0 }}>
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
                }}
              >
                {formatPlanLabel(tenant.plan)}
              </Box>

              {/* Status Badge */}
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
          </Box>

          {/* Trial Warning */}
          {tenant.status === 'trial' && tenant.trialEndsAt && (
            <Box
              style={{
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.warningScale[50],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.warningScale[200]}`,
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.warningScale[700],
              }}
            >
              Trial ends in {getDaysRemaining(tenant.trialEndsAt)} days
            </Box>
          )}

          {/* Usage Bars */}
          <Box>
            <Box style={{ marginBottom: tokens.spacing[3] }}>
              <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                  Users
                </Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                  {tenant.userCount} / {tenant.userLimit}
                </Text>
              </Box>
              <div style={userBar.track}>
                <div style={userBar.fill} />
              </div>
            </Box>

            <Box>
              <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                  Storage
                </Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                  {formatStorage(tenant.storageUsedMb)} / {formatStorage(tenant.storageLimitMb)}
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
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[500],
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: tokens.spacing[2],
                }}
              >
                Features
              </Text>
              <Box style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing[1] }}>
                {tenant.features.map((feature) => (
                  <Box
                    key={feature}
                    style={{
                      ...createBadgeStyle(tokens, 'primary'),
                      fontSize: tokens.typography.fontSize.xs,
                    }}
                  >
                    {feature}
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* MRR if present */}
          {tenant.mrr !== undefined && (
            <Box
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: tokens.spacing[1],
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.lg,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                }}
              >
                {formatMrr(tenant.mrr)}
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                }}
              >
                /mo
              </Text>
            </Box>
          )}

          {/* Actions */}
          {(onManage || onUpgrade) && (
            <Box
              style={{
                display: 'flex',
                gap: tokens.spacing[2],
                borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                paddingTop: tokens.spacing[3],
              }}
            >
              {onManage && (
                <div
                  onClick={() => onManage(tenant.id)}
                  style={{
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md,
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.primaryScale[600],
                    backgroundColor: tokens.colors.primaryScale[50],
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  Manage
                </div>
              )}
              {onUpgrade && tenant.plan !== 'enterprise' && (
                <div
                  onClick={() => onUpgrade(tenant.id)}
                  style={{
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md,
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.common.white,
                    backgroundColor: tokens.colors.primaryScale[600],
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  Upgrade
                </div>
              )}
            </Box>
          )}
        </Stack>
      </Box>
    );
  },
});
