'use client';

/**
 * PricingTable - Cards Preset
 * Horizontal plan cards with feature checklists
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { PricingTableProps, BillingCycle } from '../../core';
import { formatPrice, getHighlightColors, getCurrentPlanColors } from '../../core';
import {
  createBadgeStyle,
  createHoverStyle,
} from '../../../helpers';

export const CardsPricingTable = createPreset<PricingTableProps>({
  name: 'PricingTable.Cards',
  render: ({ primitives, props, tokens, engine }: PresetContext<PricingTableProps>) => {
    const { Box, Stack } = primitives;
    const highlightColors = getHighlightColors(tokens);
    const currentPlanColors = getCurrentPlanColors(tokens);

    const {
      plans,
      billingCycle: billingCycleProp,
      onBillingCycleChange,
      onSelectPlan,
      title = 'Choose your plan',
      subtitle,
      saveBadgeText = 'Save 20%',
      loading,
      className,
      style,
    } = props;

    const [internalCycle, setInternalCycle] = useState<BillingCycle>(billingCycleProp ?? 'monthly');
    const cycle = billingCycleProp ?? internalCycle;

    const handleCycleChange = (newCycle: BillingCycle) => {
      setInternalCycle(newCycle);
      onBillingCycleChange?.(newCycle);
    };

    return (
      <Box className={className} style={{ padding: tokens.spacing[6], backgroundColor: tokens.colors.common.white, ...style }}>
        {/* Header */}
        <Box style={{ textAlign: 'center', marginBottom: tokens.spacing[6] }}>
          <h2 style={{ fontSize: tokens.typography.fontSize['3xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], margin: 0 }}>{title}</h2>
          {subtitle && <p style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500], marginTop: tokens.spacing[2] }}>{subtitle}</p>}

          {/* Billing toggle */}
          <Box style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[2], marginTop: tokens.spacing[4], padding: tokens.spacing[1], backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.lg }}>
            <button onClick={() => handleCycleChange('monthly')} style={{
              padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
              borderRadius: tokens.borderRadius.md, border: 'none',
              backgroundColor: cycle === 'monthly' ? tokens.colors.common.white : 'transparent',
              color: cycle === 'monthly' ? tokens.colors.neutral[900] : tokens.colors.neutral[500],
              fontWeight: cycle === 'monthly' ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
              fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', fontFamily: 'inherit',
              transition: `all ${tokens.motion.hover}`,
              boxShadow: cycle === 'monthly' ? tokens.shadows.sm : 'none',
            }}>
              Monthly
            </button>
            <button onClick={() => handleCycleChange('yearly')} style={{
              padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
              borderRadius: tokens.borderRadius.md, border: 'none',
              backgroundColor: cycle === 'yearly' ? tokens.colors.common.white : 'transparent',
              color: cycle === 'yearly' ? tokens.colors.neutral[900] : tokens.colors.neutral[500],
              fontWeight: cycle === 'yearly' ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
              fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', fontFamily: 'inherit',
              transition: `all ${tokens.motion.hover}`,
              boxShadow: cycle === 'yearly' ? tokens.shadows.sm : 'none',
            }}>
              Yearly
            </button>
            {cycle === 'yearly' && (
              <span style={{
                padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.successScale[100],
                color: tokens.colors.successScale[700],
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
              }}>
                {saveBadgeText}
              </span>
            )}
          </Box>
        </Box>

        {loading ? (
          <Box style={{ textAlign: 'center', padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>Loading...</Box>
        ) : (
          /* Plan cards */
          <Box style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(plans.length, 4)}, 1fr)`, gap: tokens.spacing[4], alignItems: 'start' }}>
            {plans.map((plan) => {
              const price = cycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
              const isHighlighted = plan.highlighted;
              const isCurrent = plan.currentPlan;

              return (
                <Box key={plan.id} style={{
                  padding: tokens.spacing[5],
                  borderRadius: tokens.borderRadius.lg,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isHighlighted ? highlightColors.border : isCurrent ? currentPlanColors.border : tokens.colors.neutral[200]}`,
                  backgroundColor: tokens.colors.common.white,
                  position: 'relative',
                  display: 'flex', flexDirection: 'column',
                }}>
                  {/* Highlight badge */}
                  {isHighlighted && (
                    <Box style={{
                      position: 'absolute', top: -tokens.spacing[3], left: '50%', transform: 'translateX(-50%)',
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: highlightColors.badge.bgColor,
                      color: highlightColors.badge.color,
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      whiteSpace: 'nowrap',
                    }}>
                      {plan.highlightLabel ?? 'Most Popular'}
                    </Box>
                  )}
                  {/* Current plan badge */}
                  {isCurrent && (
                    <Box style={{
                      display: 'inline-block', alignSelf: 'flex-start',
                      padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.sm,
                      backgroundColor: currentPlanColors.badge.bgColor,
                      color: currentPlanColors.badge.color,
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      marginBottom: tokens.spacing[2],
                    }}>
                      Current plan
                    </Box>
                  )}

                  <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>
                    {plan.name}
                  </h3>
                  {plan.description && (
                    <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], margin: `${tokens.spacing[1]}px 0 0` }}>{plan.description}</p>
                  )}

                  {/* Price */}
                  <Box style={{ marginTop: tokens.spacing[4], marginBottom: tokens.spacing[4] }}>
                    <span style={{ fontSize: tokens.typography.fontSize['4xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                      {formatPrice(price, plan.currencySymbol)}
                    </span>
                    {price > 0 && (
                      <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
                        /{cycle === 'monthly' ? 'mo' : 'yr'}
                      </span>
                    )}
                  </Box>

                  {/* CTA */}
                  <button onClick={() => onSelectPlan?.(plan.id)} disabled={isCurrent} style={{
                    width: '100%', padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                    borderRadius: tokens.borderRadius.md, border: 'none',
                    backgroundColor: isHighlighted ? tokens.colors.primaryScale[500] : isCurrent ? tokens.colors.neutral[100] : tokens.colors.neutral[800],
                    color: isCurrent ? tokens.colors.neutral[500] : tokens.colors.common.white,
                    fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold,
                    cursor: isCurrent ? 'default' : 'pointer', fontFamily: 'inherit',
                    transition: `all ${tokens.motion.hover}`,
                    marginBottom: tokens.spacing[4],
                  }}>
                    {isCurrent ? 'Current plan' : plan.ctaLabel}
                  </button>

                  {/* Features */}
                  <Stack direction="vertical" spacing="sm">
                    {plan.features.map((feature, idx) => (
                      <Box key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: tokens.spacing[2], fontSize: tokens.typography.fontSize.sm }}>
                        <span style={{
                          color: feature.included ? tokens.colors.successScale[500] : tokens.colors.neutral[300],
                          flexShrink: 0,
                        }}>
                          {feature.included ? '✓' : '—'}
                        </span>
                        <span style={{ color: feature.included ? tokens.colors.neutral[700] : tokens.colors.neutral[400] }}>
                          {feature.label}
                        </span>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    );
  },
});
