import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type PricingTablePreset = 'cards' | 'comparison';

export type BillingCycle = 'monthly' | 'yearly';

export interface PricingFeature {
  label: string;
  included: boolean;
  tooltip?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  description?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currencySymbol?: string;
  features: PricingFeature[];
  highlighted?: boolean;
  highlightLabel?: string;
  ctaLabel: string;
  currentPlan?: boolean;
  badge?: string;
}

export interface PricingTableProps extends EngineAwareProps {
  preset?: PricingTablePreset;
  plans: PricingPlan[];
  billingCycle?: BillingCycle;
  onBillingCycleChange?: (cycle: BillingCycle) => void;
  onSelectPlan?: (planId: string) => void;
  title?: string;
  subtitle?: string;
  saveBadgeText?: string;
  featureCategories?: Array<{ label: string; features: string[] }>;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const PRICING_TABLE_DEFAULTS: Partial<PricingTableProps> = {
  preset: 'cards',
  billingCycle: 'monthly',
  saveBadgeText: 'Save 20%',
  title: 'Choose your plan',
};

export function formatPrice(amount: number, symbol: string = '$'): string {
  if (amount === 0) return 'Free';
  return `${symbol}${amount}`;
}

export function getHighlightColors(tokens: DesignTokens) {
  return {
    border: tokens.colors.primaryScale[500],
    badge: {
      color: tokens.colors.common.white,
      bgColor: tokens.colors.primaryScale[500],
    },
  };
}

export function getCurrentPlanColors(tokens: DesignTokens) {
  return {
    border: tokens.colors.successScale[300],
    badge: {
      color: tokens.colors.successScale[700],
      bgColor: tokens.colors.successScale[50],
    },
  };
}
