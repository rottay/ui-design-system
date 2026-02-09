/**
 * PlNotificationAnalytics - Core Interface
 * Analyze notification delivery rates, open rates, and engagement metrics
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PlNotificationAnalyticsPreset = 'dashboard' | 'report';

export interface NotificationAnalyticsItem {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlNotificationAnalyticsProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PlNotificationAnalyticsPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: NotificationAnalyticsItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback when an item is created */
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

export const PL_NOTIFICATION_ANALYTICS_DEFAULTS: Partial<PlNotificationAnalyticsProps> = {
  preset: 'dashboard',
};
