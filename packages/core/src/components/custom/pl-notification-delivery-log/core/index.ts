/**
 * PlNotificationDeliveryLog - Core Interface
 * Track notification delivery status across email, SMS, push, and in-app channels
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PlNotificationDeliveryLogPreset = 'table' | 'timeline';

export interface NotificationDeliveryLogItem {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlNotificationDeliveryLogProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PlNotificationDeliveryLogPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: NotificationDeliveryLogItem[];
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

export const PL_NOTIFICATION_DELIVERY_LOG_DEFAULTS: Partial<PlNotificationDeliveryLogProps> = {
  preset: 'table',
};
