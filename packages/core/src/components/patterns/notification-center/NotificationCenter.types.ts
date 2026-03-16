/**
 * @fileoverview Type definitions for the NotificationCenter pattern component.
 * Defines the `Notification` shape (type, read state, optional action CTA) and
 * `NotificationCenterProps` controlling the dropdown panel, read/dismiss
 * callbacks, custom trigger element, and unread badge count. The notification
 * center is fully controlled -- the parent owns the notification list and
 * handles all state mutations via callbacks.
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../types';

/**
 * Represents a single notification entry displayed in the notification center.
 *
 * Each notification has a severity type that determines its icon and color
 * treatment, a read/unread state, and an optional action button (e.g. "View",
 * "Approve") that triggers a callback.
 */
export interface Notification {
  /** Unique identifier for this notification. Used as React key and in callbacks. */
  id: string;

  /** Short title summarizing the notification (e.g. "New comment on PR #42"). */
  title: string;

  /** Full notification message body with additional detail. */
  message: string;

  /**
   * Severity type controlling the visual treatment (icon and color accent).
   *
   * - `"info"` -- General informational notifications (default styling).
   * - `"success"` -- Positive outcomes (e.g. "Deployment succeeded").
   * - `"warning"` -- Attention-needed situations (e.g. "License expiring").
   * - `"error"` -- Failures or critical alerts (e.g. "Payment failed").
   */
  type: 'info' | 'success' | 'warning' | 'error';

  /**
   * Whether this notification has been read. Read notifications are rendered
   * with reduced visual prominence (muted background, no bold title).
   */
  read: boolean;

  /**
   * Display timestamp for the notification (e.g. "5 min ago", "Yesterday").
   * Passed as a pre-formatted string -- the component does not perform
   * date formatting.
   */
  timestamp: string;

  /**
   * Optional action button rendered on the notification row. Provides a
   * quick-action CTA without requiring the user to navigate away.
   */
  action?: {
    /** Button label (e.g. "View", "Approve", "Dismiss"). */
    label: string;
    /** Called when the action button is clicked. */
    onClick: () => void;
  };

  /**
   * Custom icon overriding the default type-based icon. Useful for
   * notification-specific icons (e.g. a user avatar for social notifications).
   */
  icon?: ReactNode;
}

/**
 * Props for the NotificationCenter pattern component.
 *
 * NotificationCenter renders a trigger element (default: bell icon with badge)
 * that opens a dropdown panel listing notifications. It supports marking
 * individual or all notifications as read, dismissing notifications, and
 * limiting the visible count.
 *
 * @example
 * ```tsx
 * <PatternNotificationCenter
 *   notifications={notifications}
 *   unreadCount={notifications.filter((n) => !n.read).length}
 *   onRead={(id) => markAsRead(id)}
 *   onReadAll={() => markAllAsRead()}
 *   onClear={(id) => dismissNotification(id)}
 *   onClearAll={() => clearAllNotifications()}
 *   emptyMessage="You're all caught up!"
 *   maxVisible={50}
 * />
 * ```
 */
export interface NotificationCenterProps extends PatternBaseProps {
  /**
   * Array of notifications to display. Order in the array determines display
   * order (typically newest first). Each notification renders as a row in the
   * dropdown panel.
   */
  notifications: Notification[];

  /**
   * Number of unread notifications, shown as a badge on the trigger element.
   * When omitted, the component can derive this from the `notifications`
   * array, but providing it explicitly avoids unnecessary re-computation.
   */
  unreadCount?: number;

  /**
   * Called when a single notification is marked as read (e.g. by clicking
   * on it or via a "mark as read" action).
   *
   * @param id - The notification to mark as read.
   */
  onRead?: (id: string) => void;

  /**
   * Called when the "Mark all as read" action is triggered. The parent
   * should update the `read` state of all notifications.
   */
  onReadAll?: () => void;

  /**
   * Called when a single notification is dismissed/cleared from the list.
   *
   * @param id - The notification to remove.
   */
  onClear?: (id: string) => void;

  /**
   * Called when the "Clear all" action is triggered. The parent should
   * remove all notifications from the list.
   */
  onClearAll?: () => void;

  /**
   * Custom trigger element that toggles the dropdown. When omitted, the
   * component renders a default bell icon button with an unread count badge.
   */
  trigger?: ReactNode;

  /**
   * Controlled open state for the dropdown panel. When provided, the parent
   * owns the open/close state. When omitted, the component manages its own
   * internal state.
   */
  open?: boolean;

  /**
   * Called when the dropdown should open or close (trigger clicked, outside
   * click, Escape key). Only relevant when `open` is controlled.
   *
   * @param open - The new desired open state.
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Message displayed when `notifications` is empty.
   * @default "No notifications"
   */
  emptyMessage?: string;

  /**
   * Maximum number of notifications to render in the dropdown. When the list
   * exceeds this limit, older notifications are truncated and a "View all"
   * link may be shown (depending on the engine implementation).
   */
  maxVisible?: number;
}
