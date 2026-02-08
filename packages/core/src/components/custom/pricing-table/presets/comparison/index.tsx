'use client';

/**
 * PricingTable - Comparison Preset
 * Feature grid table comparing all plans
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { PricingTableProps, BillingCycle } from '../../core';
import { formatPrice, getHighlightColors, getCurrentPlanColors } from '../../core';
import {
  createBadgeStyle,
  createHoverStyle,
  createListItemStyle,
  createPanelHeaderStyle,
} from '../../../helpers';

export const ComparisonPricingTable = createPreset<PricingTableProps>({
  name: 'PricingTable.Comparison',
  render: ({ primitives, props, tokens, engine }: PresetContext<PricingTableProps>) => {
    const { Box } = primitives;
    const highlightColors = getHighlightColors(tokens);
    const currentPlanColors = getCurrentPlanColors(tokens);

    const {
      plans,
      billingCycle: billingCycleProp,
      onBillingCycleChange,
      onSelectPlan,
      title = 'Compare plans',
      subtitle,
      saveBadgeText = 'Save 20%',
      featureCategories,
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

    // Collect all unique feature labels
    const allFeatures = featureCategories
      ? featureCategories.flatMap(c => c.features)
      : [...new Set(plans.flatMap(p => p.features.map(f => f.label)))];

    const getFeatureForPlan = (planId: string, featureLabel: string) => {
      const plan = plans.find(p => p.id === planId);
      return plan?.features.find(f => f.label === featureLabel);
    };

    return (
      <Box className={className} style={{ padding: tokens.spacing[6], backgroundColor: tokens.colors.common.white, overflow: 'auto', ...style }}>
        {/* Header */}
        <Box style={{ textAlign: 'center', marginBottom: tokens.spacing[6] }}>
          <h2 style={{ fontSize: tokens.typography.fontSize['3xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], margin: 0 }}>{title}</h2>
          {subtitle && <p style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500], marginTop: tokens.spacing[2] }}>{subtitle}</p>}

          <Box style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[2], marginTop: tokens.spacing[4], padding: tokens.spacing[1], backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.lg }}>
            <button onClick={() => handleCycleChange('monthly')} style={{
              padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md, border: 'none',
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
              padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md, border: 'none',
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
              <span style={{ padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.successScale[100], color: tokens.colors.successScale[700], fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold }}>
                {saveBadgeText}
              </span>
            )}
          </Box>
        </Box>

        {loading ? (
          <Box style={{ textAlign: 'center', padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>Loading...</Box>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            {/* Plan headers */}
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, width: '30%' }} />
                {plans.map((plan) => {
                  const price = cycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
                  const isHighlighted = plan.highlighted;
                  const isCurrent = plan.currentPlan;
                  return (
                    <th key={plan.id} style={{
                      textAlign: 'center', padding: `${tokens.spacing[4]}px ${tokens.spacing[3]}px`,
                      borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isHighlighted ? highlightColors.border : isCurrent ? currentPlanColors.border : tokens.colors.neutral[200]}`,
                      position: 'relative',
                    }}>
                      {isHighlighted && (
                        <Box style={{
                          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                          padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm,
                          backgroundColor: highlightColors.badge.bgColor, color: highlightColors.badge.color,
                          fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold,
                        }}>
                          {plan.highlightLabel ?? 'Most Popular'}
                        </Box>
                      )}
                      <Box style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], marginTop: isHighlighted ? tokens.spacing[4] : 0 }}>
                        {plan.name}
                      </Box>
                      <Box style={{ marginTop: tokens.spacing[2] }}>
                        <span style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                          {formatPrice(price, plan.currencySymbol)}
                        </span>
                        {price > 0 && <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>/{cycle === 'monthly' ? 'mo' : 'yr'}</span>}
                      </Box>
                      <button onClick={() => onSelectPlan?.(plan.id)} disabled={isCurrent} style={{
                        marginTop: tokens.spacing[3], padding: `${tokens.spacing[1]}px ${tokens.spacing[4]}px`,
                        borderRadius: tokens.borderRadius.md, border: 'none',
                        backgroundColor: isHighlighted ? tokens.colors.primaryScale[500] : isCurrent ? tokens.colors.neutral[100] : tokens.colors.neutral[800],
                        color: isCurrent ? tokens.colors.neutral[500] : tokens.colors.common.white,
                        fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold,
                        cursor: isCurrent ? 'default' : 'pointer', fontFamily: 'inherit',
                        transition: `all ${tokens.motion.hover}`,
                      }}>
                        {isCurrent ? 'Current' : plan.ctaLabel}
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {featureCategories ? (
                featureCategories.map((category) => (
                  <>
                    <tr key={`cat-${category.label}`}>
                      <td colSpan={plans.length + 1} style={{
                        padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[900],
                        backgroundColor: tokens.colors.neutral[50],
                        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      }}>
                        {category.label}
                      </td>
                    </tr>
                    {category.features.map((featureLabel) => (
                      <tr key={featureLabel}>
                        <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                          {featureLabel}
                        </td>
                        {plans.map((plan) => {
                          const feature = getFeatureForPlan(plan.id, featureLabel);
                          return (
                            <td key={plan.id} style={{ textAlign: 'center', padding: `${tokens.spacing[2]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                              {feature?.included ? (
                                <span style={{ color: tokens.colors.successScale[500], fontWeight: tokens.typography.fontWeight.semibold }}>✓</span>
                              ) : (
                                <span style={{ color: tokens.colors.neutral[300] }}>—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </>
                ))
              ) : (
                allFeatures.map((featureLabel) => (
                  <tr key={featureLabel}>
                    <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                      {featureLabel}
                    </td>
                    {plans.map((plan) => {
                      const feature = getFeatureForPlan(plan.id, featureLabel);
                      return (
                        <td key={plan.id} style={{ textAlign: 'center', padding: `${tokens.spacing[2]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                          {feature?.included ? (
                            <span style={{ color: tokens.colors.successScale[500], fontWeight: tokens.typography.fontWeight.semibold }}>✓</span>
                          ) : (
                            <span style={{ color: tokens.colors.neutral[300] }}>—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </Box>
    );
  },
});
