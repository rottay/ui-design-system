/**
 * PmSubscriptionManager - Core Interface
 * Manage subscriptions with plan info, billing cycles, and renewal status
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PmSubscriptionManagerPreset = 'table' | 'cards';

export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'paused' | 'cancelled' | 'expired';
export interface SubscriptionManagerItem {
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

export interface PmSubscriptionManagerProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PmSubscriptionManagerPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: SubscriptionManagerItem[];
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

export const PM_SUBSCRIPTION_MANAGER_DEFAULTS: Partial<PmSubscriptionManagerProps> = {
  preset: 'table',
};
