/**
 * PmPlanSelector - Core Interface
 * Compare and select subscription plans with feature matrices and pricing tiers
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PmPlanSelectorPreset = 'cards' | 'comparison';

export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'paused' | 'cancelled' | 'expired';
export interface PlanSelectorItem {
  id: string;
  planName: string;
  status: SubscriptionStatus;
  amount: string;
  currency: string;
  interval: 'monthly' | 'yearly';
  customer?: string;
  currentPeriodEnd: string;
  createdAt: string;
}

export interface PmPlanSelectorProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PmPlanSelectorPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: PlanSelectorItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to create */
  onCreate?: () => void;
  /** Search query */
  searchQuery?: string;
  /** Callback when search changes */
  onSearchChange?: (query: string) => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const PM_PLAN_SELECTOR_DEFAULTS: Partial<PmPlanSelectorProps> = {
  preset: 'cards',
};
