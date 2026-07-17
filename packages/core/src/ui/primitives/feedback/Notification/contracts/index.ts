/**
 * @fileoverview Notification Type Definitions - Rottay Design System
 * @description Type definitions for the Notification component's imperative API.
 * These types support global notifications across all rendering engines.
 *
 * @remarks
 * The Notification types are designed to work consistently across all three
 * rendering engines (Classic, Modern, Rustic) while providing engine-specific
 * optimizations when needed.
 *
 * @module Notification/Types
 * @category Feedback
 * @package @rottay/design-system
 */

import type { ReactNode, CSSProperties } from 'react';

// ============================================================================
// Core Types
// ============================================================================

/**
 * Notification type variants.
 *
 * @remarks
 * Each type has a distinct visual style with appropriate colors and icons:
 * - `success` - Green styling for positive outcomes
 * - `error` - Red styling for errors and failures
 * - `info` - Blue styling for informational messages
 * - `warning` - Yellow/orange styling for warnings
 * - `open` - Neutral styling without a predefined type
 */
export type NotificationType = 'success' | 'error' | 'info' | 'warning' | 'open';

/**
 * Notification placement positions.
 *
 * @remarks
 * Notifications can appear at any of the six positions on the screen.
 * The placement affects the animation direction and stacking behavior.
 *
 * @example
 * ```tsx
 * api.info({
 *   message: 'Title',
 *   placement: 'bottomLeft'
 * });
 * ```
 */
export type NotificationPlacement =
  | 'top'
  | 'topLeft'
  | 'topRight'
  | 'bottom'
  | 'bottomLeft'
  | 'bottomRight';

// ============================================================================
// Configuration Interfaces
// ============================================================================

/**
 * Configuration options for showing a notification.
 *
 * @remarks
 * This interface defines all the options available when calling notification
 * methods like `api.success()`, `api.error()`, etc.
 *
 * @example
 * ```tsx
 * const config: NotificationConfig = {
 *   message: 'File Uploaded',
 *   description: 'Your file has been uploaded successfully.',
 *   duration: 5,
 *   placement: 'topRight',
 *   closable: true,
 * };
 * api.success(config);
 * ```
 */
export interface NotificationConfig {
  /** Notification title/message - the primary text displayed prominently */
  message: ReactNode;

  /** Notification description - secondary text with more details */
  description?: ReactNode;

  /** Notification type - determines the color scheme and icon */
  type?: NotificationType;

  /** Duration in seconds before auto-close (0 or null = no auto close) */
  duration?: number | null;

  /** Unique key to identify and update existing notifications */
  key?: string;

  /** Callback function invoked when the notification closes */
  onClose?: () => void;

  /** Callback function invoked when the notification is clicked */
  onClick?: () => void;

  /** Custom icon to replace the default type icon */
  icon?: ReactNode;

  /** Additional CSS class for custom styling */
  className?: string;

  /** Inline styles for the notification container */
  style?: CSSProperties;

  /** Screen position where the notification appears */
  placement?: NotificationPlacement;

  /** Custom action content displayed in the notification */
  actions?: ReactNode;

  /** Custom close icon to replace the default */
  closeIcon?: ReactNode;

  /** Whether to show the close button (default: true) */
  closable?: boolean;

  /** ARIA role for accessibility ('alert' for urgent, 'status' for passive) */
  role?: 'alert' | 'status';

  /** Additional props passed to the notification container */
  props?: Record<string, unknown>;
}

/**
 * Extended notification configuration with internal properties.
 *
 * @remarks
 * Used internally by the notification system to track notification instances.
 *
 * @internal
 */
export interface NotificationArgsProps extends NotificationConfig {
  /** Internal unique identifier for the notification instance */
  id?: string;
}

// ============================================================================
// API Interfaces
// ============================================================================

/**
 * Notification API instance returned by useNotification hook.
 *
 * @remarks
 * This interface defines the methods available on the notification API object.
 * Each method corresponds to a notification type or action.
 *
 * @example
 * ```tsx
 * const [api] = useNotification();
 *
 * // Show different types
 * api.success({ message: 'Saved!' });
 * api.error({ message: 'Failed!' });
 * api.info({ message: 'Note' });
 * api.warning({ message: 'Caution' });
 *
 * // Generic open
 * api.open({ message: 'Custom', type: 'info' });
 *
 * // Close notifications
 * api.destroy('specific-key');
 * api.destroy(); // Close all
 * ```
 */
export interface NotificationInstance {
  /** Show a success notification with green styling */
  success: (config: NotificationConfig) => void;

  /** Show an error notification with red styling */
  error: (config: NotificationConfig) => void;

  /** Show an info notification with blue styling */
  info: (config: NotificationConfig) => void;

  /** Show a warning notification with yellow styling */
  warning: (config: NotificationConfig) => void;

  /** Open a notification with explicit config (type in config) */
  open: (config: NotificationConfig) => void;

  /** Destroy notification(s) - by key for specific, or all if no key provided */
  destroy: (key?: string) => void;
}

/**
 * Global configuration options for the notification system.
 *
 * @remarks
 * These settings are applied system-wide and affect all notifications.
 * Can be set via NotificationProvider or notification.config().
 *
 * @example
 * ```tsx
 * const globalConfig: NotificationGlobalConfig = {
 *   duration: 3,
 *   maxCount: 5,
 *   placement: 'topRight',
 *   top: 24,
 *   bottom: 24,
 * };
 * ```
 */
export interface NotificationGlobalConfig {
  /** Default duration in seconds for all notifications (default: 4.5) */
  duration?: number;

  /** Maximum number of notifications shown at once (default: 5) */
  maxCount?: number;

  /** Default placement for notifications (default: 'topRight') */
  placement?: NotificationPlacement;

  /** Distance from top of viewport in pixels */
  top?: number;

  /** Distance from bottom of viewport in pixels */
  bottom?: number;

  /** Distance from right of viewport in pixels (for right placements) */
  right?: number;

  /** Distance from left of viewport in pixels (for left placements) */
  left?: number;

  /** CSS class prefix for styling customization */
  prefixCls?: string;

  /** Enable right-to-left layout mode */
  rtl?: boolean;

  /** Default close icon for all notifications */
  closeIcon?: ReactNode;

  /** Whether notifications are closable by default */
  closable?: boolean;
}

// ============================================================================
// Component Props Interfaces
// ============================================================================

/**
 * Props for the NotificationProvider component.
 *
 * @remarks
 * The NotificationProvider wraps your application to enable the notification
 * system. It manages the notification state and renders the notification container.
 *
 * @example
 * ```tsx
 * <NotificationProvider
 *   maxCount={5}
 *   placement="topRight"
 *   top={24}
 *   bottom={24}
 * >
 *   <App />
 * </NotificationProvider>
 * ```
 */
export interface NotificationProviderProps {
  /** Child components that can access the notification API */
  children: ReactNode;

  /** Global configuration options */
  config?: NotificationGlobalConfig;

  /** Maximum number of notifications displayed at once */
  maxCount?: number;

  /** Default placement for notifications */
  placement?: NotificationPlacement;

  /** Distance from top of viewport in pixels */
  top?: number;

  /** Distance from bottom of viewport in pixels */
  bottom?: number;
}

/**
 * Props for individual NotificationItem components.
 *
 * @remarks
 * Used internally to render each notification. Can also be used directly
 * for custom notification implementations.
 *
 * @example
 * ```tsx
 * <NotificationItem
 *   id="notification-1"
 *   type="success"
 *   message="File uploaded"
 *   description="Your file has been uploaded successfully."
 *   duration={4.5}
 *   closable
 *   onRemove={(id) => handleRemove(id)}
 * />
 * ```
 */
export interface NotificationItemProps {
  /** Unique identifier for the notification */
  id: string;

  /** Notification type determining visual style */
  type: NotificationType;

  /** Primary title/message text */
  message: ReactNode;

  /** Secondary description text */
  description?: ReactNode;

  /** Duration in seconds before auto-close */
  duration?: number | null;

  /** Callback when notification closes */
  onClose?: () => void;

  /** Callback when notification is clicked */
  onClick?: () => void;

  /** Custom icon element */
  icon?: ReactNode;

  /** Additional CSS class */
  className?: string;

  /** Inline styles */
  style?: CSSProperties;

  /** Action content */
  actions?: ReactNode;

  /** Custom close icon */
  closeIcon?: ReactNode;

  /** Whether close button is shown */
  closable?: boolean;

  /** Internal callback to remove notification from state */
  onRemove?: (id: string) => void;
}

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default values for notification configuration.
 *
 * @remarks
 * These defaults are used when specific values are not provided.
 * They can be overridden at the provider level or per-notification.
 */
export const NOTIFICATION_DEFAULTS = {
  /** Default duration in seconds */
  duration: 4.5,
  /** Maximum notifications shown at once */
  maxCount: 5,
  /** Default screen placement */
  placement: 'topRight' as NotificationPlacement,
  /** Default top offset in pixels */
  top: 24,
  /** Default bottom offset in pixels */
  bottom: 24,
  /** Default right offset in pixels */
  right: 24,
  /** Default left offset in pixels */
  left: 24,
  /** Default closable state */
  closable: true,
};

/**
 * Default icons for each notification type.
 *
 * @remarks
 * These Unicode characters are used as fallback icons when custom
 * icons are not provided. Engine implementations may override these
 * with more sophisticated SVG icons.
 */
export const NOTIFICATION_ICONS: Record<Exclude<NotificationType, 'open'>, string> = {
  /** Checkmark for success */
  success: '✓',
  /** X mark for error */
  error: '✕',
  /** Information symbol for info */
  info: 'ℹ',
  /** Warning triangle for warning */
  warning: '⚠',
};
