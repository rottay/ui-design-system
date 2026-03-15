/**
 * PlNotificationPreferences - Core Interface
 * Configure notification delivery preferences by channel, category, and frequency
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PlNotificationPreferencesPreset = 'form' | 'matrix';

export interface NotificationPreferencesItem {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlNotificationPreferencesProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PlNotificationPreferencesPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: NotificationPreferencesItem[];
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

export const PL_NOTIFICATION_PREFERENCES_DEFAULTS: Partial<PlNotificationPreferencesProps> = {
  preset: 'form',
};
