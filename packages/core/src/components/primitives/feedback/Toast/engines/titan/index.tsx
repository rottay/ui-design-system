/**
 * @fileoverview Toast Titan Engine - Rottay Design System
 * @description Ant Design implementation of the Toast component.
 * Uses Ant Design's message and notification APIs for native integration.
 *
 * @remarks
 * The Titan engine leverages Ant Design's built-in notification system:
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
 *   engine="titan"
 *   variant="success"
 *   description="Operation completed successfully"
 *   visible={true}
 * />
 * ```
 *
 * @example With Title (uses notification API)
 * ```tsx
 * <Toast
 *   engine="titan"
 *   variant="info"
 *   title="Update Available"
 *   description="A new version is ready to install."
 *   visible={true}
 * />
 * ```
 *
 * @example Static Methods
 * ```tsx
 * import TitanToast from './engines/titan';
 *
 * TitanToast.success('File saved!');
 * TitanToast.error('Upload failed');
 * TitanToast.loading('Processing...');
 * ```
 *
 * @see {@link ToastProps} for prop documentation
 * @see {@link Toast} for the engine-agnostic component
 *
 * @module Toast/Engines/Titan
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React, { useEffect } from 'react';
import { message, notification } from 'antd';
import type { ToastProps } from '../../types';
import { TOAST_DEFAULTS } from '../../types';

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
// Titan Toast Component
// ============================================================================

/**
 * TitanToast - Ant Design implementation of Toast.
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
 * <TitanToast
 *   variant="success"
 *   title="Saved!"
 *   description="Your changes have been saved."
 *   visible={true}
 *   onClose={() => console.log('Closed')}
 * />
 * ```
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
 * TitanToast.success('File uploaded successfully');
 * TitanToast.success('Saved!', { duration: 2000 });
 * ```
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

/**
 * Show an error toast message.
 *
 * @param content - Message content to display
 * @param config - Optional configuration (duration, onClose)
 *
 * @example
 * ```tsx
 * TitanToast.error('Failed to save changes');
 * TitanToast.error('Network error', { duration: 5000 });
 * ```
 */
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

/**
 * Show a warning toast message.
 *
 * @param content - Message content to display
 * @param config - Optional configuration (duration, onClose)
 *
 * @example
 * ```tsx
 * TitanToast.warning('Session will expire soon');
 * ```
 */
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

/**
 * Show an info toast message.
 *
 * @param content - Message content to display
 * @param config - Optional configuration (duration, onClose)
 *
 * @example
 * ```tsx
 * TitanToast.info('New features available');
 * ```
 */
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

/**
 * Show a loading toast message.
 *
 * @param content - Message content to display
 * @param config - Optional configuration (duration, onClose)
 *
 * @example
 * ```tsx
 * const hide = TitanToast.loading('Uploading...');
 * // Later: hide();
 * ```
 */
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

/**
 * Destroy all toast messages and notifications.
 *
 * @description
 * Removes all active message and notification instances.
 *
 * @example
 * ```tsx
 * // Clear all toasts
 * TitanToast.destroy();
 * ```
 */
TitanToast.destroy = (): void => {
  message.destroy();
  notification.destroy();
};
