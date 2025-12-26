'use client';

/**
 * Notification - Hermes Engine (DaisyUI/Tailwind)
 */
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

// Types for internal state
interface InternalNotification extends NotificationItemProps {
  key?: string;
  placement: NotificationPlacement;
}

// Context for notification API
const NotificationContext = createContext<NotificationInstance | null>(null);

// Unique ID generator
let notificationId = 0;
const generateId = () => `hermes-notification-${++notificationId}`;

/**
 * NotificationProvider - Hermes Engine
 */
export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  maxCount = NOTIFICATION_DEFAULTS.maxCount,
  placement = NOTIFICATION_DEFAULTS.placement,
  top = NOTIFICATION_DEFAULTS.top,
  bottom = NOTIFICATION_DEFAULTS.bottom,
}) => {
  const [notifications, setNotifications] = useState<InternalNotification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

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

  const createNotificationMethod = useCallback(
    (type: NotificationType) => {
      return (config: NotificationConfig) => {
        addNotification({ ...config, type });
      };
    },
    [addNotification]
  );

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

  // Group notifications by placement
  const groupedNotifications = notifications.reduce<Record<NotificationPlacement, InternalNotification[]>>(
    (acc, notification) => {
      const p = notification.placement || placement;
      if (!acc[p]) acc[p] = [];
      acc[p].push(notification);
      return acc;
    },
    {} as Record<NotificationPlacement, InternalNotification[]>
  );

  const placementClasses: Record<NotificationPlacement, string> = {
    top: 'toast toast-top toast-center',
    topLeft: 'toast toast-top toast-start',
    topRight: 'toast toast-top toast-end',
    bottom: 'toast toast-bottom toast-center',
    bottomLeft: 'toast toast-bottom toast-start',
    bottomRight: 'toast toast-bottom toast-end',
  };

  const placementStyles: Record<NotificationPlacement, React.CSSProperties> = {
    top: { marginTop: top },
    topLeft: { marginTop: top },
    topRight: { marginTop: top },
    bottom: { marginBottom: bottom },
    bottomLeft: { marginBottom: bottom },
    bottomRight: { marginBottom: bottom },
  };

  return (
    <NotificationContext.Provider value={notificationApi}>
      {children}
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

/**
 * useNotification hook - Hermes Engine
 */
export function useNotification(): [NotificationInstance, React.ReactElement | null] {
  const context = useContext(NotificationContext);

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

/**
 * NotificationItem - Hermes Engine
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

  const handleClose = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    onRemove?.(id);
    onClose?.();
  };

  const alertClasses: Record<NotificationType, string> = {
    success: 'alert-success',
    error: 'alert-error',
    info: 'alert-info',
    warning: 'alert-warning',
    open: '',
  };

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

  return (
    <div
      className={`alert ${alertClasses[type]} shadow-lg min-w-80 ${className}`}
      style={style}
      onClick={onClick}
      role="alert"
    >
      <div className="flex gap-3 w-full">
        {icon !== null && <span>{icon || icons[type]}</span>}
        <div className="flex-1">
          <div className="font-bold">{message}</div>
          {description && <div className="text-sm opacity-80">{description}</div>}
          {btn && <div className="mt-2">{btn}</div>}
        </div>
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

/**
 * Static notification methods
 */
export const notification: NotificationInstance = {
  success: () => console.warn('Hermes notification: Please use NotificationProvider and useNotification hook'),
  error: () => console.warn('Hermes notification: Please use NotificationProvider and useNotification hook'),
  info: () => console.warn('Hermes notification: Please use NotificationProvider and useNotification hook'),
  warning: () => console.warn('Hermes notification: Please use NotificationProvider and useNotification hook'),
  open: () => console.warn('Hermes notification: Please use NotificationProvider and useNotification hook'),
  destroy: () => console.warn('Hermes notification: Please use NotificationProvider and useNotification hook'),
};

export default {
  NotificationProvider,
  NotificationItem,
  useNotification,
  notification,
};
