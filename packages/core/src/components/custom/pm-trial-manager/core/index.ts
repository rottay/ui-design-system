/**
 * PmTrialManager - Core Interface
 * Manage trial periods with conversion tracking, extension options, and expiration alerts
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PmTrialManagerPreset = 'overview' | 'timeline';

export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'paused' | 'cancelled' | 'expired';
export interface TrialManagerItem {
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

export interface PmTrialManagerProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PmTrialManagerPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: TrialManagerItem[];
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

export const PM_TRIAL_MANAGER_DEFAULTS: Partial<PmTrialManagerProps> = {
  preset: 'overview',
};
