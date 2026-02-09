/**
 * PmSubscriptionDetail - Core Interface
 * View subscription details with billing history, usage, and plan changes
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PmSubscriptionDetailPreset = 'panel' | 'timeline';

export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'paused' | 'cancelled' | 'expired';
export interface SubscriptionDetailItem {
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

export interface PmSubscriptionDetailProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PmSubscriptionDetailPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: SubscriptionDetailItem[];
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

export const PM_SUBSCRIPTION_DETAIL_DEFAULTS: Partial<PmSubscriptionDetailProps> = {
  preset: 'panel',
};
