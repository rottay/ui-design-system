import type { ReactNode } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type NotificationCenterPreset = 'panel' | 'dropdown' | 'full-page';

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'mention' | 'update';

export interface Notification {
  id: string;
  type?: NotificationType;
  title: string;
  description?: string;
  icon?: ReactNode;
  timestamp: string;
  read?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  category?: string;
}

export interface NotificationCategory {
  key: string;
  label: string;
  icon?: ReactNode;
}

export interface NotificationCenterProps extends EngineAwareProps {
  preset?: NotificationCenterPreset;
  notifications: Notification[];
  categories?: NotificationCategory[];
  activeCategory?: string;
  onCategoryChange?: (key: string) => void;
  onRead?: (id: string) => void;
  onReadAll?: () => void;
  onDismiss?: (id: string) => void;
  onClearAll?: () => void;
  unreadCount?: number;
  title?: string;
  emptyMessage?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const NOTIFICATION_CENTER_DEFAULTS: Partial<NotificationCenterProps> = {
  preset: 'panel',
  title: 'Notifications',
  emptyMessage: 'No notifications',
};
