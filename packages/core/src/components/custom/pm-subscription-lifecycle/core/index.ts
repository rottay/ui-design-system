/**
 * PmSubscriptionLifecycle - Core Interface
 * Track subscription lifecycle from trial through active, paused, and cancelled states
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PmSubscriptionLifecyclePreset = 'panel' | 'compact';

export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'paused' | 'cancelled' | 'expired';
export interface SubscriptionLifecycleItem {
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

export interface PmSubscriptionLifecycleProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PmSubscriptionLifecyclePreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: SubscriptionLifecycleItem[];
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

export const PM_SUBSCRIPTION_LIFECYCLE_DEFAULTS: Partial<PmSubscriptionLifecycleProps> = {
  preset: 'panel',
};
