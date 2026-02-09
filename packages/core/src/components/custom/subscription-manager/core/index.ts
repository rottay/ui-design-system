import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type SubscriptionManagerPreset = 'current' | 'plans' | 'history';

export type SubscriptionStatus = 'active' | 'trialing' | 'past-due' | 'paused' | 'canceled' | 'expired';

export type BillingInterval = 'monthly' | 'yearly' | 'quarterly';

export interface SubscriptionFeature {
  name: string;
  included: boolean;
  limit?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  features: SubscriptionFeature[];
  highlighted?: boolean;
  highlightLabel?: string;
}

export interface UsageMetric {
  name: string;
  used: number;
  limit: number;
  unit?: string;
}

export interface BillingEvent {
  id: string;
  type: 'payment' | 'refund' | 'upgrade' | 'downgrade' | 'cancellation' | 'renewal' | 'trial-start' | 'trial-end';
  description: string;
  amount?: number;
  currency?: string;
  date: Date;
  status: 'succeeded' | 'failed' | 'pending' | 'refunded';
  invoiceUrl?: string;
}

export interface Subscription {
  id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  billingInterval: BillingInterval;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAt?: Date;
  trialEnd?: Date;
  usage?: UsageMetric[];
  nextPaymentAmount?: number;
  nextPaymentDate?: Date;
}

export interface SubscriptionManagerProps extends EngineAwareProps {
  preset?: SubscriptionManagerPreset;
  subscription?: Subscription;
  plans?: SubscriptionPlan[];
  billingHistory?: BillingEvent[];
  onUpgrade?: (planId: string) => void;
  onDowngrade?: (planId: string) => void;
  onCancel?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onChangeBillingInterval?: (interval: BillingInterval) => void;
  onDownloadInvoice?: (eventId: string) => void;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const SUBSCRIPTION_MANAGER_DEFAULTS: Partial<SubscriptionManagerProps> = {
  preset: 'current',
  title: 'Subscription',
};

export function getSubscriptionStatusColors(tokens: DesignTokens) {
  return {
    'active': { bg: tokens.colors.successScale[50], color: tokens.colors.successScale[700], dot: tokens.colors.successScale[500] },
    'trialing': { bg: tokens.colors.infoScale[50], color: tokens.colors.infoScale[700], dot: tokens.colors.infoScale[500] },
    'past-due': { bg: tokens.colors.errorScale[50], color: tokens.colors.errorScale[700], dot: tokens.colors.errorScale[500] },
    'paused': { bg: tokens.colors.warningScale[50], color: tokens.colors.warningScale[700], dot: tokens.colors.warningScale[500] },
    'canceled': { bg: tokens.colors.neutral[100], color: tokens.colors.neutral[600], dot: tokens.colors.neutral[400] },
    'expired': { bg: tokens.colors.neutral[100], color: tokens.colors.neutral[500], dot: tokens.colors.neutral[400] },
  };
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  if (amount === 0) return 'Free';
  const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£' };
  return `${symbols[currency] || currency}${amount.toFixed(2)}`;
}

export function getBillingEventColors(tokens: DesignTokens) {
  return {
    succeeded: { bg: tokens.colors.successScale[50], color: tokens.colors.successScale[700] },
    failed: { bg: tokens.colors.errorScale[50], color: tokens.colors.errorScale[700] },
    pending: { bg: tokens.colors.warningScale[50], color: tokens.colors.warningScale[700] },
    refunded: { bg: tokens.colors.infoScale[50], color: tokens.colors.infoScale[700] },
  };
}
