/**
 * @fileoverview Notification Base Component - Rottay Design System
 * @description Base implementation for the Notification component using CSS variables
 * for consistent theming across all rendering engines.
 *
 * @remarks
 * This base component provides the foundation for notification rendering using
 * CSS variables from the design token system. It can be extended by engine-specific
 * implementations or used directly for custom notification scenarios.
 *
 * The component uses CSS custom properties (variables) for all themeable values,
 * enabling dynamic theme switching and multi-tenant support without re-rendering.
 *
 * @example
 * ```tsx
 * import { BaseNotificationItem } from './base';
 *
 * <BaseNotificationItem
 *   id="notification-1"
 *   type="success"
 *   message="File saved"
 *   description="Your changes have been saved."
 *   duration={4.5}
 *   closable
 *   onRemove={(id) => handleRemove(id)}
 * />
 * ```
 *
 * @module Notification/Base
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, useEffect, useState, useMemo } from 'react';
import type { NotificationItemProps, NotificationType } from '../types';
import { NOTIFICATION_DEFAULTS, NOTIFICATION_ICONS } from '../types';

// ============================================================================
// Type Color Configuration
// ============================================================================

/**
 * Color configuration for each notification type.
 *
 * @remarks
 * Maps notification types to their background color, icon color, and icon character.
 * These are fallback values when CSS variables are not defined.
 *
 * @internal
 */
const TYPE_COLORS: Record<Exclude<NotificationType, 'open'>, { bg: string; color: string; icon: string }> = {
  success: { bg: '#f6ffed', color: '#52c41a', icon: NOTIFICATION_ICONS.success },
  error: { bg: '#fff2f0', color: '#ff4d4f', icon: NOTIFICATION_ICONS.error },
  info: { bg: '#e6f4ff', color: '#1677ff', icon: NOTIFICATION_ICONS.info },
  warning: { bg: '#fffbe6', color: '#faad14', icon: NOTIFICATION_ICONS.warning },
};

// ============================================================================
// Internal Components
// ============================================================================

/**
 * Close icon SVG component.
 *
 * @remarks
 * A simple X icon used as the default close button for notifications.
 *
 * @internal
 */
const CloseIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
);

// ============================================================================
// Base Notification Item Component
// ============================================================================

/**
 * Base NotificationItem component using CSS variables.
 *
 * @description
 * The foundational notification item that renders individual notifications.
 * Uses CSS custom properties for theming, enabling seamless integration with
 * the design token system.
 *
 * @remarks
 * Features:
 * - Auto-dismiss timer with configurable duration
 * - Exit animation on close
 * - Support for custom icons, buttons, and close icons
 * - Click handler for notification body
 * - Accessible with role="alert"
 *
 * CSS Variables Used:
 * - `--notification-bg` - Background color
 * - `--notification-icon-color` - Icon color based on type
 * - `--notification-shadow` - Box shadow
 * - `--notification-border-radius` - Border radius
 * - `--notification-padding` - Internal padding
 * - `--notification-width` - Container width
 *
 * @param props - {@link NotificationItemProps}
 * @returns A notification item element
 *
 * @example
 * ```tsx
 * <BaseNotificationItem
 *   id="notif-1"
 *   type="success"
 *   message="Operation Complete"
 *   description="Your data has been saved."
 *   duration={5}
 *   closable
 *   onRemove={(id) => removeNotification(id)}
 * />
 * ```
 */
export const BaseNotificationItem = forwardRef<HTMLDivElement, NotificationItemProps>(
  (props, ref) => {
    const {
      id,
      type,
      message,
      description,
      duration = NOTIFICATION_DEFAULTS.duration,
      onClose,
      onClick,
      icon,
      className = '',
      style = {},
      btn,
      closeIcon,
      closable = NOTIFICATION_DEFAULTS.closable,
      onRemove,
    } = props;

    // ========================================================================
    // State Management
    // ========================================================================

    const [isVisible, setIsVisible] = useState(true);
    const [isExiting, setIsExiting] = useState(false);

    const typeConfig = type !== 'open' ? TYPE_COLORS[type] : null;

    // ========================================================================
    // Auto-close Timer
    // ========================================================================

    useEffect(() => {
      if (duration && duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration * 1000);

        return () => clearTimeout(timer);
      }
    }, [duration]);

    // ========================================================================
    // Event Handlers
    // ========================================================================

    /**
     * Handles the notification close action.
     * Triggers exit animation before removing from DOM.
     */
    const handleClose = () => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose?.();
        onRemove?.(id);
      }, 200);
    };

    /**
     * Handles click on the notification body.
     */
    const handleClick = () => {
      onClick?.();
    };

    // ========================================================================
    // CSS Variables
    // ========================================================================

    /**
     * CSS custom properties for theming.
     * These variables can be overridden by tenant themes.
     */
    const notificationVars = useMemo<React.CSSProperties>(() => ({
      '--notification-bg': 'var(--color-bg-elevated, #fff)',
      '--notification-icon-color': typeConfig?.color || 'var(--color-text-secondary)',
      '--notification-shadow': 'var(--shadow-lg)',
      '--notification-border-radius': 'var(--radius-lg, 8px)',
      '--notification-padding': '16px 24px',
      '--notification-width': '384px',
    } as React.CSSProperties), [typeConfig]);

    // ========================================================================
    // Early Return
    // ========================================================================

    if (!isVisible) return null;

    // ========================================================================
    // Style Definitions
    // ========================================================================

    const notificationStyle: React.CSSProperties = {
      ...notificationVars,
      position: 'relative',
      width: 'var(--notification-width)',
      padding: 'var(--notification-padding)',
      backgroundColor: 'var(--notification-bg)',
      borderRadius: 'var(--notification-border-radius)',
      boxShadow: 'var(--notification-shadow)',
      opacity: isExiting ? 0 : 1,
      transform: isExiting ? 'translateX(100%)' : 'translateX(0)',
      transition: 'opacity 0.3s, transform 0.3s',
      cursor: onClick ? 'pointer' : 'default',
      ...style,
    };

    const headerStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
    };

    const iconStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '24px',
      height: '24px',
      fontSize: '24px',
      color: 'var(--notification-icon-color)',
      flexShrink: 0,
    };

    const contentStyle: React.CSSProperties = {
      flex: 1,
      minWidth: 0,
    };

    const titleStyle: React.CSSProperties = {
      fontSize: '16px',
      fontWeight: 500,
      color: 'var(--color-text-primary)',
      marginBottom: description ? '8px' : 0,
      paddingRight: closable ? '24px' : 0,
    };

    const descriptionStyle: React.CSSProperties = {
      fontSize: '14px',
      color: 'var(--color-text-secondary)',
      lineHeight: 1.5,
    };

    const closeButtonStyle: React.CSSProperties = {
      position: 'absolute',
      top: '16px',
      right: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '22px',
      height: '22px',
      cursor: 'pointer',
      color: 'var(--color-text-tertiary)',
      borderRadius: '4px',
      transition: 'color 0.2s, background-color 0.2s',
    };

    const btnStyle: React.CSSProperties = {
      marginTop: '12px',
      display: 'flex',
      justifyContent: 'flex-end',
    };

    // ========================================================================
    // Render
    // ========================================================================

    return (
      <div
        ref={ref}
        className={`rottay-notification rottay-notification--${type} ${className}`}
        style={notificationStyle}
        onClick={handleClick}
        role="alert"
      >
        {/* Header with icon and content */}
        <div className="rottay-notification__header" style={headerStyle}>
          {/* Icon */}
          {(icon !== undefined || typeConfig) && (
            <span className="rottay-notification__icon" style={iconStyle}>
              {icon !== undefined ? icon : typeConfig?.icon}
            </span>
          )}

          {/* Content */}
          <div className="rottay-notification__content" style={contentStyle}>
            {/* Title */}
            <div className="rottay-notification__title" style={titleStyle}>
              {message}
            </div>

            {/* Description */}
            {description && (
              <div className="rottay-notification__description" style={descriptionStyle}>
                {description}
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        {btn && (
          <div className="rottay-notification__btn" style={btnStyle}>
            {btn}
          </div>
        )}

        {/* Close button */}
        {closable && (
          <span
            className="rottay-notification__close"
            style={closeButtonStyle}
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
          >
            {closeIcon || <CloseIcon />}
          </span>
        )}
      </div>
    );
  }
);

BaseNotificationItem.displayName = 'BaseNotificationItem';

// ============================================================================
// Base Notification Container Component
// ============================================================================

/**
 * Props for the BaseNotificationContainer component.
 *
 * @internal
 */
interface BaseNotificationContainerProps {
  /** Placement position on screen */
  placement?: 'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight';
  /** Distance from top edge */
  top?: number;
  /** Distance from bottom edge */
  bottom?: number;
  /** Distance from right edge */
  right?: number;
  /** Distance from left edge */
  left?: number;
  /** Notification items to render */
  children: React.ReactNode;
}

/**
 * Container component for positioning notifications on screen.
 *
 * @description
 * A fixed-position container that holds notification items and positions
 * them according to the specified placement. Handles stacking direction
 * based on whether notifications appear from top or bottom.
 *
 * @remarks
 * The container:
 * - Uses fixed positioning relative to viewport
 * - Handles different placement positions (6 options)
 * - Manages notification stacking direction
 * - Provides proper z-index layering
 *
 * @param props - Container configuration
 * @returns A positioned container for notifications
 *
 * @example
 * ```tsx
 * <BaseNotificationContainer placement="topRight" top={24}>
 *   <BaseNotificationItem {...notificationProps} />
 * </BaseNotificationContainer>
 * ```
 */
export const BaseNotificationContainer = forwardRef<HTMLDivElement, BaseNotificationContainerProps>(({
  placement = 'topRight',
  top = NOTIFICATION_DEFAULTS.top,
  bottom = NOTIFICATION_DEFAULTS.bottom,
  right = NOTIFICATION_DEFAULTS.right,
  left = NOTIFICATION_DEFAULTS.left,
  children,
}, ref) => {
  /**
   * Calculates positioning styles based on placement.
   *
   * @returns CSS properties for container positioning
   */
  const getPosition = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'fixed',
      zIndex: 1010,
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    };

    switch (placement) {
      case 'top':
        return { ...base, top, left: '50%', transform: 'translateX(-50%)' };
      case 'topLeft':
        return { ...base, top, left };
      case 'topRight':
        return { ...base, top, right };
      case 'bottom':
        return { ...base, bottom, left: '50%', transform: 'translateX(-50%)', flexDirection: 'column-reverse' };
      case 'bottomLeft':
        return { ...base, bottom, left, flexDirection: 'column-reverse' };
      case 'bottomRight':
        return { ...base, bottom, right, flexDirection: 'column-reverse' };
      default:
        return { ...base, top, right };
    }
  };

  return (
    <div ref={ref} className="rottay-notification-container" style={getPosition()}>
      {children}
    </div>
  );
});

BaseNotificationContainer.displayName = 'BaseNotificationContainer';
