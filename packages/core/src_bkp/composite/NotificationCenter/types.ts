export interface Notification {
  id: string;
  title: string;
  description?: string;
  timestamp: Date | string;
  read: boolean;
  type?: 'info' | 'success' | 'warning' | 'error';
  icon?: React.ReactNode;
  avatar?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export interface NotificationCenterProps {
  notifications: Notification[];
  unreadCount?: number;
  showBadge?: boolean;
  onNotificationClick?: (notification: Notification) => void;
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
  onClearAll?: () => void;
  placement?: 'bottom' | 'bottomLeft' | 'bottomRight' | 'top' | 'topLeft' | 'topRight';
  trigger?: ('click' | 'hover')[];
  maxHeight?: number;
  emptyText?: string;
  className?: string;
  style?: React.CSSProperties;
}
