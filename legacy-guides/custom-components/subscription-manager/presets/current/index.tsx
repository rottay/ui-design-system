'use client';

/**
 * SubscriptionManager - Current Preset
 * Current subscription overview with usage and actions
 */

import { createPreset, PresetContext } from '../../../factory';
import type { SubscriptionManagerProps } from '../../core';
import { getSubscriptionStatusColors, formatCurrency } from '../../core';
import {
  createCardStyle,
  createPanelHeaderStyle,
  createProgressBarStyle,
  createAccentBarStyle,
} from '../../../helpers';

export const CurrentSubscriptionManager = createPreset<SubscriptionManagerProps>({
  name: 'SubscriptionManager.Current',
  render: ({ primitives, props, tokens }: PresetContext<SubscriptionManagerProps>) => {
    const { Box, Stack } = primitives;
    const statusColors = getSubscriptionStatusColors(tokens);

    const {
      subscription,
      onCancel,
      onPause,
      onResume,
      onUpgrade,
      title = 'Current Subscription',
      loading,
      className,
      style,
    } = props;

    if (loading) {
      return <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400], ...style }}>Loading...</Box>;
    }

    if (!subscription) {
      return (
        <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), padding: tokens.spacing[6], textAlign: 'center', ...style }}>
          <span style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500] }}>No active subscription</span>
          {onUpgrade && (
            <button onClick={() => onUpgrade('')} style={{
              display: 'block', margin: `${tokens.spacing[3]}px auto 0`, padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
              borderRadius: tokens.borderRadius.md, border: 'none', backgroundColor: tokens.colors.primaryScale[500],
              color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>View Plans</button>
          )}
        </Box>
      );
    }

    const sColors = statusColors[subscription.status];
    const daysLeft = Math.ceil((subscription.currentPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), overflow: 'hidden', ...style }}>
        <Box style={createAccentBarStyle(tokens, { position: 'top' })} />

        <Box style={{ ...createPanelHeaderStyle(tokens), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>{title}</h3>
          </Box>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: sColors.bg, color: sColors.color, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium }}>
            <span style={{ width: 6, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: sColors.dot, display: 'inline-block' }} />
            {subscription.status}
          </span>
        </Box>

        <Box style={{ padding: tokens.spacing[4] }}>
          {/* Plan Info */}
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
            <Box>
              <span style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{subscription.plan.name}</span>
              {subscription.plan.description && (
                <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{subscription.plan.description}</span>
              )}
            </Box>
            <Box style={{ textAlign: 'right' }}>
              <span style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                {formatCurrency(subscription.billingInterval === 'yearly' ? subscription.plan.yearlyPrice : subscription.plan.monthlyPrice, subscription.plan.currency)}
              </span>
              <span style={{ display: 'block', fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>/{subscription.billingInterval}</span>
            </Box>
          </Box>

          {/* Billing Period */}
          <Box style={{ padding: tokens.spacing[3], borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.neutral[50], marginBottom: tokens.spacing[4] }}>
            <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
              <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Current Period</span>
              <span style={{ fontSize: tokens.typography.fontSize.xs, color: daysLeft < 7 ? tokens.colors.warningScale[600] : tokens.colors.neutral[600] }}>{daysLeft} days remaining</span>
            </Box>
            <Box style={{ display: 'flex', gap: tokens.spacing[3], fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>
              <span>{subscription.currentPeriodStart.toLocaleDateString()} — {subscription.currentPeriodEnd.toLocaleDateString()}</span>
            </Box>
            {subscription.nextPaymentAmount !== undefined && subscription.nextPaymentDate && (
              <span style={{ display: 'block', fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginTop: tokens.spacing[1] }}>
                Next payment: {formatCurrency(subscription.nextPaymentAmount, subscription.plan.currency)} on {subscription.nextPaymentDate.toLocaleDateString()}
              </span>
            )}
            {subscription.cancelAt && (
              <span style={{ display: 'block', fontSize: tokens.typography.fontSize.xs, color: tokens.colors.errorScale[600], marginTop: tokens.spacing[1], fontWeight: tokens.typography.fontWeight.medium }}>
                Cancels on {subscription.cancelAt.toLocaleDateString()}
              </span>
            )}
          </Box>

          {/* Usage */}
          {subscription.usage && subscription.usage.length > 0 && (
            <Box style={{ marginBottom: tokens.spacing[4] }}>
              <h4 style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: `0 0 ${tokens.spacing[2]}px` }}>Usage</h4>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
                {subscription.usage.map((metric) => {
                  const pct = metric.limit > 0 ? Math.round((metric.used / metric.limit) * 100) : 0;
                  const isNearLimit = pct >= 80;
                  const progress = createProgressBarStyle(tokens, { percent: pct, color: isNearLimit ? tokens.colors.warningScale[500] : undefined });

                  return (
                    <Box key={metric.name}>
                      <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                        <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>{metric.name}</span>
                        <span style={{ fontSize: tokens.typography.fontSize.xs, color: isNearLimit ? tokens.colors.warningScale[600] : tokens.colors.neutral[500] }}>
                          {metric.used.toLocaleString()}/{metric.limit.toLocaleString()} {metric.unit || ''}
                        </span>
                      </Box>
                      <Box style={progress.track}><Box style={progress.fill} /></Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* Actions */}
          <Box style={{ display: 'flex', gap: tokens.spacing[2], borderTop: `1px solid ${tokens.colors.neutral[200]}`, paddingTop: tokens.spacing[3] }}>
            {onUpgrade && (
              <button onClick={() => onUpgrade('')} style={{
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md,
                border: 'none', backgroundColor: tokens.colors.primaryScale[500], color: tokens.colors.common.white,
                fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer', fontFamily: 'inherit',
              }}>Change Plan</button>
            )}
            {subscription.status === 'active' && onPause && (
              <button onClick={onPause} style={{
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md,
                border: `1px solid ${tokens.colors.neutral[300]}`, backgroundColor: tokens.colors.common.white,
                color: tokens.colors.neutral[700], fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', fontFamily: 'inherit',
              }}>Pause</button>
            )}
            {subscription.status === 'paused' && onResume && (
              <button onClick={onResume} style={{
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md,
                border: 'none', backgroundColor: tokens.colors.successScale[500], color: tokens.colors.common.white,
                fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer', fontFamily: 'inherit',
              }}>Resume</button>
            )}
            {(subscription.status === 'active' || subscription.status === 'trialing') && onCancel && !subscription.cancelAt && (
              <button onClick={onCancel} style={{
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md,
                border: `1px solid ${tokens.colors.errorScale[300]}`, backgroundColor: tokens.colors.common.white,
                color: tokens.colors.errorScale[700], fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', fontFamily: 'inherit',
                marginLeft: 'auto',
              }}>Cancel Subscription</button>
            )}
          </Box>
        </Box>
      </Box>
    );
  },
});
