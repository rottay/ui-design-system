'use client';

/**
 * SubscriptionManager - Plans Preset
 * Plan selection with comparison
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { SubscriptionManagerProps, BillingInterval } from '../../core';
import { formatCurrency } from '../../core';
import {
  createCardStyle,
  createPanelHeaderStyle,
  createInteractiveCardStyle,
  createAccentBarStyle,
} from '../../../helpers';

export const PlansSubscriptionManager = createPreset<SubscriptionManagerProps>({
  name: 'SubscriptionManager.Plans',
  render: ({ primitives, props, tokens }: PresetContext<SubscriptionManagerProps>) => {
    const { Box, Stack } = primitives;

    const {
      plans = [],
      subscription,
      onUpgrade,
      onDowngrade,
      onChangeBillingInterval,
      title = 'Choose a Plan',
      loading,
      className,
      style,
    } = props;

    const [interval, setInterval] = useState<BillingInterval>(subscription?.billingInterval || 'monthly');

    const handleIntervalChange = (newInterval: BillingInterval) => {
      setInterval(newInterval);
      onChangeBillingInterval?.(newInterval);
    };

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), ...style }}>
        <Box style={{ textAlign: 'center', padding: `${tokens.spacing[5]}px ${tokens.spacing[4]}px ${tokens.spacing[4]}px` }}>
          <h3 style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], margin: 0 }}>{title}</h3>

          {/* Billing Toggle */}
          <Box style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[2], marginTop: tokens.spacing[3], padding: tokens.spacing[1], backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.lg }}>
            {(['monthly', 'yearly'] as BillingInterval[]).map(int => (
              <button key={int} onClick={() => handleIntervalChange(int)} style={{
                padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md,
                border: 'none', backgroundColor: interval === int ? tokens.colors.common.white : 'transparent',
                color: interval === int ? tokens.colors.neutral[900] : tokens.colors.neutral[500],
                fontWeight: interval === int ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: interval === int ? tokens.shadows.sm : 'none',
                transition: `all ${tokens.motion.hover}`,
              }}>
                {int.charAt(0).toUpperCase() + int.slice(1)}
              </button>
            ))}
            {interval === 'yearly' && (
              <span style={{ padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.successScale[100], color: tokens.colors.successScale[700], fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold }}>Save 20%</span>
            )}
          </Box>
        </Box>

        {loading ? (
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>Loading...</Box>
        ) : (
          <Box style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(plans.length, 4)}, 1fr)`, gap: tokens.spacing[3], padding: `0 ${tokens.spacing[4]}px ${tokens.spacing[4]}px` }}>
            {plans.map((plan) => {
              const isCurrent = subscription?.plan.id === plan.id;
              const price = interval === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;

              return (
                <Box key={plan.id} style={{
                  ...createInteractiveCardStyle(tokens, { active: isCurrent }),
                  overflow: 'hidden',
                  display: 'flex', flexDirection: 'column',
                }}>
                  {plan.highlighted && <Box style={createAccentBarStyle(tokens, { position: 'top' })} />}
                  <Box style={{ padding: tokens.spacing[4], flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {plan.highlighted && plan.highlightLabel && (
                      <span style={{ display: 'inline-block', alignSelf: 'flex-start', padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.primaryScale[50], color: tokens.colors.primaryScale[700], fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, marginBottom: tokens.spacing[2] }}>
                        {plan.highlightLabel}
                      </span>
                    )}
                    {isCurrent && (
                      <span style={{ display: 'inline-block', alignSelf: 'flex-start', padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, backgroundColor: tokens.colors.successScale[50], color: tokens.colors.successScale[700], fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, marginBottom: tokens.spacing[2] }}>Current Plan</span>
                    )}

                    <h4 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>{plan.name}</h4>
                    {plan.description && <p style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], margin: `${tokens.spacing[1]}px 0 0` }}>{plan.description}</p>}

                    <Box style={{ marginTop: tokens.spacing[3], marginBottom: tokens.spacing[3] }}>
                      <span style={{ fontSize: tokens.typography.fontSize['3xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{formatCurrency(price, plan.currency)}</span>
                      {price > 0 && <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>/{interval === 'yearly' ? 'yr' : 'mo'}</span>}
                    </Box>

                    <button onClick={() => isCurrent ? undefined : onUpgrade?.(plan.id)} disabled={isCurrent} style={{
                      width: '100%', padding: `${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.md,
                      border: 'none',
                      backgroundColor: isCurrent ? tokens.colors.neutral[100] : plan.highlighted ? tokens.colors.primaryScale[500] : tokens.colors.neutral[800],
                      color: isCurrent ? tokens.colors.neutral[500] : tokens.colors.common.white,
                      fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold,
                      cursor: isCurrent ? 'default' : 'pointer', fontFamily: 'inherit',
                      marginBottom: tokens.spacing[3],
                    }}>
                      {isCurrent ? 'Current Plan' : 'Select Plan'}
                    </button>

                    <Stack direction="vertical" spacing="sm">
                      {plan.features.map((feature, idx) => (
                        <Box key={idx} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], fontSize: tokens.typography.fontSize.xs }}>
                          <span style={{ color: feature.included ? tokens.colors.successScale[500] : tokens.colors.neutral[300], flexShrink: 0 }}>
                            {feature.included ? '✓' : '—'}
                          </span>
                          <span style={{ color: feature.included ? tokens.colors.neutral[700] : tokens.colors.neutral[400] }}>
                            {feature.name}
                            {feature.limit && <span style={{ color: tokens.colors.neutral[400] }}> ({feature.limit})</span>}
                          </span>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    );
  },
});
