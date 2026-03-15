/**
 * NotificationCenter - Pattern Component Types
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../../types';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: ReactNode;
}

export interface NotificationCenterProps extends PatternBaseProps {
  /** List of notifications */
  notifications: Notification[];
  /** Number of unread notifications */
  unreadCount?: number;
  /** Called when a notification is marked as read */
  onRead?: (id: string) => void;
  /** Called when all notifications are marked as read */
  onReadAll?: () => void;
  /** Called when a notification is dismissed */
  onClear?: (id: string) => void;
  /** Called when all notifications are cleared */
  onClearAll?: () => void;
  /** Custom trigger element (defaults to bell icon) */
  trigger?: ReactNode;
  /** Whether the dropdown is open (controlled) */
  open?: boolean;
  /** Called when the open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Empty state message */
  emptyMessage?: string;
  /** Maximum number of notifications to display */
  maxVisible?: number;
}
