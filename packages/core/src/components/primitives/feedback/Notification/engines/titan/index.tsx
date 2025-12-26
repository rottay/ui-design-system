'use client';

/**
 * Notification - Titan Engine (Ant Design)
 * Uses Ant Design's notification API
 */
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

// Map our placement to Ant Design placement
const placementMap: Record<NotificationPlacement, NotificationPlacement> = {
  top: 'top',
  topLeft: 'topLeft',
  topRight: 'topRight',
  bottom: 'bottom',
  bottomLeft: 'bottomLeft',
  bottomRight: 'bottomRight',
};

/**
 * NotificationProvider - Titan Engine
 */
export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  maxCount = NOTIFICATION_DEFAULTS.maxCount,
  placement = NOTIFICATION_DEFAULTS.placement,
  top = NOTIFICATION_DEFAULTS.top,
  bottom = NOTIFICATION_DEFAULTS.bottom,
}) => {
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

NotificationProvider.displayName = 'NotificationProvider.Titan';

/**
 * useNotification hook - Titan Engine
 */
export function useNotification(): [NotificationInstance, React.ReactElement | null] {
  const [api, contextHolder] = antNotification.useNotification();

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
          btn: config.btn,
          closeIcon: config.closeIcon,
          onClose: config.onClose,
          onClick: config.onClick,
        });
      };
    },
    [api]
  );

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

/**
 * NotificationItem - Titan Engine
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
  btn,
  closeIcon,
  closable = NOTIFICATION_DEFAULTS.closable,
  onRemove,
}) => {
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const handleClose = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    onRemove?.(id);
    onClose?.();
  };

  const typeStyles: Record<NotificationType, React.CSSProperties> = {
    success: { borderLeft: '4px solid #52c41a' },
    error: { borderLeft: '4px solid #ff4d4f' },
    info: { borderLeft: '4px solid #1677ff' },
    warning: { borderLeft: '4px solid #faad14' },
    open: {},
  };

  const iconColors: Record<NotificationType, string> = {
    success: '#52c41a',
    error: '#ff4d4f',
    info: '#1677ff',
    warning: '#faad14',
    open: '#1677ff',
  };

  return (
    <div
      className={`ant-notification-notice ${className || ''}`}
      style={{
        padding: '16px 24px',
        borderRadius: '8px',
        backgroundColor: '#fff',
        boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08)',
        cursor: onClick ? 'pointer' : 'default',
        ...typeStyles[type],
        ...style,
      }}
      onClick={onClick}
      role="alert"
    >
      <div style={{ display: 'flex', gap: '12px' }}>
        {icon !== null && (
          <span style={{ color: iconColors[type], fontSize: '24px' }}>
            {icon || (type !== 'open' ? (type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ℹ') : null)}
          </span>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: description ? '8px' : 0 }}>
            {message}
          </div>
          {description && (
            <div style={{ color: 'rgba(0, 0, 0, 0.65)', fontSize: '14px' }}>
              {description}
            </div>
          )}
          {btn && <div style={{ marginTop: '12px' }}>{btn}</div>}
        </div>
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
              color: 'rgba(0, 0, 0, 0.45)',
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

NotificationItem.displayName = 'NotificationItem.Titan';

/**
 * Static notification methods
 */
export const notification: NotificationInstance = {
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
      btn: config.btn,
      closeIcon: config.closeIcon,
      onClose: config.onClose,
      onClick: config.onClick,
    });
  },
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
      btn: config.btn,
      closeIcon: config.closeIcon,
      onClose: config.onClose,
      onClick: config.onClick,
    });
  },
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
      btn: config.btn,
      closeIcon: config.closeIcon,
      onClose: config.onClose,
      onClick: config.onClick,
    });
  },
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
      btn: config.btn,
      closeIcon: config.closeIcon,
      onClose: config.onClose,
      onClick: config.onClick,
    });
  },
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
      btn: config.btn,
      closeIcon: config.closeIcon,
      onClose: config.onClose,
      onClick: config.onClick,
    });
  },
  destroy: (key?: string) => {
    if (key) {
      antNotification.destroy(key);
    } else {
      antNotification.destroy();
    }
  },
};

export default {
  NotificationProvider,
  NotificationItem,
  useNotification,
  notification,
};
