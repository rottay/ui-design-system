import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type NotificationCenterPreset = 'inbox' | 'broadcast';

export interface Notification {
  id: string;
  category: 'orders' | 'schedule' | 'announcements' | 'alerts' | 'promotions';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'normal' | 'high';
}

export interface BroadcastMessage {
  id: string;
  title: string;
  body: string;
  audience: string;
  channels: string[];
  scheduledAt?: Date;
  sentAt?: Date;
  status: 'draft' | 'scheduled' | 'sent';
}

export interface NotificationCenterProps extends EngineAwareProps {
  preset?: NotificationCenterPreset;
  notifications?: Notification[];
  broadcasts?: BroadcastMessage[];
  onNotificationClick?: (notificationId: string) => void;
  onMarkRead?: (notificationId: string) => void;
  onSendBroadcast?: (broadcastId: string) => void;
  style?: CSSProperties;
  className?: string;
}

export const NOTIFICATION_CENTER_DEFAULTS: Required<
  Pick<NotificationCenterProps, 'preset' | 'notifications' | 'broadcasts'>
> = {
  preset: 'inbox',
  notifications: [],
  broadcasts: [],
};
