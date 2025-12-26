/**
 * Toast - Titan Engine (Ant Design)
 * Uses Ant Design's message and notification APIs
 */

'use client';

import React, { useEffect } from 'react';
import { message, notification } from 'antd';
import type { ToastProps } from '../../types';
import { TOAST_DEFAULTS } from '../../types';

/**
 * Map our variant to Ant Design's type
 */
function mapVariantToType(variant: string): 'success' | 'info' | 'warning' | 'error' {
  switch (variant) {
    case 'success':
      return 'success';
    case 'error':
      return 'error';
    case 'warning':
      return 'warning';
    case 'info':
    default:
      return 'info';
  }
}

/**
 * TitanToast - Ant Design implementation
 * Uses notification API for rich toasts with title and description
 * Uses message API for simple toasts
 */
export default function TitanToast(props: ToastProps): React.ReactElement | null {
  const {
    variant = TOAST_DEFAULTS.variant,
    title,
    description,
    icon,
    duration = TOAST_DEFAULTS.duration,
    closable = TOAST_DEFAULTS.closable,
    onClose,
    action,
    visible = true,
    className,
    style,
  } = props;

  useEffect(() => {
    if (!visible) return;

    const type = mapVariantToType(variant!);
    const durationInSeconds = duration! / 1000;

    // Use notification for toasts with title or action
    if (title || action) {
      const key = `toast-${Date.now()}`;

      notification[type]({
        key,
        message: title || description,
        description: title ? description : undefined,
        icon,
        duration: duration === 0 ? 0 : durationInSeconds,
        placement: 'topRight',
        className,
        style,
        onClose,
        btn: action ? (
          <button
            type="button"
            onClick={() => {
              action.onClick();
              notification.destroy(key);
            }}
            style={{
              padding: '4px 12px',
              fontSize: '13px',
              fontWeight: 500,
              background: 'transparent',
              border: '1px solid currentColor',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {action.label}
          </button>
        ) : undefined,
      });
    } else {
      // Use message for simple toasts
      message[type]({
        content: description,
        duration: duration === 0 ? 0 : durationInSeconds,
        className,
        style,
        onClose,
      });
    }

    return () => {
      // Cleanup is handled by Ant Design
    };
  }, [visible, variant, title, description, icon, duration, closable, onClose, action, className, style]);

  // Ant Design handles rendering via its own portal
  return null;
}

TitanToast.displayName = 'TitanToast';

/**
 * Static methods for programmatic usage
 */
TitanToast.success = (
  content: React.ReactNode,
  config?: { duration?: number; onClose?: () => void }
): void => {
  message.success({
    content,
    duration: config?.duration ? config.duration / 1000 : 3,
    onClose: config?.onClose,
  });
};

TitanToast.error = (
  content: React.ReactNode,
  config?: { duration?: number; onClose?: () => void }
): void => {
  message.error({
    content,
    duration: config?.duration ? config.duration / 1000 : 3,
    onClose: config?.onClose,
  });
};

TitanToast.warning = (
  content: React.ReactNode,
  config?: { duration?: number; onClose?: () => void }
): void => {
  message.warning({
    content,
    duration: config?.duration ? config.duration / 1000 : 3,
    onClose: config?.onClose,
  });
};

TitanToast.info = (
  content: React.ReactNode,
  config?: { duration?: number; onClose?: () => void }
): void => {
  message.info({
    content,
    duration: config?.duration ? config.duration / 1000 : 3,
    onClose: config?.onClose,
  });
};

TitanToast.loading = (
  content: React.ReactNode,
  config?: { duration?: number; onClose?: () => void }
): void => {
  message.loading({
    content,
    duration: config?.duration ? config.duration / 1000 : 3,
    onClose: config?.onClose,
  });
};

TitanToast.destroy = (): void => {
  message.destroy();
  notification.destroy();
};
