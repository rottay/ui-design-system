/**
 * Notification Types
 * Imperative API for global notifications
 */
import type { ReactNode, CSSProperties } from 'react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning' | 'open';

export type NotificationPlacement =
  | 'top'
  | 'topLeft'
  | 'topRight'
  | 'bottom'
  | 'bottomLeft'
  | 'bottomRight';

export interface NotificationConfig {
  /** Notification title/message */
  message: ReactNode;
  /** Notification description */
  description?: ReactNode;
  /** Notification type */
  type?: NotificationType;
  /** Duration in seconds (0 = no auto close) */
  duration?: number | null;
  /** Unique key to update existing notification */
  key?: string;
  /** Callback when notification closes */
  onClose?: () => void;
  /** Click callback */
  onClick?: () => void;
  /** Custom icon */
  icon?: ReactNode;
  /** Custom className */
  className?: string;
  /** Custom style */
  style?: CSSProperties;
  /** Placement */
  placement?: NotificationPlacement;
  /** Close button */
  btn?: ReactNode;
  /** Close icon */
  closeIcon?: ReactNode;
  /** Whether to show close button */
  closable?: boolean;
  /** Role for accessibility */
  role?: 'alert' | 'status';
  /** Props for notification container */
  props?: Record<string, unknown>;
}

export interface NotificationArgsProps extends NotificationConfig {
  /** Internal: unique ID */
  id?: string;
}

export interface NotificationInstance {
  /** Show success notification */
  success: (config: NotificationConfig) => void;
  /** Show error notification */
  error: (config: NotificationConfig) => void;
  /** Show info notification */
  info: (config: NotificationConfig) => void;
  /** Show warning notification */
  warning: (config: NotificationConfig) => void;
  /** Open notification with config */
  open: (config: NotificationConfig) => void;
  /** Destroy notification by key or all */
  destroy: (key?: string) => void;
}

export interface NotificationGlobalConfig {
  /** Default duration in seconds */
  duration?: number;
  /** Max notifications to show */
  maxCount?: number;
  /** Default placement */
  placement?: NotificationPlacement;
  /** Top offset */
  top?: number;
  /** Bottom offset */
  bottom?: number;
  /** Right offset (for right placements) */
  right?: number;
  /** Left offset (for left placements) */
  left?: number;
  /** Custom prefix class */
  prefixCls?: string;
  /** RTL mode */
  rtl?: boolean;
  /** Close icon */
  closeIcon?: ReactNode;
  /** Whether closable by default */
  closable?: boolean;
}

export interface NotificationProviderProps {
  /** Children */
  children: ReactNode;
  /** Global config */
  config?: NotificationGlobalConfig;
  /** Max notifications */
  maxCount?: number;
  /** Default placement */
  placement?: NotificationPlacement;
  /** Top offset */
  top?: number;
  /** Bottom offset */
  bottom?: number;
}

export interface NotificationItemProps {
  /** Notification ID */
  id: string;
  /** Notification type */
  type: NotificationType;
  /** Notification title */
  message: ReactNode;
  /** Notification description */
  description?: ReactNode;
  /** Duration in seconds */
  duration?: number | null;
  /** On close callback */
  onClose?: () => void;
  /** Click callback */
  onClick?: () => void;
  /** Custom icon */
  icon?: ReactNode;
  /** Custom className */
  className?: string;
  /** Custom style */
  style?: CSSProperties;
  /** Custom button */
  btn?: ReactNode;
  /** Close icon */
  closeIcon?: ReactNode;
  /** Whether closable */
  closable?: boolean;
  /** Internal: remove handler */
  onRemove?: (id: string) => void;
}

export const NOTIFICATION_DEFAULTS = {
  duration: 4.5,
  maxCount: 5,
  placement: 'topRight' as NotificationPlacement,
  top: 24,
  bottom: 24,
  right: 24,
  left: 24,
  closable: true,
};

export const NOTIFICATION_ICONS: Record<Exclude<NotificationType, 'open'>, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
};
