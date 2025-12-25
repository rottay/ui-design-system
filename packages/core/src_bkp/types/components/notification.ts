/**
 * Notification Component Types
 *
 * Unified type definitions for Notification component across all engines.
 * Notification provides rich notification panels with imperative API.
 * Compatible with: titan (AntD), hermes (DaisyUI), apollo (Custom HTML+Tailwind)
 */

import type { CSSProperties, ReactNode } from 'react';

/**
 * Notification type variants
 */
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

/**
 * Notification placement options
 */
export type NotificationPlacement =
  | 'top'
  | 'topLeft'
  | 'topRight'
  | 'bottom'
  | 'bottomLeft'
  | 'bottomRight';

/**
 * Notification configuration for individual notifications
 */
export interface NotificationConfig {
  /** Unique key for the notification */
  key?: string;

  /** Title/message of the notification */
  message: ReactNode;

  /** Description/body content */
  description?: ReactNode;

  /** Duration in seconds before auto-close (0 = never) */
  duration?: number | null;

  /** Custom icon */
  icon?: ReactNode;

  /** Custom class name */
  className?: string;

  /** Custom inline styles */
  style?: CSSProperties;

  /** Callback when notification is closed */
  onClose?: () => void;

  /** Callback when notification is clicked */
  onClick?: () => void;

  /** Whether to show close button */
  closable?: boolean;

  /** Custom close icon */
  closeIcon?: ReactNode;

  /** Placement of the notification */
  placement?: NotificationPlacement;

  /** Action buttons */
  btn?: ReactNode;

  /** Role attribute for accessibility */
  role?: 'alert' | 'status';
}

/**
 * Global notification configuration
 */
export interface NotificationGlobalConfig {
  /** Default duration in seconds */
  duration?: number;

  /** Maximum number of notifications to show */
  maxCount?: number;

  /** Placement of notifications */
  placement?: NotificationPlacement;

  /** Top offset in pixels */
  top?: number;

  /** Bottom offset in pixels */
  bottom?: number;

  /** Whether to render in RTL mode */
  rtl?: boolean;

  /** Container element or selector */
  getContainer?: () => HTMLElement;

  /** Prefix class name for custom styling */
  prefixCls?: string;

  /** Whether to show close button by default */
  closable?: boolean;

  /** Custom close icon */
  closeIcon?: ReactNode;
}

/**
 * Notification instance API
 * Imperative API for showing notifications
 */
export interface NotificationInstance {
  /** Show a notification with custom config */
  open(config: NotificationConfig): void;

  /** Show a success notification */
  success(config: NotificationConfig): void;

  /** Show an error notification */
  error(config: NotificationConfig): void;

  /** Show an info notification */
  info(config: NotificationConfig): void;

  /** Show a warning notification */
  warning(config: NotificationConfig): void;

  /** Destroy a notification by key, or all if no key provided */
  destroy(key?: string): void;

  /** Update global config (optional, not all engines support this) */
  config?: (options: NotificationGlobalConfig) => void;
}

/**
 * Utility: Get notification type styles
 */
export function getNotificationTypeStyles(type?: NotificationType): {
  icon: string;
  bg: string;
  border: string;
  text: string;
} {
  const styles = {
    success: { icon: '✓', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' },
    error: { icon: '✕', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' },
    warning: { icon: '⚠', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800' },
    info: { icon: 'ℹ', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
  };

  return type ? styles[type] : { icon: 'ℹ', bg: 'bg-white', border: 'border-gray-200', text: 'text-gray-800' };
}

/**
 * Utility: Get placement position classes
 */
export function getPlacementClasses(placement: NotificationPlacement = 'topRight'): string {
  const positionClasses: Record<NotificationPlacement, string> = {
    top: 'top-4 left-1/2 -translate-x-1/2',
    topLeft: 'top-4 left-4',
    topRight: 'top-4 right-4',
    bottom: 'bottom-4 left-1/2 -translate-x-1/2',
    bottomLeft: 'bottom-4 left-4',
    bottomRight: 'bottom-4 right-4',
  };

  return positionClasses[placement] ?? positionClasses.topRight;
}
