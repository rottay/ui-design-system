/**
 * @fileoverview Notification Rustic Engine - Rottay Design System
 * @description Vanilla HTML/CSS implementation of the Notification component.
 * Provides a zero-dependency notification experience with maximum accessibility.
 *
 * @remarks
 * The Rustic engine uses pure HTML/CSS and minimal JavaScript to provide:
 * - Zero external dependencies
 * - Maximum accessibility compliance
 * - Full control over styling
 * - Lightweight bundle footprint
 * - Server-side rendering compatibility
 *
 * This engine is recommended for applications requiring no external UI dependencies,
 * maximum accessibility, or those building custom design systems on top of Rottay.
 *
 * Note: Static methods are not supported in Rustic. Always use the Provider
 * and useNotification hook pattern.
 *
 * @example Basic Usage
 * ```tsx
 * import { NotificationProvider, useNotification } from '@rottay/design-system/rustic';
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
 * @module Notification/Engines/Rustic
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
} from 'react';
import type {
  NotificationConfig,
  NotificationInstance,
  NotificationProviderProps,
  NotificationItemProps,
  NotificationType,
  NotificationPlacement,
} from '../Notification.types';
import { NOTIFICATION_DEFAULTS, NOTIFICATION_ICONS } from '../Notification.types';
import { warnOnceInDev } from '../../../../../core/utils/runtime-logger';

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
const generateId = () => `rustic-notification-${++notificationId}`;

// ============================================================================
// Style Definitions
// ============================================================================

/**
 * Inline styles for Rustic engine components.
 *
 * @remarks
 * All styles are defined as JavaScript objects for zero CSS dependency.
 * These provide a solid baseline that can be customized through the
 * style prop or CSS custom properties.
 *
 * @internal
 */
const styles = {
  /**
   * Container styles based on placement position.
   */
  container: (placement: NotificationPlacement, top: number, bottom: number): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'fixed',
      zIndex: 'var(--ds-notification-z-index, 1000)' as unknown as number,
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--ds-notification-gap, 12px)',
      pointerEvents: 'none',
      maxWidth: 'var(--ds-notification-max-width, 400px)',
      width: '100%',
    };

    const placements: Record<NotificationPlacement, React.CSSProperties> = {
      top: { top, left: '50%', transform: 'translateX(-50%)', alignItems: 'center' },
      topLeft: { top, left: 24 },
      topRight: { top, right: 24 },
      bottom: { bottom, left: '50%', transform: 'translateX(-50%)', alignItems: 'center' },
      bottomLeft: { bottom, left: 24 },
      bottomRight: { bottom, right: 24 },
    };

    return { ...base, ...placements[placement] };
  },

  /**
   * Notification item styles.
   */
  notification: {
    base: {
      display: 'flex',
      gap: '12px',
      padding: 'var(--ds-notification-padding, 16px 24px)',
      borderRadius: 'var(--ds-notification-radius, 8px)',
      backgroundColor: 'var(--ds-notification-bg, var(--ds-color-bg-elevated))',
      boxShadow: 'var(--ds-notification-shadow, var(--ds-shadow-lg))',
      pointerEvents: 'auto' as const,
      animation:
        'notificationSlideIn var(--ds-notification-enter-duration, 240ms) var(--ds-notification-enter-easing, cubic-bezier(0.22, 1, 0.36, 1))',
      minWidth: 'var(--ds-notification-min-width, 300px)',
    } as React.CSSProperties,
    success: { borderLeft: '4px solid var(--ds-notification-success-color, var(--ds-color-success))' },
    error: { borderLeft: '4px solid var(--ds-notification-error-color, var(--ds-color-error))' },
    info: { borderLeft: '4px solid var(--ds-notification-info-color, var(--ds-color-primary-500))' },
    warning: { borderLeft: '4px solid var(--ds-notification-warning-color, var(--ds-color-warning))' },
    open: {},
  },

  /**
   * Icon styles by type.
   */
  icon: {
    base: {
      display: 'flex',
      alignItems: 'flex-start',
      fontSize: '20px',
      paddingTop: '2px',
    } as React.CSSProperties,
    success: { color: 'var(--ds-notification-success-color, var(--ds-color-success))' },
    error: { color: 'var(--ds-notification-error-color, var(--ds-color-error))' },
    info: { color: 'var(--ds-notification-info-color, var(--ds-color-primary-500))' },
    warning: { color: 'var(--ds-notification-warning-color, var(--ds-color-warning))' },
    open: { color: 'var(--ds-notification-info-color, var(--ds-color-primary-500))' },
  },

  /**
   * Content container styles.
   */
  content: {
    flex: 1,
    minWidth: 0,
  } as React.CSSProperties,

  /**
   * Message/title styles.
   */
  message: {
    fontWeight: 600,
    fontSize: 'var(--ds-notification-title-size, 16px)',
    lineHeight: '24px',
    color: 'var(--ds-notification-title-color, var(--ds-color-text-primary))',
    marginBottom: '4px',
  } as React.CSSProperties,

  /**
   * Description styles.
   */
  description: {
    fontSize: 'var(--ds-notification-desc-size, 14px)',
    lineHeight: '22px',
    color: 'var(--ds-notification-desc-color, var(--ds-color-text-secondary))',
  } as React.CSSProperties,

  /**
   * Action button container styles.
   */
  btnContainer: {
    marginTop: '12px',
  } as React.CSSProperties,

  /**
   * Close button styles.
   */
  closeButton: {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    padding: '4px',
    color: 'var(--ds-notification-close-color, var(--ds-color-text-tertiary))',
    fontSize: '14px',
    lineHeight: 1,
    transition: 'color var(--ds-duration-fast, 200ms)',
    marginLeft: '8px',
  } as React.CSSProperties,
};

// ============================================================================
// Animation Styles Injection
// ============================================================================

/**
 * Injects CSS keyframe animations into the document head.
 *
 * @remarks
 * Called once when the provider mounts to add slide animations.
 * Checks for existing styles to prevent duplicates.
 *
 * @internal
 */
const injectStyles = () => {
  if (typeof document === 'undefined') return;

  const styleId = 'rustic-notification-styles';
  if (document.getElementById(styleId)) return;

  const styleSheet = document.createElement('style');
  styleSheet.id = styleId;
  styleSheet.textContent = `
    @keyframes notificationSlideIn {
      from {
        opacity: 0;
        transform: translateX(calc(var(--ds-personality-animation-offset-distance, 12px) * 2));
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    @keyframes notificationSlideOut {
      from {
        opacity: 1;
        transform: translateX(0);
      }
      to {
        opacity: 0;
        transform: translateX(calc(var(--ds-personality-animation-offset-distance, 12px) * 2));
      }
    }
  `;
  document.head.appendChild(styleSheet);
};

// ============================================================================
// Notification Provider
// ============================================================================

/**
 * NotificationProvider component for the Rustic engine.
 *
 * @description
 * Provides notification context to child components and manages the
 * notification state. Renders notifications using vanilla HTML/CSS.
 *
 * @remarks
 * Key features:
 * - Zero external dependencies
 * - Context-based notification management
 * - CSS keyframe animations
 * - Full accessibility with ARIA attributes
 * - Supports multiple placements simultaneously
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
  // Effects
  // ========================================================================

  /**
   * Inject animation styles on mount.
   */
  useEffect(() => {
    injectStyles();
  }, []);

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
        actions: config.actions,
        closeIcon: config.closeIcon,
        closable: config.closable ?? NOTIFICATION_DEFAULTS.closable,
        placement: config.placement || placement,
      };

      setNotifications((prev) => {
        // Update existing notification if key matches
        const existingIndex = prev.findIndex((n) => config.key && n.key === config.key);
        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = newNotification;
          return updated;
        }

        // Add new notification, respecting maxCount
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
  // Grouping
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
          style={styles.container(p as NotificationPlacement, top, bottom)}
          role="log"
          aria-live="polite"
        >
          {items.map((notification) => {
            const { key: _notificationKey, ...notificationProps } = notification;

            return (
              <NotificationItem
                key={notification.id}
                {...notificationProps}
                onRemove={removeNotification}
              />
            );
          })}
        </div>
      ))}
    </NotificationContext.Provider>
  );
};

NotificationProvider.displayName = 'NotificationProvider.Rustic';

// ============================================================================
// useNotification Hook
// ============================================================================

/**
 * Hook for accessing the notification API in the Rustic engine.
 *
 * @description
 * Returns a notification API instance. Rustic doesn't need a context holder
 * element since notifications are rendered directly by the provider.
 *
 * @remarks
 * Must be used within a NotificationProvider. If used outside, returns
 * a no-op API that does nothing.
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
 * NotificationItem component for the Rustic engine.
 *
 * @description
 * Renders an individual notification using vanilla HTML/CSS.
 * Supports all standard notification features with inline styles.
 *
 * @remarks
 * Features:
 * - CSS keyframe animations for enter/exit
 * - Full accessibility with ARIA attributes
 * - Hover state for close button
 * - Type-based color coding
 *
 * @param props - {@link NotificationItemProps}
 * @returns A vanilla HTML notification item
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
  actions,
  closeIcon,
  closable = NOTIFICATION_DEFAULTS.closable,
  onRemove,
}) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isExiting, setIsExiting] = useState(false);

  // ========================================================================
  // Auto-close Timer
  // ========================================================================

  useEffect(() => {
    if (duration && duration > 0) {
      timerRef.current = setTimeout(() => {
        handleClose();
      }, duration * 1000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [id, duration]);

  // ========================================================================
  // Event Handlers
  // ========================================================================

  /**
   * Handles manual close with exit animation.
   */
  const handleClose = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsExiting(true);
    setTimeout(() => {
      onRemove?.(id);
      onClose?.();
    }, 240);
  };

  // ========================================================================
  // Icon Rendering
  // ========================================================================

  /**
   * Renders the appropriate icon based on type and custom icon prop.
   */
  const renderIcon = () => {
    if (icon === null) return null;
    if (icon) return icon;
    if (type === 'open') return null;

    return (
      <span style={{ ...styles.icon.base, ...styles.icon[type] }}>
        {NOTIFICATION_ICONS[type as keyof typeof NOTIFICATION_ICONS]}
      </span>
    );
  };

  // ========================================================================
  // Style Computation
  // ========================================================================

  /**
   * Combined notification styles with animation state.
   */
  const notificationStyle: React.CSSProperties = {
    ...styles.notification.base,
    ...styles.notification[type],
    ...(isExiting
      ? {
          animation:
            'notificationSlideOut var(--ds-notification-exit-duration, 180ms) var(--ds-notification-exit-easing, cubic-bezier(0.4, 0, 1, 1)) forwards',
        }
      : {}),
    cursor: onClick ? 'pointer' : 'default',
    ...style,
  };

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <div
      className={className}
      style={notificationStyle}
      onClick={onClick}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      {renderIcon()}

      {/* Content */}
      <div style={styles.content}>
        {/* Title */}
        <div style={styles.message}>{message}</div>

        {/* Description */}
        {description && <div style={styles.description}>{description}</div>}

        {/* Action Button */}
        {actions && <div style={styles.btnContainer}>{actions}</div>}
      </div>

      {/* Close Button */}
      {closable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          style={styles.closeButton}
          aria-label="Close notification"
          onMouseEnter={(e) => {
            e.currentTarget.style.color =
              'var(--ds-notification-close-color-hover, var(--ds-color-text-primary))';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color =
              'var(--ds-notification-close-color, var(--ds-color-text-tertiary))';
          }}
        >
          {closeIcon || '×'}
        </button>
      )}
    </div>
  );
};

NotificationItem.displayName = 'NotificationItem.Rustic';

// ============================================================================
// Static Notification Methods (Not Supported)
// ============================================================================

/**
 * Static notification API for the Rustic engine.
 *
 * @remarks
 * Static methods are not supported in the Rustic engine because it relies
 * on React context for state management. All methods will log a warning
 * instructing users to use the Provider and hook pattern instead.
 *
 * @example
 * ```tsx
 * // DON'T do this with Rustic:
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
  success: () => warnOnceInDev('notification-rustic:provider-required', 'Rustic notification: Please use NotificationProvider and useNotification hook'),
  error: () => warnOnceInDev('notification-rustic:provider-required', 'Rustic notification: Please use NotificationProvider and useNotification hook'),
  info: () => warnOnceInDev('notification-rustic:provider-required', 'Rustic notification: Please use NotificationProvider and useNotification hook'),
  warning: () => warnOnceInDev('notification-rustic:provider-required', 'Rustic notification: Please use NotificationProvider and useNotification hook'),
  open: () => warnOnceInDev('notification-rustic:provider-required', 'Rustic notification: Please use NotificationProvider and useNotification hook'),
  destroy: () => warnOnceInDev('notification-rustic:provider-required', 'Rustic notification: Please use NotificationProvider and useNotification hook'),
};

// ============================================================================
// Default Export
// ============================================================================

/**
 * Default export containing all Rustic engine exports.
 */
export default {
  NotificationProvider,
  NotificationItem,
  useNotification,
  notification,
};
