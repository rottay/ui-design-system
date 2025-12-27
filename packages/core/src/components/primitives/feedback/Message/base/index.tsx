/**
 * Message - Base Component
 * Uses CSS variables from design tokens for consistent styling
 */

'use client';

import React, { forwardRef, useEffect, useState, useMemo } from 'react';
import type { MessageItemProps, MessageType } from '../types';
import { MESSAGE_DEFAULTS, MESSAGE_ICONS } from '../types';

/**
 * Type color configurations
 */
const TYPE_COLORS: Record<MessageType, { bg: string; color: string; icon: string }> = {
  success: { bg: '#f6ffed', color: '#52c41a', icon: MESSAGE_ICONS.success },
  error: { bg: '#fff2f0', color: '#ff4d4f', icon: MESSAGE_ICONS.error },
  info: { bg: '#e6f4ff', color: '#1677ff', icon: MESSAGE_ICONS.info },
  warning: { bg: '#fffbe6', color: '#faad14', icon: MESSAGE_ICONS.warning },
  loading: { bg: '#e6f4ff', color: '#1677ff', icon: MESSAGE_ICONS.loading },
};

/**
 * Loading spinner
 */
const LoadingSpinner: React.FC = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    style={{ animation: 'rottay-message-spin 1s linear infinite' }}
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeDasharray="31.416"
      strokeDashoffset="10"
    />
  </svg>
);

/**
 * Base MessageItem component using CSS variables.
 * This is extended by engine-specific implementations.
 */
export const BaseMessageItem = forwardRef<HTMLDivElement, MessageItemProps>(
  (props, ref) => {
    const {
      id,
      type,
      content,
      duration = MESSAGE_DEFAULTS.duration,
      onClose,
      icon,
      className = '',
      style = {},
      closable = MESSAGE_DEFAULTS.closable,
      closeIcon,
      onRemove,
    } = props;

    const [isVisible, setIsVisible] = useState(true);
    const [isExiting, setIsExiting] = useState(false);

    const typeConfig = TYPE_COLORS[type];

    // Auto close timer
    useEffect(() => {
      if (duration && duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration * 1000);

        return () => clearTimeout(timer);
      }
    }, [duration]);

    const handleClose = () => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose?.();
        onRemove?.(id);
      }, 200);
    };

    // CSS variables
    const messageVars = useMemo<React.CSSProperties>(() => ({
      '--message-bg': typeConfig.bg,
      '--message-color': typeConfig.color,
      '--message-shadow': 'var(--shadow-md)',
      '--message-border-radius': 'var(--radius-lg, 8px)',
      '--message-padding': '10px 16px',
      '--message-font-size': '14px',
    } as React.CSSProperties), [typeConfig]);

    if (!isVisible) return null;

    const messageStyle: React.CSSProperties = {
      ...messageVars,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: 'var(--message-padding)',
      backgroundColor: 'var(--message-bg)',
      borderRadius: 'var(--message-border-radius)',
      boxShadow: 'var(--message-shadow)',
      fontSize: 'var(--message-font-size)',
      opacity: isExiting ? 0 : 1,
      transform: isExiting ? 'translateY(-10px)' : 'translateY(0)',
      transition: 'opacity 0.2s, transform 0.2s',
      ...style,
    };

    const iconStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      color: 'var(--message-color)',
    };

    const contentStyle: React.CSSProperties = {
      color: 'var(--color-text-primary)',
    };

    const closeStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      marginLeft: '8px',
      cursor: 'pointer',
      color: 'var(--color-text-secondary)',
    };

    return (
      <div
        ref={ref}
        className={`rottay-message rottay-message--${type} ${className}`}
        style={messageStyle}
        role="alert"
      >
        <span className="rottay-message__icon" style={iconStyle}>
          {icon !== undefined ? icon : (
            type === 'loading' ? <LoadingSpinner /> : typeConfig.icon
          )}
        </span>
        <span className="rottay-message__content" style={contentStyle}>
          {content}
        </span>
        {closable && (
          <span
            className="rottay-message__close"
            style={closeStyle}
            onClick={handleClose}
          >
            {closeIcon || '×'}
          </span>
        )}
      </div>
    );
  }
);

BaseMessageItem.displayName = 'BaseMessageItem';

/**
 * Message container for positioning messages
 */
export const BaseMessageContainer = forwardRef<HTMLDivElement, {
  placement?: 'top' | 'bottom';
  top?: number;
  children: React.ReactNode;
}>(({ placement = 'top', top = MESSAGE_DEFAULTS.top, children }, ref) => {
  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    left: '50%',
    transform: 'translateX(-50%)',
    [placement]: top,
    zIndex: 1010,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    pointerEvents: 'none',
  };

  return (
    <div ref={ref} className="rottay-message-container" style={containerStyle}>
      {React.Children.map(children, child => (
        <div style={{ pointerEvents: 'auto' }}>{child}</div>
      ))}
    </div>
  );
});

BaseMessageContainer.displayName = 'BaseMessageContainer';
