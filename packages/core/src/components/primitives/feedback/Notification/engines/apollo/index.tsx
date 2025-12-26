'use client';

/**
 * Notification - Apollo Engine (Vanilla HTML/CSS)
 */
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

// Types for internal state
interface InternalNotification extends NotificationItemProps {
  key?: string;
  placement: NotificationPlacement;
}

// Context
const NotificationContext = createContext<NotificationInstance | null>(null);

// ID generator
let notificationId = 0;
const generateId = () => `apollo-notification-${++notificationId}`;

// Styles
const styles = {
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
  content: {
    flex: 1,
    minWidth: 0,
  } as React.CSSProperties,
  message: {
    fontWeight: 600,
    fontSize: '16px',
    lineHeight: '24px',
    color: 'rgba(0, 0, 0, 0.88)',
    marginBottom: '4px',
  } as React.CSSProperties,
  description: {
    fontSize: '14px',
    lineHeight: '22px',
    color: 'rgba(0, 0, 0, 0.65)',
  } as React.CSSProperties,
  btnContainer: {
    marginTop: '12px',
  } as React.CSSProperties,
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

// Inject animation styles
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

/**
 * NotificationProvider - Apollo Engine
 */
export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  maxCount = NOTIFICATION_DEFAULTS.maxCount,
  placement = NOTIFICATION_DEFAULTS.placement,
  top = NOTIFICATION_DEFAULTS.top,
  bottom = NOTIFICATION_DEFAULTS.bottom,
}) => {
  const [notifications, setNotifications] = useState<InternalNotification[]>([]);

  useEffect(() => {
    injectStyles();
  }, []);

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
        const existingIndex = prev.findIndex((n) => config.key && n.key === config.key);
        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = newNotification;
          return updated;
        }

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

  // Group by placement
  const groupedNotifications = notifications.reduce<Record<NotificationPlacement, InternalNotification[]>>(
    (acc, notification) => {
      const p = notification.placement || placement;
      if (!acc[p]) acc[p] = [];
      acc[p].push(notification);
      return acc;
    },
    {} as Record<NotificationPlacement, InternalNotification[]>
  );

  return (
    <NotificationContext.Provider value={notificationApi}>
      {children}
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

/**
 * useNotification hook - Apollo Engine
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
 * NotificationItem - Apollo Engine
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

  const notificationStyle: React.CSSProperties = {
    ...styles.notification.base,
    ...styles.notification[type],
    ...(isExiting ? { animation: 'notificationSlideOut 0.3s ease-out forwards' } : {}),
    cursor: onClick ? 'pointer' : 'default',
    ...style,
  };

  return (
    <div
      className={className}
      style={notificationStyle}
      onClick={onClick}
      role="alert"
      aria-live="polite"
    >
      {renderIcon()}
      <div style={styles.content}>
        <div style={styles.message}>{message}</div>
        {description && <div style={styles.description}>{description}</div>}
        {btn && <div style={styles.btnContainer}>{btn}</div>}
      </div>
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

/**
 * Static notification methods
 */
export const notification: NotificationInstance = {
  success: () => console.warn('Apollo notification: Please use NotificationProvider and useNotification hook'),
  error: () => console.warn('Apollo notification: Please use NotificationProvider and useNotification hook'),
  info: () => console.warn('Apollo notification: Please use NotificationProvider and useNotification hook'),
  warning: () => console.warn('Apollo notification: Please use NotificationProvider and useNotification hook'),
  open: () => console.warn('Apollo notification: Please use NotificationProvider and useNotification hook'),
  destroy: () => console.warn('Apollo notification: Please use NotificationProvider and useNotification hook'),
};

export default {
  NotificationProvider,
  NotificationItem,
  useNotification,
  notification,
};
