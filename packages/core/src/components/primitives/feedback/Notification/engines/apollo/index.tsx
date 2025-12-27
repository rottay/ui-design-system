/**
 * @fileoverview Notification Apollo Engine - Rottay Design System
 * @description Vanilla HTML/CSS implementation of the Notification component.
 * Provides a zero-dependency notification experience with maximum accessibility.
 *
 * @remarks
 * The Apollo engine uses pure HTML/CSS and minimal JavaScript to provide:
 * - Zero external dependencies
 * - Maximum accessibility compliance
 * - Full control over styling
 * - Lightweight bundle footprint
 * - Server-side rendering compatibility
 *
 * This engine is recommended for applications requiring no external UI dependencies,
 * maximum accessibility, or those building custom design systems on top of Rottay.
 *
 * Note: Static methods are not supported in Apollo. Always use the Provider
 * and useNotification hook pattern.
 *
 * @example Basic Usage
 * ```tsx
 * import { NotificationProvider, useNotification } from '@rottay/design-system/apollo';
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
 * @module Notification/Engines/Apollo
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
} from '../../types';
import { NOTIFICATION_DEFAULTS, NOTIFICATION_ICONS } from '../../types';

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
const generateId = () => `apollo-notification-${++notificationId}`;

// ============================================================================
// Style Definitions
// ============================================================================

/**
 * Inline styles for Apollo engine components.
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
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      pointerEvents: 'none',
      maxWidth: '400px',
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
      padding: '16px 24px',
      borderRadius: '8px',
      backgroundColor: '#fff',
      boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
      pointerEvents: 'auto' as const,
      animation: 'notificationSlideIn 0.3s ease-out',
      minWidth: '300px',
    } as React.CSSProperties,
    success: { borderLeft: '4px solid #52c41a' },
    error: { borderLeft: '4px solid #ff4d4f' },
    info: { borderLeft: '4px solid #1677ff' },
    warning: { borderLeft: '4px solid #faad14' },
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
    success: { color: '#52c41a' },
    error: { color: '#ff4d4f' },
    info: { color: '#1677ff' },
    warning: { color: '#faad14' },
    open: { color: '#1677ff' },
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
    fontSize: '16px',
    lineHeight: '24px',
    color: 'rgba(0, 0, 0, 0.88)',
    marginBottom: '4px',
  } as React.CSSProperties,

  /**
   * Description styles.
   */
  description: {
    fontSize: '14px',
    lineHeight: '22px',
    color: 'rgba(0, 0, 0, 0.65)',
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
    color: 'rgba(0, 0, 0, 0.45)',
    fontSize: '14px',
    lineHeight: 1,
    transition: 'color 0.2s',
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

  const styleId = 'apollo-notification-styles';
  if (document.getElementById(styleId)) return;

  const styleSheet = document.createElement('style');
  styleSheet.id = styleId;
  styleSheet.textContent = `
    @keyframes notificationSlideIn {
      from {
        opacity: 0;
        transform: translateX(100%);
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
        transform: translateX(100%);
      }
    }
  `;
  document.head.appendChild(styleSheet);
};

// ============================================================================
// Notification Provider
// ============================================================================

/**
 * NotificationProvider component for the Apollo engine.
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
        btn: config.btn,
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

NotificationProvider.displayName = 'NotificationProvider.Apollo';

// ============================================================================
// useNotification Hook
// ============================================================================

/**
 * Hook for accessing the notification API in the Apollo engine.
 *
 * @description
 * Returns a notification API instance. Apollo doesn't need a context holder
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
 * NotificationItem component for the Apollo engine.
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
  btn,
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
    }, 300);
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
    ...(isExiting ? { animation: 'notificationSlideOut 0.3s ease-out forwards' } : {}),
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
        {btn && <div style={styles.btnContainer}>{btn}</div>}
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
            e.currentTarget.style.color = 'rgba(0, 0, 0, 0.88)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(0, 0, 0, 0.45)';
          }}
        >
          {closeIcon || '×'}
        </button>
      )}
    </div>
  );
};

NotificationItem.displayName = 'NotificationItem.Apollo';

// ============================================================================
// Static Notification Methods (Not Supported)
// ============================================================================

/**
 * Static notification API for the Apollo engine.
 *
 * @remarks
 * Static methods are not supported in the Apollo engine because it relies
 * on React context for state management. All methods will log a warning
 * instructing users to use the Provider and hook pattern instead.
 *
 * @example
 * ```tsx
 * // DON'T do this with Apollo:
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
  success: () => console.warn('Apollo notification: Please use NotificationProvider and useNotification hook'),
  error: () => console.warn('Apollo notification: Please use NotificationProvider and useNotification hook'),
  info: () => console.warn('Apollo notification: Please use NotificationProvider and useNotification hook'),
  warning: () => console.warn('Apollo notification: Please use NotificationProvider and useNotification hook'),
  open: () => console.warn('Apollo notification: Please use NotificationProvider and useNotification hook'),
  destroy: () => console.warn('Apollo notification: Please use NotificationProvider and useNotification hook'),
};

// ============================================================================
// Default Export
// ============================================================================

/**
 * Default export containing all Apollo engine exports.
 */
export default {
  NotificationProvider,
  NotificationItem,
  useNotification,
  notification,
};
