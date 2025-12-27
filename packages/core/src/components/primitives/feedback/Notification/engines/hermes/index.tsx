/**
 * @fileoverview Notification Hermes Engine - Rottay Design System
 * @description DaisyUI/Tailwind-based implementation of the Notification component.
 * Provides a lightweight notification experience using utility-first CSS classes.
 *
 * @remarks
 * The Hermes engine leverages DaisyUI's toast and alert components to provide:
 * - Utility-first Tailwind CSS styling
 * - Lightweight bundle size
 * - Easy customization through class overrides
 * - Consistent DaisyUI theming integration
 *
 * This engine is recommended for applications using Tailwind CSS and DaisyUI,
 * or those prioritizing bundle size over feature richness.
 *
 * Note: Static methods are not supported in Hermes. Always use the Provider
 * and useNotification hook pattern.
 *
 * @example Basic Usage
 * ```tsx
 * import { NotificationProvider, useNotification } from '@rottay/design-system/hermes';
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
 *   const [api] = useNotification();
 *
 *   return (
 *     <button onClick={() => api.success({ message: 'Saved!' })}>
 *       Save
 *     </button>
 *   );
 * }
 * ```
 *
 * @module Notification/Engines/Hermes
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
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
// Internal Types
// ============================================================================

/**
 * Internal notification state with additional properties.
 *
 * @internal
 */
interface InternalNotification extends NotificationItemProps {
  /** Optional key for updating existing notifications */
  key?: string;
  /** Placement position for this notification */
  placement: NotificationPlacement;
}

// ============================================================================
// Context
// ============================================================================

/**
 * Context for providing notification API to child components.
 *
 * @internal
 */
const NotificationContext = createContext<NotificationInstance | null>(null);

// ============================================================================
// ID Generator
// ============================================================================

/**
 * Counter for generating unique notification IDs.
 *
 * @internal
 */
let notificationId = 0;

/**
 * Generates a unique notification ID.
 *
 * @returns Unique string identifier
 * @internal
 */
const generateId = () => `hermes-notification-${++notificationId}`;

// ============================================================================
// Notification Provider
// ============================================================================

/**
 * NotificationProvider component for the Hermes engine.
 *
 * @description
 * Provides notification context to child components and manages the
 * notification state. Renders notifications using DaisyUI's toast component.
 *
 * @remarks
 * Key features:
 * - Context-based notification management
 * - Supports multiple placements simultaneously
 * - Automatic notification stacking and limiting
 * - DaisyUI toast positioning classes
 *
 * @param props - {@link NotificationProviderProps}
 * @returns Provider component with notification containers
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
  // ========================================================================
  // State Management
  // ========================================================================

  const [notifications, setNotifications] = useState<InternalNotification[]>([]);

  // ========================================================================
  // Notification Actions
  // ========================================================================

  /**
   * Removes a notification by ID.
   */
  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  /**
   * Adds a new notification to the stack.
   * Updates existing notification if key matches.
   */
  const addNotification = useCallback(
    (config: NotificationConfig & { type: NotificationType }) => {
      const id = config.key || generateId();

      const newNotification: InternalNotification = {
        id,
        key: config.key,
        type: config.type,
        message: config.message,
        description: config.description,
        duration: config.duration ?? NOTIFICATION_DEFAULTS.duration,
        onClose: config.onClose,
        onClick: config.onClick,
        icon: config.icon,
        className: config.className,
        style: config.style,
        btn: config.btn,
        closeIcon: config.closeIcon,
        closable: config.closable ?? NOTIFICATION_DEFAULTS.closable,
        placement: config.placement || placement,
      };

      setNotifications((prev) => {
        // Update if key exists
        const existingIndex = prev.findIndex((n) => config.key && n.key === config.key);
        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = newNotification;
          return updated;
        }

        // Add new, respecting maxCount
        const updated = [...prev, newNotification];
        if (updated.length > maxCount) {
          return updated.slice(-maxCount);
        }
        return updated;
      });
    },
    [maxCount, placement]
  );

  /**
   * Creates a notification method for a specific type.
   */
  const createNotificationMethod = useCallback(
    (type: NotificationType) => {
      return (config: NotificationConfig) => {
        addNotification({ ...config, type });
      };
    },
    [addNotification]
  );

  // ========================================================================
  // API Instance
  // ========================================================================

  /**
   * Notification API provided to consumers.
   */
  const notificationApi: NotificationInstance = {
    success: createNotificationMethod('success'),
    error: createNotificationMethod('error'),
    info: createNotificationMethod('info'),
    warning: createNotificationMethod('warning'),
    open: createNotificationMethod('open'),
    destroy: (key?: string) => {
      if (key) {
        setNotifications((prev) => prev.filter((n) => n.key !== key && n.id !== key));
      } else {
        setNotifications([]);
      }
    },
  };

  // ========================================================================
  // Grouping and Styling
  // ========================================================================

  /**
   * Group notifications by their placement position.
   */
  const groupedNotifications = notifications.reduce<Record<NotificationPlacement, InternalNotification[]>>(
    (acc, notification) => {
      const p = notification.placement || placement;
      if (!acc[p]) acc[p] = [];
      acc[p].push(notification);
      return acc;
    },
    {} as Record<NotificationPlacement, InternalNotification[]>
  );

  /**
   * DaisyUI toast classes for each placement.
   */
  const placementClasses: Record<NotificationPlacement, string> = {
    top: 'toast toast-top toast-center',
    topLeft: 'toast toast-top toast-start',
    topRight: 'toast toast-top toast-end',
    bottom: 'toast toast-bottom toast-center',
    bottomLeft: 'toast toast-bottom toast-start',
    bottomRight: 'toast toast-bottom toast-end',
  };

  /**
   * Margin styles for offset configuration.
   */
  const placementStyles: Record<NotificationPlacement, React.CSSProperties> = {
    top: { marginTop: top },
    topLeft: { marginTop: top },
    topRight: { marginTop: top },
    bottom: { marginBottom: bottom },
    bottomLeft: { marginBottom: bottom },
    bottomRight: { marginBottom: bottom },
  };

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <NotificationContext.Provider value={notificationApi}>
      {children}
      {/* Render notification containers for each placement with notifications */}
      {Object.entries(groupedNotifications).map(([p, items]) => (
        <div
          key={p}
          className={placementClasses[p as NotificationPlacement]}
          style={placementStyles[p as NotificationPlacement]}
        >
          {items.map((notification) => (
            <NotificationItem
              key={notification.id}
              {...notification}
              onRemove={removeNotification}
            />
          ))}
        </div>
      ))}
    </NotificationContext.Provider>
  );
};

NotificationProvider.displayName = 'NotificationProvider.Hermes';

// ============================================================================
// useNotification Hook
// ============================================================================

/**
 * Hook for accessing the notification API in the Hermes engine.
 *
 * @description
 * Returns a notification API instance. Unlike Titan, Hermes doesn't need
 * a context holder element since notifications are rendered by the provider.
 *
 * @remarks
 * Must be used within a NotificationProvider. If used outside, returns
 * a no-op API that logs warnings.
 *
 * @returns Tuple of [NotificationInstance, null]
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const [api] = useNotification();
 *
 *   return (
 *     <button onClick={() => api.success({ message: 'Done!' })}>
 *       Complete
 *     </button>
 *   );
 * }
 * ```
 */
export function useNotification(): [NotificationInstance, React.ReactElement | null] {
  const context = useContext(NotificationContext);

  // Return no-op API if outside provider
  if (!context) {
    const noop = () => {};
    return [
      {
        success: noop,
        error: noop,
        info: noop,
        warning: noop,
        open: noop,
        destroy: () => {},
      },
      null,
    ];
  }

  return [context, null];
}

// ============================================================================
// Notification Item Component
// ============================================================================

/**
 * NotificationItem component for the Hermes engine.
 *
 * @description
 * Renders an individual notification using DaisyUI alert classes.
 * Supports all standard notification features with Tailwind styling.
 *
 * @remarks
 * Uses DaisyUI classes:
 * - `alert` - Base alert styling
 * - `alert-success`, `alert-error`, `alert-info`, `alert-warning` - Type variants
 * - `shadow-lg` - Elevation shadow
 *
 * @param props - {@link NotificationItemProps}
 * @returns A DaisyUI-styled notification item
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
  className = '',
  style,
  btn,
  closeIcon,
  closable = NOTIFICATION_DEFAULTS.closable,
  onRemove,
}) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ========================================================================
  // Auto-close Timer
  // ========================================================================

  useEffect(() => {
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
   * DaisyUI alert classes for each notification type.
   */
  const alertClasses: Record<NotificationType, string> = {
    success: 'alert-success',
    error: 'alert-error',
    info: 'alert-info',
    warning: 'alert-warning',
    open: '',
  };

  /**
   * SVG icons for each notification type.
   */
  const icons: Record<NotificationType, ReactNode> = {
    success: (
      <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
      <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    info: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    open: null,
  };

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <div
      className={`alert ${alertClasses[type]} shadow-lg min-w-80 ${className}`}
      style={style}
      onClick={onClick}
      role="alert"
    >
      <div className="flex gap-3 w-full">
        {/* Icon */}
        {icon !== null && <span>{icon || icons[type]}</span>}

        {/* Content */}
        <div className="flex-1">
          {/* Title */}
          <div className="font-bold">{message}</div>

          {/* Description */}
          {description && <div className="text-sm opacity-80">{description}</div>}

          {/* Action Button */}
          {btn && <div className="mt-2">{btn}</div>}
        </div>

        {/* Close Button */}
        {closable && (
          <button
            className="btn btn-ghost btn-sm btn-square"
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            aria-label="Close"
          >
            {closeIcon || (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

NotificationItem.displayName = 'NotificationItem.Hermes';

// ============================================================================
// Static Notification Methods (Not Supported)
// ============================================================================

/**
 * Static notification API for the Hermes engine.
 *
 * @remarks
 * Static methods are not supported in the Hermes engine because it relies
 * on React context for state management. All methods will log a warning
 * instructing users to use the Provider and hook pattern instead.
 *
 * @example
 * ```tsx
 * // DON'T do this with Hermes:
 * notification.success({ message: 'Hello' }); // Will only log a warning
 *
 * // DO this instead:
 * function MyComponent() {
 *   const [api] = useNotification();
 *   api.success({ message: 'Hello' }); // Works correctly
 * }
 * ```
 */
export const notification: NotificationInstance = {
  success: () => console.warn('Hermes notification: Please use NotificationProvider and useNotification hook'),
  error: () => console.warn('Hermes notification: Please use NotificationProvider and useNotification hook'),
  info: () => console.warn('Hermes notification: Please use NotificationProvider and useNotification hook'),
  warning: () => console.warn('Hermes notification: Please use NotificationProvider and useNotification hook'),
  open: () => console.warn('Hermes notification: Please use NotificationProvider and useNotification hook'),
  destroy: () => console.warn('Hermes notification: Please use NotificationProvider and useNotification hook'),
};

// ============================================================================
// Default Export
// ============================================================================

/**
 * Default export containing all Hermes engine exports.
 */
export default {
  NotificationProvider,
  NotificationItem,
  useNotification,
  notification,
};
