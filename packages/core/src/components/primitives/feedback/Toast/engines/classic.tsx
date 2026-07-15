/**
 * @fileoverview Toast Classic Engine - Rottay Design System
 * @description Ant Design implementation of the Toast component.
 * Uses Ant Design's message and notification APIs for native integration.
 *
 * @remarks
 * The Classic engine leverages Ant Design's built-in notification system:
 * - Simple toasts use the `message` API for lightweight feedback
 * - Rich toasts with titles use the `notification` API for detailed messages
 *
 * This implementation provides:
 * - Native Ant Design styling and animations
 * - Automatic portal rendering via Ant Design
 * - Built-in accessibility features
 * - Static methods for imperative usage
 *
 * @example Basic Usage
 * ```tsx
 * <Toast
 *   engine="classic"
 *   variant="success"
 *   description="Operation completed successfully"
 *   visible={true}
 * />
 * ```
 *
 * @example With Title (uses notification API)
 * ```tsx
 * <Toast
 *   engine="classic"
 *   variant="info"
 *   title="Update Available"
 *   description="A new version is ready to install."
 *   visible={true}
 * />
 * ```
 *
 * @example Static Methods
 * ```tsx
 * import ClassicToast from './engines/classic';
 *
 * ClassicToast.success('File saved!');
 * ClassicToast.error('Upload failed');
 * ClassicToast.loading('Processing...');
 * ```
 *
 * @see {@link ToastProps} for prop documentation
 * @see {@link Toast} for the engine-agnostic component
 *
 * @module Toast/Engines/Classic
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React, { useEffect } from 'react';
import { message, notification } from 'antd';
import type { ToastProps } from '../Toast.types';
import { TOAST_DEFAULTS } from '../Toast.types';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Maps Toast variant to Ant Design notification type.
 *
 * @description
 * Converts the design system's variant names to Ant Design's type system.
 * Variants not matching are defaulted to 'info'.
 *
 * @param variant - Toast variant string
 * @returns Ant Design notification type
 *
 * @internal
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

// ============================================================================
// Classic Toast Component
// ============================================================================

/**
 * ClassicToast - Ant Design implementation of Toast.
 *
 * @description
 * Renders toasts using Ant Design's notification system.
 * - Uses `notification` API for toasts with titles or actions
 * - Uses `message` API for simple description-only toasts
 *
 * @remarks
 * This component returns null as Ant Design handles its own rendering
 * through portals. The toast is shown imperatively via useEffect.
 *
 * @param props - {@link ToastProps}
 * @returns null (Ant Design renders via portal)
 *
 * @example
 * ```tsx
 * <ClassicToast
 *   variant="success"
 *   title="Saved!"
 *   description="Your changes have been saved."
 *   visible={true}
 *   onClose={() => console.log('Closed')}
 * />
 * ```
 */
export default function ClassicToast(props: ToastProps): React.ReactElement | null {
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

  // ========================================================================
  // Toast Display Effect
  // ========================================================================

  /**
   * Effect to show/hide toast when visibility changes.
   * Uses notification API for rich toasts, message API for simple ones.
   */
  useEffect(() => {
    if (!visible) return;

    const type = mapVariantToType(variant!);
    // Ant Design expects duration in seconds, but our API uses milliseconds
    // for consistency with setTimeout and other JS timing functions
    const durationInSeconds = duration! / 1000;

    // Toasts with a title or action need the richer notification API;
    // simple description-only toasts use the lightweight message API
    if (title || action) {
      // Unique key per toast allows targeted destroy on action click
      const key = `toast-${Date.now()}`;

      const notificationConfig = {
        key,
        message: title || description,
        description: title ? description : undefined,
        icon,
        duration: duration === 0 ? 0 : durationInSeconds,
        placement: 'topRight' as const,
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
      };
      switch (type) {
        case 'success':
          notification.success(notificationConfig);
          break;
        case 'info':
          notification.info(notificationConfig);
          break;
        case 'warning':
          notification.warning(notificationConfig);
          break;
        case 'error':
          notification.error(notificationConfig);
          break;
        default: {
          const unsupportedType: never = type;
          throw new Error(`Unsupported toast notification type: ${String(unsupportedType)}`);
        }
      }
    } else {
      // Use message for simple toasts
      const messageConfig = {
        content: description,
        duration: duration === 0 ? 0 : durationInSeconds,
        className,
        style,
        onClose,
      };
      switch (type) {
        case 'success':
          message.success(messageConfig);
          break;
        case 'info':
          message.info(messageConfig);
          break;
        case 'warning':
          message.warning(messageConfig);
          break;
        case 'error':
          message.error(messageConfig);
          break;
        default: {
          const unsupportedType: never = type;
          throw new Error(`Unsupported toast message type: ${String(unsupportedType)}`);
        }
      }
    }

    return () => {
      // Cleanup is handled by Ant Design
    };
  }, [visible, variant, title, description, icon, duration, closable, onClose, action, className, style]);

  // Returns null because Ant Design's message/notification APIs render via
  // their own portals outside the React tree; no DOM output needed here
  return null;
}

ClassicToast.displayName = 'ClassicToast';

// ============================================================================
// Static Methods
// ============================================================================

/**
 * Show a success toast message.
 *
 * @param content - Message content to display
 * @param config - Optional configuration (duration, onClose)
 *
 * @example
 * ```tsx
 * ClassicToast.success('File uploaded successfully');
 * ClassicToast.success('Saved!', { duration: 2000 });
 * ```
 */
ClassicToast.success = (
  content: React.ReactNode,
  config?: { duration?: number; onClose?: () => void }
): void => {
  message.success({
    content,
    duration: config?.duration ? config.duration / 1000 : 3,
    onClose: config?.onClose,
  });
};

/**
 * Show an error toast message.
 *
 * @param content - Message content to display
 * @param config - Optional configuration (duration, onClose)
 *
 * @example
 * ```tsx
 * ClassicToast.error('Failed to save changes');
 * ClassicToast.error('Network error', { duration: 5000 });
 * ```
 */
ClassicToast.error = (
  content: React.ReactNode,
  config?: { duration?: number; onClose?: () => void }
): void => {
  message.error({
    content,
    duration: config?.duration ? config.duration / 1000 : 3,
    onClose: config?.onClose,
  });
};

/**
 * Show a warning toast message.
 *
 * @param content - Message content to display
 * @param config - Optional configuration (duration, onClose)
 *
 * @example
 * ```tsx
 * ClassicToast.warning('Session will expire soon');
 * ```
 */
ClassicToast.warning = (
  content: React.ReactNode,
  config?: { duration?: number; onClose?: () => void }
): void => {
  message.warning({
    content,
    duration: config?.duration ? config.duration / 1000 : 3,
    onClose: config?.onClose,
  });
};

/**
 * Show an info toast message.
 *
 * @param content - Message content to display
 * @param config - Optional configuration (duration, onClose)
 *
 * @example
 * ```tsx
 * ClassicToast.info('New features available');
 * ```
 */
ClassicToast.info = (
  content: React.ReactNode,
  config?: { duration?: number; onClose?: () => void }
): void => {
  message.info({
    content,
    duration: config?.duration ? config.duration / 1000 : 3,
    onClose: config?.onClose,
  });
};

/**
 * Show a loading toast message.
 *
 * @param content - Message content to display
 * @param config - Optional configuration (duration, onClose)
 *
 * @example
 * ```tsx
 * const hide = ClassicToast.loading('Uploading...');
 * // Later: hide();
 * ```
 */
ClassicToast.loading = (
  content: React.ReactNode,
  config?: { duration?: number; onClose?: () => void }
): void => {
  message.loading({
    content,
    duration: config?.duration ? config.duration / 1000 : 3,
    onClose: config?.onClose,
  });
};

/**
 * Destroy all toast messages and notifications.
 *
 * @description
 * Removes all active message and notification instances.
 *
 * @example
 * ```tsx
 * // Clear all toasts
 * ClassicToast.destroy();
 * ```
 */
ClassicToast.destroy = (): void => {
  message.destroy();
  notification.destroy();
};
