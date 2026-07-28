/**
 * @fileoverview Notification Modern Engine - Rottay Design System
 * @description Token-driven implementation of the Notification component.
 * Provides a lightweight notification experience on a self-contained,
 * skin-owned tree — no DaisyUI or utility-framework classes.
 *
 * @remarks
 * The Modern engine is a self-contained `rottay-notification--modern` tree:
 * - No DaisyUI classes: the stack container's `toast`/`toast-top`/
 *   `toast-bottom`/`toast-center`/`toast-start`/`toast-end` placement classes
 *   were drained (K4-A); the unlayered skin `notification.css` owns fixed
 *   placement, stacking and item surface paint outright
 * - Lightweight bundle size
 * - Easy customization through class overrides and token channels
 * - Consistent DS token theming integration
 *
 * This engine is recommended for applications prioritizing bundle size and
 * token theming over feature richness.
 *
 * Note: Static methods are not supported in Modern. Always use the Provider
 * and useNotification hook pattern.
 *
 * @example Basic Usage
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
 * @module Notification/Engines/Modern
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
} from '../../contracts';
import { NOTIFICATION_DEFAULTS } from '../../contracts';
import { warnOnceInDev } from '@/infrastructure/runtime/foundation/diagnostics/development-logging';
import { useTranslation } from '@/infrastructure/runtime/i18n';
import { StatusInfoIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-info';
import { StatusSuccessIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-success';
import { StatusWarningIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-warning';
import { StatusErrorIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-error';
import { CommunicationNotificationIcon } from '@/graphics/icons/presentation/semantic/generated/roles/communication-notification';
import { ActionCloseIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-close';

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
const generateId = () => `modern-notification-${++notificationId}`;

// ============================================================================
// Notification Provider
// ============================================================================

/**
 * NotificationProvider component for the Modern engine.
 *
 * @description
 * Provides notification context to child components and manages the
 * notification state. Placement and surface paint are owned by the unlayered
 * skin `notification.css`, keyed on the stamped `data-placement`/`data-tone`
 * attributes.
 *
 * @remarks
 * Key features:
 * - Context-based notification management
 * - Supports multiple placements simultaneously
 * - Automatic notification stacking and limiting
 * - Skin-owned placement (no DaisyUI toast classes)
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
        actions: config.actions,
        closeIcon: config.closeIcon,
        closable: config.closable ?? NOTIFICATION_DEFAULTS.closable,
        role: config.role,
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

  // Grouping by placement creates separate DOM containers for each position,
  // allowing simultaneous notifications in different corners (e.g., success
  // in topRight while an error shows in bottomRight). Each group renders its
  // own stack container keyed on `data-placement` -- the unlayered skin
  // `notification.css` owns fixed placement outright; no DaisyUI toast
  // classes are emitted (drained in K4-A).
  const groupedNotifications = notifications.reduce<Record<NotificationPlacement, InternalNotification[]>>(
    (acc: Record<NotificationPlacement, InternalNotification[]>, notification) => {
      const p = notification.placement || placement;
      if (!acc[p]) acc[p] = [];
      acc[p].push(notification);
      return acc;
    },
    {} as Record<NotificationPlacement, InternalNotification[]>
  );

  // The provider's top/bottom props are block-axis offsets from the viewport
  // edge (pixel numbers per the contracts). The engine stamps the dynamic
  // value on the --ds-notification-stack-offset channel and the skin declares
  // the top/bottom property that consumes it, keeping the skin the single
  // paint owner while preserving the configurable-offset public API.
  const stackOffset = (value: number): React.CSSProperties =>
    ({ '--ds-notification-stack-offset': `${value}px` }) as React.CSSProperties;

  const placementStyles: Record<NotificationPlacement, React.CSSProperties> = {
    top: stackOffset(top),
    topLeft: stackOffset(top),
    topRight: stackOffset(top),
    bottom: stackOffset(bottom),
    bottomLeft: stackOffset(bottom),
    bottomRight: stackOffset(bottom),
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
          data-part="stack-container"
          data-placement={p}
          className="rottay-notification-stack--modern"
          style={placementStyles[p as NotificationPlacement]}
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

NotificationProvider.displayName = 'NotificationProvider.Modern';

// ============================================================================
// useNotification Hook
// ============================================================================

/**
 * Hook for accessing the notification API in the Modern engine.
 *
 * @description
 * Returns a notification API instance. Unlike Classic, Modern doesn't need
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
 * NotificationItem component for the Modern engine.
 *
 * @description
 * Renders an individual notification as a self-contained
 * `rottay-notification--modern` tree. All static surface paint lives in the
 * unlayered skin `notification.css`.
 *
 * @remarks
 * Skin-owned paint, keyed on stamped data attributes:
 * - No DaisyUI classes; tone is keyed on `data-tone`
 * - Token-driven backgrounds and colors for type variants (success, error, info, warning, open)
 * - Skin-owned elevation shadow
 *
 * @param props - {@link NotificationItemProps}
 * @returns A DS token-styled notification item
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
  role,
  onRemove,
}) => {
  const { t } = useTranslation('common');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ========================================================================
  // Auto-close countdown with hover pause (Toast family parity): hovering
  // freezes BOTH the JS countdown (remaining-time tracked, never a full
  // restart) and the skin's progress bar (data-paused), so a user reading a
  // long notification never loses it mid-sentence.
  // ========================================================================

  const [isPaused, setIsPaused] = useState(false);
  const remainingRef = useRef<number>(duration && duration > 0 ? duration * 1000 : 0);
  const startedAtRef = useRef(0);
  // A duration prop change re-arms the countdown from its full length,
  // matching the pre-pause contract.
  const prevDurationRef = useRef(duration);
  if (prevDurationRef.current !== duration) {
    prevDurationRef.current = duration;
    remainingRef.current = duration && duration > 0 ? duration * 1000 : 0;
  }

  useEffect(() => {
    if (duration && duration > 0 && !isPaused) {
      startedAtRef.current = Date.now();
      timerRef.current = setTimeout(() => {
        onRemove?.(id);
        onClose?.();
      }, remainingRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [id, duration, isPaused, onRemove, onClose]);

  const handleMouseEnter = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startedAtRef.current));
    }
    setIsPaused(true);
  };
  const handleMouseLeave = () => setIsPaused(false);

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

  // Per-type fill and text colour are keyed on `data-tone` in the unlayered modern
  // Notification skin. The root carries NO DaisyUI class: the skin is the single
  // paint owner and derives every tone -- including `open` (primary accent) --
  // from --ds-notification-accent.

  const icons: Record<NotificationType, ReactNode> = {
    success: <StatusSuccessIcon decorative size={20} />,
    error: <StatusErrorIcon decorative size={20} />,
    info: <StatusInfoIcon decorative size={20} />,
    warning: <StatusWarningIcon decorative size={20} />,
    open: <CommunicationNotificationIcon decorative size={20} />,
  };

  // ========================================================================
  // Render
  // ========================================================================

  // The skin owns width (full-width of the stack container) and elevation.
  // role="alert" triggers immediate screen reader announcement for urgent
  // types; quieter types announce politely through role="status".
  return (
    <div
      data-part="root"
      data-tone={type}
      data-has-description={description ? 'true' : 'false'}
      data-has-actions={actions ? 'true' : 'false'}
      data-closable={closable ? 'true' : 'false'}
      data-clickable={onClick ? 'true' : 'false'}
      data-paused={isPaused ? 'true' : 'false'}
      className={`rottay-notification--modern ${className}`}
      style={{
        '--ds-notification-duration': duration && duration > 0 ? `${duration}s` : undefined,
        ...style,
      } as React.CSSProperties}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={onClick ? (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      } : undefined}
      tabIndex={onClick ? 0 : undefined}
      role={role ?? (type === 'error' || type === 'warning' ? 'alert' : 'status')}
    >
      <div data-part="layout">
        {/* Icon */}
        {icon !== null && <span data-part="icon">{icon || icons[type]}</span>}

        {/* Content */}
        <div data-part="body">
          {/* Title */}
          <div data-part="title">{message}</div>

          {/* Description */}
          {description && <div data-part="description">{description}</div>}

          {/* Action Button */}
          {actions && (
            <div data-part="action" data-slot="actions">
              {actions}
            </div>
          )}
        </div>

        {/* Close Button */}
        {closable && (
          <button
            type="button"
            data-part="close-button"
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            aria-label={t('close')}
          >
            {closeIcon || <ActionCloseIcon decorative size={16} />}
          </button>
        )}
      </div>
      {duration !== null && duration > 0 && <span data-part="progress" aria-hidden="true" />}
    </div>
  );
};

NotificationItem.displayName = 'NotificationItem.Modern';

// ============================================================================
// Static Notification Methods (Not Supported)
// ============================================================================

/**
 * Static notification API for the Modern engine.
 *
 * @remarks
 * Static methods are not supported in the Modern engine because it relies
 * on React context for state management. All methods will log a warning
 * instructing users to use the Provider and hook pattern instead.
 *
 * @example
 * ```tsx
 * // DON'T do this with Modern:
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
  success: () => warnOnceInDev('notification-modern:provider-required', 'Modern notification: Please use NotificationProvider and useNotification hook'),
  error: () => warnOnceInDev('notification-modern:provider-required', 'Modern notification: Please use NotificationProvider and useNotification hook'),
  info: () => warnOnceInDev('notification-modern:provider-required', 'Modern notification: Please use NotificationProvider and useNotification hook'),
  warning: () => warnOnceInDev('notification-modern:provider-required', 'Modern notification: Please use NotificationProvider and useNotification hook'),
  open: () => warnOnceInDev('notification-modern:provider-required', 'Modern notification: Please use NotificationProvider and useNotification hook'),
  destroy: () => warnOnceInDev('notification-modern:provider-required', 'Modern notification: Please use NotificationProvider and useNotification hook'),
};

// ============================================================================
// Default Export
// ============================================================================

/**
 * Default export containing all Modern engine exports.
 */
export default {
  NotificationProvider,
  NotificationItem,
  useNotification,
  notification,
};
