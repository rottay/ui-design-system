/**
 * PricingTable - Pattern Component Types
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../../types';

export interface PricingPlan {
  id: string;
  name: string;
  price: number | string;
  description?: string;
  features: Record<string, boolean | string>;
  cta: string;
  popular?: boolean;
  priceNote?: string;
}

export interface PricingFeature {
  key: string;
  label: string;
  description?: string;
  category?: string;
}

export interface PricingTableProps extends PatternBaseProps {
  /** List of plans (columns) */
  plans: PricingPlan[];
  /** List of features (rows) */
  features: PricingFeature[];
  /** ID of the highlighted/recommended plan */
  highlightedPlan?: string;
  /** Called when a plan CTA is clicked */
  onSelectPlan?: (planId: string) => void;
  /** Billing cycle toggle */
  billingCycle?: 'monthly' | 'yearly';
  /** Called when billing cycle changes */
  onBillingCycleChange?: (cycle: 'monthly' | 'yearly') => void;
  /** Currency symbol */
  currency?: string;
  /** Custom header per plan */
  renderPlanHeader?: (plan: PricingPlan) => ReactNode;
}
