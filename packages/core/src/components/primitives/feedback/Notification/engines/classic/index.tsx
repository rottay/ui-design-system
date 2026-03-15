/**
 * @fileoverview Notification Classic Engine - Rottay Design System
 * @description Ant Design-based implementation of the Notification component.
 * Provides the most feature-rich notification experience with built-in animations.
 *
 * @remarks
 * The Classic engine leverages Ant Design's notification API to provide:
 * - Smooth slide-in/out animations
 * - Static methods that work without a provider
 * - Full integration with Ant Design's theming system
 * - Progress indicators and complex notification layouts
 *
 * This engine is recommended for applications already using Ant Design or those
 * requiring advanced notification features without additional configuration.
 *
 * @example Using Static Methods (No Provider Required)
 * ```tsx
 * import { notification } from '@rottay/design-system';
 *
 * notification.success({
 *   message: 'Success!',
 *   description: 'Your file has been uploaded.',
 * });
 * ```
 *
 * @example Using Hook with Provider
 * ```tsx
 * import { NotificationProvider, useNotification } from '@rottay/design-system';
 *
 * function App() {
 *   return (
 *     <NotificationProvider>
 *       <MyComponent />
 *     </NotificationProvider>
 *   );
 * }
 *
 * function MyComponent() {
 *   const [api, contextHolder] = useNotification();
 *
 *   return (
 *     <>
 *       {contextHolder}
 *       <button onClick={() => api.success({ message: 'Done!' })}>
 *         Show
 *       </button>
 *     </>
 *   );
 * }
 * ```
 *
 * @module Notification/Engines/Classic
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React, { useCallback, useEffect } from 'react';
import { notification as antNotification, App } from 'antd';
import type {
  NotificationConfig,
  NotificationInstance,
  NotificationProviderProps,
  NotificationItemProps,
  NotificationType,
  NotificationPlacement,
} from '../../types';
import { NOTIFICATION_DEFAULTS } from '../../types';

// ============================================================================
// Placement Mapping
// ============================================================================

/**
 * Maps Rottay placement values to Ant Design placement values.
 *
 * @remarks
 * Currently a 1:1 mapping since Ant Design uses the same placement names.
 * Maintained for consistency and potential future mapping changes.
 *
 * @internal
 */
const placementMap: Record<NotificationPlacement, NotificationPlacement> = {
  top: 'top',
  topLeft: 'topLeft',
  topRight: 'topRight',
  bottom: 'bottom',
  bottomLeft: 'bottomLeft',
  bottomRight: 'bottomRight',
};

// ============================================================================
// Notification Provider
// ============================================================================

/**
 * NotificationProvider component for the Classic engine.
 *
 * @description
 * Wraps children with Ant Design's App component and configures
 * the global notification settings. Required for proper theming
 * integration and context-based notifications.
 *
 * @remarks
 * The provider configures:
 * - Default placement position
 * - Maximum notification count
 * - Top/bottom offset distances
 *
 * @param props - {@link NotificationProviderProps}
 * @returns Provider component wrapping children
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
export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  maxCount = NOTIFICATION_DEFAULTS.maxCount,
  placement = NOTIFICATION_DEFAULTS.placement,
  top = NOTIFICATION_DEFAULTS.top,
  bottom = NOTIFICATION_DEFAULTS.bottom,
}) => {
  // Configure Ant Design notification globally
  useEffect(() => {
    antNotification.config({
      top,
      bottom,
      maxCount,
      placement: placementMap[placement],
    });
  }, [top, bottom, maxCount, placement]);

  return <App>{children}</App>;
};

NotificationProvider.displayName = 'NotificationProvider.Classic';

// ============================================================================
// useNotification Hook
// ============================================================================

/**
 * Hook for accessing the notification API in the Classic engine.
 *
 * @description
 * Returns a notification API instance and a context holder element.
 * The context holder should be rendered in your component tree to
 * enable context-aware notifications.
 *
 * @remarks
 * The returned API provides methods for all notification types:
 * - `success()` - Green success notifications
 * - `error()` - Red error notifications
 * - `info()` - Blue informational notifications
 * - `warning()` - Yellow warning notifications
 * - `open()` - Generic notifications with custom config
 * - `destroy()` - Close specific or all notifications
 *
 * @returns Tuple of [NotificationInstance, ReactElement | null]
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const [api, contextHolder] = useNotification();
 *
 *   const handleClick = () => {
 *     api.success({
 *       message: 'Task Complete',
 *       description: 'Your changes have been saved.',
 *       duration: 4.5,
 *     });
 *   };
 *
 *   return (
 *     <>
 *       {contextHolder}
 *       <button onClick={handleClick}>Save</button>
 *     </>
 *   );
 * }
 * ```
 */
export function useNotification(): [NotificationInstance, React.ReactElement | null] {
  const [api, contextHolder] = antNotification.useNotification();

  /**
   * Creates a notification method for a specific type.
   *
   * @param type - The notification type
   * @returns A function that shows notifications of that type
   */
  const createNotificationMethod = useCallback(
    (type: NotificationType) => {
      return (config: NotificationConfig) => {
        const methodName = type === 'open' ? 'open' : type;

        api[methodName]({
          message: config.message,
          description: config.description,
          duration: config.duration ?? NOTIFICATION_DEFAULTS.duration,
          key: config.key,
          icon: config.icon,
          className: config.className,
          style: config.style,
          placement: config.placement ? placementMap[config.placement] : undefined,
          actions: config.actions,
          closeIcon: config.closeIcon,
          onClose: config.onClose,
          onClick: config.onClick,
        });
      };
    },
    [api]
  );

  // Build the notification instance with all methods
  const notificationInstance: NotificationInstance = {
    success: createNotificationMethod('success'),
    error: createNotificationMethod('error'),
    info: createNotificationMethod('info'),
    warning: createNotificationMethod('warning'),
    open: createNotificationMethod('open'),
    destroy: (key?: string) => {
      if (key) {
        api.destroy(key);
      } else {
        antNotification.destroy();
      }
    },
  };

  return [notificationInstance, contextHolder as React.ReactElement | null];
}

// ============================================================================
// Notification Item Component
// ============================================================================

/**
 * NotificationItem component for the Classic engine.
 *
 * @description
 * Renders an individual notification item with Ant Design styling.
 * Used internally by the notification system but can also be used
 * directly for custom notification containers.
 *
 * @remarks
 * Features:
 * - Type-based color coding (success, error, info, warning)
 * - Auto-dismiss timer
 * - Closable with custom close icon support
 * - Action button slot
 * - Click handler for the entire notification
 *
 * @param props - {@link NotificationItemProps}
 * @returns A styled notification item
 *
 * @example
 * ```tsx
 * <NotificationItem
 *   id="notif-1"
 *   type="success"
 *   message="File Uploaded"
 *   description="Your file has been uploaded successfully."
 *   duration={4.5}
 *   closable
 *   onRemove={(id) => handleRemove(id)}
 * />
 * ```
 */
export const NotificationItem: React.FC<NotificationItemProps> = ({
  id,
  type,
  message,
  description,
  duration = NOTIFICATION_DEFAULTS.duration,
  onClose,
  onClick,
  icon,
  className,
  style,
  actions,
  closeIcon,
  closable = NOTIFICATION_DEFAULTS.closable,
  onRemove,
}) => {
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // ========================================================================
  // Auto-close Timer
  // ========================================================================

  React.useEffect(() => {
    if (duration && duration > 0) {
      timerRef.current = setTimeout(() => {
        onRemove?.(id);
        onClose?.();
      }, duration * 1000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [id, duration, onRemove, onClose]);

  // ========================================================================
  // Event Handlers
  // ========================================================================

  /**
   * Handles manual close of the notification.
   */
  const handleClose = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    onRemove?.(id);
    onClose?.();
  };

  // ========================================================================
  // Style Definitions
  // ========================================================================

  /**
   * Type-specific border styles.
   */
  const typeStyles: Record<NotificationType, React.CSSProperties> = {
    success: { borderLeft: '4px solid var(--ds-color-success)' },
    error: { borderLeft: '4px solid var(--ds-color-error)' },
    info: { borderLeft: '4px solid var(--ds-color-info)' },
    warning: { borderLeft: '4px solid var(--ds-color-warning)' },
    open: {},
  };

  /**
   * Type-specific icon colors.
   */
  const iconColors: Record<NotificationType, string> = {
    success: 'var(--ds-color-success)',
    error: 'var(--ds-color-error)',
    info: 'var(--ds-color-info)',
    warning: 'var(--ds-color-warning)',
    open: 'var(--ds-color-info)',
  };

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <div
      className={`ant-notification-notice ${className || ''}`}
      style={{
        padding: '16px 24px',
        borderRadius: '8px',
        backgroundColor: 'var(--ds-color-bg-elevated)',
        boxShadow: 'var(--ds-notification-shadow, var(--ds-shadow-lg))',
        cursor: onClick ? 'pointer' : 'default',
        ...typeStyles[type],
        ...style,
      }}
      onClick={onClick}
      role="alert"
    >
      <div style={{ display: 'flex', gap: '12px' }}>
        {/* Icon */}
        {icon !== null && (
          <span style={{ color: iconColors[type], fontSize: '24px' }}>
            {icon || (type !== 'open' ? (type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ℹ') : null)}
          </span>
        )}

        {/* Content */}
        <div style={{ flex: 1 }}>
          {/* Title */}
          <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: description ? '8px' : 0 }}>
            {message}
          </div>

          {/* Description */}
          {description && (
            <div
              style={{
                color: 'var(--ds-notification-description-color, var(--ds-color-text-secondary))',
                fontSize: '14px',
              }}
            >
              {description}
            </div>
          )}

          {/* Action Button */}
          {actions && <div style={{ marginTop: '12px' }}>{actions}</div>}
        </div>

        {/* Close Button */}
        {closable && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: '0',
              color: 'var(--ds-notification-close-color, var(--ds-color-text-tertiary))',
              fontSize: '14px',
            }}
            aria-label="Close"
          >
            {closeIcon || '×'}
          </button>
        )}
      </div>
    </div>
  );
};

NotificationItem.displayName = 'NotificationItem.Classic';

// ============================================================================
// Static Notification Methods
// ============================================================================

/**
 * Static notification API for the Classic engine.
 *
 * @description
 * Provides static methods for showing notifications without needing
 * a provider or hook. Uses Ant Design's global notification API.
 *
 * @remarks
 * These methods work anywhere in your application without setup.
 * However, they won't inherit context-specific theming. For full
 * theme integration, use the useNotification hook instead.
 *
 * @example
 * ```tsx
 * import { notification } from '@rottay/design-system';
 *
 * // Show notifications anywhere
 * notification.success({
 *   message: 'Success!',
 *   description: 'Operation completed.',
 * });
 *
 * // Destroy by key
 * notification.destroy('my-notification');
 *
 * // Destroy all
 * notification.destroy();
 * ```
 */
export const notification: NotificationInstance = {
  /**
   * Shows a success notification.
   */
  success: (config) => {
    antNotification.success({
      message: config.message,
      description: config.description,
      duration: config.duration ?? NOTIFICATION_DEFAULTS.duration,
      key: config.key,
      icon: config.icon,
      className: config.className,
      style: config.style,
      placement: config.placement ? placementMap[config.placement] : undefined,
      actions: config.actions,
      closeIcon: config.closeIcon,
      onClose: config.onClose,
      onClick: config.onClick,
    });
  },

  /**
   * Shows an error notification.
   */
  error: (config) => {
    antNotification.error({
      message: config.message,
      description: config.description,
      duration: config.duration ?? NOTIFICATION_DEFAULTS.duration,
      key: config.key,
      icon: config.icon,
      className: config.className,
      style: config.style,
      placement: config.placement ? placementMap[config.placement] : undefined,
      actions: config.actions,
      closeIcon: config.closeIcon,
      onClose: config.onClose,
      onClick: config.onClick,
    });
  },

  /**
   * Shows an info notification.
   */
  info: (config) => {
    antNotification.info({
      message: config.message,
      description: config.description,
      duration: config.duration ?? NOTIFICATION_DEFAULTS.duration,
      key: config.key,
      icon: config.icon,
      className: config.className,
      style: config.style,
      placement: config.placement ? placementMap[config.placement] : undefined,
      actions: config.actions,
      closeIcon: config.closeIcon,
      onClose: config.onClose,
      onClick: config.onClick,
    });
  },

  /**
   * Shows a warning notification.
   */
  warning: (config) => {
    antNotification.warning({
      message: config.message,
      description: config.description,
      duration: config.duration ?? NOTIFICATION_DEFAULTS.duration,
      key: config.key,
      icon: config.icon,
      className: config.className,
      style: config.style,
      placement: config.placement ? placementMap[config.placement] : undefined,
      actions: config.actions,
      closeIcon: config.closeIcon,
      onClose: config.onClose,
      onClick: config.onClick,
    });
  },

  /**
   * Opens a notification with custom configuration.
   */
  open: (config) => {
    antNotification.open({
      message: config.message,
      description: config.description,
      duration: config.duration ?? NOTIFICATION_DEFAULTS.duration,
      key: config.key,
      icon: config.icon,
      className: config.className,
      style: config.style,
      placement: config.placement ? placementMap[config.placement] : undefined,
      actions: config.actions,
      closeIcon: config.closeIcon,
      onClose: config.onClose,
      onClick: config.onClick,
    });
  },

  /**
   * Destroys notification(s) by key or all if no key provided.
   */
  destroy: (key?: string) => {
    if (key) {
      antNotification.destroy(key);
    } else {
      antNotification.destroy();
    }
  },
};

// ============================================================================
// Default Export
// ============================================================================

/**
 * Default export containing all Classic engine exports.
 */
export default {
  NotificationProvider,
  NotificationItem,
  useNotification,
  notification,
};
